import { SiteHeader } from "@/components/site-header";
import { CommunityStories } from "@/components/community-stories";
import { Feed } from "@/components/feed";
import { Marketplace } from "@/components/marketplace";
import { SiteFooter } from "@/components/site-footer";
import {
  fetchAllCommunities,
  fetchListings,
  fetchLivePosts,
  fetchMemberCounts,
} from "@/lib/db";

// Feed, communities, listings, and counts come from the database each request.
export const dynamic = "force-dynamic";

// App-style home: communities as story circles up top, then the feed,
// then the marketplace. No hero, no marketing copy — the content is the pitch.
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
      <CommunityStories communities={communities} memberCounts={memberCounts} />
      <Feed livePosts={livePosts} communities={communities} />
      <Marketplace listings={listings} />
      <SiteFooter />
    </main>
  );
}
