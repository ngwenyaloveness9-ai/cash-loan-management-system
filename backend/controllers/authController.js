const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ⚠️ keep filename lowercase to avoid casing errors

exports.login = async (req, res) => {
  try {
    // 🔍 DEBUG: log request body
    console.log('REQ BODY:', req.body);

    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // 2️⃣ Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // 3️⃣ Check if account is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        error: 'Account is blocked'
      });
    }

    // 4️⃣ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // 5️⃣ Generate JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in .env');
      return res.status(500).json({
        error: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        branch_id: user.branch_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 6️⃣ Success response
    return res.status(200).json({
      message: 'Login successful',
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
    // 🚨 FULL ERROR LOGGING
    console.error('LOGIN ERROR MESSAGE:', error.message);
    console.error('LOGIN ERROR STACK:', error.stack);

    return res.status(500).json({
      error: 'Server error'
    });
  }
};
