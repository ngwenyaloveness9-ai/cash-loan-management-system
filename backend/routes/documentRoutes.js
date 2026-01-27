const express = require('express');
const router = express.Router();

const documentController = require('../controllers/documentController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadDocuments = require('../middlewares/uploadMiddleware');

// ================= UPLOAD DOCUMENTS =================
// POST /api/loans/:loanId/documents
router.post(
  '/loans/:loanId/documents',
  authMiddleware,
  uploadDocuments,
  documentController.uploadDocuments
);

// ================= GET DOCUMENTS =================
// GET /api/loans/:loanId/documents
router.get(
  '/loans/:loanId/documents',
  authMiddleware,
  documentController.getDocumentsByLoan
);

module.exports = router;
