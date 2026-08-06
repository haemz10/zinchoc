import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteFooter } from "../components/site/SiteFooter";
import { SiteHeader } from "../components/site/SiteHeader";
import { StripeCardCta } from "../components/site/StripeCardCta";
import {
  getOrderPageData,
  recordPaymentMethod,
  submitOrder,
  type SubmitOrderResult,
} from "../lib/api/order.functions";
import { cardPaymentLink } from "../lib/payments";
import { formatAud, type Product, type Settings } from "../lib/types";

// The order page: choose a piece, place the order (server-validated, minimum
// order enforced), then pay. Payment is off-site (PayPal incl. guest card
// checkout, bank transfer, or an emailed tax invoice), so no card details are
// ever entered on this site.

type OrderSearch = { piece?: string };

export const Route = createFileRoute("/order")({
  validateSearch: (search: Record<string, unknown>): OrderSearch => ({
    piece: typeof search.piece === "string" ? search.piece : undefined,
  }),
  loaderDeps: ({ search }) => ({ piece: search.piece ?? "" }),
  loader: async ({ deps }) => getOrderPageData({ data: { piece: deps.piece } }),
  head: () => ({
    meta: [
      { title: "Order | Zin Choc" },
      {
        name: "description",
        content: "Place an order for Zin Choc handcrafted artisan chocolate catering.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: OrderPage,
});

const inputClass =
  "w-full rounded-sm border border-ink/25 bg-beige px-3.5 py-2.5 font-body text-base text-ink placeholder:text-ink/35 focus:border-gold focus:outline-none";
const labelClass = "font-body text-sm font-medium text-ink";
const errorClass = "mt-1 font-body text-sm text-[#8a2f2f]";

type Placed = Extract<SubmitOrderResult, { ok: true }>;

function OrderPage() {
  const {
    settings,
    products,
    product,
    productImages,
    origin,
    dbReady,
    faqVisible,
    galleryVisible,
    stripeEnabled,
  } = Route.useLoaderData();

  return (
    <>
      <SiteHeader settings={settings} showFaq={faqVisible} showGallery={galleryVisible} />
      <main className="bg-beige">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          {product ? (
            <OrderFlow
              product={product}
              productImages={productImages}
              settings={settings}
              origin={origin}
              dbReady={dbReady}
              stripeEnabled={stripeEnabled}
            />
          ) : (
            <PieceChooser products={products} />
          )}
        </div>
      </main>
      <SiteFooter settings={settings} showFaq={faqVisible} />
    </>
  );
}

function PieceChooser({ products }: { products: Product[] }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl">
        Which piece would you like to order?
      </h1>
      <p className="mt-4 font-body text-base leading-relaxed text-ink/75">
        Choose a piece from the collection. For bespoke commissions, please start with an enquiry
        instead.
      </p>
      <ul className="mt-8 divide-y divide-silver/50 border-t border-silver/50">
        {products.map((p) => (
          <li key={p.slug}>
            <a
              href={`/order?piece=${encodeURIComponent(p.slug)}`}
              className="group flex items-center justify-between gap-4 py-5 transition-colors hover:text-gold"
            >
              <span>
                <span className="font-display text-xl text-ink group-hover:text-gold">
                  {p.name}
                </span>
                <span className="mt-1 block font-body text-sm text-ink/60">
                  {formatAud(p.price_cents)} {p.unit}, minimum {p.min_order}
                </span>
              </span>
              <svg
                viewBox="0 0 32 12"
                aria-hidden="true"
                className="h-3 w-8 shrink-0 overflow-visible text-silver transition-transform duration-300 group-hover:translate-x-1.5"
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
            </a>
          </li>
        ))}
      </ul>
      <a
        href="/#enquiry"
        className="mt-8 inline-block font-body text-sm text-ink underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
      >
        Prefer to talk first? Tell us about your day.
      </a>
    </div>
  );
}

// Product photo gallery for the order page: a large active image with a
// thumbnail strip when there is more than one. Client-only interactivity.
function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];
  return (
    <div className="mb-6">
      <img
        src={`/img/${current}`}
        alt={`${name}, a Zin Choc piece`}
        className="aspect-[4/5] w-full rounded-sm object-cover"
      />
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((key, i) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              className={`overflow-hidden rounded-sm border ${
                i === active ? "border-gold" : "border-transparent"
              }`}
            >
              <img
                src={`/img/${key}`}
                alt=""
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OrderFlow({
  product,
  productImages,
  settings,
  origin,
  dbReady,
  stripeEnabled,
}: {
  product: Product;
  productImages: string[];
  settings: Settings;
  origin: string;
  dbReady: boolean;
  stripeEnabled: boolean;
}) {
  const [placed, setPlaced] = useState<Placed | null>(null);

  if (placed) {
    return (
      <PaymentStep
        placed={placed}
        product={product}
        settings={settings}
        origin={origin}
        stripeEnabled={stripeEnabled}
      />
    );
  }
  return (
    <OrderForm
      product={product}
      productImages={productImages}
      dbReady={dbReady}
      notesHint={settings.order_notes_hint}
      leadTime={settings.lead_time_text}
      onPlaced={setPlaced}
    />
  );
}

function OrderForm({
  product,
  productImages,
  dbReady,
  notesHint,
  leadTime,
  onPlaced,
}: {
  product: Product;
  productImages: string[];
  dbReady: boolean;
  notesHint: string;
  leadTime: string;
  onPlaced: (p: Placed) => void;
}) {
  const [quantity, setQuantity] = useState(product.min_order);
  const [fields, setFields] = useState({
    customer_name: "",
    email: "",
    phone: "",
    event_date: "",
    delivery_address: "",
    notes: "",
    consent: false,
    company: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = product.price_cents * quantity;

  const set = <K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) =>
    setFields((f) => ({ ...f, [key]: value }));

  function clampQuantity(v: number): number {
    if (!Number.isFinite(v)) return product.min_order;
    return Math.max(product.min_order, Math.min(100_000, Math.round(v)));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const clientErrors: Record<string, string> = {};
    if (!fields.customer_name.trim()) clientErrors.customer_name = "Please tell us your name.";
    if (!fields.email.trim()) clientErrors.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
      clientErrors.email = "Please enter a valid email address.";
    if (quantity < product.min_order)
      clientErrors.quantity = `The minimum order for ${product.name} is ${product.min_order}.`;
    if (!fields.consent)
      clientErrors.consent = "Please agree to the privacy policy so we can process your order.";
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await submitOrder({
        data: {
          product_slug: product.slug,
          quantity,
          customer_name: fields.customer_name,
          email: fields.email,
          phone: fields.phone,
          event_date: fields.event_date,
          delivery_address: fields.delivery_address,
          notes: fields.notes,
          consent: fields.consent,
          company: fields.company,
        },
      });
      if (result.ok) {
        onPlaced(result);
      } else {
        if (result.errors) setErrors(result.errors);
        if (result.formError) setFormError(result.formError);
      }
    } catch {
      setFormError("Something went wrong placing your order. Please try again or email us.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
      {/* Product summary */}
      <aside>
        {productImages.length > 0 ? (
          <ProductGallery images={productImages} name={product.name} />
        ) : null}
        <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">Your order</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
          {product.name}
        </h1>
        <p className="mt-4 max-w-md font-body text-base leading-relaxed text-ink/75">
          {product.description}
        </p>
        <dl className="mt-6 max-w-md divide-y divide-silver/50 border-y border-silver/50 font-body text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-ink/60">Price</dt>
            <dd className="text-ink">
              {formatAud(product.price_cents)} {product.unit}
            </dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-ink/60">Minimum order</dt>
            <dd className="text-ink">{product.min_order}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-ink/60">Lead time</dt>
            <dd className="text-ink">{leadTime}</dd>
          </div>
        </dl>
        <p className="mt-4 max-w-md font-body text-xs leading-relaxed text-ink/55">
          Prices are in Australian dollars and include GST. Delivery is quoted separately once we
          confirm your date and address.
        </p>
      </aside>

      {/* Order form */}
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {!dbReady ? (
          <p className="rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 font-body text-sm text-ink">
            Ordering is not connected just yet. Please email us and we will invoice you directly.
          </p>
        ) : null}
        {formError ? (
          <p className="rounded-sm border border-[#8a2f2f]/30 bg-[#8a2f2f]/5 px-4 py-3 font-body text-sm text-[#8a2f2f]">
            {formError}
          </p>
        ) : null}

        {/* Quantity + live total */}
        <div className="rounded-sm border border-ink/15 bg-panel p-5">
          <label htmlFor="o-qty" className={labelClass}>
            Quantity
          </label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => clampQuantity(q - 1))}
              aria-label="Decrease quantity"
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-ink/25 font-body text-lg text-ink transition-transform active:scale-[0.98] disabled:opacity-40"
              disabled={quantity <= product.min_order}
            >
              -
            </button>
            <input
              id="o-qty"
              name="quantity"
              type="number"
              min={product.min_order}
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value || "0", 10) || 0)}
              onBlur={() => setQuantity((q) => clampQuantity(q))}
              className="w-24 rounded-sm border border-ink/25 bg-beige px-3 py-2 text-center font-body text-base text-ink focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => clampQuantity(q + 1))}
              aria-label="Increase quantity"
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-ink/25 font-body text-lg text-ink transition-transform active:scale-[0.98]"
            >
              +
            </button>
            <div className="ml-auto text-right">
              <p className="font-body text-xs uppercase tracking-[0.15em] text-ink/50">Total</p>
              <p className="font-display text-2xl text-ink">
                {formatAud(product.price_cents * clampQuantity(quantity))}
              </p>
              <p className="font-body text-xs text-ink/55">includes GST</p>
            </div>
          </div>
          {errors.quantity ? <p className={errorClass}>{errors.quantity}</p> : null}
          <p className="mt-2 font-body text-xs text-ink/55">
            Minimum {product.min_order}. Need a different quantity for an intimate wedding? Send an
            enquiry instead.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="o-name" className={labelClass}>
              Name
            </label>
            <input
              id="o-name"
              type="text"
              autoComplete="name"
              value={fields.customer_name}
              onChange={(e) => set("customer_name", e.target.value)}
              required
              aria-invalid={Boolean(errors.customer_name)}
              aria-describedby={errors.customer_name ? "oe-name" : undefined}
              className={`mt-1.5 ${inputClass}`}
            />
            {errors.customer_name ? (
              <p id="oe-name" className={errorClass}>
                {errors.customer_name}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="o-email" className={labelClass}>
              Email
            </label>
            <input
              id="o-email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "oe-email" : undefined}
              className={`mt-1.5 ${inputClass}`}
            />
            {errors.email ? (
              <p id="oe-email" className={errorClass}>
                {errors.email}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="o-phone" className={labelClass}>
              Phone <span className="text-ink/45">(optional)</span>
            </label>
            <input
              id="o-phone"
              type="tel"
              autoComplete="tel"
              value={fields.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="o-date" className={labelClass}>
              Wedding or event date <span className="text-ink/45">(optional)</span>
            </label>
            <input
              id="o-date"
              type="date"
              value={fields.event_date}
              onChange={(e) => set("event_date", e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="o-address" className={labelClass}>
            Delivery address <span className="text-ink/45">(optional, can be confirmed later)</span>
          </label>
          <textarea
            id="o-address"
            rows={2}
            autoComplete="street-address"
            value={fields.delivery_address}
            onChange={(e) => set("delivery_address", e.target.value)}
            className={`mt-1.5 ${inputClass} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="o-notes" className={labelClass}>
            Notes <span className="text-ink/45">(optional)</span>
          </label>
          <textarea
            id="o-notes"
            rows={3}
            value={fields.notes}
            onChange={(e) => set("notes", e.target.value)}
            aria-describedby={notesHint.trim() ? "o-notes-hint" : undefined}
            className={`mt-1.5 ${inputClass} resize-y`}
          />
          {notesHint.trim() ? (
            <p id="o-notes-hint" className="mt-1 font-body text-xs text-ink/55">
              {notesHint}
            </p>
          ) : null}
        </div>

        {/* Honeypot: visually hidden, off-screen, not announced. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="o-company">Company</label>
          <input
            id="o-company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={fields.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="o-consent" className="flex items-start gap-3">
            <input
              id="o-consent"
              type="checkbox"
              checked={fields.consent}
              onChange={(e) => set("consent", e.target.checked)}
              required
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? "oe-consent" : undefined}
              className="mt-1 h-4 w-4 shrink-0 accent-gold"
            />
            <span className="font-body text-sm leading-relaxed text-ink/75">
              I agree that Zin Choc may use the details above to process my order, as described in
              the{" "}
              <a href="/privacy" className="text-ink underline decoration-gold underline-offset-4">
                privacy policy
              </a>
              .
            </span>
          </label>
          {errors.consent ? (
            <p id="oe-consent" className={errorClass}>
              {errors.consent}
            </p>
          ) : null}
        </div>

        {/* Place order: its own garment, a full-width ink bar whose gold leading
            edge widens on hover, distinct from the enquiry seal. */}
        <button
          type="submit"
          disabled={submitting || !dbReady}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-sm bg-ink px-8 py-4 font-body text-base font-medium tracking-wide text-beige transition-transform duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-gold transition-all duration-300 ease-out group-hover:w-2.5"
          />
          {submitting ? "Placing your order..." : "Place order"}
        </button>
        <p className="font-body text-xs leading-relaxed text-ink/55">
          Placing your order reserves it with us; you choose how to pay on the next step. Nothing is
          charged on this page.
        </p>
      </form>
    </div>
  );
}

function PaymentStep({
  placed,
  product,
  settings,
  origin,
  stripeEnabled,
}: {
  placed: Placed;
  product: Product;
  settings: Settings;
  origin: string;
  stripeEnabled: boolean;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const totalDollars = (placed.total_cents / 100).toFixed(2);
  const hasBank =
    settings.bank_account_name.trim() &&
    settings.bank_bsb.trim() &&
    settings.bank_account_number.trim();
  const thankYouUrl = `${origin}/order/thank-you?ref=${encodeURIComponent(placed.reference)}`;

  function choose(method: "paypal" | "bank_transfer" | "invoice" | "card_link") {
    setChosen(method);
    void recordPaymentMethod({ data: { reference: placed.reference, method } }).catch(() => {
      // annotation only; never block payment on it
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">Order placed</p>
      <h1 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
        Thank you. Your order is reserved.
      </h1>

      <dl className="mt-8 divide-y divide-silver/50 border-y border-silver/50 font-body text-sm">
        <div className="flex justify-between py-3">
          <dt className="text-ink/60">Order reference</dt>
          <dd className="font-semibold tracking-wide text-ink">{placed.reference}</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink/60">Piece</dt>
          <dd className="text-ink">
            {placed.product_name || product.name} x {placed.quantity}
          </dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink/60">Total (includes GST)</dt>
          <dd className="font-display text-xl text-ink">{formatAud(placed.total_cents)}</dd>
        </div>
      </dl>
      <p className="mt-4 font-body text-sm leading-relaxed text-ink/70">
        A copy of these details has been recorded against your reference. Choose how you would like
        to pay:
      </p>

      <div className="mt-6 space-y-4">
        {stripeEnabled ? (
          <div className="rounded-sm border border-ink/15 bg-panel p-5">
            <h2 className="font-display text-lg text-ink">Pay by card</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
              Pay securely by credit or debit card. You are taken to our Stripe checkout and
              returned here once payment is complete.
            </p>
            <StripeCardCta reference={placed.reference} totalCents={placed.total_cents} />
          </div>
        ) : null}

        {settings.paypal_email.trim() ? (
          <div className="rounded-sm border border-ink/15 bg-panel p-5">
            <h2 className="font-display text-lg text-ink">PayPal, or credit and debit card</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
              Pay securely through PayPal. You do not need a PayPal account: choose "Pay with card"
              at PayPal for guest checkout.
            </p>
            <form
              method="post"
              action="https://www.paypal.com/cgi-bin/webscr"
              onSubmit={() => choose("paypal")}
              className="mt-4"
            >
              <input type="hidden" name="cmd" value="_xclick" />
              <input type="hidden" name="business" value={settings.paypal_email} />
              <input type="hidden" name="item_name" value={`Zin Choc order ${placed.reference}`} />
              <input type="hidden" name="item_number" value={placed.reference} />
              <input type="hidden" name="amount" value={totalDollars} />
              <input type="hidden" name="currency_code" value="AUD" />
              <input type="hidden" name="no_shipping" value="1" />
              <input type="hidden" name="return" value={thankYouUrl} />
              <input
                type="hidden"
                name="cancel_return"
                value={`${origin}/order?piece=${encodeURIComponent(product.slug)}`}
              />
              <button
                type="submit"
                className="inline-flex items-center rounded-sm bg-gold px-6 py-3 font-body text-sm font-semibold text-ink transition-transform duration-200 hover:-translate-y-px active:scale-[0.98]"
              >
                Pay {formatAud(placed.total_cents)} with PayPal
              </button>
            </form>
          </div>
        ) : null}

        {!stripeEnabled && settings.stripe_payment_link.trim() ? (
          <div className="rounded-sm border border-ink/15 bg-panel p-5">
            <h2 className="font-display text-lg text-ink">Pay by card</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
              Pay by card through our secure payment page. Please quote your order reference{" "}
              <strong>{placed.reference}</strong> in the payment description.
            </p>
            <a
              href={cardPaymentLink(settings.stripe_payment_link, placed.reference)}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => choose("card_link")}
              className="mt-4 inline-flex items-center rounded-sm border border-ink px-6 py-3 font-body text-sm font-semibold text-ink transition-transform duration-200 hover:-translate-y-px active:scale-[0.98]"
            >
              Open card payment page
            </a>
          </div>
        ) : null}

        <div className="rounded-sm border border-ink/15 bg-panel p-5">
          <h2 className="font-display text-lg text-ink">Bank transfer</h2>
          {hasBank ? (
            <>
              <dl className="mt-3 space-y-1.5 font-body text-sm text-ink/80">
                <div className="flex gap-3">
                  <dt className="w-36 shrink-0 text-ink/55">Account name</dt>
                  <dd>{settings.bank_account_name}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-36 shrink-0 text-ink/55">BSB</dt>
                  <dd>{settings.bank_bsb}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-36 shrink-0 text-ink/55">Account number</dt>
                  <dd>{settings.bank_account_number}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-36 shrink-0 text-ink/55">Description</dt>
                  <dd className="font-semibold">{placed.reference}</dd>
                </div>
              </dl>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink/70">
                Please use your order reference as the payment description. Production is scheduled
                once funds clear, usually one to two business days.
              </p>
              <button
                type="button"
                onClick={() => choose("bank_transfer")}
                className="mt-3 inline-flex items-center rounded-sm border border-ink/25 px-4 py-2 font-body text-xs font-medium text-ink transition-transform active:scale-[0.98]"
              >
                {chosen === "bank_transfer"
                  ? "Noted, paying by transfer"
                  : "I will pay by transfer"}
              </button>
            </>
          ) : (
            <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
              Bank transfer details are provided on your invoice.
            </p>
          )}
        </div>

        <div className="rounded-sm border border-ink/15 bg-panel p-5">
          <h2 className="font-display text-lg text-ink">Invoice by email</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
            Prefer a tax invoice first? No further action is needed: we email your tax invoice with
            a secure card payment link within one business day.
          </p>
          <button
            type="button"
            onClick={() => choose("invoice")}
            className="mt-3 inline-flex items-center rounded-sm border border-ink/25 px-4 py-2 font-body text-xs font-medium text-ink transition-transform active:scale-[0.98]"
          >
            {chosen === "invoice" ? "Noted, invoice on its way" : "Send me the invoice"}
          </button>
        </div>
      </div>

      <a
        href={`/order/thank-you?ref=${encodeURIComponent(placed.reference)}`}
        className="mt-8 inline-block font-body text-sm text-ink underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
      >
        Continue to your order confirmation
      </a>
    </div>
  );
}
