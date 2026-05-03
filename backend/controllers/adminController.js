import User from '../models/User.js';
import BusinessProfile from '../models/BusinessProfile.js';
import QRCode from '../models/QRCode.js';
import ScanLog from '../models/ScanLog.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProfiles = await BusinessProfile.countDocuments();
  const totalQRCodes = await QRCode.countDocuments();
  const totalScans = await ScanLog.countDocuments();

  // Get user growth (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Get scans growth (last 30 days)
  const scansThisMonth = await ScanLog.countDocuments({
    timestamp: { $gte: thirtyDaysAgo },
  });

  // Active users (users with at least one profile)
  const activeUsers = await User.countDocuments({
    _id: { $in: await BusinessProfile.distinct('userId') },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      totalUsers,
      totalProfiles,
      totalQRCodes,
      totalScans,
      activeUsers,
      newUsersThisMonth,
      scansThisMonth,
    },
  });
});

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, role } = req.query;

  const skip = (page - 1) * limit;
  const filter = {};

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (role) {
    filter.role = role;
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  // Get user's statistics
  const profiles = await BusinessProfile.countDocuments({ userId: user._id });
  const qrCodes = await QRCode.countDocuments({ userId: user._id });
  const scans = await ScanLog.countDocuments({ userId: user._id });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      user,
      stats: {
        profiles,
        qrCodes,
        scans,
      },
    },
  });
});

// Suspend user
export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  user.status = 'suspended';
  await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.USER_SUSPENDED,
    data: { user },
  });
});

// Activate user
export const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  user.status = 'active';
  await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.USER_ACTIVATED,
    data: { user },
  });
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  // Delete all associated data
  const profiles = await BusinessProfile.find({ userId: user._id });
  const profileIds = profiles.map((p) => p._id);

  // Delete QR codes and scan logs
  await QRCode.deleteMany({ userId: user._id });
  await ScanLog.deleteMany({ profileId: { $in: profileIds } });

  // Delete profiles
  await BusinessProfile.deleteMany({ userId: user._id });

  // Delete user
  await user.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// Get all business profiles
export const getAllProfiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const skip = (page - 1) * limit;
  const filter = {};

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const profiles = await BusinessProfile.find(filter)
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await BusinessProfile.countDocuments(filter);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Delete profile (admin)
export const deleteProfileAdmin = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findById(req.params.id);

  if (!profile) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.PROFILE_NOT_FOUND,
    });
  }

  // Delete QR codes and scan logs
  await QRCode.deleteMany({ profileId: profile._id });
  await ScanLog.deleteMany({ profileId: profile._id });

  // Delete profile
  await profile.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.PROFILE_DELETED,
  });
});

// Get all QR codes
export const getAllQRCodes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * limit;

  const qrCodes = await QRCode.find()
    .populate('profileId', 'fullName companyName')
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await QRCode.countDocuments();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      qrCodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get all scan logs
export const getAllScanLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const skip = (page - 1) * limit;

  const logs = await ScanLog.find()
    .populate('userId', 'fullName email')
    .populate('qrCodeId', 'totalScans')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ScanLog.countDocuments();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get overall analytics
export const getOverallAnalytics = asyncHandler(async (req, res) => {
  // Get all scans
  const allScans = await ScanLog.find();

  // Device distribution
  const deviceDistribution = {};
  allScans.forEach((scan) => {
    const device = scan.deviceType || 'unknown';
    deviceDistribution[device] = (deviceDistribution[device] || 0) + 1;
  });

  // Country distribution
  const countryDistribution = {};
  allScans.forEach((scan) => {
    const country = scan.country || 'Unknown';
    countryDistribution[country] = (countryDistribution[country] || 0) + 1;
  });

  // Daily scans (last 30 days)
  const dailyScans = {};
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  allScans.forEach((scan) => {
    if (scan.timestamp >= thirtyDaysAgo) {
      const date = scan.timestamp.toISOString().split('T')[0];
      dailyScans[date] = (dailyScans[date] || 0) + 1;
    }
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      totalScans: allScans.length,
      deviceDistribution,
      countryDistribution,
      dailyScans: Object.entries(dailyScans)
        .sort()
        .map(([date, count]) => ({ date, count })),
    },
  });
});
