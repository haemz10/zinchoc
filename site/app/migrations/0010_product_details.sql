-- Per-product "detail sections": the small expandable toggles shown on the
-- product page (ingredients, storage, delivery, …). Stored as one text block
-- per product; each section is a block whose first line is the toggle title and
-- the remaining lines are its body, with a blank line between sections. The
-- owner edits this in the Products tab. Runs once on deploy (migrations are
-- applied in order, each file once), so a plain ADD COLUMN is safe.

ALTER TABLE products ADD COLUMN details TEXT;

-- Seed existing products with original starter sections so the toggles are
-- visible immediately; the owner can rewrite them per product.
UPDATE products SET details =
'Ingredients & allergens
Fine couverture chocolate (cocoa mass, cocoa butter, sugar) with natural colours and edible metallic lustre. May contain milk, nuts and soy, and traces of gluten. Tell us about any allergies and we will advise before production.

Storage & care
Keep cool, dry and out of direct sunlight, ideally 16 to 18°C. Best enjoyed within two weeks of delivery. Avoid the fridge, which can dull the shine and draw moisture to the surface.

Delivery & lead time
Made to order, usually four to six weeks from design approval. Shipped cold-chain protected across Australia; delivery is quoted separately once we have your address and date.'
WHERE details IS NULL OR details = '';
