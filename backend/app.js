const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());

/**
 * ✅ IMPORTANT FIX
 * Only parse JSON if request is NOT multipart/form-data
 * This prevents hanging requests when using multer
 */
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    return next();
  }
  express.json()(req, res, next);
});

// ✅ Serve uploaded files (THIS WAS MISSING BEFORE)
app.use('/api', require('./routes/documentRoutes'));


app.get('/', (req, res) => {
  res.send('Cash Loan Management System API is running');
});

// ROUTES
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

// ❌ MUST BE LAST
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
