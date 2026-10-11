-- Owner-managed collection categories. Until now the collection was split by a
-- hardcoded wedding/art flag; this makes categories real rows the owner can add,
-- rename, reorder, show/hide and delete from the admin Categories tab. Products
-- keep referencing a category by its stable `key` (products.category).
--
-- Additive and idempotent, like every migration here (the one DB is shared by
-- preview + prod and this file re-runs on each deploy).

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed the three launch collections. Labels are owner-editable afterwards.
INSERT OR IGNORE INTO categories (key, label, sort, visible) VALUES ('premium', 'Premium Collection', 1, 1);
INSERT OR IGNORE INTO categories (key, label, sort, visible) VALUES ('art', 'Art Collection', 2, 1);
INSERT OR IGNORE INTO categories (key, label, sort, visible) VALUES ('cookies', 'Cookies & Desserts', 3, 1);

-- Move the legacy catalogue onto the new scheme so nothing disappears: every
-- product that was in the old "wedding" group (and any blank) becomes Premium.
-- Products already tagged 'art' line up with the seeded Art category.
UPDATE products SET category = 'premium' WHERE category IS NULL OR category = '' OR category = 'wedding';
