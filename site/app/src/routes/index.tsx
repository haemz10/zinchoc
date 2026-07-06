import { createFileRoute } from "@tanstack/react-router";

import { StructuredData } from "../components/StructuredData";
import { AtelierStory } from "../components/site/AtelierStory";
import { ClosingCta } from "../components/site/ClosingCta";
import { Collection } from "../components/site/Collection";
import { EnquirySection } from "../components/site/EnquirySection";
import { FaqExcerpt } from "../components/site/FaqExcerpt";
import { Hero } from "../components/site/Hero";
import { HowItWorks } from "../components/site/HowItWorks";
import { SiteFooter } from "../components/site/SiteFooter";
import { SiteHeader } from "../components/site/SiteHeader";
import { getHomeData } from "../lib/api/public.functions";

export const Route = createFileRoute("/")({
  loader: async () => getHomeData(),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const title = "Zin Choc | Wedding Chocolate Bomboniere, Made in Australia";
    const description =
      "Luxury artisan chocolate, handcrafted to order in Australia: wedding bomboniere and collectible art bonbon boxes.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Zin Choc" },
        ...(origin ? [{ property: "og:url", content: `${origin}/` }] : []),
      ],
      links: origin ? [{ rel: "canonical", href: `${origin}/` }] : [],
    };
  },
  component: Home,
});

function Home() {
  const { products, settings, origin, faqVisible, galleryVisible, faqItems } =
    Route.useLoaderData();
  const showCollection =
    settings.show_collection_wedding === "1" || settings.show_collection_art === "1";

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": origin ? `${origin}/#business` : "#business",
        name: settings.business_name || "Zin Choc",
        description:
          "Luxury artisan chocolate, handcrafted to order in Australia: wedding bomboniere and collectible art bonbon boxes.",
        email: settings.contact_email,
        ...(origin ? { url: origin } : {}),
        image: origin ? `${origin}/favicon.svg` : undefined,
        areaServed: "AU",
        address: { "@type": "PostalAddress", addressCountry: "AU" },
        sameAs: settings.instagram_url ? [settings.instagram_url] : undefined,
      },
      {
        "@type": "WebSite",
        "@id": origin ? `${origin}/#website` : "#website",
        name: "Zin Choc",
        ...(origin ? { url: origin } : {}),
        inLanguage: "en-AU",
      },
    ],
  });

  return (
    <>
      <StructuredData json={jsonLd} />
      <SiteHeader settings={settings} showFaq={faqVisible} showGallery={galleryVisible} />
      <main>
        <Hero settings={settings} />
        {settings.show_story === "1" ? <AtelierStory settings={settings} /> : null}
        {showCollection ? <Collection products={products} settings={settings} /> : null}
        {settings.show_process === "1" ? <HowItWorks /> : null}
        {faqVisible ? <FaqExcerpt items={faqItems} settings={settings} /> : null}
        <EnquirySection products={products} settings={settings} />
        <ClosingCta settings={settings} />
      </main>
      <SiteFooter settings={settings} showFaq={faqVisible} />
    </>
  );
}
