"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice } from "@/lib/currency";

type CommunityHit = { id: string; name: string; blurb: string };
type PostHit = {
  id: string;
  caption: string;
  community_id: string;
  author: { username: string } | null;
};
type ListingHit = {
  id: string;
  title: string;
  price: string;
  currency: string;
  image: string | null;
  sold: boolean;
};
type MemberHit = { username: string; display_name: string; avatar_url: string | null };

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

// Search across communities, members, posts, and the marketplace.
export default function SearchPage() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [communities, setCommunities] = useState<CommunityHit[]>([]);
  const [members, setMembers] = useState<MemberHit[]>([]);
  const [posts, setPosts] = useState<PostHit[]>([]);
  const [listings, setListings] = useState<ListingHit[]>([]);

  useEffect(() => {
    const text = q.trim();
    if (text.length < 2) {
      setSearched(false);
      return;
    }
    const t = setTimeout(async () => {
      setBusy(true);
      const supabase = supabaseBrowser();
      const like = `%${text.replaceAll("%", "").replaceAll("_", "")}%`;
      const [c, m, p, l] = await Promise.all([
        supabase
          .from("coterie_communities")
          .select("id,name,blurb")
          .or(`name.ilike.${like},blurb.ilike.${like}`)
          .limit(8),
        supabase
          .from("coterie_profiles")
          .select("username,display_name,avatar_url")
          .or(`username.ilike.${like},display_name.ilike.${like}`)
          .limit(8),
        supabase
          .from("coterie_posts")
          .select(
            "id,caption,community_id,author:coterie_profiles!coterie_posts_user_id_fkey(username)"
          )
          .ilike("caption", like)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("coterie_listings")
          .select("id,title,price,currency,image,sold")
          .ilike("title", like)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);
      setCommunities((c.data as CommunityHit[]) ?? []);
      setMembers((m.data as MemberHit[]) ?? []);
      setPosts(
        (((p.data as unknown[]) ?? []).map((r) => {
          const t = r as PostHit & { author: unknown };
          return { ...t, author: one(t.author) as PostHit["author"] };
        })) as PostHit[]
      );
      setListings((l.data as ListingHit[]) ?? []);
      setBusy(false);
      setSearched(true);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const empty =
    searched &&
    !busy &&
    communities.length + members.length + posts.length + listings.length === 0;

  return (
    <>
      <SiteHeader />
      <main className="container-page max-w-2xl py-8">
        <label htmlFor="search" className="sr-only">
          Search Coterie
        </label>
        <input
          id="search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search communities, members, posts, goods…"
          autoFocus
          className="w-full rounded-full border border-ink/15 bg-white px-5 py-3 text-base outline-none focus:border-ink/40"
        />

        {busy && <p className="mt-6 text-sm text-ink/45">Searching…</p>}
        {empty && (
          <p className="mt-6 text-sm text-ink/45">
            Nothing found for “{q.trim()}”.
          </p>
        )}

        {members.length > 0 && (
          <section className="mt-7">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Members
            </h2>
            <div className="mt-2 space-y-1">
              {members.map((m) => (
                <a
                  key={m.username}
                  href={`/u/${m.username}`}
                  className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 hover:bg-white/70"
                >
                  <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-clay/25 via-cream to-moss/25 font-serif text-sm font-semibold text-ink/60">
                    {m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      m.display_name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{m.display_name}</span>
                    <span className="block text-xs text-ink/50">@{m.username}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {communities.length > 0 && (
          <section className="mt-7">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Communities
            </h2>
            <div className="mt-2 space-y-1">
              {communities.map((c) => (
                <a
                  key={c.id}
                  href={`/c/${c.id}`}
                  className="block rounded-xl bg-white px-3 py-2 hover:bg-white/70"
                >
                  <span className="block text-sm font-semibold">{c.name}</span>
                  <span className="block truncate text-xs text-ink/50">{c.blurb}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {listings.length > 0 && (
          <section className="mt-7">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Marketplace
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listings.map((l) => (
                <a key={l.id} href={`/marketplace/${l.id}`} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-clay/15 via-cream to-moss/15">
                    {l.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.image}
                        alt={l.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    {l.sold && (
                      <span className="absolute left-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-bold uppercase text-cream">
                        Sold
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{l.title}</span>
                    <span className="shrink-0 text-xs font-semibold text-clay">
                      {formatPrice(l.price, l.currency)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {posts.length > 0 && (
          <section className="mt-7">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Posts
            </h2>
            <div className="mt-2 space-y-1">
              {posts.map((p) => (
                <a
                  key={p.id}
                  href={`/c/${p.community_id}`}
                  className="block rounded-xl bg-white px-3 py-2 hover:bg-white/70"
                >
                  <span className="block truncate text-sm">{p.caption}</span>
                  <span className="block text-xs text-ink/50">
                    @{p.author?.username ?? "member"}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
