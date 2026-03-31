const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());

// Handle JSON (but allow multer multipart)
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) return next();
  express.json()(req, res, next);
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// ================= API ROUTES =================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api', require('./routes/documentRoutes'));

// ================= FRONTEND ROUTES =================

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Explicit routes for each page (NO conflicts)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'register.html'));
});

app.get('/branches', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'branches.html'));
});

app.get('/payments', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'payments.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'profile.html'));
});

app.get('/borrower-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'borrower-dashboard.html'));
});

app.get('/officer-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'officer-dashboard.html'));
});

app.get('/loan-documents', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'loan-documents.html'));
});

app.get('/apply-loan', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'apply-loan.html'));
});

app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'reports.html'));
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).send("Page not found");
});

module.exports = app;