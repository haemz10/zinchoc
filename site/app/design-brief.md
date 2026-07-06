# Zin Choc — design brief (Phase 0)

## Design read
For engaged couples commissioning wedding bomboniere from a niche artisan chocolatier; the register is a private atelier viewing: quiet, intimate, unhurried luxury, discovered by word of mouth rather than advertised.

## Concept spine
"The site is an invitation being opened." Every beat of the page behaves like receiving and opening a hand-addressed wedding invitation and the black box inside it: a sealed monogram opens onto the scene, sections unfold as panels of the same letter, the enquiry form is the RSVP.

## Delivery tier
`editorial`. The user asked for simple and refined; typography + generated imagery + bespoke chrome, micro-motion only. No Lenis/GSAP scroll choreography.

## Locked palette (user's explicit brand colors; overrides default-family bans)
- `#F3EEE5` warm beige ground / `#EAE3D5` deeper beige panel tint
- `#1C1A17` off-black ink (text + product identity, never #000)
- `#A9853E` gold accent (single accent; muted, sub-80% saturation)
- `#B9BCC2` silver (logo/monogram, hairlines, product chrome only, never as second accent on interactive elements)
Defense: the client explicitly locked beige+gold site atmosphere with black+silver product/logo identity; gold is the one interactive accent, silver is reserved for the mark and hairlines so the page still reads one-accent.

## Locked type
- Display: **Marcellus** (serif). Written justification: Zin Choc is a genuine luxury wedding brand whose whole register is the engraved wedding invitation; Marcellus's inscriptional capitals enact that literally. Not Fraunces/Instrument/Playfair defaults.
- Body/UI: **Inter Tight** (sans), `text-base leading-relaxed max-w-[65ch]`.
- Emphasis inside headlines: italic of same family only.

## Tier-1 technique
**C3, scroll-driven mask reveal** (wow-catalog). The page opens inside a giant ZC monogram / invitation-seal mask over the hero image; scrolling expands the mask until the tablescape goes full bleed. Defense: the spine IS "opening the invitation", and C3 is the catalog's named editorial-compatible opener. Initial paint fully rendered (masked state complete); reduced-motion and mobile get the composed full-bleed hero, static. Anti-convergence: first build in this chat; all six axes derived from the brief's material world (linen, engraving, foil, cacao, ribbon).

## Section plan (home, 7 sections, ≥4 layout families, eyebrow budget 3)
1. **Hero** — full-bleed image with C3 mask reveal; headline left over linen negative space. (family: image-as-canvas)
2. **Atelier story** — split 50/50: craft photograph right, story text left. (family: split text+image)
3. **The collection** — asymmetric product grid, 6 pieces with AUD prices; first item spans wide. (family: asymmetric grid)
4. **How commissioning works** — numbered vertical steps, `divide-y` hairlines, no cards. (family: ruled list)
5. **Questions** (FAQ excerpt, accordion, link to full FAQ page). (family: accordion rows)
6. **Enquiry (RSVP)** — full-width form panel on deeper beige tint; D1-backed server function; payment terms stated (50% deposit invoice, card link or bank transfer). (family: full-width form panel)
7. **Footer** — monogram, Instagram + email icon links, ABN, legal page links. (family: footer)
Eyebrows: max 3 total (hero counts).

## Asset plan (credit-constrained: free plan, 10 credits, 2/image)
Honest deviation from the full kit: no reference boards and no generated icon set; budget goes to the content images that carry the page.
- `hero.png` 16:9 2k tablescape with left negative space (also cropped for OG card)
- `products.png` 16:9 2k, the two real launch pieces (glossy black faceted diamond bonbon with silver seam lines; faceted gemstone dome), split composition CSS-cropped into two product tiles. Owner will supply real per-product photos later; tiles are built to swap images per product.
- `collection-a.png` / `collection-b.png` (earlier generation, invented pieces): NOT used in the launch catalogue; may serve the atelier/story strip only if coherent, else dropped.
- `atelier.png` 3:4 2k chocolatier hands
- Logo: the owner's real mark, an ink-navy heart containing an eye (vector recreation in `zinchoc-logo.svg`); favicon from the same mark. Wordmark "ZIN CHOC" set in Marcellus beside it.
- Icons: minimal; library fallback (Phosphor-style inline SVG) only in form/footer, one stroke style

## Brand mark correction (from owner)
The logo is a heart-with-eye mark in deep ink navy (~#1C3040), not a ZC monogram. The palette's "off-black ink" shifts to this ink navy so mark, product photography (jet-black faceted chocolates with silver lines) and text share one identity. Silver stays hairline/mark-only; gold stays the single interactive accent.

## Launch catalogue (from owner)
Exactly TWO products at launch, both shown in the owner's photo: (1) a faceted diamond-cut dark chocolate bonbon edged with fine silver lines, (2) a faceted gemstone-dome dark chocolate. More pieces will be added after launch and each product's image differs, so the collection grid must read complete at two items (feature-scale tiles, plus one quiet "commissions and new pieces" enquiry tile) and accept new products by adding one data entry.

## CTA inventory (bespoke chrome, one label per intent)
- **"Start your enquiry"** (primary; nav + hero): ink-black bar with gold hairline underline that draws on hover; scrolls to §6.
- **"View the collection"** (secondary; hero only): ghost text link with silver hairline arrow, slides on hover.
- **"Send enquiry"** (form submit): gold seal-shaped button, presses with `scale-[0.98]` active state; loading + success + inline error states fully composed.
- Product tiles: whole-tile hover lift with price reveal underline, links to enquiry with piece preselected. No shared button utility class anywhere.

## Admin mode (owner requirement, added mid-brief)
Owner-facing `/admin` area, plain and functional (not part of the public brand experience, but same type family):
- Login with password (secret `ADMIN_PASSWORD` via website secrets; session cookie, httpOnly, signed, 7-day expiry; rate-limited attempts).
- Products CRUD: name, description, price AUD, unit ("per piece" / "per box of N"), minimum order, image upload (R2, served through a worker route), sort order, visible/hidden. Public collection section renders from D1, so the owner adds pieces without code.
- Enquiries inbox: list of enquiry submissions (name, email, phone, event date, message, product interest, consent timestamp), CSV export of customer emails.
- Settings: contact email, Instagram URL, ABN, business name/address, announcement line. Footer + legal pages read these from D1 so the owner can replace the placeholder ABN themselves.
Infra: `"db": true` + `"r2": true` in app.manifest.json. Owner said they will upload real product images via admin, so generated product imagery is seed/stand-in only where unavoidable, and the nano banana pro two-product split image (job a29f0c43) is NOT used anywhere per owner instruction.

## Pages
`/` (all sections above), `/faq`, `/privacy`, `/terms`, `/shipping-refunds`. Footer carries ABN 00 000 000 000 (owner must replace with registered ABN) and the compliance links. D1 (`"db": true`) stores enquiries; no live card processing (no payment keys), so checkout is enquiry → 50% deposit invoice by email → balance 2 weeks before delivery, stated plainly on the form and terms.

## Order + payment flow (owner requirement, added post-brief)
Visitors can purchase catalogue pieces directly, not only enquire:
- Each collection tile carries one ordering intent, "Order this piece", leading to `/order?piece=<slug>`.
- `/order` renders a composed order form (quantity stepper enforcing the piece's minimum order, live GST-inclusive AUD total, customer details, privacy consent, honeypot). A server function re-validates quantity and price from D1 and creates an `orders` row with a random `ZC-XXXXXX` reference.
- Payment happens off-site, no card data ever touches the app: (1) PayPal standard checkout (guest card checkout included) posting to paypal.com with the order reference, shown only when `paypal_email` is set; (2) bank transfer details from settings, shown only when complete; (3) emailed tax invoice with a card link, always offered; (4) optional hosted card link (`stripe_payment_link`).
- `/order/thank-you?ref=` is the composed confirmation (PayPal return URL). Catalogue orders are paid in full; the 50% deposit terms stay for bespoke commissions via enquiry.
- Admin gains an Orders tab (status pending_payment/paid/confirmed/cancelled, details expand, CSV export) and payment settings (PayPal email, bank account name/BSB/number, card link).

## Site imagery (owner correction)
No generated photography ships. The hero and atelier sections launch as composed typographic/brand states and switch to real photographs when the owner uploads them in admin (settings keys `hero_image_key`, `story_image_key`, R2-served via `/img/<key>`). Product tiles behave the same per product. Only the vector mark (`zinchoc-logo.svg`, favicon) lives in public assets.

## Owner feedback round (post-preview)
- Primary CTA label is "Enquiry" (nav, hero, closing); "Send enquiry" stays on the form submit.
- Footer: Instagram icon only (email icon/mailto removed until the owner assigns a business address); brand line now "Handcrafted wedding chocolate bomboniere and art chocolate boxes, made in Australia." Tagline "Curated artisan chocolates" replaces "Known only to those who know" everywhere, including the atelier story heading.
- Contact email is zinchoc@naver.com (settings migration 0003; all rendered copy reads from settings).
- Brand scope widened: weddings lead, art chocolate bonbon boxes join (hero subline, story copy, meta descriptions).
- Products carry a category (wedding | art); the collection renders two labelled groups, "The Collection · Wedding" and "The Collection · Art", the art group showing a quiet composed enquiry line while empty.
- FAQ is private by default (settings faq_public='0'): the home Questions section, nav/footer FAQ links and /faq hide from visitors until the owner flips "FAQ public" in admin Settings; admin sessions see the page with a notice. Sitemap lists /faq only when public.
- New /gallery page (masonry column grid, captions, composed ink-panel empty state) fed by an admin Gallery tab (R2 upload under gallery/<timestamp>, caption, reorder, hide/show, delete). Nav gains "Gallery" beside "The collection".
