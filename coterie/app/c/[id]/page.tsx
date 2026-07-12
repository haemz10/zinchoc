import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostComposer } from "@/components/post-composer";
import { LivePostCard } from "@/components/live-post-card";
import { JoinButton } from "@/components/join-button";
import { CommunityOwnerActions } from "@/components/community-owner-actions";
import {
  fetchCommunity,
  fetchCommunityListings,
  fetchCommunityPosts,
  fetchMemberCounts,
} from "@/lib/db";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const community = await fetchCommunity(params.id);
  if (!community) return { title: "Community not found — Coterie" };
  return {
    title: `${community.name} — Coterie`,
    description: community.blurb,
  };
}

export default async function CommunityPage({
  params,
}: {
  params: { id: string };
}) {
  const community = await fetchCommunity(params.id);
  if (!community) notFound();

  const [posts, counts, listings] = await Promise.all([
    fetchCommunityPosts(community.id),
    fetchMemberCounts(),
    fetchCommunityListings(community.id),
  ]);
  const memberCount = counts[community.id] ?? 0;

  return (
    <>
      <SiteHeader />
      <main>
        {/* Community banner */}
        <section className="relative">
          <div className="h-48 w-full overflow-hidden bg-gradient-to-br from-clay/20 via-cream to-moss/20 sm:h-60">
            {community.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={community.cover}
                alt={community.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="container-page">
            <div className="-mt-12 flex flex-col gap-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
              <div>
                <a
                  href="/#communities"
                  className="text-xs font-semibold uppercase tracking-widest text-ink/40 hover:text-ink"
                >
                  ← All communities
                </a>
                <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  {community.name}
                </h1>
                <p className="mt-1 max-w-xl text-ink/60">{community.blurb}</p>
                <p className="mt-2 text-sm font-medium text-ink/50">
                  {memberCount === 0
                    ? "Be the first to join"
                    : `${memberCount} member${memberCount === 1 ? "" : "s"}`}
                  {" · "}
                  {posts.length} post{posts.length === 1 ? "" : "s"}
                </p>
                <CommunityOwnerActions
                  communityId={community.id}
                  ownerId={community.created_by}
                  name={community.name}
                  blurb={community.blurb}
                />
              </div>
              <div className="w-full sm:w-48">
                <JoinButton communityId={community.id} />
              </div>
            </div>
          </div>
        </section>

        {/* Post + feed */}
        <section className="container-page py-10">
          <PostComposer communities={[]} fixedCommunityId={community.id} />

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink/15 bg-white/60 px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-clay/10 text-2xl">
                🌱
              </div>
              <h2 className="mt-4 font-serif text-2xl font-semibold">
                Nothing here yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-ink/60">
                This community is a blank canvas. Post the first update and start
                building it into something.
              </p>
            </div>
          ) : (
            <div className="masonry">
              {posts.map((post) => (
                <LivePostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* Community marketplace */}
        <section className="border-t border-black/5 bg-white/60 py-12">
          <div className="container-page">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-clay">
                  {community.name} marketplace
                </span>
                <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                  Goods from this community
                </h2>
                <p className="mt-1 max-w-xl text-sm text-ink/60">
                  Members here can sell what they make — buy directly, no cut
                  taken.
                </p>
              </div>
              <a
                href={`/marketplace/new?community=${community.id}`}
                className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                Sell an item here
              </a>
            </div>

            {listings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-12 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-clay/10 text-xl">
                  🛍️
                </div>
                <p className="mx-auto mt-3 max-w-sm text-sm text-ink/60">
                  No items for sale in this community yet. Be the first to open a
                  shop here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {listings.map((l) => (
                  <a key={l.id} href={`/marketplace/${l.id}`} className="group">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-clay/15 via-cream to-moss/15">
                      {l.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.image}
                          alt={l.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-3xl text-ink/20">
                          🛍️
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold">
                          {l.title}
                        </h3>
                        <span className="shrink-0 text-sm font-semibold text-clay">
                          {formatPrice(l.price, l.currency)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-ink/50">
                        @{l.maker?.username ?? "member"}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
