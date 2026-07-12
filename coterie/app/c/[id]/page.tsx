import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostComposer } from "@/components/post-composer";
import { LivePostCard } from "@/components/live-post-card";
import { JoinButton } from "@/components/join-button";
import {
  fetchCommunity,
  fetchCommunityPosts,
  fetchMemberCounts,
} from "@/lib/db";

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

  const [posts, counts] = await Promise.all([
    fetchCommunityPosts(community.id),
    fetchMemberCounts(),
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
      </main>
      <SiteFooter />
    </>
  );
}
