import { useCallback, useEffect, useState } from "react";

import {
  adminDeleteGalleryImage,
  adminListGallery,
  adminMoveGalleryImage,
  adminSetGalleryCaption,
  adminSetGalleryVisible,
} from "../../lib/api/admin.functions";
import type { GalleryImage } from "../../lib/types";

// Admin gallery tab: upload images to R2 (gallery/<timestamp>.<ext>), edit
// captions, reorder, hide/show, delete with confirm.

const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";
const field =
  "w-full rounded-sm border border-ink/25 bg-white px-3 py-2 font-body text-sm text-ink focus:border-gold focus:outline-none";

export function GalleryTab() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [captionDrafts, setCaptionDrafts] = useState<Record<number, string>>({});
  const [savingCaptionId, setSavingCaptionId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await adminListGallery();
      setImages(res.images);
      setCaptionDrafts((drafts) => {
        const next: Record<number, string> = {};
        for (const img of res.images) {
          next[img.id] = drafts[img.id] ?? img.caption ?? "";
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function upload(file: File, kind: "image" | "video") {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("target", kind === "video" ? "gallery_video" : "gallery");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) setError(json.error ?? "Upload failed.");
      await refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function saveCaption(img: GalleryImage) {
    setSavingCaptionId(img.id);
    try {
      await adminSetGalleryCaption({
        data: { id: img.id, caption: captionDrafts[img.id] ?? "" },
      });
      await refresh();
    } finally {
      setSavingCaptionId(null);
    }
  }

  async function toggleVisible(img: GalleryImage) {
    await adminSetGalleryVisible({ data: { id: img.id, visible: img.visible !== 1 } });
    await refresh();
  }

  async function move(img: GalleryImage, dir: "up" | "down") {
    await adminMoveGalleryImage({ data: { id: img.id, dir } });
    await refresh();
  }

  async function remove(img: GalleryImage) {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this gallery image? This cannot be undone.")
    ) {
      return;
    }
    await adminDeleteGalleryImage({ data: { id: img.id } });
    await refresh();
  }

  if (loading) {
    return <p className="font-body text-sm text-ink/60">Loading gallery...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl text-ink">Gallery</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`${btn} cursor-pointer bg-ink text-beige`}>
            {uploading ? "Uploading..." : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f, "image");
                e.target.value = "";
              }}
            />
          </label>
          <label className={`${btn} cursor-pointer border border-ink/25 text-ink`}>
            {uploading ? "Uploading..." : "Upload video"}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f, "video");
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-sm border border-[#8a2f2f]/30 bg-[#8a2f2f]/5 px-3 py-2 font-body text-sm text-[#8a2f2f]">
          {error}
        </p>
      ) : null}

      {images.length === 0 ? (
        <p className="mt-5 rounded-sm border border-ink/15 bg-white p-5 font-body text-sm text-ink/60">
          No gallery images yet. Upload your first photograph above; it appears on the public
          gallery page immediately.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-ink/10 rounded-sm border border-ink/15 bg-white">
          {images.map((img, i) => (
            <li key={img.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-panel">
                {img.video_key ? (
                  <video
                    src={`/img/${img.video_key}`}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : img.image_key ? (
                  <img
                    src={`/img/${img.image_key}`}
                    alt={img.caption ?? "Gallery image"}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <label className="block">
                  <span className="font-body text-xs font-medium text-ink/70">Caption</span>
                  <input
                    type="text"
                    value={captionDrafts[img.id] ?? ""}
                    onChange={(e) => setCaptionDrafts((d) => ({ ...d, [img.id]: e.target.value }))}
                    className={`mt-1 ${field}`}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => saveCaption(img)}
                  disabled={savingCaptionId === img.id}
                  className={`${btn} mt-2 border border-ink/25 text-ink disabled:opacity-50`}
                >
                  {savingCaptionId === img.id ? "Saving..." : "Save caption"}
                </button>
                {img.visible !== 1 ? (
                  <span className="ml-2 rounded-sm bg-ink/10 px-1.5 py-0.5 font-body text-[0.65rem] uppercase tracking-wide text-ink/60">
                    Hidden
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(img, "up")}
                  disabled={i === 0}
                  className={`${btn} border border-ink/25 text-ink disabled:opacity-30`}
                  aria-label="Move image up"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => move(img, "down")}
                  disabled={i === images.length - 1}
                  className={`${btn} border border-ink/25 text-ink disabled:opacity-30`}
                  aria-label="Move image down"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => toggleVisible(img)}
                  className={`${btn} border border-ink/25 text-ink`}
                >
                  {img.visible === 1 ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(img)}
                  className={`${btn} border border-[#8a2f2f]/40 text-[#8a2f2f]`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 font-body text-xs text-ink/50">
        JPEG, PNG or WebP, up to 5MB. Captions are optional and show beneath each photograph.
      </p>
    </div>
  );
}
