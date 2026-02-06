-- Migration: Improve database schema for real-world e-commerce
-- Run this after initial schema setup
-- This migration improves the schema without breaking existing data

-- ============================================================
-- 1. UPDATE PRODUCTS TABLE
-- ============================================================

-- Add product description
ALTER TABLE products
ADD COLUMN description TEXT NULL AFTER name;

-- Add stock management
ALTER TABLE products
ADD COLUMN stock INT NOT NULL DEFAULT 0 AFTER price;

-- Add product status (ACTIVE/INACTIVE)
ALTER TABLE products
ADD COLUMN status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE' AFTER stock;

-- Add SKU (Stock Keeping Unit) - optional but useful for inventory
ALTER TABLE products
ADD COLUMN sku VARCHAR(100) NULL UNIQUE AFTER status;

-- Add index for status (for filtering active products)
ALTER TABLE products
ADD INDEX idx_status (status);

-- Add index for sku (for quick SKU lookup)
ALTER TABLE products
ADD INDEX idx_sku (sku);

-- ============================================================
-- 2. UPDATE ORDER_ITEMS TABLE
-- ============================================================

-- Add VAT rate per item (for full traceability)
-- This ensures we can track VAT rate even if category changes later
ALTER TABLE order_items
ADD COLUMN vat_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00 
COMMENT 'VAT rate at time of order (snapshot)' 
AFTER price;

-- Update existing order_items to calculate vat_rate from tax_amount
-- Formula: vat_rate = tax_amount / (price * quantity)
UPDATE order_items oi
SET oi.vat_rate = CASE 
    WHEN oi.price > 0 AND oi.quantity > 0 
    THEN ROUND(oi.tax_amount / (oi.price * oi.quantity), 2)
    ELSE 0.00
END
WHERE oi.vat_rate = 0.00;

-- ============================================================
-- 3. UPDATE ORDERS TABLE
-- ============================================================

-- Change status from VARCHAR to ENUM for better data integrity
-- First, update existing status values to match new ENUM
UPDATE orders 
SET status = 'PENDING' 
WHERE status NOT IN ('PENDING', 'PAID', 'CANCELLED', 'COMPLETED');

-- Drop old status column
ALTER TABLE orders
DROP COLUMN status;

-- Add new status column with ENUM
ALTER TABLE orders
ADD COLUMN status ENUM('PENDING', 'PAID', 'CANCELLED', 'COMPLETED') 
NOT NULL DEFAULT 'PENDING' 
AFTER total_amount;

-- ============================================================
-- 4. UPDATE USERS TABLE
-- ============================================================

-- Rename password to password_hash (better naming convention)
ALTER TABLE users
CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL;

-- ============================================================
-- VERIFICATION QUERIES (Optional - run to verify changes)
-- ============================================================

-- Verify products table
-- DESCRIBE products;
-- Should see: description, stock, status, sku

-- Verify order_items table
-- DESCRIBE order_items;
-- Should see: vat_rate

-- Verify orders table
-- DESCRIBE orders;
-- Should see: status as ENUM

-- Verify users table
-- DESCRIBE users;
-- Should see: password_hash (not password)






