const express = require('express');
const router = express.Router();

const branchController = require('../controllers/branchController');

// ✅ Public: allow register page to load branches
router.get('/', branchController.getAllBranches);

module.exports = router;
