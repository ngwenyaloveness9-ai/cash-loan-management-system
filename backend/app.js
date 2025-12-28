const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// =================== MIDDLEWARE ===================
app.use(cors());
app.use(express.json());

// =================== HOME ROUTE ===================
app.get('/', (req, res) => {
  res.send('Cash Loan Management System API is running');
});

// =================== ROUTES ===================

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// User routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Branch routes
const branchRoutes = require('./routes/branchRoutes');
app.use('/api/branches', branchRoutes);

// Loan routes
const loanRoutes = require('./routes/loanRoutes');
app.use('/api/loans', loanRoutes);

// Payment routes
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

// Report routes
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// 🔥 DOCUMENT UPLOAD / REGISTER ROUTES
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/documents', documentRoutes);

// =================== 404 HANDLER ===================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
