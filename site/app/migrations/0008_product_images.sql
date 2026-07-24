-- Multiple photos per product (additive). Each product can now carry several
-- images; products.image_key stays as the "cover" (first/primary), used by the
-- collection tiles, while the full set lives here and shows on the order page.

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  image_key TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id, sort);

-- Backfill: bring each product's existing single photo in as its first image.
INSERT INTO product_images (product_id, image_key, sort)
SELECT id, image_key, 0 FROM products
WHERE image_key IS NOT NULL AND image_key != '';
