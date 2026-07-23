"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Follow/unfollow on a member's profile. Hidden on your own profile and when
// signed out (shows a sign-in link instead).
export function FollowButton({ profileId }: { profileId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid && uid !== profileId) {
        const { data: row } = await supabase
          .from("coterie_follows")
          .select("followee_id")
          .eq("follower_id", uid)
          .eq("followee_id", profileId)
          .maybeSingle();
        setFollowing(Boolean(row));
      }
      setChecked(true);
    });
  }, [profileId]);

  if (!checked || userId === profileId) return null;

  if (!userId) {
    return (
      <a
        href="/auth"
        className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream"
      >
        Follow
      </a>
    );
  }

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = supabaseBrowser();
    if (following) {
      setFollowing(false);
      await supabase
        .from("coterie_follows")
        .delete()
        .eq("follower_id", userId)
        .eq("followee_id", profileId);
    } else {
      setFollowing(true);
      await supabase
        .from("coterie_follows")
        .insert({ follower_id: userId, followee_id: profileId });
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
        following
          ? "border border-ink/20 bg-white text-ink hover:border-ink/50"
          : "bg-ink text-cream"
      }`}
    >
      {following ? "Following ✓" : "Follow"}
    </button>
  );
}
