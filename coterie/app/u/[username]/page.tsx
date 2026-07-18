import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LivePostCard } from "@/components/live-post-card";
import { FollowButton } from "@/components/follow-button";
import { formatPrice } from "@/lib/currency";
import {
  fetchFollowCounts,
  fetchProfileByUsername,
  fetchUserCommunities,
  fetchUserListings,
  fetchUserPosts,
} from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: { username: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = decodeURIComponent(params.username);
  return { title: `@${username} — Coterie` };
}

// Public member profile — their posts, communities, and listings in one place.
export default async function ProfilePage({ params }: Props) {
  const username = decodeURIComponent(params.username);
  const profile = await fetchProfileByUsername(username);

  if (!profile) {
    return (
      <>
        <SiteHeader />
        <main className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
          <h1 className="font-serif text-3xl font-semibold">Member not found</h1>
          <p className="mt-2 text-ink/60">
            No one goes by @{username} here.
          </p>
          <a
            href="/"
            className="mt-5 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
          >
            Back to home
          </a>
        </main>
        <SiteFooter />
      </>
    );
  }

  const [posts, communities, listings, follows] = await Promise.all([
    fetchUserPosts(profile.id),
    fetchUserCommunities(profile.id),
    fetchUserListings(profile.id),
    fetchFollowCounts(profile.id),
  ]);

  const joined = new Date(profile.created_at).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <SiteHeader />
      <main className="container-page py-8">
        {/* Profile header */}
        <div className="flex items-center gap-5">
          <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-clay/25 via-cream to-moss/25 sm:h-24 sm:w-24">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-serif text-3xl font-semibold text-ink/60">
                {profile.display_name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {profile.display_name}
            </h1>
            <p className="text-sm text-ink/50">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/75">
                {profile.bio}
              </p>
            )}
            <p className="mt-1 text-xs text-ink/40">Joined {joined}</p>
          </div>
          <div className="ml-auto shrink-0">
            <FollowButton profileId={profile.id} />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-6 border-y border-black/5 py-3 text-sm">
          {[
            [posts.length, "posts"],
            [follows.followers, "followers"],
            [follows.following, "following"],
            [communities.length, "communities"],
            [listings.length, "for sale"],
          ].map(([n, label]) => (
            <span key={label as string}>
              <strong className="font-semibold">{n}</strong>{" "}
              <span className="text-ink/50">{label}</span>
            </span>
          ))}
        </div>

        {/* Communities they started */}
        {communities.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-xl font-semibold">Communities</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {communities.map((c) => (
                <a
                  key={c.id}
                  href={`/c/${c.id}`}
                  className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <p className="font-serif text-lg font-semibold">{c.name}</p>
                  <p className="mt-0.5 truncate text-sm text-ink/55">
                    {c.blurb}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Listings */}
        {listings.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-xl font-semibold">For sale</h2>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
                    {l.sold && (
                      <span className="absolute left-2 top-2 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-cream">
                        Sold
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {l.title}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-clay">
                      {formatPrice(l.price, l.currency)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Posts */}
        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold">Posts</h2>
          {posts.length > 0 ? (
            <div className="masonry mt-3">
              {posts.map((p) => (
                <LivePostCard key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink/50">No posts yet.</p>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
