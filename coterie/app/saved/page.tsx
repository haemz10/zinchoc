"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice } from "@/lib/currency";

type SavedPost = { id: string; caption: string; community_id: string };
type SavedListing = {
  id: string;
  title: string;
  price: string;
  currency: string;
  image: string | null;
  sold: boolean;
};

// Everything the member bookmarked, with one-tap unsave.
export default function SavedPage() {
  const [state, setState] = useState<"checking" | "denied" | "ready">(
    "checking"
  );
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [listings, setListings] = useState<SavedListing[]>([]);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setState("denied");
        return;
      }
      const { data: saves } = await supabase
        .from("coterie_saves")
        .select("target_type,target_id")
        .order("created_at", { ascending: false });
      const postIds = (saves ?? [])
        .filter((s) => s.target_type === "post")
        .map((s) => s.target_id);
      const listingIds = (saves ?? [])
        .filter((s) => s.target_type === "listing")
        .map((s) => s.target_id);
      const [p, l] = await Promise.all([
        postIds.length
          ? supabase
              .from("coterie_posts")
              .select("id,caption,community_id")
              .in("id", postIds)
          : Promise.resolve({ data: [] }),
        listingIds.length
          ? supabase
              .from("coterie_listings")
              .select("id,title,price,currency,image,sold")
              .in("id", listingIds)
          : Promise.resolve({ data: [] }),
      ]);
      setPosts((p.data as SavedPost[]) ?? []);
      setListings((l.data as SavedListing[]) ?? []);
      setState("ready");
    });
  }, []);

  async function unsave(targetType: "post" | "listing", targetId: string) {
    if (targetType === "post") setPosts((xs) => xs.filter((x) => x.id !== targetId));
    else setListings((xs) => xs.filter((x) => x.id !== targetId));
    await supabaseBrowser()
      .from("coterie_saves")
      .delete()
      .eq("target_type", targetType)
      .eq("target_id", targetId);
  }

  return (
    <>
      <SiteHeader />
      <main className="container-page max-w-2xl py-10">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Saved
        </h1>

        {state === "checking" && <p className="mt-6 text-ink/50">Loading…</p>}
        {state === "denied" && (
          <p className="mt-6 text-ink/60">
            <a href="/auth" className="font-semibold text-clay hover:underline">
              Sign in
            </a>{" "}
            to see what you&apos;ve saved.
          </p>
        )}

        {state === "ready" && posts.length + listings.length === 0 && (
          <p className="mt-6 text-ink/50">
            Nothing saved yet — tap the 🏷️ on any post or item.
          </p>
        )}

        {listings.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Marketplace items
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listings.map((l) => (
                <div key={l.id} className="group relative">
                  <a href={`/marketplace/${l.id}`}>
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
                      <span className="truncate text-sm font-semibold">
                        {l.title}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-clay">
                        {formatPrice(l.price, l.currency)}
                      </span>
                    </div>
                  </a>
                  <button
                    type="button"
                    onClick={() => unsave("listing", l.id)}
                    className="mt-0.5 text-xs font-medium text-ink/45 hover:text-clay"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {posts.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Posts
            </h2>
            <div className="mt-2 space-y-1">
              {posts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
                >
                  <a
                    href={`/c/${p.community_id}`}
                    className="min-w-0 flex-1 truncate text-sm hover:underline"
                  >
                    {p.caption}
                  </a>
                  <button
                    type="button"
                    onClick={() => unsave("post", p.id)}
                    className="shrink-0 text-xs font-medium text-ink/45 hover:text-clay"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
