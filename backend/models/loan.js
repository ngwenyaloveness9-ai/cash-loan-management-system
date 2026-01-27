const db = require('../config/db');

const Loan = {
  // ======================
  // Create loan (WITH CALCULATIONS)
  // ======================
  create: async (loan) => {
    const loanAmount = Number(loan.loan_amount);

    // 30% interest
    const interestRate = 30;

    // repayment period rule
    const repaymentPeriod = loanAmount < 2000 ? 3 : 6;

    // total payable = amount + 30%
    const totalPayable = loanAmount + (loanAmount * interestRate / 100);

    // initial balance = total payable
    const loanBalance = totalPayable;

    const sql = `
      INSERT INTO loans 
      (
        user_id,
        branch_id,
        loan_amount,
        interest_rate,
        repayment_period,
        total_payable,
        loan_balance
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      loan.user_id,
      loan.branch_id,
      loanAmount,
      interestRate,
      repaymentPeriod,
      totalPayable,
      loanBalance
    ]);

    return result.insertId;
  },

  // ======================
  // Get all loans
  // ======================
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        l.loan_id,
        l.loan_amount,
        l.interest_rate,
        l.repayment_period,
        l.total_payable,
        l.loan_balance,
        l.loan_status,
        l.created_at,
        u.full_name,
        u.email,
        b.branch_name
      FROM loans l
      JOIN users u ON l.user_id = u.user_id
      JOIN branches b ON l.branch_id = b.branch_id
    `);
    return rows;
  },

  // ======================
  // Get loans by user
  // ======================
  getByUserId: async (user_id) => {
    const [rows] = await db.query(
      `
      SELECT 
        loan_id,
        loan_amount,
        interest_rate,
        repayment_period,
        total_payable,
        loan_balance,
        loan_status,
        created_at
      FROM loans
      WHERE user_id = ?
      `,
      [user_id]
    );
    return rows;
  },

  // ======================
  // Update loan status
  // ======================
  updateStatus: async (loanId, status, approvedBy) => {
    await db.query(
      `
      UPDATE loans
      SET loan_status = ?, approved_by = ?
      WHERE loan_id = ?
      `,
      [status, approvedBy, loanId]
    );
  },

  // ======================
  // Review loan
  // ======================
  reviewLoan: async (loanId, status, reviewedBy) => {
    await db.query(
      `
      UPDATE loans
      SET loan_status = ?, approved_by = ?
      WHERE loan_id = ?
      `,
      [status, reviewedBy, loanId]
    );
  },

  // ======================
  // APPLY PAYMENT (SAFE VERSION)
  // ======================
  applyPayment: async (loanId, amountPaid) => {
    const [rows] = await db.query(
      `
      SELECT loan_balance, loan_status 
      FROM loans 
      WHERE loan_id = ?
      `,
      [loanId]
    );

    if (!rows.length) {
      throw new Error('Loan not found');
    }

    // ❌ Prevent payment if loan not approved
    if (rows[0].loan_status !== 'approved') {
      throw new Error('Payments are only allowed on approved loans');
    }

    // ❌ Prevent over-payment
    if (amountPaid > rows[0].loan_balance) {
      throw new Error('Payment exceeds remaining loan balance');
    }

    const newBalance = rows[0].loan_balance - amountPaid;

    await db.query(
      `
      UPDATE loans
      SET loan_balance = ?, loan_status = ?
      WHERE loan_id = ?
      `,
      [
        newBalance <= 0 ? 0 : newBalance,
        newBalance <= 0 ? 'closed' : 'approved',
        loanId
      ]
    );
  }
};

module.exports = Loan;
