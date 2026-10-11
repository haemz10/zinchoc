-- Pivot from wedding-specific to general chocolate sales: clear the stored copy
-- settings that still contain wedding wording so they fall back to the new,
-- general defaults in code (DEFAULT_SETTINGS). Only rows that actually contain
-- wedding wording are removed, so any clean custom copy the owner wrote is kept.
-- The owner can re-edit any of these in admin → Settings afterwards.
-- Runs once on deploy.

DELETE FROM settings
WHERE key IN (
  'hero_kicker',
  'hero_subline',
  'story_body',
  'story_closing_line',
  'commission_body',
  'enquiry_intro',
  'closing_heading',
  'closing_line_1',
  'collection_intro',
  'process_heading',
  'process_intro',
  'process_steps',
  'footer_blurb'
)
AND (
  lower(value) LIKE '%wedding%'
  OR lower(value) LIKE '%bomboniere%'
  OR lower(value) LIKE '%your day%'
);
