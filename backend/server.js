// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// API routes
const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

// Auth routes (public)
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Order routes (protected - require JWT authentication)
const orderRoutes = require('./src/routes/orderRoutes');
const { authMiddleware } = require('./src/middlewares/auth.middleware');
app.use('/api/orders', authMiddleware, orderRoutes);

// User routes (protected - require JWT authentication)
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', authMiddleware, userRoutes);

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

