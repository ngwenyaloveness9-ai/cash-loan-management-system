const Payment = require('../models/payment');

exports.makePayment = async (req, res) => {
  try {
    console.log('💰 PAYMENT BODY:', req.body);

    const { loan_id, amount_paid, payment_method, reference_number } = req.body;

    if (!loan_id || !amount_paid) {
      return res.status(400).json({ error: 'Loan ID and amount are required' });
    }

    const paymentId = await Payment.create({
      loan_id,
      user_id: req.user.user_id,
      branch_id: req.user.branch_id,
      amount_paid,
      payment_method,
      reference_number
    });

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment_id: paymentId
    });

  } catch (error) {
    console.error('PAYMENT ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
