const pool = require('../config/database');

class OrderItemModel {
  // Find all order items
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT oi.*, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id'
    );
    return rows;
  }

  // Find order item by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT oi.*, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Find order items by order ID
  static async findByOrderId(orderId) {
    const [rows] = await pool.query(
      'SELECT oi.*, p.name as product_name, p.image as product_image FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [orderId]
    );
    return rows;
  }

  // Create new order item
  static async create(orderItemData) {
    const { order_id, product_id, quantity, price, tax_amount, total, size, color } = orderItemData;
    const [result] = await pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price, tax_amount, total, size, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [order_id, product_id, quantity, price, tax_amount, total, size || null, color || null]
    );
    return this.findById(result.insertId);
  }

  // Update order item
  static async update(id, orderItemData) {
    const { quantity, price, tax_amount, total, size, color } = orderItemData;
    await pool.query(
      'UPDATE order_items SET quantity = ?, price = ?, tax_amount = ?, total = ?, size = ?, color = ? WHERE id = ?',
      [quantity, price, tax_amount, total, size, color, id]
    );
    return this.findById(id);
  }

  // Delete order item
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM order_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Delete all order items for an order
  static async deleteByOrderId(orderId) {
    const [result] = await pool.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    return result.affectedRows;
  }
}

module.exports = OrderItemModel;




