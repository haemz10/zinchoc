import { feed, type FeedPost } from "@/lib/data";

export function Feed() {
  return (
    <section id="feed" className="border-t border-black/5 bg-white/60 py-16">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Fresh from the communities
            </h2>
            <p className="mt-2 max-w-xl text-ink/60">
              A living feed of what members are making, growing, baking, and
              shooting right now — no algorithm deciding what you see.
            </p>
          </div>
          <a
            href="#feed"
            className="hidden shrink-0 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold transition-colors hover:border-ink/40 sm:block"
          >
            See the full feed
          </a>
        </div>

        <div className="masonry">
          {feed.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image}
          alt={post.caption}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {post.community}
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
