const AdminService = require('../services/AdminService');
const OrderReturnService = require('../services/OrderReturnService').OrderReturnService;

class AdminController {
  /**
   * Get all orders (admin)
   * GET /api/admin/orders
   */
  static async getOrders(req, res) {
    try {
      const orders = await AdminService.getOrders();
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch orders'
      });
    }
  }

  /**
   * Get VAT Report
   * GET /api/admin/vat-report
   * Admin-only route - requires JWT authentication + ADMIN role
   * @param {Object} req - Express request object (req.user from JWT middleware)
   * @param {Object} res - Express response object
   */
  static async getVATReport(req, res) {
    try {
      // Get VAT report data from AdminService
      const reportData = await AdminService.getVATReport();

      // Return structured JSON response
      res.status(200).json({
        success: true,
        data: reportData
      });
    } catch (error) {
      console.error('Error fetching VAT report:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch VAT report'
      });
    }
  }

  /**
   * Update Order Status
   * PUT /api/admin/orders/:id/status
   * Admin-only route - requires JWT authentication + ADMIN role
   * @param {Object} req - Express request object (req.user from JWT middleware)
   * @param {Object} res - Express response object
   */
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate order ID
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }

      // Validate status in request body
      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required in request body'
        });
      }

      // Update order status using AdminService
      const updatedOrder = await AdminService.updateOrderStatus(parseInt(id), status);

      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: updatedOrder
      });
    } catch (error) {
      console.error('Error updating order status:', error);

      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Không thể chuyển trạng thái') ||
          error.message.includes('Invalid status') ||
          error.message.includes('already')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update order status'
      });
    }
  }

  /**
   * Approve return request
   * PUT /api/admin/orders/:id/return/approve
   * Admin only, orders.return_status must be REQUESTED
   */
  static async approveReturnRequest(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }

      const result = await OrderReturnService.approveReturnRequest(orderId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { orderId: result.orderId }
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ success: false, error: error.message });
      }
      if (error.message.includes('must be REQUESTED')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      console.error('Approve return error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to approve return request'
      });
    }
  }

  /**
   * Reject return request
   * PUT /api/admin/orders/:id/return/reject
   * Admin only, orders.return_status must be REQUESTED
   */
  static async rejectReturnRequest(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }

      const result = await OrderReturnService.rejectReturnRequest(orderId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { orderId: result.orderId }
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ success: false, error: error.message });
      }
      if (error.message.includes('must be REQUESTED')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      console.error('Reject return error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to reject return request'
      });
    }
  }

  /**
   * Get list of return requests (UC008)
   * GET /api/admin/return-requests
   * Admin only
   */
  static async getReturnRequests(req, res) {
    try {
      const list = await AdminService.getReturnRequests();
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (error) {
      console.error('Error fetching return requests:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch return requests'
      });
    }
  }

  // ---------- Category Management ----------

  static async getCategories(req, res) {
    try {
      const data = await AdminService.getCategories();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch categories' });
    }
  }

  static async createCategory(req, res) {
    try {
      const category = await AdminService.createCategory(req.body);
      res.status(201).json({ success: true, message: 'Category created', data: category });
    } catch (error) {
      if (error.message === 'Category name already exists') {
        return res.status(400).json({ success: false, error: error.message });
      }
      if (error.message.includes('required') || error.message.includes('between 0 and 1')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      console.error('Error creating category:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to create category' });
    }
  }

  static async updateCategory(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid category ID' });
      const category = await AdminService.updateCategory(id, req.body);
      res.status(200).json({ success: true, message: 'Category updated', data: category });
    } catch (error) {
      if (error.message === 'Category not found') return res.status(404).json({ success: false, error: error.message });
      if (error.message === 'Category name already exists' || error.message.includes('required') || error.message.includes('between 0 and 1')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      console.error('Error updating category:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to update category' });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid category ID' });
      await AdminService.deleteCategory(id);
      res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
      if (error.message === 'Category not found') return res.status(404).json({ success: false, error: error.message });
      if (error.message.includes('Cannot delete')) return res.status(400).json({ success: false, error: error.message });
      console.error('Error deleting category:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to delete category' });
    }
  }

  // ---------- Product Management ----------

  static async getProducts(req, res) {
    try {
      const data = await AdminService.getProducts();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch products' });
    }
  }

  static async createProduct(req, res) {
    try {
      const product = await AdminService.createProduct(req.body);
      res.status(201).json({ success: true, message: 'Product created', data: product });
    } catch (error) {
      if (error.message === 'Category not found') return res.status(404).json({ success: false, error: error.message });
      if (error.message.includes('required') || error.message.includes('greater than') || error.message.includes('0 or greater')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      console.error('Error creating product:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to create product' });
    }
  }

  static async updateProduct(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid product ID' });
      const product = await AdminService.updateProduct(id, req.body);
      res.status(200).json({ success: true, message: 'Product updated', data: product });
    } catch (error) {
      if (error.message === 'Product not found' || error.message === 'Category not found') {
        return res.status(404).json({ success: false, error: error.message });
      }
      if (error.message.includes('required') || error.message.includes('greater than') || error.message.includes('0 or greater')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      console.error('Error updating product:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to update product' });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid product ID' });
      await AdminService.deleteProduct(id);
      res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
      if (error.message === 'Product not found') return res.status(404).json({ success: false, error: error.message });
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to delete product' });
    }
  }

  // ---------- User Management ----------

  static async getUsers(req, res) {
    try {
      const data = await AdminService.getUsers();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch users' });
    }
  }

  static async createUser(req, res) {
    try {
      const user = await AdminService.createUser(req.body);
      res.status(201).json({ success: true, message: 'User created', data: user });
    } catch (error) {
      if (error.message === 'Email đã được sử dụng') {
        return res.status(400).json({ success: false, error: error.message });
      }
      if (error.message.includes('bắt buộc') || error.message.includes('hợp lệ') || error.message.includes('ít nhất')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to create user' });
    }
  }

  static async updateUser(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid user ID' });
      const user = await AdminService.updateUser(id, req.body);
      res.status(200).json({ success: true, message: 'User updated', data: user });
    } catch (error) {
      if (error.message === 'User not found') return res.status(404).json({ success: false, error: error.message });
      if (error.message === 'Email đã được sử dụng bởi tài khoản khác' || error.message.includes('bắt buộc') || error.message.includes('hợp lệ')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to update user' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid user ID' });
      await AdminService.deleteUser(id);
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      if (error.message === 'User not found') return res.status(404).json({ success: false, error: error.message });
      if (error.message.includes('Không thể xóa')) return res.status(400).json({ success: false, error: error.message });
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to delete user' });
    }
  }
}

module.exports = AdminController;

