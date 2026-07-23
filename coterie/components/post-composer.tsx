"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { uploadImage } from "@/lib/upload";

type CommunityOption = { id: string; name: string };

// Photo-first composer: leads with a big "Add a photo" area, then a short
// caption — so the feed fills up with images the way Instagram does. A caption
// alone still works for a quick text update.
export function PostComposer({
  communities,
  fixedCommunityId,
}: {
  communities: CommunityOption[];
  fixedCommunityId?: string;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [caption, setCaption] = useState("");
  const [communityId, setCommunityId] = useState(
    fixedCommunityId ?? communities[0]?.id ?? ""
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  function pick(f: File | undefined) {
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  async function post(e: React.FormEvent) {
    e.preventDefault();
    const target = fixedCommunityId ?? communityId;
    if (!userId || busy || !target) return;
    const text = caption.trim();
    // Photo-first: a post needs at least a photo (a caption alone is fine too).
    if (!file && !text) return;
    setBusy(true);
    setError(null);
    const supabase = supabaseBrowser();
    let image: string | null = null;
    if (file) {
      image = await uploadImage(supabase, userId, file);
      if (!image) {
        setError("Could not upload the photo — try a smaller image.");
        setBusy(false);
        return;
      }
    }
    const { error } = await supabase.from("coterie_posts").insert({
      user_id: userId,
      community_id: target,
      caption: text.slice(0, 500),
      image,
    });
    setBusy(false);
    if (error) {
      setError("Could not publish — please try again.");
      return;
    }
    setCaption("");
    setFile(null);
    setPreview(null);
    router.refresh();
  }

  if (!checked) return null;

  if (!userId) {
    return (
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-clay/20 bg-white p-4">
        <p className="text-sm text-ink/70">
          <span className="font-semibold text-ink">Share a photo here.</span>{" "}
          Members post what they make, grow, and shoot.
        </p>
        <a
          href="/auth"
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
        >
          Join to post
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={post}
      className="mb-8 rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* Photo-first: the big first action is adding a photo. */}
      {preview ? (
        <div className="relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Your photo"
            className="max-h-96 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            aria-label="Remove photo"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-sm font-bold text-white"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-cream py-10 text-center transition-colors hover:border-ink/35"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-clay/10 text-2xl">
            📷
          </span>
          <span className="font-serif text-lg font-semibold text-ink">
            Add a photo
          </span>
          <span className="text-xs text-ink/50">
            Share what you made, grew, baked, or shot
          </span>
        </button>
      )}

      {/* Caption comes after the photo. */}
      <label htmlFor="composer-caption" className="sr-only">
        Add a caption
      </label>
      <textarea
        id="composer-caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={preview ? "Add a caption…" : "…or just write a quick update"}
        rows={2}
        maxLength={500}
        className="input mt-3 resize-none"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {!fixedCommunityId && communities.length > 0 ? (
          <div className="flex items-center gap-2">
            <label
              htmlFor="composer-community"
              className="text-xs font-semibold uppercase tracking-wider text-ink/50"
            >
              Post to
            </label>
            <select
              id="composer-community"
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm font-medium"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          {error && (
            <p role="alert" className="text-sm font-medium text-clay">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || (!file && !caption.trim())}
            className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {busy ? "Posting…" : "Share"}
          </button>
        </div>
      </div>
    </form>
  );
}
