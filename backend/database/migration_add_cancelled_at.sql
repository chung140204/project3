-- Add cancelled_at to orders (when order status is set to CANCELLED)
-- Run once. Safe to run if column already exists (ignore error).

ALTER TABLE orders
ADD COLUMN cancelled_at DATETIME NULL
COMMENT 'When order was marked as CANCELLED';
