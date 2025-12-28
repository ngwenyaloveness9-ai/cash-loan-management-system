const db = require('../config/db');

const User = {
  // ===============================
  // Find user by email (for login)
  // ===============================
  findByEmail: async (email) => {
    const [rows] = await db
      .promise()
      .query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  // ===============================
  // Create new user (register)
  // ===============================
  create: async (userData) => {
    const {
      branch_id,
      full_name,
      email,
      password,
      phone,
      address,
      role
    } = userData;

    const [result] = await db
      .promise()
      .query(
        `INSERT INTO users 
        (branch_id, full_name, email, password, phone, address, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [branch_id, full_name, email, password, phone, address, role]
      );

    return result.insertId;
  },

  // ===============================
  // Get all users (admin only)
  // ===============================
  getAll: async () => {
    const [rows] = await db
      .promise()
      .query(
        `SELECT user_id, full_name, email, phone, role, status, branch_id, created_at 
         FROM users`
      );
    return rows;
  },

  // ===============================
  // Get user by ID
  // ===============================
  getById: async (user_id) => {
    const [rows] = await db
      .promise()
      .query(
        `SELECT user_id, full_name, email, phone, role, status, branch_id 
         FROM users WHERE user_id = ?`,
        [user_id]
      );
    return rows[0];
  },

  // ===============================
  // Update user status (block / activate)
  // ===============================
  updateStatus: async (user_id, status) => {
    const [result] = await db
      .promise()
      .query(
        'UPDATE users SET status = ? WHERE user_id = ?',
        [status, user_id]
      );
    return result.affectedRows;
  }
};

module.exports = User;
