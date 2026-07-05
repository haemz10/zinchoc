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

## Pages
`/` (all sections above), `/faq`, `/privacy`, `/terms`, `/shipping-refunds`. Footer carries ABN 00 000 000 000 (owner must replace with registered ABN) and the compliance links. D1 (`"db": true`) stores enquiries; no live card processing (no payment keys), so checkout is enquiry → 50% deposit invoice by email → balance 2 weeks before delivery, stated plainly on the form and terms.
