const express = require('express');
const router = express.Router();
const CategoryModel = require('../models/CategoryModel');

// GET /api/categories - List all categories (public, for product filter)
router.get('/', async (req, res) => {
  try {
    const categories = await CategoryModel.findAll();
    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch categories'
    });
  }
});

module.exports = router;
