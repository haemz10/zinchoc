import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MessageSellerButton } from "@/components/message-seller-button";
import { ListingOwnerActions } from "@/components/listing-owner-actions";
import { fetchListing } from "@/lib/db";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const listing = await fetchListing(params.id);
  if (!listing) return { title: "Listing not found — Coterie" };
  return {
    title: `${listing.title} — Coterie Marketplace`,
    description: listing.description ?? `${listing.title} by a Coterie member.`,
  };
}

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await fetchListing(params.id);
  if (!listing) notFound();

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <a
          href="/#marketplace"
          className="text-xs font-semibold uppercase tracking-widest text-ink/40 hover:text-ink"
        >
          ← Marketplace
        </a>

        <div className="mt-4 grid gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-clay/15 via-cream to-moss/15">
            <div className="aspect-square">
              {listing.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-5xl text-ink/20">
                  🛍️
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {listing.community && (
              <a
                href={`/c/${listing.community.id}`}
                className="text-sm font-semibold text-clay hover:underline"
              >
                {listing.community.name}
              </a>
            )}
            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-2 text-2xl font-semibold text-clay">
              {formatPrice(listing.price, listing.currency)}
            </p>
            <p className="mt-2 text-sm text-ink/55">
              Sold by @{listing.maker?.username ?? "member"}
            </p>

            {listing.description && (
              <p className="mt-5 whitespace-pre-wrap leading-relaxed text-ink/75">
                {listing.description}
              </p>
            )}

            <div className="mt-8 space-y-3">
              {listing.buy_url && (
                <a
                  href={listing.buy_url}
                  target="_blank"
                  rel="noopener nofollow noreferrer"
                  className="block w-full rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
                >
                  Buy now ↗
                </a>
              )}
              <MessageSellerButton
                listingId={listing.id}
                sellerId={listing.user_id}
              />
              <ListingOwnerActions
                listingId={listing.id}
                ownerId={listing.user_id}
              />
              <p className="text-center text-xs text-ink/45">
                Coterie never takes a cut. Arrange payment and delivery directly
                with the maker.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
