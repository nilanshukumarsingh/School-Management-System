const jwt = require('jsonwebtoken');
const { User, Teacher, Guardian } = require('../models');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Authentication Middleware
 * Verifies the JWT Bearer token and attaches user & role profiles to req
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required. No authorization token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_scholaverse_production_grade_2026');

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Invalid session. User account no longer exists.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Account is deactivated. Please contact the administrator.',
      });
    }

    req.user = user;

    // Attach role-specific metadata for RBAC checks
    if (user.role === 'TEACHER') {
      const teacher = await Teacher.findOne({ userId: user._id });
      req.teacherProfile = teacher;
    } else if (user.role === 'GUARDIAN') {
      const guardian = await Guardian.findOne({ userId: user._id });
      req.guardianProfile = guardian;
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, { statusCode: 401, message: 'Invalid authentication token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, { statusCode: 401, message: 'Authentication token has expired. Please log in again.' });
    }
    return errorResponse(res, { statusCode: 500, message: 'Authentication error: ' + error.message });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles Allowed roles ('ADMIN', 'TEACHER', 'GUARDIAN')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required prior to authorization.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: `Forbidden: Access restricted. Role '${req.user.role}' is not authorized to perform this action.`,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
