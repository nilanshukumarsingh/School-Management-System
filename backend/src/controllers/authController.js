const jwt = require('jsonwebtoken');
const { User, Teacher, Guardian, Student } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { recordAuditLog } = require('../middleware/auditLogger');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'super_secret_jwt_key_scholaverse_production_grade_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Log in with email and password
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Invalid credentials. User with this email does not exist.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Invalid credentials. Password is incorrect.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Your account is deactivated. Please contact the administrator.',
      });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = signToken(user);

    // Fetch role profile
    let roleProfile = null;
    if (user.role === 'TEACHER') {
      roleProfile = await Teacher.findOne({ userId: user._id });
    } else if (user.role === 'GUARDIAN') {
      roleProfile = await Guardian.findOne({ userId: user._id }).populate({
        path: 'linkedStudentIds',
        populate: [
          { path: 'classId', select: 'name gradeLevel academicYear' },
          { path: 'sectionId', select: 'name roomNumber' },
        ],
      });
    }

    // Sanitize user object
    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    // Log audit
    await recordAuditLog({
      req: { ...req, user },
      action: 'USER_LOGIN',
      module: 'AUTH',
      affectedRecordId: user._id,
      affectedModel: 'User',
      details: { email: user.email, role: user.role },
    });

    return successResponse(res, {
      message: 'Login successful',
      data: {
        token,
        user: userSafe,
        roleProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let roleProfile = null;

    if (user.role === 'TEACHER') {
      roleProfile = req.teacherProfile || (await Teacher.findOne({ userId: user._id }));
    } else if (user.role === 'GUARDIAN') {
      roleProfile = await Guardian.findOne({ userId: user._id }).populate({
        path: 'linkedStudentIds',
        populate: [
          { path: 'classId', select: 'name gradeLevel academicYear' },
          { path: 'sectionId', select: 'name roomNumber' },
        ],
      });
    }

    return successResponse(res, {
      message: 'User profile fetched successfully',
      data: {
        user,
        roleProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new user (Admin-restricted or onboarding)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, {
        statusCode: 409,
        message: 'A user with this email address already exists.',
      });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      phone,
    });

    await recordAuditLog({
      req,
      action: 'USER_REGISTERED',
      module: 'AUTH',
      affectedRecordId: user._id,
      affectedModel: 'User',
      details: { email, role, name },
    });

    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    return successResponse(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: { user: userSafe },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await recordAuditLog({
        req,
        action: 'USER_LOGOUT',
        module: 'AUTH',
        affectedRecordId: req.user._id,
        affectedModel: 'User',
      });
    }
    return successResponse(res, {
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  register,
  logout,
};
