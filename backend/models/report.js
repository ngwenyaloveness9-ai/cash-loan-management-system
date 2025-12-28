const db = require('../config/db');

const Report = {

  // ======================
  // All loans report
  // ======================
  getAllLoans: async () => {
    const [rows] = await db.promise().query(`
      SELECT 
        l.loan_id,
        u.full_name,
        b.branch_name,
        l.loan_amount,
        l.interest_rate,
        l.repayment_period,
        l.loan_status,
        l.created_at
      FROM loans l
      JOIN users u ON l.user_id = u.user_id
      JOIN branches b ON l.branch_id = b.branch_id
    `);
    return rows;
  },

  // ======================
  // All payments report
  // ======================
  getAllPayments: async () => {
    const [rows] = await db.promise().query(`
      SELECT
        p.payment_id,
        u.full_name,
        b.branch_name,
        p.amount_paid,
        p.payment_method,
        p.reference_number,
        p.payment_date
      FROM payments p
      JOIN users u ON p.user_id = u.user_id
      JOIN branches b ON p.branch_id = b.branch_id
    `);
    return rows;
  },

  // ======================
  // Summary report
  // ======================
  getSummary: async () => {
    const [[summary]] = await db.promise().query(`
      SELECT
        (SELECT COUNT(*) FROM loans) AS total_loans,
        (SELECT COUNT(*) FROM loans WHERE loan_status = 'approved') AS approved_loans,
        (SELECT COUNT(*) FROM loans WHERE loan_status = 'pending') AS pending_loans,
        (SELECT IFNULL(SUM(loan_amount),0) FROM loans) AS total_amount_loaned,
        (SELECT IFNULL(SUM(amount_paid),0) FROM payments) AS total_payments
    `);

    summary.outstanding_balance =
      summary.total_amount_loaned - summary.total_payments;

    return summary;
  },

  // ======================
  // 🔥 Branch revenue report
  // ======================
  getBranchRevenue: async () => {
    const [rows] = await db.promise().query(`
      SELECT 
        b.branch_name,
        COUNT(DISTINCT l.loan_id) AS total_loans,
        IFNULL(SUM(p.amount_paid), 0) AS revenue
      FROM branches b
      LEFT JOIN loans l ON b.branch_id = l.branch_id
      LEFT JOIN payments p ON l.loan_id = p.loan_id
      GROUP BY b.branch_id
    `);
    return rows;
  },

  // ======================
  // 🔥 Closed loans report
  // ======================
  getClosedLoans: async () => {
    const [rows] = await db.promise().query(`
      SELECT 
        l.loan_id,
        u.full_name,
        b.branch_name,
        l.loan_amount,
        l.interest_rate,
        l.repayment_period,
        l.created_at
      FROM loans l
      JOIN users u ON l.user_id = u.user_id
      JOIN branches b ON l.branch_id = b.branch_id
      WHERE l.loan_status = 'closed'
    `);
    return rows;
  }
};

module.exports = Report;
