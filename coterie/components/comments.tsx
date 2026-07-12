"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  author: { username: string; display_name: string } | null;
};

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function Comments({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  async function load() {
    const { data } = await supabaseBrowser()
      .from("coterie_comments")
      .select(
        "id,body,created_at,user_id,author:coterie_profiles(username,display_name)"
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    const rows = (data ?? []) as Array<
      Omit<Comment, "author"> & {
        author:
          | { username: string; display_name: string }
          | { username: string; display_name: string }[]
          | null;
      }
    >;
    // PostgREST may return the embedded author as an array — normalize to one.
    setComments(
      rows.map((r) => ({
        ...r,
        author: Array.isArray(r.author) ? (r.author[0] ?? null) : r.author,
      }))
    );
  }

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !loadedRef.current) {
      loadedRef.current = true;
      await load();
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      window.location.href = "/auth";
      return;
    }
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("coterie_comments")
      .insert({ post_id: postId, user_id: userId, body: text.slice(0, 500) });
    setBusy(false);
    if (!error) {
      setBody("");
      setCount((c) => c + 1);
      await load();
    }
  }

  async function remove(id: string) {
    // Optimistic: drop it from the list immediately.
    setConfirmDeleteId(null);
    setCount((c) => Math.max(0, c - 1));
    setComments((cs) => (cs ? cs.filter((c) => c.id !== id) : cs));
    const { error } = await supabaseBrowser()
      .from("coterie_comments")
      .delete()
      .eq("id", id);
    if (error) {
      // Restore true state on failure.
      setCount((c) => c + 1);
      await load();
    }
  }

  async function saveEdit(id: string) {
    const text = editDraft.trim();
    if (!text) return;
    const { error } = await supabaseBrowser()
      .from("coterie_comments")
      .update({ body: text.slice(0, 500) })
      .eq("id", id);
    if (!error) {
      setComments((cs) =>
        cs ? cs.map((c) => (c.id === id ? { ...c, body: text } : c)) : cs
      );
      setEditingId(null);
    }
  }

  return (
    <div className="mt-3 border-t border-black/5 pt-3">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/55 hover:text-ink"
      >
        <span aria-hidden>💬</span>
        {count > 0 ? `${count} comment${count === 1 ? "" : "s"}` : "Comment"}
        <span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {comments === null ? (
            <p className="text-xs text-ink/40">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-ink/40">
              No comments yet — say the first thing.
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  {editingId === c.id ? (
                    <div>
                      <input
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        maxLength={500}
                        className="w-full rounded-full border border-ink/15 bg-cream px-3 py-1.5 text-sm outline-none focus:border-ink/40"
                      />
                      <div className="mt-1 flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => saveEdit(c.id)}
                          className="font-semibold text-ink hover:underline"
                        >
                          save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-ink/45 hover:text-ink"
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="leading-snug text-ink/80">{c.body}</p>
                      <p className="mt-0.5 text-xs text-ink/45">
                        @{c.author?.username ?? "member"} ·{" "}
                        {timeAgo(c.created_at)}
                        {userId === c.user_id &&
                          (confirmDeleteId === c.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => remove(c.id)}
                                className="ml-2 font-semibold text-clay underline-offset-2 hover:underline"
                              >
                                confirm delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="ml-2 text-ink/40 hover:text-ink"
                              >
                                cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(c.id);
                                  setEditDraft(c.body);
                                }}
                                className="ml-2 text-ink/40 underline-offset-2 hover:text-ink hover:underline"
                              >
                                edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(c.id)}
                                className="ml-2 text-ink/40 underline-offset-2 hover:text-clay hover:underline"
                              >
                                delete
                              </button>
                            </>
                          ))}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={userId ? "Add a comment…" : "Sign in to comment"}
              maxLength={500}
              className="w-full flex-1 rounded-full border border-ink/15 bg-cream px-3 py-1.5 text-sm outline-none transition-colors focus:border-ink/40"
            />
            <button
              type="submit"
              disabled={busy || !body.trim()}
              className="shrink-0 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
