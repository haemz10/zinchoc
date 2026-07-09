// Server-only Stripe Checkout integration. Calls the Stripe REST API directly
// with fetch (no stripe npm SDK; keeps the Worker bundle lean). Two key
// sources exist: the owner-stored settings value and the STRIPE_SECRET_KEY
// deploy secret. The stored key is preferred, but if Stripe rejects it the
// deploy secret is tried next, so a mistyped key pasted in admin Settings can
// never take card payments down while a working secret is staged.
import { bindings } from "./bindings.server";
import { getSettingValue } from "./data.server";
import type { Order } from "./types";

export type StripeKeySource = "settings" | "secret";

type KeyCandidate = { key: string; source: StripeKeySource };

/** All usable keys in preference order: owner-stored first, deploy secret as
 * the fallback. Server-only; values never leave the server. */
async function keyCandidates(): Promise<KeyCandidate[]> {
  const out: KeyCandidate[] = [];
  const stored = (await getSettingValue("stripe_secret_key")).trim();
  if (stored) out.push({ key: stored, source: "settings" });
  const env = (bindings().STRIPE_SECRET_KEY ?? "").trim();
  if (env && env !== stored) out.push({ key: env, source: "secret" });
  return out;
}

export async function stripeEnabled(): Promise<boolean> {
  return (await keyCandidates()).length > 0;
}

/** Masked display value for admin: empty string when unset, else last 4. */
export async function stripeKeyMasked(): Promise<string> {
  const stored = (await getSettingValue("stripe_secret_key")).trim();
  if (stored) return `configured in Settings, ending ${stored.slice(-4)}`;
  const env = (bindings().STRIPE_SECRET_KEY ?? "").trim();
  if (env) return `configured at deploy, ending ${env.slice(-4)}`;
  return "";
}

/** Stripe's own error description (their messages mask key material, e.g.
 * "Invalid API Key provided: rk_live_*****"). Truncated for UI display. */
export type StripeFailure = { status: number; code: string; message: string };

type SessionAttempt = { ok: true; url: string; id: string } | { ok: false; failure: StripeFailure };

async function stripeApi(
  key: string,
  path: string,
  params: URLSearchParams,
): Promise<{ res: Response; json: Record<string, unknown> }> {
  const res = await fetch(`https://api.stripe.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    // non-JSON body; leave json empty
  }
  return { res, json };
}

function failureFrom(res: Response, json: Record<string, unknown>): StripeFailure {
  const err = (json.error ?? {}) as { code?: string; type?: string; message?: string };
  return {
    status: res.status,
    code: err.code ?? err.type ?? `http_${res.status}`,
    message: (err.message ?? "Stripe did not accept the request.").slice(0, 400),
  };
}

async function createSessionWithKey(key: string, params: URLSearchParams): Promise<SessionAttempt> {
  try {
    const { res, json } = await stripeApi(key, "/v1/checkout/sessions", params);
    if (!res.ok) return { ok: false, failure: failureFrom(res, json) };
    const url = typeof json.url === "string" ? json.url : "";
    const id = typeof json.id === "string" ? json.id : "";
    if (!url.startsWith("https://")) {
      return {
        ok: false,
        failure: {
          status: res.status,
          code: "no_url",
          message: "Stripe returned no checkout URL.",
        },
      };
    }
    return { ok: true, url, id };
  } catch (error) {
    return {
      ok: false,
      failure: {
        status: 0,
        code: "network_error",
        message: error instanceof Error ? error.message.slice(0, 400) : "Network error.",
      },
    };
  }
}

function checkoutParams(order: Order, origin: string): URLSearchParams {
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
  return params;
}

export type StripeCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: "not_configured" | "api_error"; failure?: StripeFailure };

/** Create a Stripe Checkout session for the whole order total (one line item).
 * Tries the stored key first, then the deploy secret. Payment confirmation is
 * by Stripe's redirect; reconciliation happens in the owner's Stripe dashboard
 * (no webhooks yet). */
export async function createCheckoutSession(
  order: Order,
  origin: string,
): Promise<StripeCheckoutResult> {
  const candidates = await keyCandidates();
  if (candidates.length === 0) return { ok: false, error: "not_configured" };

  const params = checkoutParams(order, origin);
  let lastFailure: StripeFailure | undefined;
  for (const candidate of candidates) {
    const attempt = await createSessionWithKey(candidate.key, params);
    if (attempt.ok) return { ok: true, url: attempt.url };
    lastFailure = attempt.failure;
    // Log status/code only; never log the request (it carries customer email).
    console.error(
      `Stripe checkout session failed [key from ${candidate.source}]: HTTP ${attempt.failure.status} ${attempt.failure.code}`,
    );
  }
  return { ok: false, error: "api_error", failure: lastFailure };
}

/** Immediately expire a diagnostic checkout session so it never lingers as a
 * payable link. Best effort. */
async function expireSession(key: string, sessionId: string): Promise<void> {
  try {
    await stripeApi(key, `/v1/checkout/sessions/${sessionId}/expire`, new URLSearchParams());
  } catch {
    // open sessions expire on their own after 24h
  }
}

function diagnosticParams(origin: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price_data][currency]", "aud");
  params.set(
    "line_items[0][price_data][product_data][name]",
    "Zin Choc admin diagnostic (not a real order)",
  );
  params.set("line_items[0][price_data][unit_amount]", "100");
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${origin}/admin`);
  params.set("cancel_url", `${origin}/admin`);
  params.set("metadata[diagnostic]", "1");
  return params;
}

/** Verify one key can create Checkout sessions by doing exactly that, then
 * expiring the test session. Nothing is charged. */
export async function validateStripeKey(
  key: string,
  origin: string,
): Promise<{ ok: true } | { ok: false; failure: StripeFailure }> {
  const attempt = await createSessionWithKey(key.trim(), diagnosticParams(origin));
  if (!attempt.ok) return { ok: false, failure: attempt.failure };
  await expireSession(key.trim(), attempt.id);
  return { ok: true };
}

export type StripeDiagnostic = {
  source: StripeKeySource;
  key_tail: string;
  ok: boolean;
  failure?: StripeFailure;
};

/** Run the diagnostic against every configured key. Admin-only caller. */
export async function stripeDiagnostics(origin: string): Promise<StripeDiagnostic[]> {
  const candidates = await keyCandidates();
  const results: StripeDiagnostic[] = [];
  for (const candidate of candidates) {
    const check = await validateStripeKey(candidate.key, origin);
    results.push({
      source: candidate.source,
      key_tail: candidate.key.slice(-4),
      ok: check.ok,
      ...(check.ok ? {} : { failure: check.failure }),
    });
  }
  return results;
}
