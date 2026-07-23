"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Opens (or reuses) a buyer↔seller thread for a listing, then routes to the
// messages inbox with that thread selected.
export function MessageSellerButton({
  listingId,
  sellerId,
}: {
  listingId: string;
  sellerId: string;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const isSeller = userId === sellerId;

  async function openThread() {
    if (!userId) {
      router.push("/auth");
      return;
    }
    if (isSeller || busy) return;
    setBusy(true);
    const supabase = supabaseBrowser();

    // Reuse an existing thread if one is already open.
    const { data: existing } = await supabase
      .from("coterie_threads")
      .select("id")
      .eq("listing_id", listingId)
      .eq("buyer_id", userId)
      .maybeSingle();

    let threadId = existing?.id as string | undefined;
    if (!threadId) {
      const { data: created, error } = await supabase
        .from("coterie_threads")
        .insert({
          listing_id: listingId,
          buyer_id: userId,
          seller_id: sellerId,
        })
        .select("id")
        .single();
      if (error) {
        setBusy(false);
        return;
      }
      threadId = created.id;
    }

    router.push(`/messages?t=${threadId}`);
  }

  if (isSeller) {
    return (
      <p className="rounded-full bg-cream px-5 py-3 text-center text-sm font-medium text-ink/50">
        This is your listing
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={openThread}
      disabled={busy}
      className="w-full rounded-full border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40 disabled:opacity-60"
    >
      {busy ? "Opening…" : "💬 Message seller"}
    </button>
  );
}
