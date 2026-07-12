import { feed, type FeedPost } from "@/lib/data";
import type { Community, LivePost } from "@/lib/db";
import { PostComposer } from "./post-composer";
import { LivePostCard } from "./live-post-card";

export function Feed({
  livePosts = [],
  communities = [],
}: {
  livePosts?: LivePost[];
  communities?: Community[];
}) {
  const hasLive = livePosts.length > 0;

  return (
    <section id="feed" className="border-t border-black/5 bg-white/60 py-16">
      <div className="container-page">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Fresh from the communities
          </h2>
          <p className="mt-2 max-w-xl text-ink/60">
            A living feed of what members are making, growing, baking, and
            shooting right now — no algorithm deciding what you see.
          </p>
        </div>

        <PostComposer
          communities={communities.map((c) => ({ id: c.id, name: c.name }))}
        />

        {hasLive ? (
          // Real member posts — the actual feed.
          <div className="masonry">
            {livePosts.map((post) => (
              <LivePostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-10 rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-clay/10 text-2xl">
                ✍️
              </div>
              <h3 className="mt-4 font-serif text-2xl font-semibold">
                The feed is yours to start
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-ink/60">
                No real posts yet. Share the first update above, or jump into a
                community and get it going.
              </p>
              <a
                href="#communities"
                className="mt-5 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                Browse communities
              </a>
            </div>

            {/* Clearly-labelled preview so the empty page still shows the vibe. */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                Preview — example posts
              </span>
              <span className="h-px flex-1 bg-ink/10" />
            </div>
            <div className="masonry opacity-90">
              {feed.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// Non-interactive example card, always badged so it can't be mistaken for real
// member content.
function PostCard({ post }: { post: FeedPost }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image}
          alt={post.caption}
          className="w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {post.community}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink/70 backdrop-blur-sm">
          Example
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.avatar}
            alt={post.author}
            className="h-8 w-8 rounded-full object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {post.author}
            </p>
            <p className="truncate text-xs text-ink/50">@{post.handle}</p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          {post.caption}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs font-medium text-ink/50">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>♥</span> {post.likes.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>💬</span> {post.comments}
          </span>
        </div>
      </div>
    </article>
  );
}
