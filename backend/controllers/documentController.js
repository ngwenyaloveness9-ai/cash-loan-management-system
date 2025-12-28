const Document = require('../models/document');

exports.uploadDocuments = async (req, res) => {
  try {
    const { loanId } = req.params;
    const files = req.files;

    if (!files || !files.id) {
      return res.status(400).json({ error: 'ID document is required' });
    }

    if (!files.payslip && !files.bank_statement) {
      return res.status(400).json({
        error: 'Either payslip or bank statement is required'
      });
    }

    const savedDocs = [];

    // ID document (required)
    const idDoc = files.id[0];
    await Document.create({
      loan_id: loanId,
      document_type: 'id',
      file_path: idDoc.path
    });
    savedDocs.push('id');

    // Payslip (optional)
    if (files.payslip) {
      const payslip = files.payslip[0];
      await Document.create({
        loan_id: loanId,
        document_type: 'payslip',
        file_path: payslip.path
      });
      savedDocs.push('payslip');
    }

    // Bank statement (optional)
    if (files.bank_statement) {
      const bank = files.bank_statement[0];
      await Document.create({
        loan_id: loanId,
        document_type: 'bank_statement',
        file_path: bank.path
      });
      savedDocs.push('bank_statement');
    }

    res.status(201).json({
      message: 'Documents uploaded successfully',
      loanId,
      documents: savedDocs
    });

  } catch (error) {
    console.error('DOCUMENT UPLOAD ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
