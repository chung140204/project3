const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

class AuthService {
  /**
   * Register a new user
   * ALL VALIDATION MUST HAPPEN BEFORE ANY DATABASE OPERATIONS
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - Plain text password
   * @param {string} userData.confirmPassword - Password confirmation
   * @param {string} userData.phone - User's phone number (required)
   * @returns {Promise<Object>} Created user (without password_hash)
   */
  static async register(userData) {
    // Destructure in the same order as form fields
    const { name, email, phone, password, confirmPassword } = userData;

    // ============================================
    // STEP 1: VALIDATE ALL INPUTS FIRST
    // ============================================
    // Do NOT perform any database operations until all validations pass
    // Validation order matches form field order

    // 1. Validate name: required, not empty after trim
    if (!name || typeof name !== 'string') {
      throw new Error('Name is required');
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Name cannot be empty');
    }
    if (trimmedName.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    // 2. Validate email: required, valid format
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail.length === 0) {
      throw new Error('Email cannot be empty');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Invalid email format');
    }

    // 3. Validate phone: required, valid Vietnamese phone number (10-11 digits)
    if (!phone || typeof phone !== 'string') {
      throw new Error('Phone number is required');
    }
    const trimmedPhone = phone.trim();
    if (trimmedPhone.length === 0) {
      throw new Error('Phone number cannot be empty');
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      throw new Error('Phone number must be 10-11 digits');
    }

    // 4. Validate password: required, minimum 6 characters
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // 5. Validate confirmPassword: must match password
    if (!confirmPassword || typeof confirmPassword !== 'string') {
      throw new Error('Password confirmation is required');
    }
    if (password !== confirmPassword) {
      throw new Error('Password and confirmation password must match');
    }

    // ============================================
    // STEP 2: CHECK EMAIL UNIQUENESS
    // ============================================
    // Only after all validations pass, check database
    const existingUser = await UserModel.findByEmail(trimmedEmail);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // ============================================
    // STEP 3: HASH PASSWORD
    // ============================================
    // Only hash password after all validations pass
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // ============================================
    // STEP 4: INSERT INTO DATABASE
    // ============================================
    // Only insert after ALL validations pass
    const user = await UserModel.create({
      name: trimmedName,
      email: trimmedEmail,
      password_hash,
      phone: trimmedPhone,
      role: 'CUSTOMER' // Default role
    });

    // Return user without password_hash
    // User object from database has: id, name, email, phone, role, created_at, updated_at
    const { password_hash: _, ...userWithoutPassword } = user;
    return {
      id: userWithoutPassword.id,
      name: userWithoutPassword.name, // Database column is 'name'
      email: userWithoutPassword.email,
      phone: userWithoutPassword.phone,
      role: userWithoutPassword.role
    };
  }

  /**
   * Login user and generate JWT token
   * @param {string} email - User's email
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} JWT token and user info
   */
  static async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN
      }
    );

    // Return token and user info (without password_hash)
    // User object from database has: id, name, email, phone, role, password_hash
    const { password_hash: _, ...userWithoutPassword } = user;
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    };
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token payload
   */
  static async verifyToken(token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = AuthService;

