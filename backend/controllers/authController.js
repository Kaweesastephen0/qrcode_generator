const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey';
const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn: jwtExpiry }
  );
}

function validateRegistration(data) {
  const errors = [];

  if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  if (!data.username || typeof data.username !== 'string' || data.username.trim().length < 3) {
    errors.push('Username must be at least 3 characters.');
  } else {
    const username = data.username.trim();
    const hasNumber = /\d/.test(username);
    const hasSymbol = /[^A-Za-z0-9]/.test(username);
    const hasSpace = /\s/.test(username);

    if (hasSpace) {
      errors.push('Username cannot contain spaces.');
    }
    if (!hasNumber || !hasSymbol) {
      errors.push('Username must include at least one number and one symbol.');
    }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailPattern.test(data.email)) {
    errors.push('A valid email is required.');
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  return errors;
}

exports.register = async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;
    const validationErrors = validateRegistration({ fullName, username, email, password });

    if (validationErrors.length) {
      return res.status(400).json({ errors: validationErrors });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ message: 'Email is already in use.' });
      }
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      fullName: fullName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Registration successful. Please login to continue.'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required.' });
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact support.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      token
    });
  } catch (error) {
    next(error);
  }
};
