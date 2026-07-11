# Coterie

**Ad-free communities, beautifully quiet.**

Coterie is a member-owned home for niche communities. Members share photos and
stories, help each other out, and trade the small-batch goods they make — with
no ads and no algorithm deciding what you see.

Homepage built with **Next.js 14 (App Router)**, **TypeScript**, and
**Tailwind CSS**.

## Highlights

- **Fully self-contained** — all images are vendored in `public/img/` and
  fonts are self-hosted via `next/font`. Zero runtime requests to external
  hosts; renders identically offline or behind strict proxies.
- **Static output** — every route pre-renders at build time (~88 kB first
  load JS). Fast, cheap, CDN-friendly.
- **Responsive** — masonry feed (2→4 columns), 6-column marketplace grid,
  and a mobile hamburger nav.
- **SEO-ready** — Open Graph + Twitter card metadata, SVG favicon, and
  `metadataBase` wired for Vercel.

## Structure

```
app/
  layout.tsx      # fonts, metadata, favicon
  page.tsx        # homepage: hero → feed → marketplace → communities
  legal/page.tsx  # privacy & terms placeholder
components/       # hero, feed, marketplace, communities, header, footer
lib/data.ts       # mock content — swap for a real backend later
public/img/       # vendored images (posts, avatars, products, covers)
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying (Vercel)

1. Push this folder to its own GitHub repository.
2. [vercel.com/new](https://vercel.com/new) → Import the repo.
3. Framework preset **Next.js**, root directory `./` — no env vars needed.
4. Deploy.

Set `NEXT_PUBLIC_SITE_URL` once a custom domain exists so social cards use
the right absolute URLs.

## Placeholder content

The feed, marketplace, and community cards are driven by mock data in
[`lib/data.ts`](./lib/data.ts), with images stored locally under
`public/img/`. Swap this data source for your real backend / member uploads
when wiring things up.
