const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Assume JWT authentication middleware exists
// It should set req.user = { id, email, role }
// Example: const authenticate = require('../middleware/authenticate');
// For now, we'll add a comment and assume it's applied at app level or route level

// POST /api/orders/checkout - Create order from cart items (Protected)
// Requires: JWT authentication middleware
router.post('/checkout', OrderController.checkout);

// GET /api/orders/:id/invoice - Get invoice for an order (Protected)
// Requires: JWT authentication middleware
router.get('/:id/invoice', OrderController.getInvoice);

module.exports = router;

