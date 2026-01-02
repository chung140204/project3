const pool = require('../config/database');

class CategoryModel {
  // Find all categories
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    return rows;
  }

  // Find category by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Create new category
  static async create(categoryData) {
    const { name, tax_rate } = categoryData;
    const [result] = await pool.query(
      'INSERT INTO categories (name, tax_rate) VALUES (?, ?)',
      [name, tax_rate || 0.00]
    );
    return this.findById(result.insertId);
  }

  // Update category
  static async update(id, categoryData) {
    const { name, tax_rate } = categoryData;
    await pool.query(
      'UPDATE categories SET name = ?, tax_rate = ? WHERE id = ?',
      [name, tax_rate, id]
    );
    return this.findById(id);
  }

  // Delete category
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = CategoryModel;




