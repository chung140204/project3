const pool = require('../config/database');

class ProductModel {
  // Find all products
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT p.*, c.name as category_name, c.tax_rate FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name'
    );
    return rows;
  }

  // Find product by ID (optional conn for transaction)
  static async findById(id, conn = null) {
    const db = conn || pool;
    const [rows] = await db.query(
      'SELECT p.*, c.name as category_name, c.tax_rate FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Increment stock (for return/refund - use conn in transaction)
   * @param {number} productId
   * @param {number} quantity
   * @param {Object} conn - Database connection
   */
  static async incrementStock(productId, quantity, conn) {
    const [result] = await conn.query(
      'UPDATE products SET stock = stock + ? WHERE id = ?',
      [quantity, productId]
    );
    return result.affectedRows > 0;
  }

  // Decrement stock (for transaction - use conn)
  static async decrementStock(productId, quantity, conn) {
    const [result] = await conn.query(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, productId, quantity]
    );
    return result.affectedRows > 0;
  }

  // Find products by category
  static async findByCategory(categoryId) {
    const [rows] = await pool.query(
      'SELECT p.*, c.name as category_name, c.tax_rate FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = ? ORDER BY p.name',
      [categoryId]
    );
    return rows;
  }

  /**
   * Find products with optional search, category filter, and pagination
   * @param {Object} opts - { search?: string, categoryId?: number, page?: number, pageSize?: number }
   * @returns {Promise<{ products: Array, total: number, page: number, pageSize: number, totalPages: number }>}
   */
  static async findAllWithFilters(opts = {}) {
    const { search, categoryId, page = 1, pageSize = 12 } = opts;
    const conditions = [];
    const params = [];

    let baseSql =
      'FROM products p LEFT JOIN categories c ON p.category_id = c.id';
    let whereSql = '';

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      conditions.push('(p.name LIKE ? OR COALESCE(p.description, "") LIKE ?)');
      params.push(term, term);
    }
    if (categoryId != null && categoryId !== '' && !Number.isNaN(Number(categoryId))) {
      conditions.push('p.category_id = ?');
      params.push(Number(categoryId));
    }
    if (conditions.length) {
      whereSql = ' WHERE ' + conditions.join(' AND ');
    }

    // Count total (for pagination)
    const countSql = `SELECT COUNT(*) as total ${baseSql}${whereSql}`;
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0]?.total || 0;

    // Get paginated products
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSizeNum = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 12));
    const offset = (pageNum - 1) * pageSizeNum;

    const dataSql = `SELECT p.*, c.name as category_name, c.tax_rate ${baseSql}${whereSql} ORDER BY p.name LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(dataSql, [...params, pageSizeNum, offset]);

    const totalPages = Math.ceil(total / pageSizeNum);

    return {
      products: rows,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages
    };
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

  /**
   * Create product (admin) - full fields: name, description, price, stock, status, image, category_id, sku
   */
  static async createForAdmin(productData) {
    const {
      name,
      description,
      price,
      stock,
      status,
      image,
      category_id,
      sku
    } = productData;
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, stock, status, image, category_id, sku)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        price,
        stock != null ? parseInt(stock, 10) : 0,
        status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        image || null,
        category_id,
        sku || null
      ]
    );
    return this.findById(result.insertId);
  }

  /**
   * Update product (admin) - full fields
   */
  static async updateForAdmin(id, productData) {
    const {
      name,
      description,
      price,
      stock,
      status,
      image,
      category_id,
      sku
    } = productData;
    await pool.query(
      `UPDATE products SET
        name = ?, description = ?, price = ?, stock = ?, status = ?, image = ?, category_id = ?, sku = ?
       WHERE id = ?`,
      [
        name,
        description || null,
        price,
        stock != null ? parseInt(stock, 10) : 0,
        status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        image || null,
        category_id,
        sku || null,
        id
      ]
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






