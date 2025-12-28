const db = require('../config/db');

// ================= GET ALL USERS =================
exports.getAllUsers = (req, res) => {
  const sql = `SELECT user_id, full_name, email, role, branch_id FROM users`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
