const OrderService = require('../services/OrderService');

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
}

module.exports = OrderController;

