"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function CommunityOwnerActions({
  communityId,
  ownerId,
  name,
  blurb,
}: {
  communityId: string;
  ownerId: string | null;
  name: string;
  blurb: string;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const [blurbDraft, setBlurbDraft] = useState(blurb);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  if (!ownerId || userId !== ownerId) return null;

  async function save() {
    if (busy) return;
    if (nameDraft.trim().length < 2 || blurbDraft.trim().length < 4) {
      setError("Name and description are too short.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: updErr } = await supabaseBrowser()
      .from("coterie_communities")
      .update({
        name: nameDraft.trim().slice(0, 40),
        blurb: blurbDraft.trim().slice(0, 140),
      })
      .eq("id", communityId);
    setBusy(false);
    if (updErr) {
      setError("Could not save. Please try again.");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (busy) return;
    if (
      !window.confirm(
        "Delete this community? All of its posts will be removed too. This can't be undone."
      )
    )
      return;
    setBusy(true);
    const { error: delErr } = await supabaseBrowser()
      .from("coterie_communities")
      .delete()
      .eq("id", communityId);
    if (delErr) {
      setBusy(false);
      return;
    }
    router.push("/#communities");
    router.refresh();
  }

  if (editing) {
    return (
      <div className="mt-4 rounded-2xl border border-ink/15 bg-white p-4">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50">
          Community name
        </label>
        <input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          maxLength={40}
          className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-ink/40"
        />
        <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-wider text-ink/50">
          Description
        </label>
        <textarea
          value={blurbDraft}
          onChange={(e) => setBlurbDraft(e.target.value)}
          rows={2}
          maxLength={140}
          className="w-full resize-none rounded-2xl border border-ink/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-ink/40"
        />
        {error && <p className="mt-2 text-sm font-medium text-clay">{error}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink/60 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-3 text-sm">
      <button
        type="button"
        onClick={() => {
          setNameDraft(name);
          setBlurbDraft(blurb);
          setEditing(true);
        }}
        className="font-semibold text-ink/60 hover:text-ink"
      >
        Edit community
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="font-semibold text-ink/60 hover:text-clay disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
