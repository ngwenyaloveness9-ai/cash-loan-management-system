const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/loans', reportController.getLoansReport);
router.get('/payments', reportController.getPaymentsReport);
router.get('/branch-revenue', reportController.getBranchRevenueReport);
router.get('/closed-loans', reportController.getClosedLoansReport);
router.get('/pending-loans', reportController.getPendingLoansReport);
router.get('/overdue-loans', reportController.getOverdueLoansReport);

module.exports = router;