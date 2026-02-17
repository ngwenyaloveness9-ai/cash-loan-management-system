const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const userController = require('../controllers/userController');

// ================= ADMIN: GET ALL USERS =================
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  userController.getAllUsers
);

// ================= GET MY PROFILE =================
router.get(
  '/me',
  authMiddleware,
  userController.getMyProfile
);

// ================= UPDATE MY PROFILE =================
router.put(
  '/me',
  authMiddleware,
  userController.updateMyProfile
);

module.exports = router;
