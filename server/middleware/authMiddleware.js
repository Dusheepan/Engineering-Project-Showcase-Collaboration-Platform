const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header and attaches the user to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Authorization header starting with "Bearer "
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Return 401 if no token provided
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided. Access denied.',
        errors: [{ message: 'No authorization token provided. Access denied.' }],
      });
    }

    try {
      // Verify token with secret key
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_engineering_showcase_2026'
      );

      // Find user by ID extracted from payload (exclude hashed password)
      const user = await User.findById(decoded.id).select('-password');

      // Return 401 if user no longer exists in database
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
          errors: [
            { message: 'The user belonging to this token no longer exists.' },
          ],
        });
      }

      // Attach user document to request object
      req.user = user;
      next();
    } catch (err) {
      // Token expired, signature mismatch, or malformed
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or has expired.',
        errors: [{ message: 'Token is invalid or has expired.' }],
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
