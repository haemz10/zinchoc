import { products } from "@/lib/data";

export function Marketplace() {
  return (
    <section id="marketplace" className="py-16">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-clay">
              Trending in the marketplace
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Small-batch goods from members
            </h2>
            <p className="mt-2 max-w-xl text-ink/60">
              Every listing is made by a person in a community you can join.
              Buy directly from the maker — Coterie never takes an ad cut.
            </p>
          </div>
          <a
            href="#marketplace"
            className="hidden shrink-0 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold transition-colors hover:border-ink/40 sm:block"
          >
            Browse marketplace
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {products.map((p) => (
            <article key={p.id} className="group">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {p.tag && (
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink shadow-sm">
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold">{p.title}</h3>
                  <span className="shrink-0 text-sm font-semibold text-clay">
                    {p.price}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink/50">
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
