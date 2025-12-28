const db = require('../config/db');

const Payment = {
  create: async ({ loan_id, user_id, branch_id, amount_paid, payment_method, reference_number }) => {
    const sql = `
      INSERT INTO payments
      (loan_id, user_id, branch_id, amount_paid, payment_method, reference_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().query(sql, [
      loan_id,
      user_id,
      branch_id,
      amount_paid,
      payment_method,
      reference_number
    ]);

    return result.insertId;
  },

  getByLoanId: async (loan_id) => {
    const [rows] = await db.promise().query(
      'SELECT * FROM payments WHERE loan_id = ?',
      [loan_id]
    );
    return rows;
  }
};

module.exports = Payment;
