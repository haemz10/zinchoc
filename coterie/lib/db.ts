// Server-side read helpers. Public data only (RLS: select allowed for anon),
// fetched straight from PostgREST so server components need no auth session.
import { SUPABASE_KEY, SUPABASE_URL } from "./supabase-config";

const headers = { apikey: SUPABASE_KEY };

export type LivePost = {
  id: string;
  caption: string;
  created_at: string;
  community: { id: string; name: string } | null;
  author: { username: string; display_name: string } | null;
  likes: { count: number }[];
};

const POST_SELECT =
  `id,caption,created_at,` +
  `community:coterie_communities(id,name),` +
  `author:coterie_profiles!coterie_posts_user_id_fkey(username,display_name),` +
  `likes:coterie_likes(count)`;

export async function fetchLivePosts(): Promise<LivePost[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/coterie_posts?select=${POST_SELECT}` +
        `&order=created_at.desc&limit=30`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return [];
    return (await res.json()) as LivePost[];
  } catch {
    return [];
  }
}

export async function fetchCommunityPosts(
  communityId: string
): Promise<LivePost[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/coterie_posts?select=${POST_SELECT}` +
        `&community_id=eq.${encodeURIComponent(communityId)}` +
        `&order=created_at.desc&limit=50`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return [];
    return (await res.json()) as LivePost[];
  } catch {
    return [];
  }
}

export type Community = {
  id: string;
  name: string;
  blurb: string;
  cover: string | null;
  created_by: string | null;
};

export async function fetchCommunity(id: string): Promise<Community | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/coterie_communities?select=id,name,blurb,cover,created_by` +
        `&id=eq.${encodeURIComponent(id)}&limit=1`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Community[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function fetchAllCommunities(): Promise<Community[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/coterie_communities?select=id,name,blurb,cover,created_by` +
        `&order=created_at.asc`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return [];
    return (await res.json()) as Community[];
  } catch {
    return [];
  }
}

export type MemberCounts = Record<string, number>;

export async function fetchMemberCounts(): Promise<MemberCounts> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/coterie_memberships?select=community_id`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return {};
    const rows = (await res.json()) as { community_id: string }[];
    const counts: MemberCounts = {};
    for (const r of rows)
      counts[r.community_id] = (counts[r.community_id] ?? 0) + 1;
    return counts;
  } catch {
    return {};
  }
}
