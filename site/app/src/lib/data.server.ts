// Server-only D1 data access for Zin Choc. All reads/writes go through the
// bindings() accessor; every function guards for a missing DB so the site still
// renders (with in-code seed data) before the deploy provisions the database.
import { bindings } from "./bindings.server";
import { SEED_FAQS, SEED_LEGAL_PAGES } from "./content-seed";
import {
  DEFAULT_SETTINGS,
  SEED_PRODUCTS,
  type Enquiry,
  type FaqItem,
  type GalleryImage,
  type LegalPage,
  type Order,
  type Product,
  type Settings,
} from "./types";

export function getDb() {
  return bindings().DB;
}

export function getBucket() {
  return bindings().STORAGE;
}

type ProductRow = {
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

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    price_cents: r.price_cents,
    unit: r.unit,
    min_order: r.min_order,
    image_key: r.image_key,
    sort: r.sort,
    visible: r.visible,
    category: r.category ?? "wedding",
  };
}

/** Visible products for the public collection. Falls back to seed data when the
 * DB is not provisioned so the launch catalogue always renders. */
export async function getVisibleProducts(): Promise<Product[]> {
  const db = getDb();
  if (!db) return SEED_PRODUCTS;
  try {
    const res = await db
      .prepare(
        "SELECT id, slug, name, description, price_cents, unit, min_order, image_key, sort, visible, category FROM products WHERE visible = 1 ORDER BY sort ASC, id ASC",
      )
      .all<ProductRow>();
    const rows = res.results ?? [];
    return rows.length ? rows.map(rowToProduct) : SEED_PRODUCTS;
  } catch {
    return SEED_PRODUCTS;
  }
}

/** Every product, for the admin list. */
export async function getAllProducts(): Promise<Product[]> {
  const db = getDb();
  if (!db) return [];
  const res = await db
    .prepare(
      "SELECT id, slug, name, description, price_cents, unit, min_order, image_key, sort, visible, category FROM products ORDER BY sort ASC, id ASC",
    )
    .all<ProductRow>();
  return (res.results ?? []).map(rowToProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = getDb();
  if (!db) return null;
  const row = await db
    .prepare(
      "SELECT id, slug, name, description, price_cents, unit, min_order, image_key, sort, visible, category FROM products WHERE id = ?",
    )
    .bind(id)
    .first<ProductRow>();
  return row ? rowToProduct(row) : null;
}

export async function getSettings(): Promise<Settings> {
  const db = getDb();
  if (!db) return { ...DEFAULT_SETTINGS };
  try {
    const res = await db.prepare("SELECT key, value FROM settings").all<{
      key: string;
      value: string;
    }>();
    const map = new Map((res.results ?? []).map((r) => [r.key, r.value]));
    const pick = (k: keyof Settings) => map.get(k) ?? DEFAULT_SETTINGS[k];
    return {
      contact_email: pick("contact_email"),
      instagram_url: pick("instagram_url"),
      abn: pick("abn"),
      business_name: pick("business_name"),
      announcement: pick("announcement"),
      hero_image_key: pick("hero_image_key"),
      story_image_key: pick("story_image_key"),
      logo_image_key: pick("logo_image_key"),
      faq_public: pick("faq_public"),
      hero_headline: pick("hero_headline"),
      hero_subline: pick("hero_subline"),
      story_heading: pick("story_heading"),
      story_body: pick("story_body"),
      closing_line_1: pick("closing_line_1"),
      collection_intro: pick("collection_intro"),
      order_notes_hint: pick("order_notes_hint"),
      color_ground: pick("color_ground"),
      color_panel: pick("color_panel"),
      color_ink: pick("color_ink"),
      color_gold: pick("color_gold"),
      color_silver: pick("color_silver"),
      show_story: pick("show_story"),
      show_process: pick("show_process"),
      show_gallery: pick("show_gallery"),
      show_collection_wedding: pick("show_collection_wedding"),
      show_collection_art: pick("show_collection_art"),
      paypal_email: pick("paypal_email"),
      bank_account_name: pick("bank_account_name"),
      bank_bsb: pick("bank_bsb"),
      bank_account_number: pick("bank_account_number"),
      stripe_payment_link: pick("stripe_payment_link"),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .bind(key, value)
    .run();
}

export type EnquiryInput = {
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  guest_count: number | null;
  product_slug: string | null;
  message: string;
  consent_at: string;
};

export async function insertEnquiry(input: EnquiryInput): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await db
    .prepare(
      "INSERT INTO enquiries (name, email, phone, event_date, guest_count, product_slug, message, consent_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')",
    )
    .bind(
      input.name,
      input.email,
      input.phone,
      input.event_date,
      input.guest_count,
      input.product_slug,
      input.message,
      input.consent_at,
    )
    .run();
  return true;
}

export type ProductInput = {
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  unit: string;
  min_order: number;
  sort: number;
  visible: number;
  category: string;
};

export async function createProduct(input: ProductInput): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare(
      "INSERT INTO products (slug, name, description, price_cents, unit, min_order, sort, visible, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      input.slug,
      input.name,
      input.description,
      input.price_cents,
      input.unit,
      input.min_order,
      input.sort,
      input.visible,
      input.category,
    )
    .run();
}

export async function updateProduct(id: number, input: ProductInput): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare(
      "UPDATE products SET slug = ?, name = ?, description = ?, price_cents = ?, unit = ?, min_order = ?, sort = ?, visible = ?, category = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .bind(
      input.slug,
      input.name,
      input.description,
      input.price_cents,
      input.unit,
      input.min_order,
      input.sort,
      input.visible,
      input.category,
      id,
    )
    .run();
}

export async function deleteProduct(id: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
}

export async function setProductVisible(id: number, visible: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare("UPDATE products SET visible = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(visible, id)
    .run();
}

export async function setProductImageKey(id: number, key: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare("UPDATE products SET image_key = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(key, id)
    .run();
}

/** Swap a product's sort value with its neighbour in the given direction. */
export async function moveProduct(id: number, dir: "up" | "down"): Promise<void> {
  const db = getDb();
  if (!db) return;
  const products = await getAllProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index < 0) return;
  const swapIndex = dir === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= products.length) return;
  const a = products[index];
  const b = products[swapIndex];
  await db.batch([
    db.prepare("UPDATE products SET sort = ? WHERE id = ?").bind(b.sort, a.id),
    db.prepare("UPDATE products SET sort = ? WHERE id = ?").bind(a.sort, b.id),
  ]);
}

export async function setEnquiryStatus(id: number, status: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").bind(status, id).run();
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const db = getDb();
  if (!db) return [];
  const res = await db
    .prepare(
      "SELECT id, name, email, phone, event_date, guest_count, product_slug, message, consent_at, created_at, status FROM enquiries ORDER BY created_at DESC, id DESC",
    )
    .all<Enquiry>();
  return res.results ?? [];
}

/** Visible product looked up by slug (public order page). Falls back to the
 * in-code seed when the DB is not provisioned. */
export async function getVisibleProductBySlug(slug: string): Promise<Product | null> {
  const db = getDb();
  if (!db) return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
  try {
    const row = await db
      .prepare(
        "SELECT id, slug, name, description, price_cents, unit, min_order, image_key, sort, visible, category FROM products WHERE slug = ? AND visible = 1",
      )
      .bind(slug)
      .first<ProductRow>();
    return row ? rowToProduct(row) : null;
  } catch {
    return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

export type OrderInput = {
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
  consent_at: string;
};

export async function insertOrder(input: OrderInput): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not provisioned");
  await db
    .prepare(
      `INSERT INTO orders (reference, product_slug, product_name, quantity, unit_price_cents, total_cents, customer_name, email, phone, event_date, delivery_address, notes, consent_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment')`,
    )
    .bind(
      input.reference,
      input.product_slug,
      input.product_name,
      input.quantity,
      input.unit_price_cents,
      input.total_cents,
      input.customer_name,
      input.email,
      input.phone,
      input.event_date,
      input.delivery_address,
      input.notes,
      input.consent_at,
    )
    .run();
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  const db = getDb();
  if (!db) return null;
  const row = await db
    .prepare("SELECT * FROM orders WHERE reference = ?")
    .bind(reference)
    .first<Order>();
  return row ?? null;
}

export async function setOrderPaymentMethod(reference: string, method: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare(
      "UPDATE orders SET payment_method = ?, updated_at = datetime('now') WHERE reference = ?",
    )
    .bind(method, reference)
    .run();
}

export async function getOrders(): Promise<Order[]> {
  const db = getDb();
  if (!db) return [];
  const res = await db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC, id DESC")
    .all<Order>();
  return res.results ?? [];
}

export async function setOrderStatus(id: number, status: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(status, id)
    .run();
}

/** Record the one-time payment reminder. Only flips when no reminder has been
 * recorded yet; returns false if it was already sent (the once-only rule is
 * enforced here, not in the UI). */
export async function markOrderReminded(id: number): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const res = await db
    .prepare(
      "UPDATE orders SET reminder_sent_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND reminder_sent_at IS NULL",
    )
    .bind(id)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

/** Soft delete / restore. Deleted orders keep their row (deleted_at set) so
 * the admin can always undo. */
export async function setOrderDeleted(id: number, deleted: boolean): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare(
      deleted
        ? "UPDATE orders SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
        : "UPDATE orders SET deleted_at = NULL, updated_at = datetime('now') WHERE id = ?",
    )
    .bind(id)
    .run();
}

// ---- Gallery ----------------------------------------------------------------

export async function getVisibleGalleryImages(): Promise<GalleryImage[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const res = await db
      .prepare(
        "SELECT id, image_key, caption, sort, visible, created_at FROM gallery_images WHERE visible = 1 ORDER BY sort ASC, id ASC",
      )
      .all<GalleryImage>();
    return res.results ?? [];
  } catch {
    return [];
  }
}

export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  const db = getDb();
  if (!db) return [];
  const res = await db
    .prepare(
      "SELECT id, image_key, caption, sort, visible, created_at FROM gallery_images ORDER BY sort ASC, id ASC",
    )
    .all<GalleryImage>();
  return res.results ?? [];
}

export async function insertGalleryImage(imageKey: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const row = await db
    .prepare("SELECT COALESCE(MAX(sort), 0) AS max_sort FROM gallery_images")
    .first<{ max_sort: number }>();
  await db
    .prepare(
      "INSERT INTO gallery_images (image_key, sort, visible, created_at) VALUES (?, ?, 1, datetime('now'))",
    )
    .bind(imageKey, (row?.max_sort ?? 0) + 1)
    .run();
}

export async function setGalleryCaption(id: number, caption: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.prepare("UPDATE gallery_images SET caption = ? WHERE id = ?").bind(caption, id).run();
}

export async function setGalleryVisible(id: number, visible: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.prepare("UPDATE gallery_images SET visible = ? WHERE id = ?").bind(visible, id).run();
}

export async function deleteGalleryImage(id: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.prepare("DELETE FROM gallery_images WHERE id = ?").bind(id).run();
}

/** Swap a gallery image's sort with its neighbour in the given direction. */
export async function moveGalleryImage(id: number, dir: "up" | "down"): Promise<void> {
  const db = getDb();
  if (!db) return;
  const images = await getAllGalleryImages();
  const index = images.findIndex((g) => g.id === id);
  if (index < 0) return;
  const swapIndex = dir === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= images.length) return;
  const a = images[index];
  const b = images[swapIndex];
  await db.batch([
    db.prepare("UPDATE gallery_images SET sort = ? WHERE id = ?").bind(b.sort, a.id),
    db.prepare("UPDATE gallery_images SET sort = ? WHERE id = ?").bind(a.sort, b.id),
  ]);
}

// ---- Raw single-setting access (server-only; used for admin-only keys such
// ---- as admin_password_hash and stripe_secret_key, which are deliberately
// ---- NOT part of the public Settings shape) --------------------------------

export async function getSettingValue(key: string): Promise<string> {
  const db = getDb();
  if (!db) return "";
  try {
    const row = await db
      .prepare("SELECT value FROM settings WHERE key = ?")
      .bind(key)
      .first<{ value: string }>();
    return row?.value ?? "";
  } catch {
    return "";
  }
}

// ---- FAQ items --------------------------------------------------------------

export async function getVisibleFaqItems(): Promise<FaqItem[]> {
  const db = getDb();
  if (!db) return SEED_FAQS;
  try {
    const res = await db
      .prepare(
        "SELECT id, question, answer, sort, visible FROM faq_items WHERE visible = 1 ORDER BY sort ASC, id ASC",
      )
      .all<FaqItem>();
    const rows = res.results ?? [];
    return rows.length ? rows : SEED_FAQS;
  } catch {
    return SEED_FAQS;
  }
}

export async function getAllFaqItems(): Promise<FaqItem[]> {
  const db = getDb();
  if (!db) return [];
  const res = await db
    .prepare("SELECT id, question, answer, sort, visible FROM faq_items ORDER BY sort ASC, id ASC")
    .all<FaqItem>();
  return res.results ?? [];
}

export async function createFaqItem(question: string, answer: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const row = await db
    .prepare("SELECT COALESCE(MAX(sort), 0) AS max_sort FROM faq_items")
    .first<{ max_sort: number }>();
  await db
    .prepare("INSERT INTO faq_items (question, answer, sort, visible) VALUES (?, ?, ?, 1)")
    .bind(question, answer, (row?.max_sort ?? 0) + 1)
    .run();
}

export async function updateFaqItem(id: number, question: string, answer: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare("UPDATE faq_items SET question = ?, answer = ? WHERE id = ?")
    .bind(question, answer, id)
    .run();
}

export async function setFaqVisible(id: number, visible: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.prepare("UPDATE faq_items SET visible = ? WHERE id = ?").bind(visible, id).run();
}

export async function deleteFaqItem(id: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.prepare("DELETE FROM faq_items WHERE id = ?").bind(id).run();
}

/** Swap a FAQ item's sort with its neighbour in the given direction. */
export async function moveFaqItem(id: number, dir: "up" | "down"): Promise<void> {
  const db = getDb();
  if (!db) return;
  const items = await getAllFaqItems();
  const index = items.findIndex((f) => f.id === id);
  if (index < 0) return;
  const swapIndex = dir === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;
  const a = items[index];
  const b = items[swapIndex];
  await db.batch([
    db.prepare("UPDATE faq_items SET sort = ? WHERE id = ?").bind(b.sort, a.id),
    db.prepare("UPDATE faq_items SET sort = ? WHERE id = ?").bind(a.sort, b.id),
  ]);
}

// ---- Legal pages -------------------------------------------------------------

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  const fallback = SEED_LEGAL_PAGES.find((p) => p.slug === slug) ?? null;
  const db = getDb();
  if (!db) return fallback;
  try {
    const row = await db
      .prepare("SELECT slug, title, body, updated_at FROM legal_pages WHERE slug = ?")
      .bind(slug)
      .first<LegalPage>();
    return row ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getAllLegalPages(): Promise<LegalPage[]> {
  const db = getDb();
  if (!db) return SEED_LEGAL_PAGES;
  const res = await db
    .prepare("SELECT slug, title, body, updated_at FROM legal_pages ORDER BY slug ASC")
    .all<LegalPage>();
  const rows = res.results ?? [];
  return rows.length ? rows : SEED_LEGAL_PAGES;
}

export async function updateLegalPage(slug: string, title: string, body: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .prepare(
      "UPDATE legal_pages SET title = ?, body = ?, updated_at = datetime('now') WHERE slug = ?",
    )
    .bind(title, body, slug)
    .run();
}
