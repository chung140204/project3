const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { uploadReturnMedia } = require('../middlewares/upload.middleware');

// GET /api/orders - List orders for current user (Protected)
router.get('/', OrderController.getMyOrders);

// POST /api/orders/checkout - Create order from cart items (Protected)
router.post('/checkout', OrderController.checkout);

// POST /api/orders/:id/return-request - Submit return request (Protected, order owner only)
// Multer parse multipart: reason → req.body.reason, files → req.files
router.post('/:id/return-request', 
  uploadReturnMedia.array('files', 5),
  (err, req, res, next) => {
    // Multer error handler
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Kích thước file quá lớn. Tối đa 5MB mỗi file'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Số lượng file quá nhiều. Tối đa 5 file'
        });
      }
      if (err.message && err.message.includes('Chỉ cho phép tải lên ảnh')) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Lỗi upload file'
      });
    }
    next();
  },
  OrderController.submitReturnRequest
);

// GET /api/orders/:id/invoice - Get invoice for an order (Protected)
router.get('/:id/invoice', OrderController.getInvoice);

module.exports = router;

