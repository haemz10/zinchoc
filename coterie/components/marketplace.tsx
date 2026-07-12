import { products } from "@/lib/data";

export function Marketplace() {
  return (
    <section id="marketplace" className="py-16">
      <div className="container-page">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-clay/30 bg-clay/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-clay">
            Coming soon
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            A marketplace, made by members
          </h2>
          <p className="mt-2 max-w-xl text-ink/60">
            Soon, members will sell the small-batch goods they make — bought
            directly from the maker, with Coterie never taking a cut. Here&apos;s
            a preview of what that will look like.
          </p>
        </div>

        {/* Preview only — deliberately non-interactive and clearly labelled so
            it can't be mistaken for a live storefront. */}
        <div
          aria-hidden
          className="pointer-events-none grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {products.map((p) => (
            <article key={p.id}>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink/70 shadow-sm">
                  Example
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold text-ink/70">
                    {p.title}
                  </h3>
                  <span className="shrink-0 text-sm font-semibold text-clay/70">
                    {p.price}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink/40">
                  {p.maker} · {p.community}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
