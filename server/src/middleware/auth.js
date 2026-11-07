const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      });
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or has been deactivated.',
      });
    }

    req.user = user;
    req.organizationId = user.organizationId;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Action requires role [${roles.join(' or ')}]. Your role is '${req.user.role}'.`,
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
