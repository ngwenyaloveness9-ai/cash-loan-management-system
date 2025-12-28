const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const loanController = require('../controllers/loanController');

// ======================
// Test route
// ======================
router.get('/test', authMiddleware, (req, res) => {
  res.json({ message: 'Loan routes working' });
});

// ======================
// Borrower applies for loan
// ======================
router.post('/', authMiddleware, loanController.applyLoan);

// ======================
// Get loans
// ======================
router.get('/', authMiddleware, loanController.getLoans);

// ======================
// Admin / Officer approves loan
// ======================
router.put('/:id/approve', authMiddleware, loanController.approveLoan);

// ======================
// Admin / Officer rejects loan
// ======================
router.put('/:id/reject', authMiddleware, loanController.rejectLoan);

// ======================
// 🔥 STEP 5 — Review loan
// ======================
router.put(
  '/:loanId/review',
  authMiddleware,
  loanController.reviewLoan
);

module.exports = router;
