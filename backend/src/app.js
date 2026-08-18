require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', true);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,https://shelf-control-inventory-management.vercel.app').split(',').map((origin) => origin.trim()).filter(Boolean);

// Middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS policy blocked this request'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/sales', require('./routes/sales.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/payroll', require('./routes/payroll.routes'));
app.use('/api/expenses', require('./routes/expenses.routes'));
app.use('/api/customers', require('./routes/customers.routes'));
app.use('/api/suppliers', require('./routes/suppliers.routes'));
app.use('/api/users', require('./routes/users.routes'));

app.get(['/health', '/api/health'], (req, res) => res.json({ success: true, message: 'API is running' }));

// Global error handler
app.use(errorHandler);

module.exports = app;
