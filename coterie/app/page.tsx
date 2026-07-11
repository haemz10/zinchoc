import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Feed } from "@/components/feed";
import { Marketplace } from "@/components/marketplace";
import { Communities } from "@/components/communities";
import { Waitlist } from "@/components/waitlist";
import { SiteFooter } from "@/components/site-footer";
import { fetchLivePosts, fetchMemberCounts } from "@/lib/db";

// The feed and member counts come from the database on every request.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [livePosts, memberCounts] = await Promise.all([
    fetchLivePosts(),
    fetchMemberCounts(),
  ]);

  return (
    <main>
      <SiteHeader />
      <Hero />
      <Feed livePosts={livePosts} />
      <Marketplace />
      <Communities memberCounts={memberCounts} />
      <Waitlist />
      <SiteFooter />
    </main>
  );
}
