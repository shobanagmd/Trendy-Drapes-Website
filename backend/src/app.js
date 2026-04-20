const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const financeRoutes = require('./routes/financeRoutes');
const otpRoutes = require('./routes/otpRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const notificationRoutes = require('./routes/notificationRoutes');


const app = express();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];
app.use(cors({
  origin: (origin, callback) => {
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    if (!origin || allowedOrigins.includes(origin) || isDev) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);

// Compatibility redirect (Optional: if we want to support old non-prefixed routes during transition)
app.post('/api/login', (req, res) => res.redirect(307, '/api/auth/login'));
app.post('/api/register', (req, res) => res.redirect(307, '/api/auth/register'));
app.get('/api/me', (req, res) => res.redirect(301, '/api/user/me'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

module.exports = app;
