// Server-only Stripe Checkout integration. Calls the Stripe REST API directly
// with fetch (no stripe npm SDK; keeps the Worker bundle lean). The restricted
// key lives in the STRIPE_SECRET_KEY secret and never leaves the server; it is
// staged at deploy, so local dev simply has the option disabled.
import { bindings } from "./bindings.server";
import { getSettingValue } from "./data.server";
import type { Order } from "./types";

/** Resolve the active Stripe key: the owner-stored settings value wins, the
 * STRIPE_SECRET_KEY env secret is the fallback. Server-only; the value is
 * never returned to any client. */
export async function stripeKey(): Promise<string> {
  const stored = await getSettingValue("stripe_secret_key");
  if (stored) return stored;
  return bindings().STRIPE_SECRET_KEY ?? "";
}

export async function stripeEnabled(): Promise<boolean> {
  return (await stripeKey()).length > 0;
}

/** Masked display value for admin: empty string when unset, else last 4. */
export async function stripeKeyMasked(): Promise<string> {
  const key = await stripeKey();
  if (!key) return "";
  return `configured, ending ${key.slice(-4)}`;
}

export type StripeCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: "not_configured" | "api_error" };

/** Create a Stripe Checkout session for the whole order total (one line item).
 * Payment confirmation is by Stripe's redirect; reconciliation happens in the
 * owner's Stripe dashboard (no webhooks yet). */
export async function createCheckoutSession(
  order: Order,
  origin: string,
): Promise<StripeCheckoutResult> {
  const key = await stripeKey();
  if (!key) return { ok: false, error: "not_configured" };

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price_data][currency]", "aud");
  params.set(
    "line_items[0][price_data][product_data][name]",
    `Zin Choc order ${order.reference}: ${order.product_name} x ${order.quantity}`,
  );
  params.set("line_items[0][price_data][unit_amount]", String(order.total_cents));
  params.set("line_items[0][quantity]", "1");
  params.set(
    "success_url",
    `${origin}/order/thank-you?ref=${encodeURIComponent(order.reference)}&paid=card`,
  );
  params.set(
    "cancel_url",
    `${origin}/order?piece=${encodeURIComponent(order.product_slug)}&ref=${encodeURIComponent(order.reference)}`,
  );
  params.set("client_reference_id", order.reference);
  params.set("customer_email", order.email);

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    if (!res.ok) {
      // Log status only; never log the request (it carries customer email).
      console.error(`Stripe checkout session failed: HTTP ${res.status}`);
      return { ok: false, error: "api_error" };
    }
    const json = (await res.json()) as { url?: string };
    if (!json.url || !json.url.startsWith("https://")) {
      return { ok: false, error: "api_error" };
    }
    return { ok: true, url: json.url };
  } catch (error) {
    console.error("Stripe checkout session failed:", error instanceof Error ? error.message : "");
    return { ok: false, error: "api_error" };
  }
}
