import type { Product, Settings } from "../../lib/types";
import { ProductTile } from "./ProductTile";

// The collection, split into two labelled groups: wedding bomboniere (the
// lead) and art bonbon boxes. Renders visible products from D1, plus one quiet
// "commissions and new pieces" enquiry tile so the grid reads complete at
// launch and accepts new pieces by adding a data row. Two-up on desktop,
// stacked on mobile. The art group shows a composed single line while empty,
// never an empty grid.

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-baseline gap-3 font-body text-xs uppercase tracking-[0.25em] text-ink/55">
      <span aria-hidden="true" className="inline-block h-px w-8 self-center bg-silver" />
      {children}
    </h3>
  );
}

export function Collection({
  products,
  settings,
}: {
  products: Product[];
  settings: Settings;
}) {
  const showWedding = settings.show_collection_wedding === "1";
  const showArt = settings.show_collection_art === "1";
  const wedding = showWedding ? products.filter((p) => p.category !== "art") : [];
  const art = showArt ? products.filter((p) => p.category === "art") : [];

  return (
    <section id="collection" className="bg-panel">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">The collection</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink md:text-5xl">
            Made to order, never made twice the same way
          </h2>
          <p className="mt-5 font-body text-base leading-relaxed text-ink/75">
            {settings.collection_intro}
          </p>
        </div>

        {showWedding ? (
        <div className="mt-14">
          <GroupLabel>The Collection &middot; Wedding</GroupLabel>
          {wedding.length > 0 ? (
            <div className="mt-8 grid gap-x-10 gap-y-14 sm:grid-cols-2">
              {wedding.map((product) => (
                <ProductTile key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink/70">
              Wedding pieces are being prepared for the season.{" "}
              <a href="#enquiry" className="text-ink underline decoration-gold underline-offset-4">
                Tell us about your day
              </a>
              .
            </p>
          )}
        </div>
        ) : null}

        {showArt ? (
        <div className="mt-16">
          <GroupLabel>The Collection &middot; Art</GroupLabel>
          {art.length > 0 ? (
            <div className="mt-8 grid gap-x-10 gap-y-14 sm:grid-cols-2">
              {art.map((product) => (
                <ProductTile key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink/70">
              Art bonbon boxes are joining the collection.{" "}
              <a href="#enquiry" className="text-ink underline decoration-gold underline-offset-4">
                Enquire to commission an early piece
              </a>
              .
            </p>
          )}
        </div>
        ) : null}

        {/* Quiet commissions tile: not a product, a different treatment. */}
        <a
          href="#enquiry"
          className="group mt-16 flex flex-col items-start justify-between gap-6 rounded-sm border border-ink/15 bg-beige px-8 py-10 transition-colors hover:border-gold md:flex-row md:items-center"
        >
          <div className="max-w-xl">
            <h3 className="font-display text-2xl text-ink">Commissions and new pieces</h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink/70">
              Beyond the launch collection we design one-off pieces around your story: a motif from
              your invitation, a colour from your table, a form that belongs to the two of you. New
              pieces are added each season.
            </p>
          </div>
          <span className="inline-flex items-center gap-3 font-body text-sm font-medium tracking-wide text-ink transition-colors group-hover:text-gold">
            Enquire about a commission
            <svg viewBox="0 0 32 12" aria-hidden="true" className="h-3 w-8 overflow-visible text-silver transition-transform duration-300 group-hover:translate-x-1.5">
              <line x1="0" y1="6" x2="30" y2="6" stroke="currentColor" strokeWidth="1" />
              <path d="M24 1 L30 6 L24 11" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}
