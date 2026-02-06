// Load environment variables first
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files: return request media (UC005/UC008)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// API routes
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Auth routes (public)
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Contact routes (protected - require JWT so we can use account email)
const contactRoutes = require('./src/routes/contactRoutes');
const { authMiddleware } = require('./src/middlewares/auth.middleware');
app.use('/api/contact', authMiddleware, contactRoutes);

// Order routes (protected - require JWT authentication)
const orderRoutes = require('./src/routes/orderRoutes');
app.use('/api/orders', authMiddleware, orderRoutes);

// User routes (protected - require JWT authentication)
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', authMiddleware, userRoutes);

// Admin routes (protected - require JWT authentication + ADMIN role)
const adminRoutes = require('./src/routes/adminRoutes');
const { requireAdmin } = require('./src/middlewares/auth.middleware');
app.use('/api/admin', authMiddleware, requireAdmin, adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

