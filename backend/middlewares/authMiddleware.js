const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Invalid token format.' });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user to request
    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
      branch_id: decoded.branch_id
    };

    console.log('✅ AUTH USER ATTACHED:', req.user);

    next();
  } catch (error) {
    console.error('❌ AUTH ERROR:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
