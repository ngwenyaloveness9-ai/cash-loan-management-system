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

// Serve uploaded files publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// ================= FRONTEND ROUTES =================

// Serve homepage (index.html in backend/pages)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Serve other HTML pages dynamically
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, 'pages', `${page}.html`), (err) => {
    if (err) next(); // pass to API 404 handler if file doesn't exist
  });
});

// ================= API ROUTES =================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Mount document routes only once
app.use('/api', require('./routes/documentRoutes'));

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;