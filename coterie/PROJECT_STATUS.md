# Coterie — Project Status & Handoff

A member-owned community platform (like a quiet Instagram/Facebook, with a
per-community marketplace). This file is the single source of truth so any new
session — human or AI — can resume without losing context.

_Last updated: July 2026._

---

## Links & accounts

- **Live site:** https://coterie-lyart.vercel.app
- **GitHub (source of truth):** https://github.com/haemz10/Coterie — branch `main` (auto-deploys to Vercel)
  - Backup branch in the `haemz10/zinchoc` repo: `claude/coterie-homepage-redesign-38u35j` (mirror of the same code)
- **Hosting:** Vercel project `coterie` (owner: haemz10)
- **Backend:** Supabase project `supabase-green-book` (id `anwjhnbqqwseyvzctmyl`, region us-east-1)
- **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Auth + Postgres + Storage)

The Supabase URL + **publishable (anon)** key are intentionally hardcoded in
`lib/supabase-config.ts` — this key is public by design and protected by RLS.
The **service_role** key is NOT in the code.

---

## What's built (all live)

- **Auth:** email/password sign up & sign in, username + display name, profile
  auto-created on signup (DB trigger + client `ensureProfile` safety net),
  **password reset** ("Forgot password?" → email link → `/auth/reset`).
- **Communities:** anyone can create one (`/communities/new`); clickable pages
  `/c/[id]`; join/leave; owner can edit/delete.
- **Posts:** post into a community; edit/delete your own; likes; **comments**
  (add/edit/delete your own).
- **Marketplace (per-community):** each community has its own marketplace;
  create a listing (`/marketplace/new`, requires choosing a community) with
  title, price + **currency (KRW/AUD/USD/GBP/JPY/EUR)**, description, image
  upload, and an optional external **buy link**; listing detail `/marketplace/[id]`;
  edit/delete your own; **message the seller** (1:1 chat at `/messages`,
  realtime + polling fallback).
- **Moderation:** members can **report** posts/listings/comments → `coterie_reports`
  table (review in the Supabase dashboard; no in-app admin UI yet).
- **Founding Club** section + email waitlist (`coterie_waitlist`).
- **Polish:** custom 404, error boundary, robots.txt, sitemap.xml, OG/Twitter
  cards, PWA manifest, no `window.confirm` (fast inline confirms), no hydration
  warnings, all mock content clearly labelled "Example/Preview".
- **Security hardening applied:** owner-only RLS on every table; storage bucket
  listing disabled; profile trigger locked from RPC; waitlist insert tightened.

### Database tables (schema `public`)
`coterie_profiles`, `coterie_communities`, `coterie_memberships`,
`coterie_posts`, `coterie_likes`, `coterie_comments`, `coterie_listings`,
`coterie_threads`, `coterie_messages`, `coterie_reports`, `coterie_waitlist`.
Storage bucket: `coterie-media` (public, owner-scoped uploads).

---

## ⚠️ WHAT THE OWNER MUST DO (not doable from code)

### 🔴 Now — required for password reset / confirm emails to actually send
1. **Custom SMTP (Resend).** Default Supabase email is rate-limited (~2–3/hr
   project-wide), so reset/confirm emails may not arrive.
   - Sign up at resend.com → create an API key (free: 3,000/mo).
   - Supabase → **Authentication → Emails → SMTP Settings** → Enable Custom SMTP:
     Host `smtp.resend.com`, Port `465`, User `resend`, Password `<API key>`,
     Sender `onboarding@resend.dev` (or your verified domain).

### 🟡 Before a wide public launch (friends-only testing is fine now)
2. **Turn on "Confirm email"** (after SMTP): Supabase → Authentication →
   Providers → Email → Confirm email = ON. Prevents fake/spam accounts.
3. **Turn on "Leaked password protection"**: Supabase → Authentication →
   Providers → Password → enable (HaveIBeenPwned check).
4. **Move to a dedicated Supabase project (recommended).** This project is
   shared with another app (`v0-community-platform-ui`) — same `auth.users`
   and a foreign `handle_new_user()` trigger. If that other project is ever
   reset/deleted, Coterie could break. A clean cutover needs care (migrating
   the real users' accounts) and should be done with SMTP already in place as a
   safety net. Ask the assistant to prepare + run the migration when ready.
5. **Real legal review (optional).** `/legal` now has a solid Privacy Policy +
   Terms draft, but it's not lawyer-reviewed.

### 🟢 Only when connecting a custom domain
6. Vercel → project → Settings → Domains → add your domain; set the DNS records
   Vercel shows at your registrar. Then **also**:
   - Vercel → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` =
     `https://yourdomain.com` → Redeploy.
   - Supabase → Authentication → URL Configuration → set **Site URL** and add
     `https://yourdomain.com/**` to **Redirect URLs** (so email links work).

### ℹ️ Awareness only
- The Vercel Toolbar/INP overlays are visible **only to you** (logged into
  Vercel), never to visitors. Disable via Settings → Toolbar if you like.
- Waitlist has no auto-reply; invite founding members manually from the
  `coterie_waitlist` table (or ask to automate — needs SMTP).
- Moderation currently = report collection only; an admin review UI can be added.

---

## How to resume in a new session
1. Read this file first.
2. Code lives in `haemz10/Coterie` (`main`). Deploys happen automatically on push.
3. Supabase changes: use the Supabase MCP tools against project
   `anwjhnbqqwseyvzctmyl` (apply_migration / execute_sql / get_advisors).
4. Real user data exists (≈8 accounts, a couple of communities/posts) — never
   run destructive DB commands without checking rows are test data first.
