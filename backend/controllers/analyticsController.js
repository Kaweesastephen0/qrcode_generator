import ScanLog from '../models/ScanLog.js';
import QRCode from '../models/QRCode.js';
import BusinessProfile from '../models/BusinessProfile.js';
import User from '../models/User.js';
import ScanTracker from '../utils/scanTracker.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get comprehensive QR code analytics
export const getQRAnalytics = asyncHandler(async (req, res) => {
  const { qrCodeId } = req.params;
  const { days = 30 } = req.query;

  // Validate QR code ownership
  const qrCode = await QRCode.findById(qrCodeId).populate('profileId');
  
  if (!qrCode) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'QR code not found',
    });
  }

  // Check ownership (unless admin)
  if (req.user.role !== 'admin' && qrCode.userId.toString() !== req.user.userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN,
    });
  }

  try {
    const analytics = await ScanTracker.getQRAnalytics(qrCodeId, parseInt(days));
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get analytics',
    });
  }
});

// Get profile analytics with comprehensive data
export const getProfileAnalytics = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const { days = 30 } = req.query;

  // Validate profile and ownership
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

  // Get QR code for this profile
  const qrCode = await QRCode.findOne({ profileId });
  
  if (!qrCode) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalScans: 0,
        uniqueVisitors: 0,
        returningVisitors: 0,
        deviceBreakdown: {},
        browserBreakdown: {},
        topCountries: [],
        topCities: [],
        hourlyDistribution: {},
        dailyDistribution: [],
        recentScans: [],
      },
    });
  }

  try {
    const analytics = await ScanTracker.getQRAnalytics(qrCode._id, parseInt(days));
    
    // Get recent scan logs
    const recentScans = await ScanLog.find({ qrCodeId: qrCode._id })
      .sort({ scannedAt: -1 })
      .limit(20)
      .select('country city deviceType browser scannedAt visitorStatus');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        ...analytics,
        recentScans,
        profileInfo: {
          fullName: profile.fullName,
          companyName: profile.companyName,
          createdAt: profile.createdAt,
        },
        qrCodeInfo: {
          id: qrCode._id,
          totalScans: qrCode.totalScans,
          lastScannedAt: qrCode.lastScannedAt,
          createdAt: qrCode.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Error getting profile analytics:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get analytics',
    });
  }
});

// Get detailed scan logs with pagination
export const getScanLogs = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const { page = 1, limit = 20, startDate, endDate } = req.query;

  // Validate profile and ownership
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

  // Get QR code for this profile
  const qrCode = await QRCode.findOne({ profileId });
  
  if (!qrCode) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        scans: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      },
    });
  }

  // Build query
  const query = { qrCodeId: qrCode._id };
  
  if (startDate || endDate) {
    query.scannedAt = {};
    if (startDate) query.scannedAt.$gte = new Date(startDate);
    if (endDate) query.scannedAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  try {
    const scans = await ScanLog.find(query)
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('country city deviceType browser operatingSystem scannedAt visitorStatus visitorFingerprint');

    const total = await ScanLog.countDocuments(query);

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
  } catch (error) {
    console.error('Error getting scan logs:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get scan logs',
    });
  }
});

// Get user's comprehensive analytics dashboard
export const getUserAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  // Get all profiles for user
  const profiles = await BusinessProfile.find({ userId: req.user.userId });
  const profileIds = profiles.map((p) => p._id);

  // Get all QR codes for user
  const qrCodes = await QRCode.find({ userId: req.user.userId });
  const qrCodeIds = qrCodes.map((q) => q._id);

  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  try {
    // Get total scans in date range
    const totalScans = await ScanLog.countDocuments({
      qrCodeId: { $in: qrCodeIds },
      scannedAt: { $gte: startDate }
    });

    // Get today's scans
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayScans = await ScanLog.countDocuments({
      qrCodeId: { $in: qrCodeIds },
      scannedAt: { $gte: today }
    });

    // Get unique visitors
    const uniqueVisitors = await ScanLog.distinct('visitorFingerprint', {
      qrCodeId: { $in: qrCodeIds },
      scannedAt: { $gte: startDate }
    });

    // Get returning visitors
    const returningVisitors = await ScanLog.countDocuments({
      qrCodeId: { $in: qrCodeIds },
      visitorStatus: 'returning',
      scannedAt: { $gte: startDate }
    });

    // Get device distribution
    const deviceStats = await ScanLog.aggregate([
      { $match: { qrCodeId: { $in: qrCodeIds }, scannedAt: { $gte: startDate } } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get browser distribution
    const browserStats = await ScanLog.aggregate([
      { $match: { qrCodeId: { $in: qrCodeIds }, scannedAt: { $gte: startDate } } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top countries
    const countryStats = await ScanLog.aggregate([
      { $match: { qrCodeId: { $in: qrCodeIds }, scannedAt: { $gte: startDate } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get daily scan trends
    const dailyTrends = await ScanLog.aggregate([
      { $match: { qrCodeId: { $in: qrCodeIds }, scannedAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$scannedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get hourly distribution
    const hourlyStats = await ScanLog.aggregate([
      { $match: { qrCodeId: { $in: qrCodeIds }, scannedAt: { $gte: startDate } } },
      { $group: { _id: '$scanHour', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        summary: {
          totalProfiles: profiles.length,
          totalQRCodes: qrCodes.length,
          totalScans,
          todayScans,
          uniqueVisitors: uniqueVisitors.length,
          returningVisitors,
          newVisitors: uniqueVisitors.length - returningVisitors,
        },
        deviceBreakdown: deviceStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        browserBreakdown: browserStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topCountries: countryStats.map(item => ({
          country: item._id,
          count: item.count
        })),
        dailyTrends: dailyTrends.map(item => ({
          date: item._id,
          count: item.count
        })),
        hourlyDistribution: hourlyStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get user analytics',
    });
  }
});

// Export all analytics functions
export default {
  getQRAnalytics,
  getProfileAnalytics,
  getScanLogs,
  getUserAnalytics,
};
