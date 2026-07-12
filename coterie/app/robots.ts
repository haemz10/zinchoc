import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private app surfaces out of search results.
      disallow: ["/api/", "/auth", "/messages"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
