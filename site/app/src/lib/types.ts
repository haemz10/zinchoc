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
  sort: number;
  visible: number;
  category: string;
};

export type GalleryImage = {
  id: number;
  image_key: string;
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
  faq_public: string;
  hero_headline: string;
  hero_subline: string;
  story_heading: string;
  story_body: string;
  closing_line_1: string;
  collection_intro: string;
  order_notes_hint: string;
  color_ground: string;
  color_panel: string;
  color_ink: string;
  color_gold: string;
  color_silver: string;
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
  faq_public: "0",
  hero_headline: "Where art meets chocolate.",
  hero_subline:
    "Handcrafted wedding bomboniere and collectible art bonbon boxes. Made to order in Australia, in small numbers, for a small number of commissions each season.",
  story_heading: "Curated artisan chocolates",
  story_body:
    "Zin Choc is not found in shops. Each piece begins as a sketch, becomes a mould, and is finished by hand in cocoa butter, gold and silver. We make wedding bomboniere the way a jeweller makes a ring: slowly, precisely, and for one couple at a time.\n\nWe work with fine couverture chocolate and take on a limited number of weddings each season, so every guest at your table receives something made, not manufactured. Every shell is polished, every box tied by hand, every detail matched to the two of you. Between weddings, the same hands cut and paint our art bonbon boxes: small collectible editions of the atelier's work.",
  closing_line_1: "If your wedding is within six months, we recommend enquiring now.",
  collection_intro:
    "Every piece is designed for one wedding, or made in a small collectible edition. All prices are in Australian dollars and include GST. Delivery is quoted separately, and lead time is four to six weeks from design approval.",
  order_notes_hint: "",
  color_ground: "#f3eee5",
  color_panel: "#eae3d5",
  color_ink: "#1c3040",
  color_gold: "#a9853e",
  color_silver: "#b9bcc2",
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
