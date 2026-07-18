import type { Community, LivePost } from "@/lib/db";
import { PostComposer } from "./post-composer";
import { LivePostCard } from "./live-post-card";

// The feed IS the homepage — no headings or copy, straight to content,
// like opening a social app.
export function Feed({
  livePosts = [],
  communities = [],
}: {
  livePosts?: LivePost[];
  communities?: Community[];
}) {
  const hasLive = livePosts.length > 0;

  return (
    <section id="feed" className="py-6">
      <div className="container-page">
        <div id="composer">
          <PostComposer
            communities={communities.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>

        {hasLive ? (
          <div className="masonry">
            {livePosts.map((post) => (
              <LivePostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-clay/10 text-2xl">
              ✍️
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold">
              Be the first to post
            </h3>
            <a
              href="/communities/new"
              className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              Start a community
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
