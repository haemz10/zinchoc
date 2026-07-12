// The site's public base URL. On Vercel, VERCEL_URL is set automatically per
// deployment; set NEXT_PUBLIC_SITE_URL once a custom domain is connected so
// canonical URLs, sitemap, and social cards use the real domain.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");
