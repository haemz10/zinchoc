// Server-side read helpers. Public data only (RLS: select allowed for anon),
// fetched straight from PostgREST so server components need no auth session.
import { SUPABASE_KEY, SUPABASE_URL } from "./supabase-config";

export type LivePost = {
  id: string;
  caption: string;
  created_at: string;
  community: { id: string; name: string } | null;
  author: { username: string; display_name: string } | null;
  likes: { count: number }[];
};

export async function fetchLivePosts(): Promise<LivePost[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/coterie_posts?select=id,caption,created_at,` +
        `community:coterie_communities(id,name),` +
        `author:coterie_profiles!coterie_posts_user_id_fkey(username,display_name),` +
        `likes:coterie_likes(count)&order=created_at.desc&limit=30`,
      { headers: { apikey: SUPABASE_KEY }, cache: "no-store" }
    );
    if (!res.ok) return [];
    return (await res.json()) as LivePost[];
  } catch {
    return [];
  }
}

export type MemberCounts = Record<string, number>;

export async function fetchMemberCounts(): Promise<MemberCounts> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/coterie_memberships?select=community_id`,
      { headers: { apikey: SUPABASE_KEY }, cache: "no-store" }
    );
    if (!res.ok) return {};
    const rows = (await res.json()) as { community_id: string }[];
    const counts: MemberCounts = {};
    for (const r of rows) counts[r.community_id] = (counts[r.community_id] ?? 0) + 1;
    return counts;
  } catch {
    return {};
  }
}
