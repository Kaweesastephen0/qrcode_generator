import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { validateEmail, validatePassword, validateFullName } from '../utils/validators.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  // Validation
  if (!fullName || !validateFullName(fullName)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid full name',
    });
  }

  if (!email || !validateEmail(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid email address',
    });
  }

  if (!password || !validatePassword(password)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  if (password !== confirmPassword) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Passwords do not match',
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: ERROR_MESSAGES.USER_EXISTS,
    });
  }

  // Create new user
  const user = new User({
    fullName,
    email,
    password,
    role: 'user',
    status: 'active',
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id, user.role);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.SIGNUP_SUCCESS,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    },
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Find user and select password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  // Check user status
  if (user.status === 'suspended') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Your account has been suspended',
    });
  }

  // Compare passwords
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    },
  });
});

// Get current user profile
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePhoto: user.profilePhoto,
      },
    },
  });
});

// Logout (handled on frontend by removing token)
export const logout = asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logged out successfully',
  });
});
