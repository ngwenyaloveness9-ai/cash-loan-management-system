const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const controller = require('../controllers/documentController');

router.post(
  '/:loanId',
  auth,
  upload.fields([
    { name: 'id', maxCount: 1 },
    { name: 'payslip', maxCount: 1 },
    { name: 'bank_statement', maxCount: 1 }
  ]),
  controller.uploadDocuments
);

module.exports = router;
