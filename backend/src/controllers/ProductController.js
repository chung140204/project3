const ProductModel = require('../models/ProductModel');

class ProductController {
  /**
   * Get all products with optional search (q) and category filter (category_id)
   * GET /api/products?q=...&category_id=...
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllProducts(req, res) {
    try {
      const search = req.query.q != null ? String(req.query.q).trim() : '';
      const categoryId = req.query.category_id;
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 12;

      const result = await ProductModel.findAllWithFilters({
        search: search || undefined,
        categoryId: categoryId != null && categoryId !== '' ? categoryId : undefined,
        page,
        pageSize
      });

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch products'
      });
    }
  }

  /**
   * Get product by ID with tax_rate
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required'
        });
      }

      const product = await ProductModel.findById(parseInt(id));

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch product'
      });
    }
  }
}

module.exports = ProductController;






