const db = require('../config/db');

// ======================
// MAKE PAYMENT
// ======================
exports.makePayment = async (req, res) => {
  try {
    console.log('💰 PAYMENT BODY:', req.body);

    const {
      loan_id,
      amount_paid,
      payment_method,
      reference_number
    } = req.body;

    if (!loan_id || !amount_paid) {
      return res.status(400).json({
        error: 'Loan ID and amount are required'
      });
    }

    // Get user info from auth middleware
    const user_id = req.user.user_id;
    const branch_id = req.user.branch_id;

    // 1️⃣ Insert payment into DB
    const [result] = await db.query(
      `INSERT INTO payments 
       (loan_id, user_id, branch_id, amount_paid, payment_method, reference_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        loan_id,
        user_id,
        branch_id,
        amount_paid,
        payment_method || null,
        reference_number || null
      ]
    );

    const paymentId = result.insertId;

    // 2️⃣ Update loan balance
    await db.query(
      `UPDATE loans 
       SET balance = balance - ?
       WHERE loan_id = ?`,
      [Number(amount_paid), loan_id]
    );

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment_id: paymentId
    });

  } catch (error) {
    console.error('PAYMENT ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ======================
// GET PAYMENTS
// ======================
exports.getPayments = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [payments] = await db.query(
      `SELECT * FROM payments 
       WHERE user_id = ? 
       ORDER BY payment_date DESC`,
      [user_id]
    );

    res.json(payments);

  } catch (err) {
    console.error('LOAD PAYMENTS ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
};