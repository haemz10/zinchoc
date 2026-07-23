"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Bookmark toggle for posts and listings. Hidden when signed out.
export function SaveButton({
  targetType,
  targetId,
}: {
  targetType: "post" | "listing";
  targetId: string;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;
      const { data: row } = await supabase
        .from("coterie_saves")
        .select("target_id")
        .eq("user_id", uid)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .maybeSingle();
      setSaved(Boolean(row));
    });
  }, [targetType, targetId]);

  if (!userId) return null;

  async function toggle() {
    const supabase = supabaseBrowser();
    if (saved) {
      setSaved(false);
      await supabase
        .from("coterie_saves")
        .delete()
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId);
    } else {
      setSaved(true);
      await supabase
        .from("coterie_saves")
        .insert({ user_id: userId, target_type: targetType, target_id: targetId });
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save"}
      className={`text-base leading-none transition-colors ${
        saved ? "text-clay" : "text-ink/35 hover:text-ink"
      }`}
    >
      {saved ? "🔖" : "🏷️"}
    </button>
  );
}
