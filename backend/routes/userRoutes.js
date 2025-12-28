const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Admin-only test route
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  (req, res) => {
    res.json({ message: 'Users route is working' });
  }
);

module.exports = router;
