const OrderService = require('../services/OrderService');
const OrderReturnService = require('../services/OrderReturnService').OrderReturnService;

class OrderController {
  /**
   * Checkout - Create order from cart items
   * POST /api/orders/checkout
   * Protected route - requires JWT authentication
   * @param {Object} req - Express request object (req.user from JWT middleware)
   * @param {Object} res - Express response object
   */
  static async checkout(req, res) {
    try {
      // Get user ID from JWT (req.user is set by authMiddleware)
      const userId = req.user.id;

      // Extract request body
      const { items, customer, voucherCode } = req.body;

      // Validate request body
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Items are required and must be a non-empty array'
        });
      }

      if (!customer) {
        return res.status(400).json({
          success: false,
          error: 'Customer information is required'
        });
      }

      // Validate customer fields
      if (!customer.name || !customer.email || !customer.address) {
        return res.status(400).json({
          success: false,
          error: 'Customer name, email, and address are required'
        });
      }

      // Create order using OrderService (all VAT calculations done on backend)
      const result = await OrderService.createOrder(userId, items, customer, voucherCode);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: result.orderId
        }
      });
    } catch (error) {
      // Handle specific error cases
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('Invalid') || 
          error.message.includes('cannot be empty') ||
          error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      // Generic server error
      console.error('Checkout error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create order'
      });
    }
  }

  /**
   * Get my orders (list for current user)
   * GET /api/orders
   * Protected route - requires JWT authentication
   */
  static async getMyOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await OrderService.getOrdersByUserId(userId);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Get my orders error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch orders'
      });
    }
  }

  /**
   * Get invoice for an order
   * GET /api/orders/:id/invoice
   * Protected route - requires JWT authentication
   * @param {Object} req - Express request object (req.user from JWT middleware)
   * @param {Object} res - Express response object
   */
  static async getInvoice(req, res) {
    try {
      // Get user ID and role from JWT (req.user is set by authMiddleware)
      const userId = req.user.id;
      const userRole = req.user.role;

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }

      // Fetch invoice data using OrderService
      const invoiceData = await OrderService.getInvoiceData(parseInt(id));

      if (!invoiceData) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Verify order belongs to user (or user is admin)
      const order = await OrderService.getOrderById(parseInt(id));
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Check ownership: user must be the owner or an admin
      if (order.user_id !== userId && userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Forbidden - You do not have permission to view this order'
        });
      }

      // Return full invoice data
      res.status(200).json({
        success: true,
        data: invoiceData
      });
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch invoice'
      });
    }
  }

  /**
   * UC005: Submit return request
   * POST /api/orders/:id/return-request
   * Auth required, order owner only
   * Payload: reason (required, text field), files (optional, multipart files)
   */
  static async submitReturnRequest(req, res) {
    try {
      // 1. Validate role
      if (req.user.role !== 'CUSTOMER') {
        return res.status(403).json({
          success: false,
          error: 'Chỉ khách hàng mới có thể gửi yêu cầu trả hàng'
        });
      }

      const userId = req.user.id;
      const orderId = parseInt(req.params.id);

      // 2. Validate order ID
      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          error: 'Mã đơn hàng không hợp lệ'
        });
      }

      // 3. Validate reason (bắt buộc)
      const reason = (req.body?.reason || '').trim();
      if (!reason || reason.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Lý do trả hàng là bắt buộc'
        });
      }

      const files = req.files || [];

      // 4. Validate order exists and belongs to user (via service)
      // 5. Validate order status, return_status, time window (via service)
      const result = await OrderReturnService.submitReturnRequest(
        orderId,
        userId,
        reason,
        files
      );

      return res.status(201).json({
        success: true,
        message: 'Gửi yêu cầu trả hàng thành công',
        data: {
          returnRequestId: result.returnRequestId,
          orderId: result.orderId
        }
      });
    } catch (error) {
      // Map service errors to HTTP status codes (KHÔNG throw, chỉ return)
      const errorMsg = error.message || '';

      // Multer errors (file size, file type, etc.)
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Kích thước file quá lớn. Tối đa 5MB mỗi file'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Số lượng file quá nhiều. Tối đa 5 file'
        });
      }
      if (error.message && error.message.includes('Chỉ cho phép tải lên ảnh')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (errorMsg.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy đơn hàng'
        });
      }

      if (errorMsg.includes('only submit') || errorMsg.includes('your own orders')) {
        return res.status(403).json({
          success: false,
          error: 'Bạn chỉ có thể gửi yêu cầu trả hàng cho đơn hàng của chính mình'
        });
      }

      if (errorMsg.includes('only allowed for completed') || errorMsg.includes('COMPLETED')) {
        return res.status(400).json({
          success: false,
          error: 'Chỉ có thể gửi yêu cầu trả hàng cho đơn hàng đã hoàn thành'
        });
      }

      if (errorMsg.includes('already exists') || errorMsg.includes('was processed')) {
        return res.status(400).json({
          success: false,
          error: 'Đơn hàng này đã có yêu cầu trả hàng hoặc đã được xử lý'
        });
      }

      if (errorMsg.includes('within 7 days') || errorMsg.includes('7 days')) {
        return res.status(400).json({
          success: false,
          error: 'Yêu cầu trả hàng phải được gửi trong vòng 7 ngày kể từ khi đơn hàng hoàn thành'
        });
      }

      if (errorMsg.includes('Reason is required')) {
        return res.status(400).json({
          success: false,
          error: 'Lý do trả hàng là bắt buộc'
        });
      }

      if (errorMsg.includes('completed_at is missing')) {
        return res.status(400).json({
          success: false,
          error: 'Không thể xác định thời điểm hoàn thành đơn hàng'
        });
      }

      // Database errors (table missing, etc.)
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
          success: false,
          error: 'Bảng yêu cầu trả hàng chưa được tạo. Vui lòng chạy migration database.'
        });
      }

      // Unknown errors - log và return 500
      console.error('Submit return request error:', error);
      return res.status(500).json({
        success: false,
        error: errorMsg || 'Không thể gửi yêu cầu trả hàng. Vui lòng thử lại sau.'
      });
    }
  }
}

module.exports = OrderController;

