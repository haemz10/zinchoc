import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "../components/site/SiteFooter";
import { SiteHeader } from "../components/site/SiteHeader";
import { getThankYouData } from "../lib/api/order.functions";
import { formatAud } from "../lib/types";

// Order confirmation. Reached after payment (PayPal return URL) or from the
// payment step. Composed success state with what happens next.

type ThankYouSearch = { ref?: string; paid?: string };

export const Route = createFileRoute("/order_/thank-you")({
  validateSearch: (search: Record<string, unknown>): ThankYouSearch => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
    paid: typeof search.paid === "string" ? search.paid : undefined,
  }),
  loaderDeps: ({ search }) => ({ ref: search.ref ?? "" }),
  loader: async ({ deps }) => getThankYouData({ data: { ref: deps.ref } }),
  head: () => ({
    meta: [
      { title: "Order confirmation | Zin Choc" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const { settings, order, faqVisible, galleryVisible } = Route.useLoaderData();
  const { paid } = Route.useSearch();
  const paidByCard = paid === "card";

  return (
    <>
      <SiteHeader settings={settings} showFaq={faqVisible} showGallery={galleryVisible} />
      <main className="bg-beige">
        <div className="mx-auto max-w-2xl px-5 py-16 md:py-24">
          {order ? (
            <>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">
                Order {order.reference}
              </p>
              <h1 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
                Thank you. We have your order.
              </h1>

              {paidByCard ? (
                <p className="mt-5 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 font-body text-sm font-medium text-ink">
                  Payment received by card. Your Stripe receipt is on its way to your inbox, and we
                  confirm the order against it within one business day.
                </p>
              ) : null}

              <dl className="mt-8 divide-y divide-silver/50 border-y border-silver/50 font-body text-sm">
                <div className="flex justify-between py-3">
                  <dt className="text-ink/60">Piece</dt>
                  <dd className="text-ink">
                    {order.product_name} x {order.quantity}
                  </dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="text-ink/60">Total (includes GST)</dt>
                  <dd className="font-display text-xl text-ink">{formatAud(order.total_cents)}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="text-ink/60">Status</dt>
                  <dd className="text-ink">
                    {paidByCard && order.status === "pending_payment"
                      ? "Payment received by card"
                      : null}
                    {!paidByCard && order.status === "pending_payment" ? "Awaiting payment" : null}
                    {order.status === "paid" ? "Payment received" : null}
                    {order.status === "confirmed" ? "Confirmed" : null}
                    {order.status === "cancelled" ? "Cancelled" : null}
                  </dd>
                </div>
              </dl>

              <h2 className="mt-10 font-display text-xl text-ink">What happens next</h2>
              <ol className="mt-4 space-y-3 font-body text-base leading-relaxed text-ink/75">
                <li className="border-l-2 border-gold/50 pl-4">
                  {paidByCard
                    ? "Your card payment is confirmed by Stripe. We reconcile it and email your tax invoice within one business day."
                    : "We confirm your order and payment by email within one business day, including your tax invoice."}
                </li>
                <li className="border-l-2 border-gold/50 pl-4">
                  We contact you to confirm colours, finishes, delivery date and address before
                  anything is made.
                </li>
                <li className="border-l-2 border-gold/50 pl-4">
                  Your pieces are made by hand in the weeks before your wedding and delivered
                  cold-chain protected, usually two to four days before the day.
                </li>
              </ol>
              <p className="mt-6 font-body text-sm leading-relaxed text-ink/65">
                Catalogue orders like this one are paid in full. For bespoke commissions arranged by
                enquiry, our 50% deposit and balance terms apply as set out in the Terms of Sale.
              </p>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink/65">
                Questions about your order? Email{" "}
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-ink underline decoration-gold underline-offset-4"
                >
                  {settings.contact_email}
                </a>{" "}
                and quote {order.reference}.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl">
                We could not find that order
              </h1>
              <p className="mt-4 font-body text-base leading-relaxed text-ink/75">
                The confirmation link looks incomplete. If you have just paid, your payment is safe:
                email{" "}
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-ink underline decoration-gold underline-offset-4"
                >
                  {settings.contact_email}
                </a>{" "}
                with your name and we will match it to your order.
              </p>
              <a
                href="/#collection"
                className="mt-6 inline-block font-body text-sm text-ink underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
              >
                Back to the collection
              </a>
            </>
          )}
        </div>
      </main>
      <SiteFooter settings={settings} showFaq={faqVisible} />
    </>
  );
}
