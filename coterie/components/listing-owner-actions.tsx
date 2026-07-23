"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function ListingOwnerActions({
  listingId,
  ownerId,
  sold = false,
}: {
  listingId: string;
  ownerId: string;
  sold?: boolean;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSold, setIsSold] = useState(sold);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  if (userId !== ownerId) return null;

  async function remove() {
    if (busy) return;
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("coterie_listings")
      .delete()
      .eq("id", listingId);
    if (error) {
      setBusy(false);
      setConfirming(false);
      return;
    }
    router.push("/#marketplace");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink hover:border-ink/40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="flex-1 rounded-full bg-clay px-4 py-2.5 text-center text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? "Deleting…" : "Confirm delete"}
        </button>
      </div>
    );
  }

  async function toggleSold() {
    if (busy) return;
    const next = !isSold;
    setIsSold(next);
    await supabaseBrowser()
      .from("coterie_listings")
      .update({ sold: next })
      .eq("id", listingId);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={toggleSold}
        className="w-full rounded-full border border-moss/40 px-4 py-2.5 text-center text-sm font-semibold text-moss transition-colors hover:bg-moss/10"
      >
        {isSold ? "Mark as available again" : "Mark as sold"}
      </button>
      <a
        href={`/marketplace/${listingId}/edit`}
        className="flex-1 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:border-ink/40"
      >
        Edit listing
      </a>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex-1 rounded-full border border-clay/40 px-4 py-2.5 text-center text-sm font-semibold text-clay transition-colors hover:bg-clay/10"
      >
        Delete
      </button>
    </div>
  );
}
