const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const UserAddressController = require('../controllers/UserAddressController');

// User profile routes
// GET /api/users/me - Get current user profile (Protected)
router.get('/me', UserController.getCurrentUser);

// PUT /api/users/me - Update current user profile (Protected)
router.put('/me', UserController.updateCurrentUser);

// PUT /api/users/me/password - Change password (Protected)
router.put('/me/password', UserController.changePassword);

// Address management routes
// GET /api/users/addresses - Get all addresses for current user
router.get('/addresses', UserAddressController.getAllAddresses);

// GET /api/users/addresses/default - Get default address
router.get('/addresses/default', UserAddressController.getDefaultAddress);

// POST /api/users/addresses - Create new address
router.post('/addresses', UserAddressController.createAddress);

// PUT /api/users/addresses/:id - Update address
router.put('/addresses/:id', UserAddressController.updateAddress);

// PUT /api/users/addresses/:id/set-default - Set address as default
router.put('/addresses/:id/set-default', UserAddressController.setDefaultAddress);

// DELETE /api/users/addresses/:id - Delete address
router.delete('/addresses/:id', UserAddressController.deleteAddress);

module.exports = router;

