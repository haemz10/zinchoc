"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function ListingOwnerActions({
  listingId,
  ownerId,
}: {
  listingId: string;
  ownerId: string;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  if (userId !== ownerId) return null;

  async function remove() {
    if (busy) return;
    if (!window.confirm("Delete this listing? This can't be undone.")) return;
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("coterie_listings")
      .delete()
      .eq("id", listingId);
    if (error) {
      setBusy(false);
      return;
    }
    router.push("/#marketplace");
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <a
        href={`/marketplace/${listingId}/edit`}
        className="flex-1 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:border-ink/40"
      >
        Edit listing
      </a>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="flex-1 rounded-full border border-clay/40 px-4 py-2.5 text-center text-sm font-semibold text-clay transition-colors hover:bg-clay/10 disabled:opacity-60"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
