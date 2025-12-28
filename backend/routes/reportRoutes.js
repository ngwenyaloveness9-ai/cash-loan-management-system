const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/loans', reportController.getLoansReport);
router.get('/payments', reportController.getPaymentsReport);
router.get('/summary', reportController.getSummaryReport);
router.get('/branch-revenue', reportController.getBranchRevenueReport);
router.get('/closed-loans', reportController.getClosedLoansReport);

module.exports = router;
