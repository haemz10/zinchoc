# Coterie

**Ad-free communities, beautifully quiet.**

Coterie is a member-owned home for niche communities. Members share photos and
stories, help each other out, and trade the small-batch goods they make — with
no ads and no algorithm deciding what you see.

This repo is a fresh rebuild of the homepage, focused on making it obvious what
Coterie *is* the moment you land:

- **A clear hero** that explains the platform in one glance.
- **The marketplace tagline promoted to the top** — "Trending in the
  marketplace · Small-batch goods from members across every community" — so new
  visitors immediately understand the value.
- **A photo-rich, Instagram / Cosmos-style feed** so the page feels full of
  real member posts and images from the start.
- **Trending marketplace goods** and **featured communities** sections.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

This is a standard Next.js app and deploys to [Vercel](https://vercel.com/) with
zero configuration — import the repo and click Deploy.

## Placeholder content

The feed, marketplace, and community cards are driven by mock data in
[`lib/data.ts`](./lib/data.ts). Images use `picsum.photos` (deterministic by
seed) so everything renders without an API key. Swap this data source for your
real backend / member uploads when wiring things up.
