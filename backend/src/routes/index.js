const express = require('express');
const router = express.Router();

// Import route modules
const productRoutes = require('./productRoutes');

// Mount routes
router.use('/products', productRoutes);

module.exports = router;

