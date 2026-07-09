import { createFileRoute } from "@tanstack/react-router";

import { isAuthed } from "../../../lib/auth.server";
import {
  getBucket,
  getProductById,
  insertGalleryImage,
  setProductImageKey,
  setSetting,
} from "../../../lib/data.server";

// Admin image upload (multipart, never JSON-serialized bytes). Validates type
// (jpeg/png/webp) and size (<=5MB), PUTs to R2 under products/<slug>/<ts>.<ext>
// for product photos, site/<slot>/<ts>.<ext> for the hero and story slots, or
// gallery/<ts>.<ext> for gallery images, then records the key in D1.
// Session-verified server-side.

const MAX_BYTES = 5 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const SITE_SLOTS = new Set(["hero", "story", "logo", "og"]);

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
            { ok: false, error: "Image storage is not provisioned yet." },
            { status: 503 },
          );
        }

        const form = await request.formData();
        const file = form.get("file");
        const target = String(form.get("target") ?? ""); // "product" | "site" | "gallery"
        if (!(file instanceof File)) {
          return Response.json({ ok: false, error: "No file received." }, { status: 400 });
        }

        const ext = EXT_BY_TYPE[file.type];
        if (!ext) {
          return Response.json(
            { ok: false, error: "Please upload a JPEG, PNG or WebP image." },
            { status: 400 },
          );
        }
        if (file.size > MAX_BYTES) {
          return Response.json(
            { ok: false, error: "Image is larger than 5MB. Please resize and try again." },
            { status: 400 },
          );
        }

        const bytes = await file.arrayBuffer();

        if (target === "gallery") {
          const key = `gallery/${Date.now()}.${ext}`;
          await bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });
          await insertGalleryImage(key);
          return Response.json({ ok: true, key });
        }

        if (target === "site") {
          const slot = String(form.get("slot") ?? "");
          if (!SITE_SLOTS.has(slot)) {
            return Response.json({ ok: false, error: "Unknown image slot." }, { status: 400 });
          }
          const key = `site/${slot}/${Date.now()}.${ext}`;
          await bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });
          await setSetting(`${slot}_image_key`, key);
          return Response.json({ ok: true, key });
        }

        const productId = Number.parseInt(String(form.get("product_id") ?? ""), 10);
        if (!Number.isFinite(productId)) {
          return Response.json({ ok: false, error: "Missing product." }, { status: 400 });
        }
        const product = await getProductById(productId);
        if (!product) {
          return Response.json({ ok: false, error: "Product not found." }, { status: 404 });
        }

        const key = `products/${product.slug}/${Date.now()}.${ext}`;
        await bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });
        await setProductImageKey(productId, key);
        return Response.json({ ok: true, key });
      },
    },
  },
});
