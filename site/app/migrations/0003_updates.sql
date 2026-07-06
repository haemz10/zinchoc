-- Owner feedback round: new contact email, product categories, FAQ privacy
-- toggle, and the gallery. Migrations run once each, so the ALTER TABLE below
-- is safe (this file is only ever applied a single time).

-- New contact email (replaces the placeholder personal address).
UPDATE settings SET value = 'zinchoc@naver.com' WHERE key = 'contact_email';
UPDATE settings SET value = 'zinchoc@naver.com'
  WHERE key = 'paypal_email' AND value = 'haem.z10@gmail.com';

-- Product categories: weddings remain the lead; art bonbon boxes join.
ALTER TABLE products ADD COLUMN category TEXT NOT NULL DEFAULT 'wedding';

-- FAQ is private until the owner flips it public in admin Settings.
INSERT OR IGNORE INTO settings (key, value) VALUES ('faq_public', '0');

-- Gallery of atelier work, managed from admin, served from R2 via /img/<key>.
CREATE TABLE IF NOT EXISTS gallery_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key TEXT NOT NULL,
  caption TEXT,
  sort INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
