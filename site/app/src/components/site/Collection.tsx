import type { Category, Product, Settings } from "../../lib/types";
import { normalizeCategory } from "../../lib/types";
import { ProductTile } from "./ProductTile";

// The collection: every visible product in one responsive grid (two-up on
// desktop, stacked on mobile) so pieces sit side by side instead of each on its
// own row. Products are ordered by category (in the order set in admin) and
// carry their category name as a small label on the tile. Plus one quiet
// "commissions and new pieces" enquiry tile so the grid reads complete.

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
  // Flatten to one list in category order; each tile keeps its category label.
  const tiles = visible.flatMap((category) =>
    products
      .filter((p) => normalizeCategory(p.category, visible) === category.key)
      .map((product) => ({ product, label: category.label })),
  );

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

        {tiles.length > 0 ? (
          <div className="mt-12 grid gap-x-10 gap-y-14 sm:grid-cols-2">
            {tiles.map(({ product, label }) => (
              <ProductTile
                key={product.slug}
                product={product}
                logoKey={settings.logo_image_key}
                categoryLabel={label}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 max-w-xl font-body text-base leading-relaxed text-ink/70">
            The collection is being prepared.{" "}
            <a href="#enquiry" className="text-ink underline decoration-gold underline-offset-4">
              Enquire about a commission
            </a>
            .
          </p>
        )}

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
