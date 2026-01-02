const AuthService = require('../services/AuthService');

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async register(req, res) {
    try {
      const { name, email, password, confirmPassword, phone } = req.body;

      // Register user using AuthService (all validation happens there)
      const user = await AuthService.register({
        name,
        email,
        password,
        confirmPassword,
        phone
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
      });
    } catch (error) {
      // Handle specific error cases
      if (error.message.includes('already registered') || 
          error.message.includes('Email already') ||
          error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      // Validation errors (400 Bad Request)
      if (error.message.includes('Invalid') || 
          error.message.includes('required') ||
          error.message.includes('at least') ||
          error.message.includes('must match') ||
          error.message.includes('cannot be empty')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      // Generic server error
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register user. Please try again.'
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate request body
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Login user using AuthService
      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      // Handle authentication errors
      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      if (error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      // Generic server error
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to login'
      });
    }
  }
}

module.exports = AuthController;

