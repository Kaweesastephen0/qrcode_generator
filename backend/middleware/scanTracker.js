import ScanTracker from '../utils/scanTracker.js';
import BusinessProfile from '../models/BusinessProfile.js';
import QRCode from '../models/QRCode.js';

/**
 * Scan Tracking Middleware
 * Automatically captures comprehensive analytics for every QR code scan
 * This middleware should be applied to the public card route
 */
const scanTrackerMiddleware = async (req, res, next) => {
  try {
    const profileId = req.params.profileId;
    
    // Validate profile ID
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    // Find the business profile
    const profile = await BusinessProfile.findById(profileId)
      .populate('userId', 'fullName email status')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    // Check if user is active
    if (profile.userId.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Profile is temporarily unavailable'
      });
    }

    // Find the associated QR code
    const qrCode = await QRCode.findOne({ profileId })
      .lean();

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found for this profile'
      });
    }

    // Track the scan asynchronously to avoid blocking the response
    // This ensures the public card loads quickly while analytics are captured
    setImmediate(async () => {
      try {
        await ScanTracker.trackScan(req, profileId, qrCode._id, profile.userId._id);
        
        // Update QR code scan count and last scanned timestamp
        await QRCode.findByIdAndUpdate(qrCode._id, {
          $inc: { totalScans: 1 },
          lastScannedAt: new Date()
        });
      } catch (error) {
        console.error('Error tracking scan:', error);
        // Don't fail the request if analytics tracking fails
      }
    });

    // Attach profile data to request for use in the route handler
    req.profileData = profile;
    req.qrCodeData = qrCode;
    
    next();
  } catch (error) {
    console.error('Scan tracking middleware error:', error);
    
    // If middleware fails, still try to serve the profile
    // but log the error for debugging
    try {
      const profile = await BusinessProfile.findById(req.params.profileId)
        .populate('userId', 'fullName email status')
        .lean();
      
      if (profile) {
        req.profileData = profile;
        next();
      } else {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

/**
 * Enhanced scan tracking middleware with rate limiting
 * Prevents spam while still capturing legitimate scans
 */
const enhancedScanTracker = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute window
    maxScans = 10, // max 10 scans per minute per IP
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  const scanCounts = new Map();

  return async (req, res, next) => {
    try {
      const profileId = req.params.profileId;
      const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const key = `${clientIp}:${profileId}`;
      const now = Date.now();
      
      // Get current scan count for this IP-profile combination
      const currentCount = scanCounts.get(key) || { count: 0, resetTime: now + windowMs };
      
      // Reset if window has expired
      if (now > currentCount.resetTime) {
        currentCount.count = 0;
        currentCount.resetTime = now + windowMs;
      }
      
      // Check if rate limit exceeded
      if (currentCount.count >= maxScans) {
        return res.status(429).json({
          success: false,
          message: 'Too many scan requests. Please try again later.',
          retryAfter: Math.ceil((currentCount.resetTime - now) / 1000)
        });
      }
      
      // Increment count
      currentCount.count++;
      scanCounts.set(key, currentCount);
      
      // Clean up expired entries periodically
      if (Math.random() < 0.01) { // 1% chance to clean up
        for (const [k, v] of scanCounts.entries()) {
          if (now > v.resetTime) {
            scanCounts.delete(k);
          }
        }
      }
      
      // Apply the original scan tracker middleware
      return scanTrackerMiddleware(req, res, next);
      
    } catch (error) {
      console.error('Enhanced scan tracker error:', error);
      next();
    }
  };
};

/**
 * Analytics data enrichment middleware
 * Adds additional context to the request for analytics purposes
 */
const analyticsEnrichment = (req, res, next) => {
  try {
    // Add timestamp for precise analytics
    req.analyticsTimestamp = new Date();
    
    // Add request metadata
    req.analyticsMetadata = {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      protocol: req.protocol,
      httpVersion: req.httpVersion,
      hostname: req.hostname,
      port: req.port,
      secure: req.secure,
      xhr: req.xhr
    };
    
    next();
  } catch (error) {
    console.error('Analytics enrichment error:', error);
    next();
  }
};

/**
 * Scan validation middleware
 * Validates that the profile exists and is accessible before tracking
 */
const validateScanTarget = async (req, res, next) => {
  try {
    const profileId = req.params.profileId;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    // Check if profile exists and is accessible
    const profile = await BusinessProfile.findOne({
      _id: profileId,
      'userId.status': 'active' // Only active users
    })
    .populate('userId', 'fullName email status')
    .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or unavailable'
      });
    }

    // Check if QR code exists
    const qrCode = await QRCode.findOne({ profileId }).lean();
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found for this profile'
      });
    }

    req.validatedProfile = profile;
    req.validatedQRCode = qrCode;
    
    next();
  } catch (error) {
    console.error('Scan validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * CORS middleware for public card access
 * Ensures the public card can be accessed from anywhere
 */
const publicCardCors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, User-Agent, Referer');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

/**
 * Cache control middleware for public cards
 * Improves performance while ensuring analytics are still captured
 */
const publicCardCache = (req, res, next) => {
  // Set cache control headers
  res.header('Cache-Control', 'public, max-age=300'); // 5 minutes
  res.header('ETag', `"${req.params.profileId}-${Date.now()}"`);
  
  next();
};

export {
  scanTrackerMiddleware,
  enhancedScanTracker,
  analyticsEnrichment,
  validateScanTarget,
  publicCardCors,
  publicCardCache
};

export default scanTrackerMiddleware;
