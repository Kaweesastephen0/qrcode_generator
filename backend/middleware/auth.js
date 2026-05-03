import { verifyToken } from '../utils/jwt.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    next();
  };
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN,
    });
  }
  next();
};

// Alias for isAdmin (for consistency)
export const requireAdmin = isAdmin;

// Check if user owns the resource
export const checkOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[paramName];

    // Admin can access any resource
    if (req.user?.role === 'admin') {
      return next();
    }

    // User can only access their own resources
    if (req.user?.userId?.toString() !== resourceUserId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    next();
  };
};
