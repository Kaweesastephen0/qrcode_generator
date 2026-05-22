import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('=== LOGIN DEBUG ===');
  console.log('Email:', email);
  console.log('Password received:', password ? 'Yes' : 'No');

  // Validation
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');
  console.log('User found:', user ? 'Yes' : 'No');

  if (!user) {
    console.log('User not found for email:', email);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  console.log('User details:', {
    id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    hasPassword: user.password ? 'Yes' : 'No',
  });

  // Check if user is active
  if (user.status !== 'active') {
    console.log('User is suspended');
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Your account has been suspended',
    });
  }

  // Compare passwords
  console.log('Comparing password...');
  const isPasswordMatch = await user.comparePassword(password);
  console.log('Password match result:', isPasswordMatch);

  if (!isPasswordMatch) {
    console.log('Password mismatch');
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  console.log('Login successful!');

  // Generate token
  const token = generateToken(user._id, user.role);
  console.log('Token generated:', token ? 'Yes' : 'No');

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