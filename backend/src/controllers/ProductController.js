const ProductModel = require('../models/ProductModel');

class ProductController {
  /**
   * Get all products with category tax_rate
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllProducts(req, res) {
    try {
      const products = await ProductModel.findAll();
      
      res.status(200).json({
        success: true,
        data: products,
        count: products.length
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




