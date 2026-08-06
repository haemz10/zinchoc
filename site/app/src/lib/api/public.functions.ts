import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { isAuthed } from "../auth.server";
import { z } from "zod";

import {
  getLegalPage,
  getSettings,
  getVisibleFaqItems,
  getVisibleGalleryImages,
  getVisibleProducts,
} from "../data.server";
import { sanitizeBrandColors, sanitizeEdgeFrame } from "../types";

// Public read functions. Route loaders call these (RPC) instead of importing
// *.server.ts directly, because loaders also run in the browser on client-side
// navigation. Server-only code stays server-only.

function requestOrigin(): string {
  try {
    return new URL(getRequest().url).origin;
  } catch {
    return "";
  }
}

async function adminSession(): Promise<boolean> {
  try {
    return await isAuthed(getRequest());
  } catch {
    return false;
  }
}

// Brand colours for the root <style> injection. Sanitized server-side so an
// invalid stored value can never break the page (falls back to defaults).
export const getBrandColors = createServerFn({ method: "GET" }).handler(async () => {
  const settings = await getSettings();
  return { colors: sanitizeBrandColors(settings), frame: sanitizeEdgeFrame(settings) };
});

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const [products, settings, isAdmin] = await Promise.all([
    getVisibleProducts(),
    getSettings(),
    adminSession(),
  ]);
  const faqVisible = settings.faq_public === "1" || isAdmin;
  const galleryVisible = settings.show_gallery === "1" || isAdmin;
  const faqItems = faqVisible ? (await getVisibleFaqItems()).slice(0, 4) : [];
  return {
    products,
    settings,
    origin: requestOrigin(),
    faqVisible,
    galleryVisible,
    isAdmin,
    faqItems,
  };
});

export const getFaqPageData = createServerFn({ method: "GET" }).handler(async () => {
  const [settings, isAdmin] = await Promise.all([getSettings(), adminSession()]);
  const faqVisible = settings.faq_public === "1" || isAdmin;
  const galleryVisible = settings.show_gallery === "1" || isAdmin;
  const items = faqVisible ? await getVisibleFaqItems() : [];
  return { settings, origin: requestOrigin(), faqVisible, galleryVisible, isAdmin, items };
});

// Which settings switch publishes each information page. Hidden pages keep
// their saved content; admins still preview them with a notice.
const PAGE_VISIBILITY_KEY = {
  privacy: "show_page_privacy",
  terms: "show_page_terms",
  "shipping-refunds": "show_page_shipping",
} as const;

export const getLegalPageData = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.enum(["privacy", "terms", "shipping-refunds"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const [settings, isAdmin, page] = await Promise.all([
      getSettings(),
      adminSession(),
      getLegalPage(data.slug),
    ]);
    const faqVisible = settings.faq_public === "1" || isAdmin;
    const galleryVisible = settings.show_gallery === "1" || isAdmin;
    const pagePublic = settings[PAGE_VISIBILITY_KEY[data.slug]] !== "0";
    const pageVisible = pagePublic || isAdmin;
    return {
      settings,
      origin: requestOrigin(),
      faqVisible,
      galleryVisible,
      isAdmin,
      pagePublic,
      page: pageVisible ? page : null,
    };
  });

export const getPageData = createServerFn({ method: "GET" }).handler(async () => {
  const [settings, isAdmin] = await Promise.all([getSettings(), adminSession()]);
  const faqVisible = settings.faq_public === "1" || isAdmin;
  const galleryVisible = settings.show_gallery === "1" || isAdmin;
  return { settings, origin: requestOrigin(), faqVisible, galleryVisible, isAdmin };
});

export const getGalleryData = createServerFn({ method: "GET" }).handler(async () => {
  const [settings, isAdmin] = await Promise.all([getSettings(), adminSession()]);
  const faqVisible = settings.faq_public === "1" || isAdmin;
  const galleryVisible = settings.show_gallery === "1" || isAdmin;
  const images = galleryVisible ? await getVisibleGalleryImages() : [];
  return { settings, images, origin: requestOrigin(), faqVisible, galleryVisible, isAdmin };
});
