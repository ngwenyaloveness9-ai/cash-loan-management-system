const Document = require('../models/document');

// ================= UPLOAD DOCUMENTS =================
exports.uploadDocuments = async (req, res) => {
  try {
    console.log('📥 DOCUMENT UPLOAD HIT');
    console.log('➡️ PARAMS:', req.params);
    console.log('➡️ FILES:', req.files);
    console.log('➡️ BODY:', req.body);

    const { loanId } = req.params;
    const files = req.files;

    // ================= VALIDATION =================

    // ❗ Loan ID required
    if (!loanId) {
      return res.status(400).json({ error: 'Loan ID is required' });
    }

    // ❗ Files object must exist
    if (!files) {
      return res.status(400).json({ error: 'No documents uploaded' });
    }

    // ❗ ID document required
    if (!files.id || files.id.length === 0) {
      return res.status(400).json({ error: 'ID document is required' });
    }

    // ❗ Bank statement required (FINAL RULE)
    if (!files.bank_statement || files.bank_statement.length === 0) {
      return res.status(400).json({ error: 'Bank statement is required' });
    }

    const savedDocs = [];

    // ================= SAVE ID =================
    const idDoc = files.id[0];

    await Document.create({
      loan_id: loanId,
      document_type: 'id',
      file_path: `/uploads/${idDoc.filename}`
    });

    savedDocs.push('id');

    // ================= SAVE BANK STATEMENT =================
    const bank = files.bank_statement[0];

    await Document.create({
      loan_id: loanId,
      document_type: 'bank_statement',
      file_path: `/uploads/${bank.filename}`
    });

    savedDocs.push('bank_statement');

    // ================= SAVE PAYSLIP (OPTIONAL) =================
    if (files.payslip && files.payslip.length > 0) {
      const payslip = files.payslip[0];

      await Document.create({
        loan_id: loanId,
        document_type: 'payslip',
        file_path: `/uploads/${payslip.filename}`
      });

      savedDocs.push('payslip');
    }

    // ================= SUCCESS RESPONSE =================
    return res.status(201).json({
      message: 'Documents uploaded successfully',
      loanId,
      documents: savedDocs
    });

  } catch (error) {
    console.error('❌ DOCUMENT UPLOAD ERROR:', error);
    return res.status(500).json({ error: 'Server error while uploading documents' });
  }
};


// ================= GET DOCUMENTS BY LOAN =================
exports.getDocumentsByLoan = async (req, res) => {
  try {
    const { loanId } = req.params;

    // ❗ Validate loanId
    if (!loanId) {
      return res.status(400).json({ error: 'Loan ID is required' });
    }

    const documents = await Document.getByLoanId(loanId);

    // ❗ No documents found
    if (!documents || documents.length === 0) {
      return res.status(404).json({ error: 'No documents found for this loan' });
    }

    // Format response
    const formattedDocs = documents.map(doc => ({
      document_type: doc.document_type,
      file_url: doc.file_path,
      file_name: doc.document_type.replace('_', ' ').toUpperCase()
    }));

    return res.json(formattedDocs);

  } catch (error) {
    console.error('❌ GET DOCUMENTS ERROR:', error);
    return res.status(500).json({ error: 'Server error while fetching documents' });
  }
};
