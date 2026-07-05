const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Verifies the JWT from the Authorization header.
 * Attaches the decoded user object to req.user on success.
 * Returns 401 for missing/invalid/expired tokens.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Accept token from Authorization header: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (excludes password by default via `select: false`)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

module.exports = { protect };
