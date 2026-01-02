-- Seed data for Clothing E-commerce System

-- Insert Categories
INSERT INTO categories (name, tax_rate) VALUES
('Áo', 0.10),
('Quần', 0.10),
('Phụ kiện', 0.05);

-- Insert Products
INSERT INTO products (name, description, price, stock, status, sku, category_id) VALUES
('Áo khoác nam mùa đông', 'Chất liệu chống nước, giữ ẩm tốt, phù hợp mùa đông và thời tiết lạnh', 500000, 25, 'ACTIVE', 'PROD-AO-002', (SELECT id FROM categories WHERE name = 'Áo')),
('Áo thun nam', 'Áo thun nam chất liệu cotton 100%, thoáng mát, phù hợp mùa hè', 200000, 50, 'ACTIVE', 'PROD-AO-001', (SELECT id FROM categories WHERE name = 'Áo')),
('Quần jean nữ', 'Quần jean nữ form slim, chất liệu denim cao cấp, nhiều size', 350000, 30, 'ACTIVE', 'PROD-QUAN-001', (SELECT id FROM categories WHERE name = 'Quần')),
('Nón lưỡi trai', 'Nón lưỡi trai thời trang, chống nắng, nhiều màu sắc', 100000, 100, 'ACTIVE', 'PROD-PK-001', (SELECT id FROM categories WHERE name = 'Phụ kiện'));

-- Insert Users
-- Note: In production, passwords should be hashed. These are placeholder values.
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@example.com', 'hashed_password_here', 'ADMIN'),
('Customer User', 'customer@example.com', 'hashed_password_here', 'CUSTOMER');

-- Insert Sample Orders (Optional - for testing)
-- Note: These orders include all new customer fields
INSERT INTO orders (
  user_id, customer_name, customer_email, customer_phone, customer_address,
  customer_type, company_name, tax_code, order_note,
  voucher_code, voucher_discount, subtotal, total_vat, total_amount, status
) VALUES
(
  (SELECT id FROM users WHERE email = 'customer@example.com' LIMIT 1),
  'Nguyễn Văn A',
  'customer@example.com',
  '0901234567',
  '123 Đường ABC, Quận 1, TP.HCM',
  'INDIVIDUAL',
  NULL,
  NULL,
  'Giao giờ hành chính',
  NULL,
  0.00,
  400000.00,  -- 2x Áo thun (200000 * 2)
  40000.00,   -- VAT 10%
  440000.00,  -- Total
  'PENDING'
);

-- Insert Sample Order Items
INSERT INTO order_items (
  order_id, product_id, quantity, price, vat_rate, tax_amount, total, size, color
) VALUES
(
  (SELECT id FROM orders ORDER BY id DESC LIMIT 1),
  (SELECT id FROM products WHERE name = 'Áo thun nam' LIMIT 1),
  2,
  200000.00,
  0.10,       -- VAT rate: 10% (snapshot at time of order)
  40000.00,   -- VAT: 200000 * 2 * 0.10
  440000.00,  -- Total: (200000 * 2) + 40000
  'M',
  'Đen'
);

