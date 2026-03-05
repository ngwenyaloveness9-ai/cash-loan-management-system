const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());

// ✅ Handle JSON (but allow multer multipart)
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    return next();
  }
  express.json()(req, res, next);
});

// ✅ 🔥 THIS IS THE IMPORTANT FIX
// Serve uploaded files publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ROOT TEST
app.get('/', (req, res) => {
  res.send('Cash Loan Management System API is running');
});

// ================= ROUTES =================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 🔥 Mount document routes ONLY ONCE
app.use('/api', require('./routes/documentRoutes'));

// ❌ MUST BE LAST
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;