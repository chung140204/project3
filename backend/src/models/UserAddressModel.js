const pool = require('../config/database');

class UserAddressModel {
  // Find all addresses for a user
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return rows;
  }

  // Find address by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM user_addresses WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Find default address for a user
  static async findDefaultByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = ? AND is_default = TRUE LIMIT 1',
      [userId]
    );
    return rows[0] || null;
  }

  // Create new address
  static async create(addressData) {
    const { user_id, recipient_name, phone, address, is_default } = addressData;
    
    // If setting as default, unset other defaults first
    if (is_default) {
      await pool.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?',
        [user_id]
      );
    }

    const [result] = await pool.query(
      'INSERT INTO user_addresses (user_id, recipient_name, phone, address, is_default) VALUES (?, ?, ?, ?, ?)',
      [user_id, recipient_name, phone, address, is_default || false]
    );
    return this.findById(result.insertId);
  }

  // Update address
  static async update(id, addressData) {
    const { recipient_name, phone, address, is_default, user_id } = addressData;
    
    // If setting as default, unset other defaults first
    if (is_default) {
      await pool.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ? AND id != ?',
        [user_id, id]
      );
    }

    await pool.query(
      'UPDATE user_addresses SET recipient_name = ?, phone = ?, address = ?, is_default = ? WHERE id = ?',
      [recipient_name, phone, address, is_default || false, id]
    );
    return this.findById(id);
  }

  // Set address as default
  static async setAsDefault(id, userId) {
    // Unset all other defaults for this user
    await pool.query(
      'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?',
      [userId]
    );
    
    // Set this address as default
    await pool.query(
      'UPDATE user_addresses SET is_default = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return this.findById(id);
  }

  // Delete address
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM user_addresses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Verify address belongs to user
  static async verifyOwnership(id, userId) {
    const [rows] = await pool.query(
      'SELECT id FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows.length > 0;
  }
}

module.exports = UserAddressModel;




