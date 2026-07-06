-- Orders + payment settings (additive). Catalogue orders are created from the
-- public /order flow with a unique human-quotable reference; payment happens
-- off-site (PayPal, bank transfer, or emailed invoice), so no card data ever
-- touches this application.

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_date TEXT,
  delivery_address TEXT,
  notes TEXT,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  consent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Payment settings (owner edits these in admin Settings).
INSERT OR IGNORE INTO settings (key, value) VALUES ('paypal_email', 'haem.z10@gmail.com');
INSERT OR IGNORE INTO settings (key, value) VALUES ('bank_account_name', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('bank_bsb', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('bank_account_number', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('stripe_payment_link', '');
