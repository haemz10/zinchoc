import type { Listing } from "@/lib/db";
import { formatPrice } from "@/lib/currency";

// Compact, app-like marketplace grid — a title, a sell button, the goods.
export function Marketplace({ listings = [] }: { listings?: Listing[] }) {
  const hasListings = listings.length > 0;

  return (
    <section id="marketplace" className="border-t border-black/5 bg-white/60 py-8">
      <div className="container-page">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            Marketplace
          </h2>
          <a
            href="/marketplace/new"
            className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
          >
            ＋ Sell
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
                  {l.sold && (
                    <span className="absolute left-2 top-2 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-cream">
                      Sold
                    </span>
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
          <div className="rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-clay/10 text-2xl">
              🛍️
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold">
              Nothing for sale yet
            </h3>
            <a
              href="/marketplace/new"
              className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              List the first item
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
