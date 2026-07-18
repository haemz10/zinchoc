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
- **Moderation:** members can **report** posts/listings/comments; **admins**
  (profiles.is_admin; currently `johnnys2`) review + delete/dismiss at `/admin`.
- **App-style homepage (July 2026 redesign):** communities as an
  Instagram-style row of story circles up top, feed immediately below,
  compact marketplace grid, mobile bottom tab bar (Home / Market / ＋ create
  menu / Messages), one-line footer. Hero/marketing copy and the Founding
  Club section were removed for clarity (the `coterie_waitlist` table and
  `/api/waitlist` endpoint still exist if the club returns).
- **Profiles:** public pages at `/u/[username]` (avatar, bio, joined date,
  their posts/communities/listings); avatars shown on post cards and in the
  header.
- **Settings (`/settings`):** avatar upload, display name/username/bio edit;
  **password change requires re-entering the current password** (re-auth
  before update); notification preferences; list of own content.
- **Notifications:** bell in the header (unread badge, realtime + polling,
  mark-read on open). DB triggers notify on: comments on your posts, posts in
  your communities, joins to your communities, new chat messages. Per-event
  toggles + optional device banner alerts (browser Notification permission)
  + email preference flags (`email_joins`, `email_listing_messages`) stored in
  `coterie_notification_prefs`. NOTE: actual email *sending* is not wired yet —
  it needs a Resend API key as a Supabase Edge Function secret; prefs are
  already recorded and honoured once a sender exists.
- **Premium beige theme:** darker warm palette (page `#eee6d8`, ink `#241f18`,
  ivory `#faf6ed` surfaces) across app, manifest, offline page.
- **Search** (`/search`): communities, members, posts, marketplace (also in
  the mobile tab bar). **Follows** with counts + notifications. **Saves**
  (bookmarks) with a `/saved` page. **Image posts** (photo attach in the
  composer). **Marketplace SOLD** toggle + badges. **Community moderators**
  (owner appoints under "Manage moderators"; RLS lets mods delete posts and
  comments in that community). **Account deletion** (Settings → Danger zone,
  password re-auth, `coterie_delete_account()` RPC).
- **Email notifications:** `notify-email` Edge Function (Resend) drains a
  queue pinged by a pg_net trigger; sends community-join and listing-message
  emails per member prefs. ⚠️ Emails start flowing only after the owner sets
  the `RESEND_API_KEY` secret: Supabase → Edge Functions → notify-email →
  Secrets → add `RESEND_API_KEY` = (Resend API key). Optional `NOTIFY_FROM`
  overrides the sender (default onboarding@resend.dev).
- **Installable app (PWA):** service worker (`public/sw.js`) with offline
  fallback (`public/offline.html`) + static caching; web app manifest with
  standalone display, app shortcuts, maskable icon, theme color; an in-app
  "Install app" prompt (`components/pwa-install.tsx`) — a real install button on
  Android/desktop Chrome and "Add to Home Screen" guidance on iOS Safari.
  Members can download Coterie to their home screen and open it full-screen
  like a native app.
- **Polish:** custom 404, error boundary, robots.txt, sitemap.xml, OG/Twitter
  cards, no `window.confirm` (fast inline confirms), no hydration
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
     Host `smtp.resend.com`, Port `465`, User `resend`, Password `<API key>`.
   - ⚠️ **Sender email MUST be `onboarding@resend.dev`** (or a domain you have
     verified in Resend). A plain gmail.com/other address will be REJECTED by
     Resend and all confirm/reset emails will fail. Fix this if it's currently
     set to a gmail address.

### 🟡 Before a wide public launch (friends-only testing is fine now)
2. **"Confirm email" = ON is correct** — keep it on, but only works once the
   SMTP above is saved and sending. Path: Supabase → Authentication →
   Providers → Email → Confirm email.
3. **Leaked password protection** now lives under Supabase → Authentication →
   **Attack Protection → Bot and Abuse Protection → "Prevent use of leaked
   passwords"** (HaveIBeenPwned check). Requires the Pro plan — recommended
   but NOT launch-blocking; skip until Pro is needed for other reasons.
4. **Supabase is now Coterie-only (DONE).** The abandoned `v0-community-platform-ui`
   footprint was removed from this project: its `on_auth_user_created` trigger,
   `handle_new_user()` function, and unused tables (`profiles`, `posts`,
   `communities`, etc.) were dropped. Only `coterie_*` tables and Coterie's own
   trigger remain. No migration needed. Just don't delete this Supabase project
   when cleaning up the old Vercel project.
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
- Moderation: admins review reports at `/admin`. To change who is admin:
  `update coterie_profiles set is_admin = true where username = '<name>';`

---

## How to resume in a new session
1. **Connect the `haemz10/Coterie` repository** — NOT `haemz10/zinchoc`.
   zinchoc's default branch is the Zin Choc website and contains no Coterie
   files; Coterie only exists there on the backup branch
   `claude/coterie-homepage-redesign-38u35j`. A session opened on zinchoc's
   default branch will report "PROJECT_STATUS.md not found" — that is
   expected, not an error.
2. Read this file first. Code lives in `haemz10/Coterie` (`main`); deploys
   happen automatically on push.
3. Supabase changes: use the Supabase MCP tools against project
   `anwjhnbqqwseyvzctmyl` (apply_migration / execute_sql / get_advisors).
4. Real user data exists (≈8 accounts, a couple of communities/posts) — never
   run destructive DB commands without checking rows are test data first.
