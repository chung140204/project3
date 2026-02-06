-- Migration: Add paid_at column and standardize tax_rate
-- Run this after schema setup
-- tax_rate: decimal format (0.1 = 10%), NOT percentage (10)

-- ============================================================
-- 1. ADD paid_at TO ORDERS
-- ============================================================

ALTER TABLE orders
ADD COLUMN paid_at DATETIME NULL 
COMMENT 'When order was marked as PAID (for tax reporting)' 
AFTER order_date;

-- Add index for VAT report queries
ALTER TABLE orders
ADD INDEX idx_paid_at (paid_at);

-- ============================================================
-- 2. NORMALIZE tax_rate IN CATEGORIES (if needed)
-- If existing data uses 10 for 10%, convert to 0.1
-- Skip if already in decimal format (values < 1)
-- ============================================================

-- Convert percentage format (10, 8) to decimal (0.1, 0.08)
UPDATE categories 
SET tax_rate = tax_rate / 100 
WHERE tax_rate >= 1;
