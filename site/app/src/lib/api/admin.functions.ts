import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { BRAND_COLOR_KEYS, DEFAULT_SETTINGS, HEX_COLOR_RE } from "../types";

import { adminConfigured, hashPassword, isAuthed } from "../auth.server";
import { stripeKeyMasked } from "../stripe.server";
import {
  createFaqItem,
  createProduct,
  deleteFaqItem,
  deleteGalleryImage,
  deleteProduct,
  getAllFaqItems,
  getAllGalleryImages,
  getAllLegalPages,
  getAllProducts,
  getDb,
  getEnquiries,
  getOrders,
  getSettings,
  getSettingValue,
  moveFaqItem,
  moveGalleryImage,
  moveProduct,
  setEnquiryStatus,
  setFaqVisible,
  setGalleryCaption,
  setGalleryVisible,
  setOrderStatus,
  setProductVisible,
  setSetting,
  updateFaqItem,
  updateLegalPage,
  updateProduct,
} from "../data.server";

// Admin server functions. Every data function verifies the signed session
// cookie server-side before touching D1. Never expose secrets in returns.

async function requireAdmin(): Promise<void> {
  const request = getRequest();
  if (!(await isAuthed(request))) {
    throw new Error("Unauthorized");
  }
}

export const getAdminState = createServerFn({ method: "POST" }).handler(async () => {
  const request = getRequest();
  const configured = await adminConfigured();
  const authed = configured ? await isAuthed(request) : false;
  return { configured, authed, dbReady: Boolean(getDb()) };
});

export const adminListProducts = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  return { products: await getAllProducts() };
});

const ProductSchema = z.object({
  id: z.number().int().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens."),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  price_cents: z.number().int().min(0).max(100_000_000),
  unit: z.string().trim().min(1).max(60),
  min_order: z.number().int().min(1).max(100_000),
  sort: z.number().int().min(0).max(100_000),
  visible: z.boolean(),
  category: z.enum(["wedding", "art"]),
});

export const adminSaveProduct = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ProductSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const input = {
      slug: data.slug,
      name: data.name,
      description: data.description,
      price_cents: data.price_cents,
      unit: data.unit,
      min_order: data.min_order,
      sort: data.sort,
      visible: data.visible ? 1 : 0,
      category: data.category,
    };
    try {
      if (data.id) {
        await updateProduct(data.id, input);
      } else {
        await createProduct(input);
      }
      return { ok: true as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("UNIQUE")) {
        return { ok: false as const, error: "That slug is already in use." };
      }
      return { ok: false as const, error: "Could not save the product. Please try again." };
    }
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.number().int() }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    await deleteProduct(data.id);
    return { ok: true as const };
  });

export const adminSetVisible = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.number().int(), visible: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await setProductVisible(data.id, data.visible ? 1 : 0);
    return { ok: true as const };
  });

export const adminMoveProduct = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.number().int(), dir: z.enum(["up", "down"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await moveProduct(data.id, data.dir);
    return { ok: true as const };
  });

export const adminListEnquiries = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  return { enquiries: await getEnquiries() };
});

export const adminSetEnquiryStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.number().int(), status: z.enum(["new", "replied"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await setEnquiryStatus(data.id, data.status);
    return { ok: true as const };
  });

export const adminGetSettings = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  // Never return admin_password_hash or stripe_secret_key: the Stripe key is
  // exposed only as a masked marker, the password only as a boolean.
  const [settings, stripe_key_masked, storedHash] = await Promise.all([
    getSettings(),
    stripeKeyMasked(),
    getSettingValue("admin_password_hash"),
  ]);
  return { settings, stripe_key_masked, admin_password_set: storedHash.length > 0 };
});

const SettingsSchema = z.object({
  contact_email: z.string().trim().max(200),
  instagram_url: z.string().trim().max(300),
  abn: z.string().trim().max(60),
  business_name: z.string().trim().max(120),
  announcement: z.string().trim().max(300),
  faq_public: z.enum(["0", "1"]),
  show_story: z.enum(["0", "1"]),
  show_process: z.enum(["0", "1"]),
  show_gallery: z.enum(["0", "1"]),
  show_collection_wedding: z.enum(["0", "1"]),
  show_collection_art: z.enum(["0", "1"]),
  hero_headline: z.string().trim().max(200),
  hero_subline: z.string().trim().max(600),
  story_heading: z.string().trim().max(200),
  story_body: z.string().trim().max(4000),
  closing_line_1: z.string().trim().max(400),
  collection_intro: z.string().trim().max(800),
  order_notes_hint: z.string().trim().max(300),
  paypal_email: z.string().trim().max(200),
  bank_account_name: z.string().trim().max(120),
  bank_bsb: z.string().trim().max(20),
  bank_account_number: z.string().trim().max(30),
  stripe_payment_link: z.string().trim().max(500),
});

export const adminListOrders = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  return { orders: await getOrders() };
});

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.number().int(),
        status: z.enum(["pending_payment", "paid", "confirmed", "cancelled"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await setOrderStatus(data.id, data.status);
    return { ok: true as const };
  });

export const adminListGallery = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  return { images: await getAllGalleryImages() };
});

export const adminSetGalleryCaption = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.number().int(), caption: z.string().trim().max(300) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await setGalleryCaption(data.id, data.caption);
    return { ok: true as const };
  });

export const adminSetGalleryVisible = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.number().int(), visible: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await setGalleryVisible(data.id, data.visible ? 1 : 0);
    return { ok: true as const };
  });

export const adminMoveGalleryImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.number().int(), dir: z.enum(["up", "down"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await moveGalleryImage(data.id, data.dir);
    return { ok: true as const };
  });

export const adminDeleteGalleryImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.number().int() }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    await deleteGalleryImage(data.id);
    return { ok: true as const };
  });

export const adminClearSiteImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ slot: z.enum(["hero", "story", "logo"]) }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    await setSetting(`${data.slot}_image_key`, "");
    return { ok: true as const };
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SettingsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    await setSetting("contact_email", data.contact_email);
    await setSetting("instagram_url", data.instagram_url);
    await setSetting("abn", data.abn);
    await setSetting("business_name", data.business_name);
    await setSetting("announcement", data.announcement);
    await setSetting("faq_public", data.faq_public);
    await setSetting("show_story", data.show_story);
    await setSetting("show_process", data.show_process);
    await setSetting("show_gallery", data.show_gallery);
    await setSetting("show_collection_wedding", data.show_collection_wedding);
    await setSetting("show_collection_art", data.show_collection_art);
    await setSetting("hero_headline", data.hero_headline);
    await setSetting("hero_subline", data.hero_subline);
    await setSetting("story_heading", data.story_heading);
    await setSetting("story_body", data.story_body);
    await setSetting("closing_line_1", data.closing_line_1);
    await setSetting("collection_intro", data.collection_intro);
    await setSetting("order_notes_hint", data.order_notes_hint);
    await setSetting("paypal_email", data.paypal_email);
    await setSetting("bank_account_name", data.bank_account_name);
    await setSetting("bank_bsb", data.bank_bsb);
    await setSetting("bank_account_number", data.bank_account_number);
    await setSetting("stripe_payment_link", data.stripe_payment_link);
    return { ok: true as const };
  });

// ---- FAQ management ----------------------------------------------------------

export const adminListFaq = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  return { items: await getAllFaqItems() };
});

export const adminSaveFaqItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.number().int().optional(),
        question: z.string().trim().min(1).max(300),
        answer: z.string().trim().min(1).max(4000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    if (data.id) {
      await updateFaqItem(data.id, data.question, data.answer);
    } else {
      await createFaqItem(data.question, data.answer);
    }
    return { ok: true as const };
  });

export const adminSetFaqVisible = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.number().int(), visible: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await setFaqVisible(data.id, data.visible ? 1 : 0);
    return { ok: true as const };
  });

export const adminMoveFaqItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.number().int(), dir: z.enum(["up", "down"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await moveFaqItem(data.id, data.dir);
    return { ok: true as const };
  });

export const adminDeleteFaqItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.number().int() }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    await deleteFaqItem(data.id);
    return { ok: true as const };
  });

// ---- Legal pages ---------------------------------------------------------------

export const adminListLegalPages = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  return { pages: await getAllLegalPages() };
});

export const adminSaveLegalPage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        slug: z.enum(["privacy", "terms", "shipping-refunds"]),
        title: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(60000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await updateLegalPage(data.slug, data.title, data.body);
    return { ok: true as const };
  });

// ---- Admin password + Stripe key self-service (write-only secrets) ------------

export const adminChangePassword = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ password: z.string().min(10).max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const hash = await hashPassword(data.password);
    await setSetting("admin_password_hash", hash);
    return { ok: true as const };
  });

export const adminSetStripeKey = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ key: z.string().trim().min(8).max(300) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await setSetting("stripe_secret_key", data.key);
    return { ok: true as const, masked: await stripeKeyMasked() };
  });

export const adminClearStripeKey = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  await setSetting("stripe_secret_key", "");
  return { ok: true as const, masked: await stripeKeyMasked() };
});

// ---- Brand colours -------------------------------------------------------------

const HexColor = z.string().trim().regex(HEX_COLOR_RE, "Colours must be #rgb or #rrggbb hex.");

const ColorsSchema = z.object({
  color_ground: HexColor,
  color_panel: HexColor,
  color_ink: HexColor,
  color_gold: HexColor,
  color_silver: HexColor,
});

export const adminSaveColors = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const parsed = ColorsSchema.safeParse(data);
    if (!parsed.success) {
      // Surface a friendly, typed failure instead of a thrown zod error so the
      // admin UI can show it inline; nothing is saved on invalid input.
      return { invalid: true as const };
    }
    return { invalid: false as const, colors: parsed.data };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    if (data.invalid) {
      return {
        ok: false as const,
        error: "One of the colours is not a valid hex value (#rgb or #rrggbb). Nothing was saved.",
      };
    }
    for (const key of BRAND_COLOR_KEYS) {
      await setSetting(key, data.colors[key].toLowerCase());
    }
    return { ok: true as const };
  });

export const adminResetColors = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  for (const key of BRAND_COLOR_KEYS) {
    await setSetting(key, DEFAULT_SETTINGS[key]);
  }
  return { ok: true as const };
});
