const pool = require('../config/database');

class OrderModel {
  // Find all orders (users.full_name if migration_add_phone_rename_name was run, else users.name)
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT o.*, u.full_name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.order_date DESC'
    );
    return rows;
  }

  // Find order by ID (optional conn for transaction)
  static async findById(id, conn = null) {
    const db = conn || pool;
    const [rows] = await db.query(
      'SELECT o.*, u.full_name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Find orders by user ID (UC003: order by created_at DESC)
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY COALESCE(created_at, order_date) DESC',
      [userId]
    );
    return rows;
  }

  // Count orders by user ID (for admin delete validation)
  static async countByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      [userId]
    );
    return rows[0]?.count ?? 0;
  }

  // Create new order (optional conn for transaction)
  static async create(orderData, conn = null) {
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
    
    const db = conn || pool;
    const [result] = await db.query(
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
    return this.findById(result.insertId, conn);
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

  // Update order status (nếu bảng thiếu paid_at/completed_at/cancelled_at thì chỉ cập nhật status)
  static async updateStatus(id, status) {
    const statusUpper = (status || '').toUpperCase();
    const statusOnly = () => pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    if (statusUpper === 'PAID') {
      try {
        await pool.query(
          'UPDATE orders SET status = ?, paid_at = COALESCE(paid_at, NOW()) WHERE id = ?',
          [status, id]
        );
      } catch (err) {
        if (err.code === 'ER_BAD_FIELD_ERROR') await statusOnly();
        else throw err;
      }
    } else if (statusUpper === 'COMPLETED') {
      try {
        await pool.query(
          'UPDATE orders SET status = ?, completed_at = COALESCE(completed_at, NOW()) WHERE id = ?',
          [status, id]
        );
      } catch (err) {
        if (err.code === 'ER_BAD_FIELD_ERROR') await statusOnly();
        else throw err;
      }
    } else if (statusUpper === 'CANCELLED') {
      try {
        await pool.query(
          'UPDATE orders SET status = ?, cancelled_at = COALESCE(cancelled_at, NOW()) WHERE id = ?',
          [status, id]
        );
      } catch (err) {
        if (err.code === 'ER_BAD_FIELD_ERROR') await statusOnly();
        else throw err;
      }
    } else {
      await statusOnly();
    }
    return this.findById(id);
  }

  /**
   * Update return_status (and optionally refunded_at; when APPROVED can set status = CANCELLED)
   * @param {number} id - Order ID
   * @param {string} returnStatus - REQUESTED | APPROVED | REJECTED
   * @param {Object} options - { refunded_at: boolean, setOrderCancelled: boolean, conn }
   */
  static async updateReturnStatus(id, returnStatus, options = {}) {
    const { refunded_at = false, setOrderCancelled = false, conn = null } = options;
    const db = conn || pool;

    if (returnStatus === 'APPROVED' && setOrderCancelled) {
      await db.query(
        'UPDATE orders SET return_status = ?, refunded_at = NOW(), status = ? WHERE id = ?',
        [returnStatus, 'CANCELLED', id]
      );
    } else if (returnStatus === 'APPROVED' && refunded_at) {
      await db.query(
        'UPDATE orders SET return_status = ?, refunded_at = NOW() WHERE id = ?',
        [returnStatus, id]
      );
    } else {
      await db.query(
        'UPDATE orders SET return_status = ? WHERE id = ?',
        [returnStatus, id]
      );
    }
    return this.findById(id, conn);
  }

  // Delete order
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = OrderModel;

