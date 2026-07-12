// The site's public base URL, used for canonical links, sitemap, and social
// cards. Resolution order:
//   1. NEXT_PUBLIC_SITE_URL   — set this once a custom domain is connected.
//   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable production alias
//      (e.g. coterie-lyart.vercel.app), not the per-deployment URL.
//   3. VERCEL_URL             — per-deployment fallback (preview builds).
//   4. localhost              — local development.
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();
