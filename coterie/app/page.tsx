import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Feed } from "@/components/feed";
import { Marketplace } from "@/components/marketplace";
import { Communities } from "@/components/communities";
import { FoundingClub } from "@/components/founding-club";
import { SiteFooter } from "@/components/site-footer";
import {
  fetchAllCommunities,
  fetchLivePosts,
  fetchMemberCounts,
} from "@/lib/db";

// Feed, communities, and member counts come from the database on every request.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [livePosts, communities, memberCounts] = await Promise.all([
    fetchLivePosts(),
    fetchAllCommunities(),
    fetchMemberCounts(),
  ]);

  return (
    <main>
      <SiteHeader />
      <Hero />
      <Feed livePosts={livePosts} communities={communities} />
      <Marketplace />
      <Communities communities={communities} memberCounts={memberCounts} />
      <FoundingClub />
      <SiteFooter />
    </main>
  );
}
