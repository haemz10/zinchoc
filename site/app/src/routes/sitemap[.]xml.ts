import { createFileRoute } from "@tanstack/react-router";

import { getSettings } from "../lib/data.server";

type SitemapRoute = {
  path: string;
  priority: string;
  changefreq: string;
  faqOnly?: boolean;
  galleryOnly?: boolean;
  settingKey?: "show_page_privacy" | "show_page_terms" | "show_page_shipping";
};

const ROUTES: SitemapRoute[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/gallery", priority: "0.7", changefreq: "weekly", galleryOnly: true },
  { path: "/faq", priority: "0.7", changefreq: "monthly", faqOnly: true },
  { path: "/privacy", priority: "0.3", changefreq: "yearly", settingKey: "show_page_privacy" },
  { path: "/terms", priority: "0.3", changefreq: "yearly", settingKey: "show_page_terms" },
  {
    path: "/shipping-refunds",
    priority: "0.3",
    changefreq: "yearly",
    settingKey: "show_page_shipping",
  },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const today = new Date().toISOString().split("T")[0];
        // The FAQ page is listed only while the owner has it set public.
        const settings = await getSettings();
        const faqPublic = settings.faq_public === "1";
        const galleryPublic = settings.show_gallery === "1";
        const urls = ROUTES.filter(
          (r) =>
            (faqPublic || !r.faqOnly) &&
            (galleryPublic || !r.galleryOnly) &&
            (!r.settingKey || settings[r.settingKey] !== "0"),
        )
          .map(
            (r) => `  <url>
    <loc>${origin}${r.path === "/" ? "" : r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
          )
          .join("\n");
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          urls,
          "</urlset>",
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
