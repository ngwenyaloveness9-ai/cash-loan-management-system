const db = require('../config/db');

const Document = {
  create: async ({ loan_id, document_type, file_path }) => {
    const sql = `
      INSERT INTO loan_documents (loan_id, document_type, file_path)
      VALUES (?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      Number(loan_id),
      document_type,
      file_path
    ]);

    return result.insertId;
  },

  getByLoanId: async (loan_id) => {
    const [rows] = await db.query(
      'SELECT * FROM loan_documents WHERE loan_id = ?',
      [Number(loan_id)]
    );

    return rows;
  }
};

module.exports = Document;
