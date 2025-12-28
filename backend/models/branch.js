const db = require('../config/db');

const Branch = {
  getAll: (callback) => {
    const sql = 'SELECT * FROM branches';
    db.query(sql, callback);
  },

  getById: (branch_id, callback) => {
    const sql = 'SELECT * FROM branches WHERE branch_id = ?';
    db.query(sql, [branch_id], callback);
  },

  create: (data, callback) => {
    const sql = `
      INSERT INTO branches (branch_name, location)
      VALUES (?, ?)
    `;
    db.query(sql, [data.branch_name, data.location], callback);
  }
};

module.exports = Branch;
