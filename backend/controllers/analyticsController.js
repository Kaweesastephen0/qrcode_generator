import ScanLog from '../models/ScanLog.js';
import QRCode from '../models/QRCode.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { getClientIP, parseUserAgent, getLocationFromIP } from '../utils/analytics.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Log QR code scan
export const logScan = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  // Get profile
  const profile = await BusinessProfile.findById(profileId);

  if (!profile) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.PROFILE_NOT_FOUND,
    });
  }

  // Get or create QR code
  let qrCode = await QRCode.findOne({ profileId });

  if (!qrCode) {
    qrCode = new QRCode({
      profileId: profile._id,
      userId: profile.userId,
      qrCodeData: `${process.env.DOMAIN_URL}/card/${profile._id}`,
      qrCodeUrl: '',
      totalScans: 0,
    });
    await qrCode.save();
  }

  // Get client information
  const ipAddress = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';
  const { browser, operatingSystem, deviceType } = parseUserAgent(userAgent);
  const { city, country, countryCode, latitude, longitude } = getLocationFromIP(ipAddress);

  // Create scan log
  const scanLog = new ScanLog({
    qrCodeId: qrCode._id,
    profileId: profile._id,
    userId: profile.userId,
    ipAddress,
    userAgent,
    deviceType,
    browser,
    operatingSystem,
    city,
    country,
    countryCode,
    latitude,
    longitude,
    timestamp: new Date(),
  });

  await scanLog.save();

  // Update QR code scan count
  qrCode.totalScans += 1;
  qrCode.lastScannedAt = new Date();
  await qrCode.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Scan logged successfully',
  });
});

// Get analytics for a specific profile
export const getProfileAnalytics = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  const profile = await BusinessProfile.findById(profileId);

  if (!profile) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.PROFILE_NOT_FOUND,
    });
  }

  // Check ownership
  if (profile.userId.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN,
    });
  }

  const qrCode = await QRCode.findOne({ profileId });

  if (!qrCode) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalScans: 0,
        dailyScans: [],
        deviceDistribution: {},
        countriesDistribution: {},
        recentScans: [],
      },
    });
  }

  // Get all scans
  const scans = await ScanLog.find({ qrCodeId: qrCode._id }).sort({ timestamp: -1 });

  // Calculate daily scans (last 30 days)
  const dailyScans = {};
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  scans.forEach((scan) => {
    if (scan.timestamp >= thirtyDaysAgo) {
      const date = scan.timestamp.toISOString().split('T')[0];
      dailyScans[date] = (dailyScans[date] || 0) + 1;
    }
  });

  // Calculate device distribution
  const deviceDistribution = {};
  scans.forEach((scan) => {
    const device = scan.deviceType || 'unknown';
    deviceDistribution[device] = (deviceDistribution[device] || 0) + 1;
  });

  // Calculate country distribution
  const countriesDistribution = {};
  scans.forEach((scan) => {
    const country = scan.country || 'Unknown';
    countriesDistribution[country] = (countriesDistribution[country] || 0) + 1;
  });

  // Get recent scans (last 10)
  const recentScans = scans.slice(0, 10).map((scan) => ({
    id: scan._id,
    country: scan.country,
    city: scan.city,
    deviceType: scan.deviceType,
    browser: scan.browser,
    timestamp: scan.timestamp,
    ipAddress: scan.ipAddress,
  }));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      totalScans: qrCode.totalScans,
      lastScannedAt: qrCode.lastScannedAt,
      dailyScans: Object.entries(dailyScans)
        .sort()
        .map(([date, count]) => ({ date, count })),
      deviceDistribution,
      countriesDistribution,
      recentScans,
    },
  });
});

// Get scan logs for a profile
export const getScanLogs = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const profile = await BusinessProfile.findById(profileId);

  if (!profile) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.PROFILE_NOT_FOUND,
    });
  }

  // Check ownership
  if (profile.userId.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN,
    });
  }

  const skip = (page - 1) * limit;

  const scans = await ScanLog.find({ profileId })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ScanLog.countDocuments({ profileId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      scans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get user's overall analytics
export const getUserAnalytics = asyncHandler(async (req, res) => {
  // Get all profiles for user
  const profiles = await BusinessProfile.find({ userId: req.user.userId });
  const profileIds = profiles.map((p) => p._id);

  // Get all QR codes for user
  const qrCodes = await QRCode.find({ userId: req.user.userId });
  const qrCodeIds = qrCodes.map((q) => q._id);

  // Get all scans
  const totalScans = await ScanLog.countDocuments({ qrCodeId: { $in: qrCodeIds } });

  // Get device distribution across all QR codes
  const deviceDistribution = {};
  const scans = await ScanLog.find({ qrCodeId: { $in: qrCodeIds } });

  scans.forEach((scan) => {
    const device = scan.deviceType || 'unknown';
    deviceDistribution[device] = (deviceDistribution[device] || 0) + 1;
  });

  // Get top countries
  const countryDistribution = {};
  scans.forEach((scan) => {
    const country = scan.country || 'Unknown';
    countryDistribution[country] = (countryDistribution[country] || 0) + 1;
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      totalProfiles: profiles.length,
      totalQRCodes: qrCodes.length,
      totalScans,
      deviceDistribution,
      topCountries: Object.entries(countryDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, count]) => ({ country, count })),
    },
  });
});
