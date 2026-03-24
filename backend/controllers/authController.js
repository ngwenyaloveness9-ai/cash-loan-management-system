const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role, branch_id } = req.body;

    // Validate input
    if (!full_name || !email || !password || !role || !branch_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.query(
      `INSERT INTO users (full_name, email, password, role, branch_id)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, hashedPassword, role, branch_id]
    );

    return res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Ensure JWT secret exists
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Create token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        branch_id: user.branch_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id
      }
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};