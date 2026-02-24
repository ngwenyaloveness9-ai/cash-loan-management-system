const db = require('../config/db');

const Report = {

  // ======================
  // Loans Issued (APPROVED ONLY)
  // ======================
  getLoans: async (period, fromDate, toDate) => {
    let sql = `SELECT l.loan_id, u.full_name, b.branch_name,
                      l.loan_amount, l.loan_status, l.created_at
               FROM loans l
               JOIN users u ON l.user_id = u.user_id
               JOIN branches b ON l.branch_id = b.branch_id
               WHERE l.loan_status = 'approved'`;

    const params = [];

    if (period === 'custom') {
      sql += ` AND l.created_at BETWEEN ? AND ?`;
      params.push(fromDate, toDate);
    }

    return (await db.query(sql, params))[0];
  },

  // ======================
  // Payments Collected
  // ======================
  getPayments: async (period, fromDate, toDate) => {
    let sql = `SELECT p.payment_id, u.full_name, b.branch_name,
                      p.amount_paid, p.payment_date
               FROM payments p
               JOIN users u ON p.user_id = u.user_id
               JOIN branches b ON p.branch_id = b.branch_id`;

    const params = [];

    if (period === 'custom') {
      sql += ` WHERE p.payment_date BETWEEN ? AND ?`;
      params.push(fromDate, toDate);
    }

    return (await db.query(sql, params))[0];
  },

  // ======================
  // Branch Revenue (Payments Per Branch)
  // ======================
  getBranchRevenue: async (period, fromDate, toDate) => {
    let sql = `SELECT b.branch_name,
                      IFNULL(SUM(p.amount_paid),0) AS revenue
               FROM branches b
               LEFT JOIN payments p ON b.branch_id = p.branch_id`;

    const params = [];

    if (period === 'custom') {
      sql += ` WHERE p.payment_date BETWEEN ? AND ?`;
      params.push(fromDate, toDate);
    }

    sql += ` GROUP BY b.branch_id`;

    return (await db.query(sql, params))[0];
  },

  // ======================
  // Closed Loans
  // ======================
  getClosedLoans: async () => {
    const sql = `SELECT l.loan_id, u.full_name, b.branch_name,
                        l.loan_amount
                 FROM loans l
                 JOIN users u ON l.user_id = u.user_id
                 JOIN branches b ON l.branch_id = b.branch_id
                 WHERE l.loan_status = 'closed'`;

    return (await db.query(sql))[0];
  },

  // ======================
  // Pending Loans
  // ======================
  getPendingLoans: async (period, fromDate, toDate) => {
    let sql = `SELECT l.loan_id, u.full_name, b.branch_name,
                      l.loan_amount, l.created_at
               FROM loans l
               JOIN users u ON l.user_id = u.user_id
               JOIN branches b ON l.branch_id = b.branch_id
               WHERE l.loan_status = 'pending'`;

    const params = [];
    if (period === 'custom') {
      sql += ` AND l.created_at BETWEEN ? AND ?`;
      params.push(fromDate, toDate);
    }

    return (await db.query(sql, params))[0];
  },

  // ======================
  // Overdue Loans (No payment in selected period)
  // ======================
  getOverdueLoans: async (period, fromDate, toDate) => {
    let sql = `
      SELECT l.loan_id, u.full_name, b.branch_name, l.loan_amount
      FROM loans l
      JOIN users u ON l.user_id = u.user_id
      JOIN branches b ON l.branch_id = b.branch_id
      LEFT JOIN payments p
        ON l.loan_id = p.loan_id
        AND p.payment_date BETWEEN ? AND ?
      WHERE l.loan_status = 'approved'
      AND p.payment_id IS NULL
    `;

    const params = [fromDate, toDate];

    return (await db.query(sql, params))[0];
  }

};

module.exports = Report;