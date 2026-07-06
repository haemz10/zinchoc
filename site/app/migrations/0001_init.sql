-- D1 schema for Zin Choc. Applied by the platform on deploy (only when
-- app.manifest.json sets "db": true). ONE database is shared by preview + prod,
-- so every statement here is additive (CREATE TABLE IF NOT EXISTS / INSERT OR
-- IGNORE). Bound as env.DB (see src/lib/bindings.server.ts).

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'per piece',
  min_order INTEGER NOT NULL DEFAULT 1,
  image_key TEXT,
  sort INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_date TEXT,
  guest_count INTEGER,
  product_slug TEXT,
  message TEXT NOT NULL DEFAULT '',
  consent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS admin_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed settings (owner edits these from the admin Settings tab).
INSERT OR IGNORE INTO settings (key, value) VALUES ('contact_email', 'haem.z10@gmail.com');
INSERT OR IGNORE INTO settings (key, value) VALUES ('instagram_url', 'https://instagram.com/zinchoc');
INSERT OR IGNORE INTO settings (key, value) VALUES ('abn', 'ABN 00 000 000 000');
INSERT OR IGNORE INTO settings (key, value) VALUES ('business_name', 'Zin Choc');
INSERT OR IGNORE INTO settings (key, value) VALUES ('announcement', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_image_key', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('story_image_key', '');

-- Seed the two launch pieces. Owner uploads real photos via admin (image_key
-- stays NULL until then, so the collection renders composed brand tiles).
INSERT OR IGNORE INTO products (slug, name, description, price_cents, unit, min_order, image_key, sort, visible)
VALUES ('diamant', 'The Diamant', 'A faceted diamond of dark couverture, each edge traced with a fine line of edible silver. Cut like a stone, tempered like glass, gone in a bite.', 1250, 'per piece', 50, NULL, 1, 1);

INSERT OR IGNORE INTO products (slug, name, description, price_cents, unit, min_order, image_key, sort, visible)
VALUES ('gemstone-dome', 'The Gemstone Dome', 'A dome cut with small polished facets that catch the light like a set stone. Dark couverture with a quiet silver highlight.', 1150, 'per piece', 50, NULL, 2, 1);
