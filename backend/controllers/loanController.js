const Loan = require('../models/loan');

// ======================
// Borrower applies for loan
// ======================
exports.applyLoan = async (req, res) => {
  try {
    const { loan_amount } = req.body;

    if (!loan_amount) {
      return res.status(400).json({ error: 'Loan amount is required' });
    }

    const amount = Number(loan_amount);

    // 🔢 BUSINESS RULES
    const interest_rate = 30; // 30%
    const repayment_period = amount < 2000 ? 3 : 6;

    const total_payable = amount + (amount * 0.30);
    const remaining_balance = total_payable;

    const loanId = await Loan.create({
      user_id: req.user.user_id,
      branch_id: req.user.branch_id,
      loan_amount: amount,
      interest_rate,
      repayment_period,
      total_payable,
      remaining_balance
    });

    res.status(201).json({
      message: 'Loan application submitted',
      loan_id: loanId,
      total_payable,
      repayment_period
    });

  } catch (error) {
    console.error('APPLY LOAN ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ======================
// Get loans
// ======================
exports.getLoans = async (req, res) => {
  try {
    let loans;

    if (req.user.role === 'borrower') {
      loans = await Loan.getByUserId(req.user.user_id);
    } else {
      loans = await Loan.getAll();
    }

    res.json(loans);

  } catch (error) {
    console.error('GET LOANS ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ======================
// Approve loan (existing)
// ======================
exports.approveLoan = async (req, res) => {
  try {
    if (!['admin', 'officer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Loan.updateStatus(
      req.params.id,
      'approved',
      req.user.user_id
    );

    res.json({ message: 'Loan approved successfully' });

  } catch (error) {
    console.error('APPROVE LOAN ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ======================
// Reject loan (existing)
// ======================
exports.rejectLoan = async (req, res) => {
  try {
    if (!['admin', 'officer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Loan.updateStatus(
      req.params.id,
      'rejected',
      req.user.user_id
    );

    res.json({ message: 'Loan rejected successfully' });

  } catch (error) {
    console.error('REJECT LOAN ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ======================
// Review loan (unchanged)
// ======================
exports.reviewLoan = async (req, res) => {
  try {
    if (!['admin', 'officer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status } = req.body;
    const loanId = req.params.loanId;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await Loan.reviewLoan(
      loanId,
      status,
      req.user.user_id
    );

    res.json({
      message: `Loan ${status} successfully`
    });

  } catch (error) {
    console.error('REVIEW LOAN ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
