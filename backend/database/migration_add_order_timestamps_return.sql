-- Migration: Add order timestamps and return_status
-- Run after schema setup. If paid_at exists (from migration_add_paid_at_and_tax_rate), skip first ALTER.
-- Does NOT change orders.status (keeps PENDING, PAID, COMPLETED, CANCELLED)

-- ============================================================
-- ADD COLUMNS TO ORDERS (do not modify existing columns)
-- ============================================================

-- paid_at: when order was marked as PAID
ALTER TABLE orders
ADD COLUMN paid_at DATETIME NULL 
COMMENT 'When order was marked as PAID' 
AFTER order_date;

-- completed_at: when order was marked as COMPLETED
ALTER TABLE orders
ADD COLUMN completed_at DATETIME NULL 
COMMENT 'When order was marked as COMPLETED' 
AFTER paid_at;

-- refunded_at: when order was refunded (not set by updateOrderStatus)
ALTER TABLE orders
ADD COLUMN refunded_at DATETIME NULL 
COMMENT 'When order was refunded' 
AFTER completed_at;

-- return_status: for return/refund workflow (separate from status)
ALTER TABLE orders
ADD COLUMN return_status ENUM('NONE','REQUESTED','APPROVED','REJECTED') 
NOT NULL DEFAULT 'NONE' 
COMMENT 'Return request status' 
AFTER refunded_at;
