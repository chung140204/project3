-- Migration: Add customer information fields to orders table
-- Run this after initial schema setup

ALTER TABLE orders
ADD COLUMN customer_name VARCHAR(255) NOT NULL AFTER user_id,
ADD COLUMN customer_email VARCHAR(255) NOT NULL AFTER customer_name,
ADD COLUMN customer_phone VARCHAR(20) AFTER customer_email,
ADD COLUMN customer_address TEXT NOT NULL AFTER customer_phone,
ADD COLUMN customer_type ENUM('INDIVIDUAL', 'BUSINESS') NOT NULL DEFAULT 'INDIVIDUAL' AFTER customer_address,
ADD COLUMN company_name VARCHAR(255) NULL AFTER customer_type,
ADD COLUMN tax_code VARCHAR(20) NULL AFTER company_name,
ADD COLUMN order_note TEXT NULL AFTER tax_code,
ADD COLUMN voucher_code VARCHAR(50) NULL AFTER order_note,
ADD COLUMN voucher_discount DECIMAL(10, 2) DEFAULT 0.00 AFTER voucher_code,
ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL COMMENT 'Subtotal before VAT' AFTER voucher_discount,
ADD COLUMN total_vat DECIMAL(10, 2) NOT NULL COMMENT 'Total VAT amount' AFTER subtotal;

-- Update existing orders to have default values (if any)
UPDATE orders SET 
  customer_name = (SELECT name FROM users WHERE users.id = orders.user_id LIMIT 1),
  customer_email = (SELECT email FROM users WHERE users.id = orders.user_id LIMIT 1),
  customer_address = 'N/A',
  subtotal = total_amount * 0.9, -- Approximate, assuming 10% VAT
  total_vat = total_amount * 0.1
WHERE customer_name IS NULL;






