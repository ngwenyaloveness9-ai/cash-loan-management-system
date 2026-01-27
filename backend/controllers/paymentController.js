const Payment = require('../models/Payment');
const Loan = require('../models/loan'); // 👈 ADD THIS

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

    // 1️⃣ Save payment
    const paymentId = await Payment.create({
      loan_id,
      user_id: req.user.user_id,
      branch_id: req.user.branch_id,
      amount_paid,
      payment_method,
      reference_number
    });

    // 2️⃣ Deduct payment from loan balance
    await Loan.applyPayment(
      loan_id,
      Number(amount_paid)
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
// GET PAYMENTS (unchanged)
// ======================
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.getByUser(req.user.user_id);
    res.json(payments);
  } catch (err) {
    console.error('LOAD PAYMENTS ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
