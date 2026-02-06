const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

// User Management (Admin only)
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// GET /api/admin/orders - List all orders (Admin only)
router.get('/orders', AdminController.getOrders);

// GET /api/admin/vat-report - Get VAT report (Admin only)
router.get('/vat-report', AdminController.getVATReport);

// Category Management (Admin only)
router.get('/categories', AdminController.getCategories);
router.post('/categories', AdminController.createCategory);
router.put('/categories/:id', AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

// Product Management (Admin only)
router.get('/products', AdminController.getProducts);
router.post('/products', AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// GET /api/admin/return-requests - List return requests (Admin only, UC008)
router.get('/return-requests', AdminController.getReturnRequests);

// PUT /api/admin/orders/:id/status - Update order status (Admin only)
router.put('/orders/:id/status', AdminController.updateOrderStatus);

// PUT /api/admin/orders/:id/return/approve - Approve return request (Admin only)
router.put('/orders/:id/return/approve', AdminController.approveReturnRequest);

// PUT /api/admin/orders/:id/return/reject - Reject return request (Admin only)
router.put('/orders/:id/return/reject', AdminController.rejectReturnRequest);

module.exports = router;

