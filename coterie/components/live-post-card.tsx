"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { LivePost } from "@/lib/db";
import { Comments } from "./comments";

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function LivePostCard({ post }: { post: LivePost }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.likes?.[0]?.count ?? 0);
  const [caption, setCaption] = useState(post.caption);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.caption);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: mine } = await supabase
          .from("coterie_likes")
          .select("post_id")
          .eq("post_id", post.id)
          .eq("user_id", uid)
          .maybeSingle();
        setLiked(Boolean(mine));
      }
    });
  }, [post.id]);

  const isOwner = userId === post.user_id;

  async function saveEdit() {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("coterie_posts")
      .update({ caption: text.slice(0, 500) })
      .eq("id", post.id);
    setBusy(false);
    if (!error) {
      setCaption(text);
      setEditing(false);
    }
  }

  async function deletePost() {
    if (busy) return;
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("coterie_posts")
      .delete()
      .eq("id", post.id);
    setBusy(false);
    if (!error) setRemoved(true);
  }

  if (removed) return null;

  async function toggleLike() {
    if (!userId) {
      window.location.href = "/auth";
      return;
    }
    const supabase = supabaseBrowser();
    if (liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      await supabase
        .from("coterie_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      await supabase
        .from("coterie_likes")
        .insert({ post_id: post.id, user_id: userId });
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-clay/25 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-clay/10 px-2.5 py-1 text-xs font-semibold text-clay">
            {post.community?.name ?? "Coterie"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink/40">
              {timeAgo(post.created_at)}
            </span>
            {isOwner && !editing && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(caption);
                    setEditing(true);
                  }}
                  className="text-xs font-medium text-ink/45 hover:text-ink"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={deletePost}
                  className="text-xs font-medium text-ink/45 hover:text-clay"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink/60 hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={busy || !draft.trim()}
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-cream disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-ink/80">{caption}</p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {post.author?.display_name ?? "A member"}
            </p>
            <p className="truncate text-xs text-ink/50">
              @{post.author?.username ?? "member"}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              liked
                ? "border-clay bg-clay/10 text-clay"
                : "border-ink/15 text-ink/60 hover:border-ink/40"
            }`}
          >
            <span aria-hidden>{liked ? "♥" : "♡"}</span> {count}
          </button>
        </div>

        <Comments postId={post.id} initialCount={post.comments?.[0]?.count ?? 0} />
      </div>
    </article>
  );
}
