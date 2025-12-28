const db = require('../config/db');

const Loan = {
  // ======================
  // Create loan
  // ======================
  create: async (loan) => {
    const sql = `
      INSERT INTO loans 
      (user_id, branch_id, loan_amount, interest_rate, repayment_period)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().query(sql, [
      loan.user_id,
      loan.branch_id,
      loan.loan_amount,
      loan.interest_rate,
      loan.repayment_period
    ]);

    return result.insertId;
  },

  // ======================
  // Get all loans
  // ======================
  getAll: async () => {
    const [rows] = await db.promise().query(`
      SELECT 
        l.loan_id,
        l.loan_amount,
        l.interest_rate,
        l.repayment_period,
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
    const [rows] = await db.promise().query(
      `SELECT * FROM loans WHERE user_id = ?`,
      [user_id]
    );
    return rows;
  },

  // ======================
  // Update loan status (existing)
  // ======================
  updateStatus: async (loanId, status, approvedBy) => {
    await db.promise().query(
      `
      UPDATE loans
      SET loan_status = ?, approved_by = ?
      WHERE loan_id = ?
      `,
      [status, approvedBy, loanId]
    );
  },

  // ======================
  // 🔥 STEP 5 — Review loan
  // ======================
  reviewLoan: async (loanId, status, reviewedBy) => {
    await db.promise().query(
      `
      UPDATE loans
      SET loan_status = ?, approved_by = ?
      WHERE loan_id = ?
      `,
      [status, reviewedBy, loanId]
    );
  }
};

module.exports = Loan;
