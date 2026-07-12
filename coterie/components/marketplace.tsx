import { products } from "@/lib/data";
import type { Listing } from "@/lib/db";
import { formatPrice } from "@/lib/currency";

export function Marketplace({ listings = [] }: { listings?: Listing[] }) {
  const hasListings = listings.length > 0;

  return (
    <section id="marketplace" className="py-16">
      <div className="container-page">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-clay">
              Marketplace
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Small-batch goods from members
            </h2>
            <p className="mt-2 max-w-xl text-ink/60">
              List what you make and sell directly to other members — Coterie
              never takes a cut.
            </p>
          </div>
          <a
            href="/marketplace/new"
            className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
          >
            List an item
          </a>
        </div>

        {hasListings ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {listings.map((l) => (
              <a key={l.id} href={`/marketplace/${l.id}`} className="group">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-clay/15 via-cream to-moss/15">
                  {l.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.image}
                      alt={l.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-3xl text-ink/20">
                      🛍️
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold">{l.title}</h3>
                    <span className="shrink-0 text-sm font-semibold text-clay">
                      {formatPrice(l.price, l.currency)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink/50">
                    @{l.maker?.username ?? "member"}
                    {l.community ? ` · ${l.community.name}` : ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-10 rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-clay/10 text-2xl">
                🛍️
              </div>
              <h3 className="mt-4 font-serif text-2xl font-semibold">
                Nothing for sale yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-ink/60">
                Be the first to list something you make — a mug, a print, a jar
                of starter. It takes a minute.
              </p>
              <a
                href="/marketplace/new"
                className="mt-5 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                List an item
              </a>
            </div>

            {/* Clearly-labelled preview so the empty section still shows intent. */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                Preview — example listings
              </span>
              <span className="h-px flex-1 bg-ink/10" />
            </div>
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
          </>
        )}
      </div>
    </section>
  );
}
