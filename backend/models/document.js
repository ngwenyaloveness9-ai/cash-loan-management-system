const db = require('../config/db');

const Document = {
  create: async ({ loan_id, document_type, file_path }) => {
    const sql = `
      INSERT INTO loan_documents (loan_id, document_type, file_path)
      VALUES (?, ?, ?)
    `;

    const [result] = await db.promise().query(sql, [
      loan_id,
      document_type,
      file_path
    ]);

    return result.insertId;
  },

  getByLoanId: async (loan_id) => {
    const [rows] = await db.promise().query(
      'SELECT * FROM loan_documents WHERE loan_id = ?',
      [loan_id]
    );
    return rows;
  }
};

module.exports = Document;
