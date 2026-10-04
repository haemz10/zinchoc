import type { Category, Product, Settings } from "../../lib/types";
import { normalizeCategory } from "../../lib/types";
import { ProductTile } from "./ProductTile";

// The collection, split into owner-managed, labelled groups (one per visible
// category, in the order set in admin). Each product is placed by its category
// key; legacy/unknown values fall back to the first category so nothing is
// lost. Plus one quiet "commissions and new pieces" enquiry tile so the grid
// reads complete. Two-up on desktop, stacked on mobile.

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
  categories,
}: {
  products: Product[];
  settings: Settings;
  categories: Category[];
}) {
  const visible = categories.filter((c) => c.visible === 1);
  const groups = visible.map((category) => ({
    category,
    items: products.filter((p) => normalizeCategory(p.category, visible) === category.key),
  }));

  return (
    <section id="collection" className="bg-panel">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">
            {settings.collection_kicker}
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink md:text-5xl">
            {settings.collection_heading}
          </h2>
          <p className="mt-5 font-body text-base leading-relaxed text-ink/75">
            {settings.collection_intro}
          </p>
        </div>

        {groups.map(({ category, items }, index) => (
          <div key={category.key} className={index === 0 ? "mt-14" : "mt-16"}>
            <GroupLabel>{category.label}</GroupLabel>
            {items.length > 0 ? (
              <div className="mt-8 grid gap-x-10 gap-y-14 sm:grid-cols-2">
                {items.map((product) => (
                  <ProductTile
                    key={product.slug}
                    product={product}
                    logoKey={settings.logo_image_key}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink/70">
                Pieces for this collection are being prepared.{" "}
                <a
                  href="#enquiry"
                  className="text-ink underline decoration-gold underline-offset-4"
                >
                  Enquire about a commission
                </a>
                .
              </p>
            )}
          </div>
        ))}

        {/* Quiet commissions tile: not a product, a different treatment. */}
        <a
          href="#enquiry"
          className="group mt-16 flex flex-col items-start justify-between gap-6 rounded-sm border border-ink/15 bg-beige px-8 py-10 transition-colors hover:border-gold md:flex-row md:items-center"
        >
          <div className="max-w-xl">
            <h3 className="font-display text-2xl text-ink">{settings.commission_heading}</h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink/70">
              {settings.commission_body}
            </p>
          </div>
          <span className="inline-flex items-center gap-3 font-body text-sm font-medium tracking-wide text-ink transition-colors group-hover:text-gold">
            Enquire about a commission
            <svg
              viewBox="0 0 32 12"
              aria-hidden="true"
              className="h-3 w-8 overflow-visible text-silver transition-transform duration-300 group-hover:translate-x-1.5"
            >
              <line x1="0" y1="6" x2="30" y2="6" stroke="currentColor" strokeWidth="1" />
              <path
                d="M24 1 L30 6 L24 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}
