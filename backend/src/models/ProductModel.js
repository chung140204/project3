const pool = require('../config/database');

class ProductModel {
  // Find all products
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT p.*, c.name as category_name, c.tax_rate FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name'
    );
    return rows;
  }

  // Find product by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT p.*, c.name as category_name, c.tax_rate FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Find products by category
  static async findByCategory(categoryId) {
    const [rows] = await pool.query(
      'SELECT p.*, c.name as category_name, c.tax_rate FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = ? ORDER BY p.name',
      [categoryId]
    );
    return rows;
  }

  // Create new product
  static async create(productData) {
    const { name, price, image, category_id } = productData;
    const [result] = await pool.query(
      'INSERT INTO products (name, price, image, category_id) VALUES (?, ?, ?, ?)',
      [name, price, image || null, category_id]
    );
    return this.findById(result.insertId);
  }

  // Update product
  static async update(id, productData) {
    const { name, price, image, category_id } = productData;
    await pool.query(
      'UPDATE products SET name = ?, price = ?, image = ?, category_id = ? WHERE id = ?',
      [name, price, image, category_id, id]
    );
    return this.findById(id);
  }

  // Delete product
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ProductModel;




