const Document = require('../models/document');

// ================= UPLOAD DOCUMENTS =================
exports.uploadDocuments = async (req, res) => {

  // 🔍 DEBUG LOGS (KEEP THESE)
  console.log('📥 DOCUMENT UPLOAD HIT');
  console.log('➡️ PARAMS:', req.params);
  console.log('➡️ FILES:', req.files);
  console.log('➡️ BODY:', req.body);

  try {
    const { loanId } = req.params;
    const files = req.files;

    if (!files || !files.id || files.id.length === 0) {
      return res.status(400).json({ error: 'ID document is required' });
    }

    if (
      (!files.payslip || files.payslip.length === 0) &&
      (!files.bank_statement || files.bank_statement.length === 0)
    ) {
      return res.status(400).json({
        error: 'Either payslip or bank statement is required'
      });
    }

    const savedDocs = [];

    // ✅ ID document
    const idDoc = files.id[0];
    await Document.create({
      loan_id: loanId,
      document_type: 'id',
      file_path: `/uploads/${idDoc.filename}`
    });
    savedDocs.push('id');

    // ✅ Payslip
    if (files.payslip && files.payslip.length > 0) {
      const payslip = files.payslip[0];
      await Document.create({
        loan_id: loanId,
        document_type: 'payslip',
        file_path: `/uploads/${payslip.filename}`
      });
      savedDocs.push('payslip');
    }

    // ✅ Bank statement
    if (files.bank_statement && files.bank_statement.length > 0) {
      const bank = files.bank_statement[0];
      await Document.create({
        loan_id: loanId,
        document_type: 'bank_statement',
        file_path: `/uploads/${bank.filename}`
      });
      savedDocs.push('bank_statement');
    }

    res.status(201).json({
      message: 'Documents uploaded successfully',
      loanId,
      documents: savedDocs
    });

  } catch (error) {
    console.error('❌ DOCUMENT UPLOAD ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ================= GET DOCUMENTS BY LOAN =================
exports.getDocumentsByLoan = async (req, res) => {
  try {
    const { loanId } = req.params;

    const documents = await Document.getByLoanId(loanId);

    const formattedDocs = documents.map(doc => ({
      document_type: doc.document_type,
      file_url: doc.file_path,
      file_name: doc.document_type.replace('_', ' ').toUpperCase()
    }));

    res.json(formattedDocs);

  } catch (error) {
    console.error('❌ GET DOCUMENTS ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
