const db = require('../config/db');

class Payment {
  static async create(data) {
    const {
      loan_id,
      user_id,
      branch_id,
      amount_paid,
      payment_method,
      reference_number
    } = data;

    const [result] = await db.execute(
      `INSERT INTO payments 
       (loan_id, user_id, branch_id, amount_paid, payment_method, reference_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [loan_id, user_id, branch_id, amount_paid, payment_method, reference_number]
    );

    return result.insertId;
  }

  // ✅ REQUIRED FOR PAYMENT HISTORY
  static async getByUser(user_id) {
    const [rows] = await db.execute(
      `SELECT payment_id, loan_id, amount_paid, payment_date
       FROM payments
       WHERE user_id = ?
       ORDER BY payment_date DESC`,
      [user_id]
    );

    return rows;
  }
}

module.exports = Payment;
