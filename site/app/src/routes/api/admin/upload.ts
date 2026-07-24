import { createFileRoute } from "@tanstack/react-router";

import { isAuthed } from "../../../lib/auth.server";
import {
  getBucket,
  getProductById,
  insertGalleryImage,
  insertGalleryItem,
  setProductImageKey,
  setProductVideoKey,
  setSetting,
} from "../../../lib/data.server";

// Admin media upload (multipart, never JSON-serialized bytes). Handles both
// photos (jpeg/png/webp, <=5MB) and short video clips (mp4/webm/mov, <=50MB),
// PUTs to R2, then records the key in D1. Targets:
//   product        -> products/<slug>/<ts>.<ext>   (product photo)
//   product_video  -> products/<slug>/video-<ts>.<ext>
//   site           -> site/<slot>/<ts>.<ext>       (hero/story/logo/og image)
//   gallery        -> gallery/<ts>.<ext>           (gallery photo)
//   gallery_video  -> gallery/video-<ts>.<ext>
// Session-verified server-side.

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const VIDEO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const SITE_SLOTS = new Set(["hero", "story", "logo", "og"]);
const VIDEO_TARGETS = new Set(["product_video", "gallery_video"]);

export const Route = createFileRoute("/api/admin/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await isAuthed(request))) {
          return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }
        const bucket = getBucket();
        if (!bucket) {
          return Response.json(
            { ok: false, error: "Media storage is not provisioned yet." },
            { status: 503 },
          );
        }

        const form = await request.formData();
        const file = form.get("file");
        const target = String(form.get("target") ?? "");
        if (!(file instanceof File)) {
          return Response.json({ ok: false, error: "No file received." }, { status: 400 });
        }

        const isVideoTarget = VIDEO_TARGETS.has(target);
        const ext = isVideoTarget ? VIDEO_EXT[file.type] : IMAGE_EXT[file.type];
        if (!ext) {
          return Response.json(
            {
              ok: false,
              error: isVideoTarget
                ? "Please upload an MP4, WebM or MOV video."
                : "Please upload a JPEG, PNG or WebP image.",
            },
            { status: 400 },
          );
        }
        const maxBytes = isVideoTarget ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
        if (file.size > maxBytes) {
          return Response.json(
            {
              ok: false,
              error: isVideoTarget
                ? "Video is larger than 50MB. Please trim or compress it and try again."
                : "Image is larger than 5MB. Please resize and try again.",
            },
            { status: 400 },
          );
        }

        const bytes = await file.arrayBuffer();
        const put = (key: string) =>
          bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });

        // --- Gallery ---------------------------------------------------------
        if (target === "gallery") {
          const key = `gallery/${Date.now()}.${ext}`;
          await put(key);
          await insertGalleryImage(key);
          return Response.json({ ok: true, key });
        }
        if (target === "gallery_video") {
          const key = `gallery/video-${Date.now()}.${ext}`;
          await put(key);
          await insertGalleryItem("video", key);
          return Response.json({ ok: true, key });
        }

        // --- Site image slots ------------------------------------------------
        if (target === "site") {
          const slot = String(form.get("slot") ?? "");
          if (!SITE_SLOTS.has(slot)) {
            return Response.json({ ok: false, error: "Unknown image slot." }, { status: 400 });
          }
          const key = `site/${slot}/${Date.now()}.${ext}`;
          await put(key);
          await setSetting(`${slot}_image_key`, key);
          return Response.json({ ok: true, key });
        }

        // --- Product photo / video ------------------------------------------
        if (target === "product" || target === "product_video") {
          const productId = Number.parseInt(String(form.get("product_id") ?? ""), 10);
          if (!Number.isFinite(productId)) {
            return Response.json({ ok: false, error: "Missing product." }, { status: 400 });
          }
          const product = await getProductById(productId);
          if (!product) {
            return Response.json({ ok: false, error: "Product not found." }, { status: 404 });
          }
          if (target === "product_video") {
            const key = `products/${product.slug}/video-${Date.now()}.${ext}`;
            await put(key);
            await setProductVideoKey(productId, key);
            return Response.json({ ok: true, key });
          }
          const key = `products/${product.slug}/${Date.now()}.${ext}`;
          await put(key);
          await setProductImageKey(productId, key);
          return Response.json({ ok: true, key });
        }

        return Response.json({ ok: false, error: "Unknown upload target." }, { status: 400 });
      },
    },
  },
});
