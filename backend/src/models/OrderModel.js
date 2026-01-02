const pool = require('../config/database');

class OrderModel {
  // Find all orders
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.order_date DESC'
    );
    return rows;
  }

  // Find order by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Find orders by user ID
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
      [userId]
    );
    return rows;
  }

  // Create new order
  static async create(orderData) {
    const {
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_type,
      company_name,
      tax_code,
      order_note,
      voucher_code,
      voucher_discount,
      subtotal,
      total_vat,
      total_amount,
      status
    } = orderData;
    
    const [result] = await pool.query(
      `INSERT INTO orders (
        user_id, customer_name, customer_email, customer_phone, customer_address,
        customer_type, company_name, tax_code, order_note,
        voucher_code, voucher_discount, subtotal, total_vat, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        customer_name,
        customer_email,
        customer_phone || null,
        customer_address,
        customer_type || 'INDIVIDUAL',
        company_name || null,
        tax_code || null,
        order_note || null,
        voucher_code || null,
        voucher_discount || 0.00,
        subtotal,
        total_vat,
        total_amount,
        status || 'PENDING'
      ]
    );
    return this.findById(result.insertId);
  }

  // Update order
  static async update(id, orderData) {
    const { total_amount, status } = orderData;
    await pool.query(
      'UPDATE orders SET total_amount = ?, status = ? WHERE id = ?',
      [total_amount, status, id]
    );
    return this.findById(id);
  }

  // Update order status
  static async updateStatus(id, status) {
    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  // Delete order
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = OrderModel;

