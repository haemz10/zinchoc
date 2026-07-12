"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";

// Safety net: guarantees the signed-in user has a coterie profile row, even if
// the database trigger ever misses. Idempotent and cheap — a no-op once the
// profile exists. RLS lets a user insert only their own profile.
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  // Fast path: profile already there.
  const { data: existing } = await supabase
    .from("coterie_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return;

  const meta = (user.user_metadata ?? {}) as {
    username?: string;
    display_name?: string;
  };
  const base =
    (meta.username || user.email?.split("@")[0] || "member")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24) || `member_${user.id.replace(/-/g, "").slice(0, 8)}`;
  const displayName = (meta.display_name || base).slice(0, 50);

  // First attempt with the natural username; on a unique-name clash, suffix it.
  const first = await supabase
    .from("coterie_profiles")
    .insert({ id: user.id, username: base, display_name: displayName });
  if (!first.error) return;

  if (first.error.code === "23505") {
    const suffixed = `${base.slice(0, 15)}_${user.id.replace(/-/g, "").slice(0, 6)}`;
    await supabase
      .from("coterie_profiles")
      .insert({ id: user.id, username: suffixed, display_name: displayName });
  }
}
