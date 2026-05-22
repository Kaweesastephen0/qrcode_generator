import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { validateEmail, validatePassword, validateFullName } from '../utils/validators.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Register a new user
 * Validates input, checks for duplicate email, creates user, returns JWT token
 */
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

  // Create new user (password hashed by User model pre-save hook)
  const user = new User({
    fullName,
    email,
    password,
    role: 'user',
    status: 'active',
  });

  await user.save();

  // Generate JWT token
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