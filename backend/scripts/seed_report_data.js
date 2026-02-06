/**
 * Seed dữ liệu mẫu cho Báo cáo VAT / Doanh thu / Số lượng sản phẩm đã bán
 * Chèn các đơn hàng có status PAID hoặc COMPLETED với order_date trải nhiều tháng
 * để biểu đồ và bảng báo cáo có dữ liệu hiển thị.
 *
 * Chạy: node scripts/seed_report_data.js
 * (từ thư mục backend, hoặc: node backend/scripts/seed_report_data.js từ root)
 */

require('dotenv').config();
const pool = require('../src/config/database');

async function seedReportData() {
  let conn;
  try {
    conn = await pool.getConnection();

    // Lấy user_id (khách hoặc admin đều được)
    const [users] = await conn.query('SELECT id FROM users LIMIT 1');
    if (!users.length) {
      console.error('Chưa có user nào. Chạy seed users trước.');
      process.exit(1);
    }
    const userId = users[0].id;

    // Lấy danh sách product_id và category (để lấy tax_rate)
    const [products] = await conn.query(
      'SELECT p.id, p.name, p.price, c.tax_rate FROM products p JOIN categories c ON p.category_id = c.id LIMIT 5'
    );
    if (!products.length) {
      console.error('Chưa có sản phẩm nào. Chạy seed products/categories trước.');
      process.exit(1);
    }

    // Các tháng cần có dữ liệu (để biểu đồ theo tháng có điểm)
    const months = [
      { date: '2024-10-15 10:00:00', label: '2024-10' },
      { date: '2024-11-08 14:00:00', label: '2024-11' },
      { date: '2024-12-01 09:00:00', label: '2024-12' },
      { date: '2025-01-10 11:00:00', label: '2025-01' },
      { date: '2025-02-05 16:00:00', label: '2025-02' },
    ];

    for (const { date, label } of months) {
      // Mỗi tháng 1 đơn: COMPLETED
      const subtotal = 850000;   // ví dụ: 200k*2 + 350k + 100k
      const totalVat = 85000;   // 10% đơn giản
      const totalAmount = subtotal + totalVat;

      const [orderResult] = await conn.query(
        `INSERT INTO orders (
          user_id, customer_name, customer_email, customer_phone, customer_address,
          customer_type, company_name, tax_code, order_note,
          voucher_code, voucher_discount, subtotal, total_vat, total_amount, status, order_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          'Khách mẫu',
          'customer@example.com',
          '0901234567',
          '123 Đường ABC, Quận 1, TP.HCM',
          'INDIVIDUAL',
          null,
          null,
          `Đơn mẫu ${label}`,
          null,
          0,
          subtotal,
          totalVat,
          totalAmount,
          'COMPLETED',
          date
        ]
      );
      const orderId = orderResult.insertId;

      // 2 dòng order_items cho mỗi đơn (2 sản phẩm)
      const p1 = products[0];
      const p2 = products[products.length > 1 ? 1 : 0];
      const qty1 = 2, qty2 = 1;
      const price1 = p1.price, price2 = p2.price;
      const rate1 = Number(p1.tax_rate), rate2 = Number(p2.tax_rate);
      const tax1 = price1 * qty1 * rate1, tax2 = price2 * qty2 * rate2;
      const total1 = price1 * qty1 + tax1, total2 = price2 * qty2 + tax2;

      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, vat_rate, tax_amount, total, size, color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, p1.id, qty1, price1, rate1, tax1, total1, 'M', 'Đen']
      );
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, vat_rate, tax_amount, total, size, color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, p2.id, qty2, price2, rate2, tax2, total2, 'L', 'Xanh']
      );

      console.log(`Đã thêm đơn mẫu ${label}, order_id=${orderId}`);
    }

    console.log('\nSeed báo cáo xong. Vào /admin/vat-report để xem doanh thu, số lượng bán và VAT theo tháng.');
  } catch (err) {
    console.error('Lỗi seed báo cáo:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    process.exit(0);
  }
}

seedReportData();
