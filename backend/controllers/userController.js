const db = require('../config/db');

// ================= GET ALL USERS (ADMIN) =================
exports.getAllUsers = (req, res) => {
  const sql = `SELECT user_id, full_name, email, role, branch_id FROM users`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ================= GET MY PROFILE =================
exports.getMyProfile = (req, res) => {
  const sql = `
    SELECT user_id, full_name, email, role, branch_id
    FROM users
    WHERE user_id = ?
  `;

  db.query(sql, [req.user.user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(results[0]);
  });
};

// ================= UPDATE MY PROFILE =================
exports.updateMyProfile = (req, res) => {
  const { full_name, email } = req.body;

  const sql = `
    UPDATE users
    SET full_name = ?, email = ?
    WHERE user_id = ?
  `;

  db.query(sql, [full_name, email, req.user.user_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Profile updated successfully' });
  });
};
