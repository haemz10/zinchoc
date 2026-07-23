"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function JoinButton({ communityId }: { communityId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: row } = await supabase
          .from("coterie_memberships")
          .select("community_id")
          .eq("community_id", communityId)
          .eq("user_id", uid)
          .maybeSingle();
        setJoined(Boolean(row));
      }
    });
  }, [communityId]);

  async function toggle() {
    if (!userId) {
      window.location.href = "/auth";
      return;
    }
    if (busy) return;
    setBusy(true);
    const supabase = supabaseBrowser();
    if (joined) {
      setJoined(false);
      await supabase
        .from("coterie_memberships")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", userId);
    } else {
      setJoined(true);
      await supabase
        .from("coterie_memberships")
        .insert({ community_id: communityId, user_id: userId });
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`mt-4 w-full rounded-full border py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
        joined
          ? "border-moss bg-moss/10 text-moss"
          : "border-ink/15 hover:bg-ink hover:text-cream"
      }`}
    >
      {joined ? "Joined ✓" : "Join community"}
    </button>
  );
}
