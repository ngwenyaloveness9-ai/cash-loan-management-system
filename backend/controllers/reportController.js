const Report = require('../models/Report');

// ======================
// Loans report
// ======================
exports.getLoansReport = async (req, res) => {
  try {
    const loans = await Report.getAllLoans();
    res.json(loans);
  } catch (error) {
    console.error('LOANS REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// Payments report
// ======================
exports.getPaymentsReport = async (req, res) => {
  try {
    const payments = await Report.getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error('PAYMENTS REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// Summary report
// ======================
exports.getSummaryReport = async (req, res) => {
  try {
    const summary = await Report.getSummary();
    res.json(summary);
  } catch (error) {
    console.error('SUMMARY REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// 🔥 Branch revenue report
// ======================
exports.getBranchRevenueReport = async (req, res) => {
  try {
    const revenue = await Report.getBranchRevenue();
    res.json(revenue);
  } catch (error) {
    console.error('BRANCH REVENUE REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// 🔥 Closed loans report
// ======================
exports.getClosedLoansReport = async (req, res) => {
  try {
    const closedLoans = await Report.getClosedLoans();
    res.json(closedLoans);
  } catch (error) {
    console.error('CLOSED LOANS REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};
