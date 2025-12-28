const express = require('express');
const router = express.Router();

const branchController = require('../controllers/branchController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public: borrowers need to see branches
router.get('/', authMiddleware, branchController.getAllBranches);

module.exports = router;
