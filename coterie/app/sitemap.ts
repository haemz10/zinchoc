import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { fetchAllCommunities } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const communities = await fetchAllCommunities();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, priority: 1 },
    { url: `${siteUrl}/legal`, lastModified: now, priority: 0.3 },
  ];

  const communityRoutes: MetadataRoute.Sitemap = communities.map((c) => ({
    url: `${siteUrl}/c/${c.id}`,
    lastModified: now,
    priority: 0.7,
  }));

  return [...staticRoutes, ...communityRoutes];
}
