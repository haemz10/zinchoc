-- Order management from admin (additive): a one-time payment-reminder marker
-- and soft delete with undo. Deleted orders stay in the table (deleted_at set)
-- so restore is always possible; nothing is ever hard-deleted from admin.

ALTER TABLE orders ADD COLUMN reminder_sent_at TEXT;
ALTER TABLE orders ADD COLUMN deleted_at TEXT;
