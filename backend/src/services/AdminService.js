const bcrypt = require('bcrypt');
const pool = require('../config/database');
const OrderModel = require('../models/OrderModel');
const OrderItemModel = require('../models/OrderItemModel');
const CategoryModel = require('../models/CategoryModel');
const ProductModel = require('../models/ProductModel');
const UserModel = require('../models/UserModel');

// Allowed status transitions for admin (UC007): backend is source of truth
const ORDER_STATUS_TRANSITIONS = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: []
};

class AdminService {
  /**
   * Get allowed next statuses for an order (no frontend hardcoding)
   */
  static getAllowedNextStatuses(currentStatus) {
    const key = (currentStatus || '').toUpperCase();
    return ORDER_STATUS_TRANSITIONS[key] || [];
  }

  /**
   * Get all orders for admin. Sorted newest first.
   * Returns id, customer_name, status, total_amount, created_at, allowed_statuses, plus full order fields and items.
   * GET /api/admin/orders
   */
  static async getOrders() {
    const orders = await OrderModel.findAll();
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItemModel.findByOrderId(order.id);
        const currentStatus = (order.status || '').toUpperCase();
        const allowed_statuses = AdminService.getAllowedNextStatuses(currentStatus);
        return {
          ...order,
          customer_name: order.customer_name || order.user_name || 'N/A',
          created_at: order.created_at || order.order_date,
          items,
          allowed_statuses
        };
      })
    );
    return ordersWithItems;
  }

  /**
   * Get VAT Report for admin
   * - Only orders with status IN ('PAID', 'COMPLETED')
   * - Total VAT = SUM(order_items.tax_amount)
   * - VAT by category = SUM(order_items.tax_amount) - category for join only
   * - VAT by month = grouped by YEAR(paid_at), MONTH(paid_at)
   * @returns {Promise<Object>} VAT report data
   */
  static async getVATReport() {
    try {
      // Query to get total VAT (only PAID/COMPLETED; exclude refunded if refunded_at column exists)
      const totalVATQuery = `
        SELECT COALESCE(SUM(oi.tax_amount), 0) as total_vat
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('PAID', 'COMPLETED')
      `;

      // Query to get VAT grouped by month (GROUP BY expression matches SELECT for only_full_group_by)
      const vatByMonthQuery = `
        SELECT 
          DATE_FORMAT(o.order_date, '%Y-%m') as month,
          COALESCE(SUM(oi.tax_amount), 0) as vat
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('PAID', 'COMPLETED')
        GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
        ORDER BY month ASC
      `;

      // Query to get VAT grouped by product category
      const vatByCategoryQuery = `
        SELECT 
          c.id as category_id,
          c.name as category_name,
          COALESCE(SUM(oi.tax_amount), 0) as vat
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
        INNER JOIN products p ON oi.product_id = p.id
        INNER JOIN categories c ON p.category_id = c.id
        WHERE o.status IN ('PAID', 'COMPLETED')
        GROUP BY c.id, c.name
        ORDER BY c.name ASC
      `;

      // Doanh thu theo tháng (revenue = SUM order_items.total)
      const revenueByMonthQuery = `
        SELECT 
          DATE_FORMAT(o.order_date, '%Y-%m') as month,
          COALESCE(SUM(oi.total), 0) as revenue
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('PAID', 'COMPLETED')
        GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
        ORDER BY month ASC
      `;

      // Số lượng sản phẩm đã bán theo tháng
      const quantityByMonthQuery = `
        SELECT 
          DATE_FORMAT(o.order_date, '%Y-%m') as month,
          COALESCE(SUM(oi.quantity), 0) as quantity
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('PAID', 'COMPLETED')
        GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
        ORDER BY month ASC
      `;

      // Execute all queries in parallel
      const [totalVATResult] = await pool.query(totalVATQuery);
      const [vatByMonthResult] = await pool.query(vatByMonthQuery);
      const [vatByCategoryResult] = await pool.query(vatByCategoryQuery);
      const [revenueByMonthResult] = await pool.query(revenueByMonthQuery);
      const [quantityByMonthResult] = await pool.query(quantityByMonthQuery);

      // Extract total VAT
      const totalVAT = parseFloat(totalVATResult[0]?.total_vat || 0);

      // Format VAT by month
      const vatByMonth = vatByMonthResult.map(row => ({
        month: row.month,
        vat: Math.round(parseFloat(row.vat) * 100) / 100
      }));

      // Format VAT by category
      const vatByCategory = vatByCategoryResult.map(row => ({
        category_id: row.category_id,
        category_name: row.category_name,
        vat: Math.round(parseFloat(row.vat) * 100) / 100
      }));

      // Doanh thu theo tháng
      const revenueByMonth = revenueByMonthResult.map(row => ({
        month: row.month,
        revenue: Math.round(parseFloat(row.revenue) * 100) / 100
      }));

      // Số lượng sản phẩm đã bán theo tháng
      const quantityByMonth = quantityByMonthResult.map(row => ({
        month: row.month,
        quantity: parseInt(row.quantity, 10) || 0
      }));

      return {
        totalVAT: Math.round(totalVAT * 100) / 100,
        vatByMonth,
        vatByCategory,
        revenueByMonth,
        quantityByMonth
      };
    } catch (error) {
      console.error('Error generating VAT report:', error);
      throw new Error('Failed to generate VAT report');
    }
  }

  /**
   * Update order status with validation
   * Validates status transitions:
   * - PENDING -> PAID or CANCELLED
   * - PAID -> COMPLETED
   * - COMPLETED and CANCELLED cannot be changed
   * When PENDING -> PAID: set paid_at = NOW()
   * @param {number} orderId - Order ID
   * @param {string} newStatus - New status to set
   * @returns {Promise<Object>} Updated order
   */
  static async updateOrderStatus(orderId, newStatus) {
    // Validate order exists
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const currentStatus = order.status?.toUpperCase();
    const requestedStatus = newStatus?.toUpperCase();

    // Validate status value
    const validStatuses = ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(requestedStatus)) {
      throw new Error(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    // Check if status is already the requested status
    if (currentStatus === requestedStatus) {
      throw new Error(`Order is already ${requestedStatus}`);
    }

    // Validate status transitions
    const validTransitions = {
      'PENDING': ['PAID', 'CANCELLED'],
      'PAID': ['COMPLETED'],
      'COMPLETED': [],
      'CANCELLED': []
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(requestedStatus)) {
      throw new Error(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${requestedStatus}`
      );
    }

    // Update order status (OrderModel.updateStatus sets paid_at when PENDING -> PAID)
    const updatedOrder = await OrderModel.updateStatus(orderId, requestedStatus);

    if (!updatedOrder) {
      throw new Error('Failed to update order status');
    }

    return updatedOrder;
  }

  /**
   * Get all return requests for admin (UC008)
   * Joins order_return_requests with orders for customer name and return_status
   * @returns {Promise<Array>} List of return requests with order info
   */
  static async getReturnRequests() {
    try {
      const [rows] = await pool.query(
        `SELECT r.id, r.order_id, r.user_id, r.reason, r.media_urls, r.created_at,
                o.return_status, o.customer_name, o.order_date, o.total_amount, o.status AS order_status
         FROM order_return_requests r
         INNER JOIN orders o ON r.order_id = o.id
         ORDER BY r.created_at DESC`
      );
      return (rows || []).map((row) => {
        let mediaUrls = [];
        if (row.media_urls) {
          try {
            mediaUrls = typeof row.media_urls === 'string' ? JSON.parse(row.media_urls) : row.media_urls;
            if (!Array.isArray(mediaUrls)) mediaUrls = [];
          } catch (_) {
            mediaUrls = [];
          }
        }
        return {
          id: row.id,
          orderId: row.order_id,
          userId: row.user_id,
          reason: row.reason,
          mediaUrls,
          createdAt: row.created_at,
          returnStatus: String(row.return_status || 'NONE'),
          customerName: row.customer_name || 'N/A',
          orderDate: row.order_date,
          totalAmount: row.total_amount,
          orderStatus: row.order_status
        };
      });
    } catch (err) {
      console.error('getReturnRequests error:', err);
      // If table missing (e.g. migration not run), return empty list so admin UI still loads
      if (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR') {
        return [];
      }
      throw err;
    }
  }

  // ---------- Category Management (Admin) ----------

  static async getCategories() {
    return CategoryModel.findAll();
  }

  static async createCategory(body) {
    const name = (body.name || '').trim();
    if (!name) throw new Error('Category name is required');
    let taxRate = body.tax_rate;
    if (taxRate == null || taxRate === '') throw new Error('Tax rate is required');
    taxRate = parseFloat(taxRate);
    if (Number.isNaN(taxRate) || taxRate < 0 || taxRate > 1) {
      throw new Error('Tax rate must be a number between 0 and 1');
    }
    const existing = await CategoryModel.findByName(name);
    if (existing) throw new Error('Category name already exists');
    return CategoryModel.create({ name, tax_rate: taxRate });
  }

  static async updateCategory(id, body) {
    const category = await CategoryModel.findById(id);
    if (!category) throw new Error('Category not found');
    const name = (body.name || '').trim();
    if (!name) throw new Error('Category name is required');
    let taxRate = body.tax_rate;
    if (taxRate == null || taxRate === '') throw new Error('Tax rate is required');
    taxRate = parseFloat(taxRate);
    if (Number.isNaN(taxRate) || taxRate < 0 || taxRate > 1) {
      throw new Error('Tax rate must be a number between 0 and 1');
    }
    const existing = await CategoryModel.findByName(name, id);
    if (existing) throw new Error('Category name already exists');
    return CategoryModel.update(id, { name, tax_rate: taxRate });
  }

  static async deleteCategory(id) {
    const category = await CategoryModel.findById(id);
    if (!category) throw new Error('Category not found');
    const count = await CategoryModel.countProductsByCategoryId(id);
    if (count > 0) {
      throw new Error('Cannot delete category: it has products. Remove or reassign products first.');
    }
    const deleted = await CategoryModel.delete(id);
    if (!deleted) throw new Error('Failed to delete category');
    return { deleted: true };
  }

  // ---------- Product Management (Admin) ----------

  static async getProducts() {
    return ProductModel.findAll();
  }

  static async createProduct(body) {
    const name = (body.name || '').trim();
    if (!name) throw new Error('Product name is required');
    const price = parseFloat(body.price);
    if (Number.isNaN(price) || price <= 0) throw new Error('Price must be greater than 0');
    const stock = body.stock != null ? parseInt(body.stock, 10) : 0;
    if (Number.isNaN(stock) || stock < 0) throw new Error('Stock must be 0 or greater');
    const categoryId = parseInt(body.category_id, 10);
    if (!categoryId) throw new Error('Category is required');
    const category = await CategoryModel.findById(categoryId);
    if (!category) throw new Error('Category not found');
    const status = body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return ProductModel.createForAdmin({
      name,
      description: body.description || null,
      price,
      stock,
      status,
      image: body.image || null,
      category_id: categoryId,
      sku: body.sku || null
    });
  }

  static async updateProduct(id, body) {
    const product = await ProductModel.findById(id);
    if (!product) throw new Error('Product not found');
    const name = (body.name || '').trim();
    if (!name) throw new Error('Product name is required');
    const price = parseFloat(body.price);
    if (Number.isNaN(price) || price <= 0) throw new Error('Price must be greater than 0');
    const stock = body.stock != null ? parseInt(body.stock, 10) : 0;
    if (Number.isNaN(stock) || stock < 0) throw new Error('Stock must be 0 or greater');
    const categoryId = parseInt(body.category_id, 10);
    if (!categoryId) throw new Error('Category is required');
    const category = await CategoryModel.findById(categoryId);
    if (!category) throw new Error('Category not found');
    const status = body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return ProductModel.updateForAdmin(id, {
      name,
      description: body.description || null,
      price,
      stock,
      status,
      image: body.image || null,
      category_id: categoryId,
      sku: body.sku || null
    });
  }

  static async deleteProduct(id) {
    const product = await ProductModel.findById(id);
    if (!product) throw new Error('Product not found');
    const deleted = await ProductModel.delete(id);
    if (!deleted) throw new Error('Failed to delete product');
    return { deleted: true };
  }

  // ---------- User Management (Admin) ----------

  static async getUsers() {
    return UserModel.findAll();
  }

  static async createUser(body) {
    const name = (body.full_name || body.name || '').trim();
    if (!name) throw new Error('Họ tên là bắt buộc');
    const email = (body.email || '').trim().toLowerCase();
    if (!email) throw new Error('Email là bắt buộc');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Email không hợp lệ');
    const password = body.password;
    if (!password || typeof password !== 'string') throw new Error('Mật khẩu là bắt buộc');
    if (password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    const role = body.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    const phone = body.phone != null ? String(body.phone).trim() : null;

    const existing = await UserModel.findByEmail(email);
    if (existing) throw new Error('Email đã được sử dụng');

    const password_hash = await bcrypt.hash(password, 10);
    return UserModel.create({ name, email, password_hash, phone, role });
  }

  static async updateUser(id, body) {
    const user = await UserModel.findById(id);
    if (!user) throw new Error('User not found');
    const name = (body.full_name || body.name || user.full_name || user.name || '').trim();
    if (!name) throw new Error('Họ tên là bắt buộc');
    const email = (body.email != null && body.email !== '' ? body.email : user.email || '').trim().toLowerCase();
    if (!email) throw new Error('Email là bắt buộc');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Email không hợp lệ');
    const role = body.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    const phone = body.phone !== undefined ? (body.phone ? String(body.phone).trim() : null) : user.phone;

    const existing = await UserModel.findByEmailExcludingId(email, id);
    if (existing) throw new Error('Email đã được sử dụng bởi tài khoản khác');

    let password_hash;
    if (body.password && typeof body.password === 'string' && body.password.trim().length >= 6) {
      password_hash = await bcrypt.hash(body.password.trim(), 10);
    }
    return UserModel.updateForAdmin(id, { name, email, phone, role, password_hash });
  }

  static async deleteUser(id) {
    const user = await UserModel.findById(id);
    if (!user) throw new Error('User not found');
    const orderCount = await OrderModel.countByUserId(id);
    if (orderCount > 0) throw new Error('Không thể xóa user đã có đơn hàng');
    if (user.role === 'ADMIN') {
      const adminCount = await UserModel.countByRole('ADMIN');
      if (adminCount <= 1) throw new Error('Không thể xóa admin cuối cùng');
    }
    const deleted = await UserModel.delete(id);
    if (!deleted) throw new Error('Failed to delete user');
    return { deleted: true };
  }
}

module.exports = AdminService;
