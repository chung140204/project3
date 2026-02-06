const pool = require('../config/database');

class OrderReturnRequestModel {
  /**
   * Create a new return request
   * @param {Object} data - { order_id, user_id, reason, media_urls }
   * @returns {Promise<Object>} Created record
   */
  static async create(data) {
    const { order_id, user_id, reason, media_urls } = data;
    const [result] = await pool.query(
      'INSERT INTO order_return_requests (order_id, user_id, reason, media_urls) VALUES (?, ?, ?, ?)',
      [order_id, user_id, reason, media_urls ? JSON.stringify(media_urls) : null]
    );
    return this.findById(result.insertId);
  }

  /**
   * Find return request by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM order_return_requests WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find return requests by order ID
   * @param {number} orderId
   * @returns {Promise<Array>}
   */
  static async findByOrderId(orderId) {
    const [rows] = await pool.query(
      'SELECT * FROM order_return_requests WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    return rows;
  }
}

module.exports = OrderReturnRequestModel;
