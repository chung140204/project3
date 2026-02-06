const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

// GET /api/products - Get all products
router.get('/', ProductController.getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', ProductController.getProductById);

module.exports = router;






