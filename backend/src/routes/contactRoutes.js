const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/ContactController');

// POST /api/contact - Send contact message to support email (Public)
router.post('/', ContactController.sendContactMessage);

module.exports = router;

