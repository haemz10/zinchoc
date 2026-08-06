import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { isAuthed } from "../auth.server";
import { createCheckoutSession, stripeEnabled } from "../stripe.server";
import {
  getDb,
  getOrderByReference,
  getProductImages,
  getSettings,
  getVisibleProductBySlug,
  getVisibleProducts,
  insertOrder,
  setOrderPaymentMethod,
} from "../data.server";

// Order flow server functions. The order is created here with a unique
// reference; payment happens off-site (PayPal, bank transfer, emailed
// invoice), so no card data ever touches this application. Totals and minimum
// order quantities are enforced server-side from the product row, never
// trusted from the client.

function requestOrigin(): string {
  try {
    return new URL(getRequest().url).origin;
  } catch {
    return "";
  }
}

async function isAdminSession(): Promise<boolean> {
  try {
    return await isAuthed(getRequest());
  } catch {
    return false;
  }
}

// Unambiguous alphabet (no O/0/I/1 lookalikes), cryptographically random.
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newReference(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += REF_ALPHABET[b % REF_ALPHABET.length];
  return `ZC-${out}`;
}

export const getOrderPageData = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ piece: z.string().max(120) }).parse(data))
  .handler(async ({ data }) => {
    const [settings, products] = await Promise.all([getSettings(), getVisibleProducts()]);
    const product = data.piece ? await getVisibleProductBySlug(data.piece) : null;
    // All photos for the chosen piece (cover first) for the order-page gallery.
    const productImages = product
      ? (await getProductImages(product.id)).map((i) => i.image_key)
      : [];
    return {
      settings,
      products,
      product,
      productImages,
      origin: requestOrigin(),
      dbReady: Boolean(getDb()),
      faqVisible: settings.faq_public === "1" || (await isAdminSession()),
      galleryVisible: settings.show_gallery === "1" || (await isAdminSession()),
      stripeEnabled: await stripeEnabled(),
    };
  });

const OrderSchema = z.object({
  product_slug: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(100_000),
  customer_name: z.string().trim().min(1, "Please tell us your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().max(40).optional().default(""),
  event_date: z.string().trim().max(40).optional().default(""),
  delivery_address: z.string().trim().max(500).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  consent: z.boolean(),
  // Honeypot: real people leave this empty.
  company: z.string().optional().default(""),
});

export type SubmitOrderResult =
  | {
      ok: true;
      reference: string;
      total_cents: number;
      quantity: number;
      product_name: string;
    }
  | { ok: false; formError?: string; errors?: Record<string, string> };

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => OrderSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitOrderResult> => {
    // Honeypot tripped: pretend success with a plausible-looking reference.
    if (data.company && data.company.trim().length > 0) {
      return {
        ok: true,
        reference: newReference(),
        total_cents: 0,
        quantity: data.quantity,
        product_name: "",
      };
    }

    if (!data.consent) {
      return {
        ok: false,
        errors: { consent: "Please agree to the privacy policy so we can process your order." },
      };
    }

    if (!getDb()) {
      return {
        ok: false,
        formError:
          "Ordering is not connected just yet. Please email us and we will invoice you directly.",
      };
    }

    const product = await getVisibleProductBySlug(data.product_slug);
    if (!product) {
      return { ok: false, formError: "That piece is no longer available. Please choose another." };
    }

    if (data.quantity < product.min_order) {
      return {
        ok: false,
        errors: {
          quantity: `The minimum order for ${product.name} is ${product.min_order}.`,
        },
      };
    }

    const total = product.price_cents * data.quantity;

    // Retry on the vanishingly small chance of a reference collision.
    for (let attempt = 0; attempt < 3; attempt++) {
      const reference = newReference();
      try {
        await insertOrder({
          reference,
          product_slug: product.slug,
          product_name: product.name,
          quantity: data.quantity,
          unit_price_cents: product.price_cents,
          total_cents: total,
          customer_name: data.customer_name,
          email: data.email,
          phone: data.phone ? data.phone : null,
          event_date: data.event_date ? data.event_date : null,
          delivery_address: data.delivery_address ? data.delivery_address : null,
          notes: data.notes ? data.notes : null,
          consent_at: new Date().toISOString(),
        });
        return {
          ok: true,
          reference,
          total_cents: total,
          quantity: data.quantity,
          product_name: product.name,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (!message.includes("UNIQUE")) {
          return {
            ok: false,
            formError: "Something went wrong placing your order. Please try again or email us.",
          };
        }
      }
    }
    return {
      ok: false,
      formError: "Something went wrong placing your order. Please try again or email us.",
    };
  });

export const recordPaymentMethod = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        reference: z.string().trim().min(1).max(40),
        method: z.enum(["paypal", "bank_transfer", "invoice", "card_link", "card"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    // Reference is an unguessable random token; recording the chosen payment
    // path is a harmless annotation, so no further auth is required.
    await setOrderPaymentMethod(data.reference, data.method);
    return { ok: true as const };
  });

export type StripeCheckoutFnResult = { ok: true; url: string } | { ok: false; error: string };

export const createStripeCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ reference: z.string().trim().min(1).max(40) }).parse(data),
  )
  .handler(async ({ data }): Promise<StripeCheckoutFnResult> => {
    if (!(await stripeEnabled())) {
      return { ok: false, error: "Card payment is not available." };
    }
    const order = await getOrderByReference(data.reference);
    if (!order || order.deleted_at || order.status !== "pending_payment") {
      return { ok: false, error: "This order is not awaiting payment." };
    }
    const result = await createCheckoutSession(order, requestOrigin());
    if (!result.ok) {
      return {
        ok: false,
        error: "Card payment is temporarily unavailable, please choose another method.",
      };
    }
    await setOrderPaymentMethod(order.reference, "card");
    return { ok: true, url: result.url };
  });

export const getThankYouData = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ ref: z.string().trim().max(40) }).parse(data))
  .handler(async ({ data }) => {
    const settings = await getSettings();
    const order = data.ref ? await getOrderByReference(data.ref) : null;
    // Public page: expose only non-sensitive order fields. A deleted order is
    // treated as not found.
    return {
      settings,
      origin: requestOrigin(),
      stripeEnabled: await stripeEnabled(),
      faqVisible: settings.faq_public === "1" || (await isAdminSession()),
      galleryVisible: settings.show_gallery === "1" || (await isAdminSession()),
      order:
        order && !order.deleted_at
          ? {
              reference: order.reference,
              product_name: order.product_name,
              quantity: order.quantity,
              total_cents: order.total_cents,
              status: order.status,
              payment_method: order.payment_method,
            }
          : null,
    };
  });
