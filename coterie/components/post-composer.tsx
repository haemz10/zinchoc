"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { uploadImage } from "@/lib/upload";

type CommunityOption = { id: string; name: string };

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

  async function post(e: React.FormEvent) {
    e.preventDefault();
    const target = fixedCommunityId ?? communityId;
    if (!userId || busy || !target) return;
    const text = caption.trim();
    if (!text) return;
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
          <span className="font-semibold text-ink">Members can post here.</span>{" "}
          Share what you&apos;re making with your communities.
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
      <label htmlFor="composer-caption" className="sr-only">
        What are you making?
      </label>
      <textarea
        id="composer-caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="What are you making, growing, baking, or shooting?"
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-xl border border-ink/10 bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-ink/40"
      />
      {preview && (
        <div className="relative mt-3 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Attached"
            className="max-h-48 rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            aria-label="Remove photo"
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-xs font-bold text-white"
          >
            ✕
          </button>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {!fixedCommunityId && communities.length > 0 && (
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
        )}
        {fixedCommunityId && <span />}
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.type.startsWith("image/")) {
                setFile(f);
                setPreview(URL.createObjectURL(f));
              }
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach a photo"
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-white text-base hover:border-ink/40"
          >
            📷
          </button>
          {error && (
            <p role="alert" className="text-sm font-medium text-clay">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !caption.trim()}
            className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {busy ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
