const Report = require('../models/report');

// ======================
// Loans (Approved Only)
// ======================
exports.getLoansReport = async (req, res) => {
  try {
    const { period, fromDate, toDate } = req.query;
    const loans = await Report.getLoans(period, fromDate, toDate);
    res.json(loans);
  } catch (error) {
    console.error('LOANS REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// Payments
// ======================
exports.getPaymentsReport = async (req, res) => {
  try {
    const { period, fromDate, toDate } = req.query;
    const payments = await Report.getPayments(period, fromDate, toDate);
    res.json(payments);
  } catch (error) {
    console.error('PAYMENTS REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// Branch Revenue
// ======================
exports.getBranchRevenueReport = async (req, res) => {
  try {
    const { period, fromDate, toDate } = req.query;
    const revenue = await Report.getBranchRevenue(period, fromDate, toDate);
    res.json(revenue);
  } catch (error) {
    console.error('BRANCH REVENUE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// Closed Loans
// ======================
exports.getClosedLoansReport = async (req, res) => {
  try {
    const { period, fromDate, toDate } = req.query;
    const closed = await Report.getClosedLoans(period, fromDate, toDate);
    res.json(closed);
  } catch (error) {
    console.error('CLOSED LOANS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// Pending Loans
// ======================
exports.getPendingLoansReport = async (req, res) => {
  try {
    const pending = await Report.getPendingLoans();
    res.json(pending);
  } catch (error) {
    console.error('PENDING LOANS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// Overdue Loans
// ======================
exports.getOverdueLoansReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const overdue = await Report.getOverdueLoans(fromDate, toDate);
    res.json(overdue);
  } catch (error) {
    console.error('OVERDUE LOANS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};