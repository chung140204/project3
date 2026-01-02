const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// POST /api/auth/register - Register new user
router.post('/register', AuthController.register);

// POST /api/auth/login - Login user
router.post('/login', AuthController.login);

module.exports = router;




