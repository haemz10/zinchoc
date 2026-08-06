// Shared, client-safe types. No bindings or secrets here.

export type ProductCategory = "wedding" | "art";

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  unit: string;
  min_order: number;
  image_key: string | null;
  video_key: string | null;
  sort: number;
  visible: number;
  category: string;
};

export type GalleryImage = {
  id: number;
  image_key: string | null;
  video_key: string | null;
  caption: string | null;
  sort: number;
  visible: number;
  created_at: string | null;
};

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  sort: number;
  visible: number;
};

export type LegalPage = {
  slug: string;
  title: string;
  body: string;
  updated_at: string | null;
};

export type Settings = {
  contact_email: string;
  instagram_url: string;
  abn: string;
  business_name: string;
  announcement: string;
  hero_image_key: string;
  story_image_key: string;
  logo_image_key: string;
  og_image_key: string;
  faq_public: string;
  hero_kicker: string;
  hero_headline: string;
  hero_subline: string;
  story_heading: string;
  story_body: string;
  story_closing_line: string;
  collection_kicker: string;
  collection_heading: string;
  collection_wedding_label: string;
  collection_art_label: string;
  commission_heading: string;
  commission_body: string;
  enquiry_kicker: string;
  enquiry_heading: string;
  enquiry_intro: string;
  closing_heading: string;
  closing_line_1: string;
  collection_intro: string;
  order_notes_hint: string;
  process_heading: string;
  process_intro: string;
  process_steps: string;
  gallery_empty_text: string;
  lead_time_text: string;
  footer_blurb: string;
  show_page_privacy: string;
  show_page_terms: string;
  show_page_shipping: string;
  color_ground: string;
  color_panel: string;
  color_ink: string;
  color_gold: string;
  color_silver: string;
  edge_frame_enabled: string;
  edge_frame_color: string;
  edge_frame_thickness: string;
  edge_frame_inset: string;
  show_story: string;
  show_process: string;
  show_gallery: string;
  show_collection_wedding: string;
  show_collection_art: string;
  paypal_email: string;
  bank_account_name: string;
  bank_bsb: string;
  bank_account_number: string;
  stripe_payment_link: string;
};

export type OrderStatus = "pending_payment" | "paid" | "confirmed" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["pending_payment", "paid", "confirmed", "cancelled"];

export type Order = {
  id: number;
  reference: string;
  product_slug: string;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  customer_name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  delivery_address: string | null;
  notes: string | null;
  payment_method: string | null;
  status: string;
  consent_at: string | null;
  created_at: string;
  updated_at: string;
  reminder_sent_at: string | null;
  deleted_at: string | null;
};

export type Enquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  guest_count: number | null;
  product_slug: string | null;
  message: string;
  consent_at: string | null;
  created_at: string;
  status: string;
};

export const DEFAULT_SETTINGS: Settings = {
  contact_email: "zinchoc@naver.com",
  instagram_url: "https://instagram.com/zinchoc",
  abn: "ABN 00 000 000 000",
  business_name: "Zin Choc",
  announcement: "",
  hero_image_key: "",
  story_image_key: "",
  logo_image_key: "",
  og_image_key: "",
  faq_public: "0",
  hero_kicker: "Wedding bomboniere, made in Australia",
  hero_headline: "Where art meets chocolate.",
  hero_subline:
    "Handcrafted wedding bomboniere and collectible art bonbon boxes. Made to order in Australia, in small numbers, for a small number of commissions each season.",
  story_heading: "Curated artisan chocolates",
  story_body:
    "Zin Choc is not found in shops. Each piece begins as a sketch, becomes a mould, and is finished by hand in cocoa butter, gold and silver. We make wedding bomboniere the way a jeweller makes a ring: slowly, precisely, and for one couple at a time.\n\nWe work with fine couverture chocolate and take on a limited number of weddings each season, so every guest at your table receives something made, not manufactured. Every shell is polished, every box tied by hand, every detail matched to the two of you. Between weddings, the same hands cut and paint our art bonbon boxes: small collectible editions of the atelier's work.",
  story_closing_line: "Begin with a conversation. Tell us about your day.",
  collection_kicker: "The collection",
  collection_heading: "Made to order, never made twice the same way",
  collection_wedding_label: "The Collection · Wedding",
  collection_art_label: "The Collection · Art",
  commission_heading: "Commissions and new pieces",
  commission_body:
    "Beyond the launch collection we design one-off pieces around your story: a motif from your invitation, a colour from your table, a form that belongs to the two of you. New pieces are added each season.",
  enquiry_kicker: "Your enquiry",
  enquiry_heading: "Begin with a conversation",
  enquiry_intro:
    "Tell us about your day. We reply within two business days, and every enquiry is read by the person who will make your pieces.",
  closing_heading: "Dates for the coming season are limited",
  closing_line_1: "If your wedding is within six months, we recommend enquiring now.",
  collection_intro:
    "Every piece is designed for one wedding, or made in a small collectible edition. All prices are in Australian dollars and include GST. Delivery is quoted separately, and lead time is four to six weeks from design approval.",
  order_notes_hint: "",
  process_heading: "How commissioning works",
  process_intro: "A Zin Choc commission unfolds in five quiet steps.",
  process_steps: [
    "Enquire\nWrite to us with your wedding date, guest numbers and the feeling you want your favours to carry. We reply within two business days.",
    "Tasting and consultation\nWe arrange a tasting of our couverture and signature fillings, in person in Melbourne or by courier elsewhere in Australia, and talk through colours, finishes and packaging.",
    "Custom design\nWe prepare a design proposal for your bomboniere: flavours, finishes, monograms or motifs, and packaging. You approve every detail before anything is made. A 50% deposit secures your date.",
    "Production\nYour pieces are made by hand in the weeks before your wedding, timed so the chocolate is at its freshest. Please allow four to six weeks from design approval.",
    "Delivery\nYour bomboniere arrive cold-chain protected, ahead of your wedding day, ready to place at each setting. The balance is due two weeks before delivery.",
  ].join("\n\n"),
  gallery_empty_text:
    "Photographs from the atelier are on their way. In the meantime, the collection is the best introduction to our work.",
  lead_time_text: "4 to 6 weeks from design approval",
  footer_blurb:
    "Handcrafted artisan chocolate catering and art chocolate boxes, made in Melbourne, Australia. Curated artisan chocolates.",
  show_page_privacy: "1",
  show_page_terms: "1",
  show_page_shipping: "1",
  color_ground: "#f3eee5",
  color_panel: "#eae3d5",
  color_ink: "#1c3040",
  color_gold: "#a9853e",
  color_silver: "#b9bcc2",
  edge_frame_enabled: "1",
  edge_frame_color: "#b9bcc2",
  edge_frame_thickness: "1",
  edge_frame_inset: "0",
  show_story: "1",
  show_process: "1",
  show_gallery: "1",
  show_collection_wedding: "1",
  show_collection_art: "1",
  paypal_email: "zinchoc@naver.com",
  bank_account_name: "",
  bank_bsb: "",
  bank_account_number: "",
  stripe_payment_link: "",
};

// In-code seed used ONLY for render when the D1 binding is not yet provisioned,
// so the public site still shows the launch catalogue. The real source of truth
// is the products table once the database exists.
export const SEED_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "diamant",
    name: "The Diamant",
    description:
      "A faceted diamond of dark couverture, each edge traced with a fine line of edible silver. Cut like a stone, tempered like glass, gone in a bite.",
    price_cents: 1250,
    unit: "per piece",
    min_order: 50,
    image_key: null,
    video_key: null,
    sort: 1,
    visible: 1,
    category: "wedding",
  },
  {
    id: 2,
    slug: "gemstone-dome",
    name: "The Gemstone Dome",
    description:
      "A dome cut with small polished facets that catch the light like a set stone. Dark couverture with a quiet silver highlight.",
    price_cents: 1150,
    unit: "per piece",
    min_order: 50,
    image_key: null,
    video_key: null,
    sort: 2,
    visible: 1,
    category: "wedding",
  },
];

export function formatAud(cents: number): string {
  const dollars = cents / 100;
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function priceLine(product: Product): string {
  const unit = product.unit ? ` ${product.unit}` : "";
  const noun = product.unit.toLowerCase().includes("box") ? "boxes" : "pieces";
  return `${formatAud(product.price_cents)}${unit}. Minimum order ${product.min_order} ${noun}.`;
}

// Strict hex colour check for the owner-editable brand palette.
export const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const BRAND_COLOR_KEYS = [
  "color_ground",
  "color_panel",
  "color_ink",
  "color_gold",
  "color_silver",
] as const;

export type BrandColorKey = (typeof BRAND_COLOR_KEYS)[number];

/** Settings colours with any invalid stored value replaced by its default. */
export function sanitizeBrandColors(settings: Settings): Record<BrandColorKey, string> {
  const out = {} as Record<BrandColorKey, string>;
  for (const key of BRAND_COLOR_KEYS) {
    const value = settings[key];
    out[key] = HEX_COLOR_RE.test(value) ? value : DEFAULT_SETTINGS[key];
  }
  return out;
}

export type EdgeFrame = {
  enabled: boolean;
  color: string;
  thickness: number;
  inset: number;
};

// Bounds keep the fixed overlay from ever covering meaningful screen area or
// injecting an invalid CSS value into the root <style>.
export const EDGE_FRAME_MAX_THICKNESS = 8;
export const EDGE_FRAME_MAX_INSET = 40;

function clampNumber(raw: string, min: number, max: number, fallback: number): number {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Edge-frame config with any invalid stored value replaced by its default. */
export function sanitizeEdgeFrame(settings: Settings): EdgeFrame {
  return {
    enabled: settings.edge_frame_enabled !== "0",
    color: HEX_COLOR_RE.test(settings.edge_frame_color)
      ? settings.edge_frame_color
      : DEFAULT_SETTINGS.edge_frame_color,
    thickness: clampNumber(settings.edge_frame_thickness, 0, EDGE_FRAME_MAX_THICKNESS, 1),
    inset: clampNumber(settings.edge_frame_inset, 0, EDGE_FRAME_MAX_INSET, 0),
  };
}
