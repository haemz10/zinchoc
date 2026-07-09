import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Feed } from "@/components/feed";
import { Marketplace } from "@/components/marketplace";
import { Communities } from "@/components/communities";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <Feed />
      <Marketplace />
      <Communities />
      <SiteFooter />
    </main>
  );
}
