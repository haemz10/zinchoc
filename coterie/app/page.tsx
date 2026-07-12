import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Feed } from "@/components/feed";
import { Marketplace } from "@/components/marketplace";
import { Communities } from "@/components/communities";
import { FoundingClub } from "@/components/founding-club";
import { SiteFooter } from "@/components/site-footer";
import {
  fetchAllCommunities,
  fetchListings,
  fetchLivePosts,
  fetchMemberCounts,
} from "@/lib/db";

// Feed, communities, listings, and counts come from the database each request.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [livePosts, communities, memberCounts, listings] = await Promise.all([
    fetchLivePosts(),
    fetchAllCommunities(),
    fetchMemberCounts(),
    fetchListings(),
  ]);

  return (
    <main>
      <SiteHeader />
      <Hero />
      <Feed livePosts={livePosts} communities={communities} />
      <Marketplace listings={listings} />
      <Communities communities={communities} memberCounts={memberCounts} />
      <FoundingClub />
      <SiteFooter />
    </main>
  );
}
