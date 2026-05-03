import geoip from 'geoip-lite';
import UAParser from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import ScanLog from '../models/ScanLog.js';

/**
 * Advanced Scan Tracking Analytics Utility
 * Captures comprehensive visitor intelligence for QR code scans
 */
class ScanTracker {
  /**
   * Generate visitor fingerprint based on IP and User-Agent
   * @param {string} ipAddress - Visitor's IP address
   * @param {string} userAgent - Visitor's user agent string
   * @returns {string} - Unique fingerprint hash
   */
  static generateVisitorFingerprint(ipAddress, userAgent) {
    const fingerprintString = `${ipAddress}:${userAgent}`;
    return crypto.createHash('sha256').update(fingerprintString).digest('hex');
  }

  /**
   * Parse user agent string for detailed device information
   * @param {string} userAgent - Raw user agent string
   * @returns {object} - Parsed device information
   */
  static parseUserAgent(userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    return {
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || 'Unknown',
      operatingSystem: result.os.name || 'Unknown',
      deviceVendor: result.device.vendor || 'Unknown',
      deviceModel: result.device.model || 'Unknown',
      deviceType: this.determineDeviceType(result),
      platform: result.engine.name || 'Unknown'
    };
  }

  /**
   * Determine device type based on parsed user agent
   * @param {object} parsedUA - Parsed user agent result
   * @returns {string} - Device type (mobile, tablet, desktop, bot)
   */
  static determineDeviceType(parsedUA) {
    const { device, browser } = parsedUA;
    
    // Check for bots
    if (browser.name && browser.name.toLowerCase().includes('bot')) {
      return 'bot';
    }
    
    // Check for tablets
    if (device.type === 'tablet' || 
        device.model?.toLowerCase().includes('ipad') ||
        device.model?.toLowerCase().includes('tablet')) {
      return 'tablet';
    }
    
    // Check for mobile
    if (device.type === 'mobile' || 
        device.model?.toLowerCase().includes('iphone') ||
        device.model?.toLowerCase().includes('android') ||
        device.model?.toLowerCase().includes('phone')) {
      return 'mobile';
    }
    
    // Default to desktop
    return 'desktop';
  }

  /**
   * Get geolocation information from IP address
   * @param {string} ipAddress - Visitor's IP address
   * @returns {object} - Geolocation data
   */
  static getGeolocation(ipAddress) {
    const geo = geoip.lookup(ipAddress);
    
    if (!geo) {
      return {
        city: null,
        region: null,
        country: null,
        latitude: null,
        longitude: null
      };
    }

    return {
      city: geo.city,
      region: geo.region,
      country: geo.country,
      latitude: geo.ll[0],
      longitude: geo.ll[1]
    };
  }

  /**
   * Determine if visitor is first-time or returning
   * @param {string} visitorFingerprint - Unique visitor identifier
   * @param {string} profileId - Profile being scanned
   * @returns {Promise<string>} - 'first_time' or 'returning'
   */
  static async determineVisitorStatus(visitorFingerprint, profileId) {
    try {
      const existingScan = await ScanLog.findOne({
        visitorFingerprint,
        profileId
      });
      
      return existingScan ? 'returning' : 'first_time';
    } catch (error) {
      console.error('Error determining visitor status:', error);
      return 'first_time';
    }
  }

  /**
   * Extract language from request headers
   * @param {object} headers - Request headers
   * @returns {string|null} - Language code
   */
  static extractLanguage(headers) {
    const acceptLanguage = headers['accept-language'];
    if (!acceptLanguage) return null;
    
    // Extract primary language (e.g., 'en' from 'en-US,en;q=0.9')
    return acceptLanguage.split(',')[0].split('-')[0];
  }

  /**
   * Get time-based analytics data
   * @returns {object} - Hour and day information
   */
  static getTimeData() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      scanHour: now.getHours(),
      scanDay: days[now.getDay()]
    };
  }

  /**
   * Extract referrer information
   * @param {object} headers - Request headers
   * @returns {string|null} - Referrer URL
   */
  static extractReferrer(headers) {
    const referrer = headers.referer || headers.referrer;
    return referrer || null;
  }

  /**
   * Create comprehensive scan analytics object
   * @param {object} req - Express request object
   * @param {string} profileId - Profile ID being scanned
   * @param {string} qrCodeId - QR Code ID being scanned
   * @param {string} userId - User ID who owns the QR
   * @returns {Promise<object>} - Complete scan analytics data
   */
  static async createScanAnalytics(req, profileId, qrCodeId, userId) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'] || '';
      const visitorFingerprint = this.generateVisitorFingerprint(ipAddress, userAgent);
      
      // Get geolocation data
      const geoData = this.getGeolocation(ipAddress);
      
      // Parse user agent
      const deviceData = this.parseUserAgent(userAgent);
      
      // Determine visitor status
      const visitorStatus = await this.determineVisitorStatus(visitorFingerprint, profileId);
      
      // Extract additional data
      const language = this.extractLanguage(req.headers);
      const referrer = this.extractReferrer(req.headers);
      const timeData = this.getTimeData();
      
      return {
        qrCodeId,
        profileId,
        userId,
        ipAddress,
        city: geoData.city,
        region: geoData.region,
        country: geoData.country,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        userAgent,
        browser: deviceData.browser,
        browserVersion: deviceData.browserVersion,
        operatingSystem: deviceData.operatingSystem,
        deviceVendor: deviceData.deviceVendor,
        deviceModel: deviceData.deviceModel,
        deviceType: deviceData.deviceType,
        platform: deviceData.platform,
        referrer,
        visitorFingerprint,
        visitorStatus,
        language,
        scanHour: timeData.scanHour,
        scanDay: timeData.scanDay,
        scannedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating scan analytics:', error);
      throw new Error('Failed to create scan analytics');
    }
  }

  /**
   * Track and save scan analytics
   * @param {object} req - Express request object
   * @param {string} profileId - Profile ID being scanned
   * @param {string} qrCodeId - QR Code ID being scanned
   * @param {string} userId - User ID who owns the QR
   * @returns {Promise<object>} - Saved scan log
   */
  static async trackScan(req, profileId, qrCodeId, userId) {
    try {
      const analyticsData = await this.createScanAnalytics(req, profileId, qrCodeId, userId);
      const scanLog = new ScanLog(analyticsData);
      await scanLog.save();
      
      return scanLog;
    } catch (error) {
      console.error('Error tracking scan:', error);
      throw new Error('Failed to track scan');
    }
  }

  /**
   * Get analytics summary for a specific QR code
   * @param {string} qrCodeId - QR Code ID
   * @param {number} days - Number of days to look back (default: 30)
   * @returns {Promise<object>} - Analytics summary
   */
  static async getQRAnalytics(qrCodeId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const analytics = await ScanLog.aggregate([
        {
          $match: {
            qrCodeId: new mongoose.Types.ObjectId(qrCodeId),
            scannedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalScans: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorFingerprint' },
            deviceTypes: { $push: '$deviceType' },
            browsers: { $push: '$browser' },
            countries: { $push: '$country' },
            cities: { $push: '$city' },
            scanHours: { $push: '$scanHour' },
            scanDays: { $push: '$scanDay' },
            returningVisitors: {
              $sum: { $cond: [{ $eq: ['$visitorStatus', 'returning'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            totalScans: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' },
            returningVisitors: 1,
            deviceBreakdown: {
              $reduce: {
                input: '$deviceTypes',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                      ]
                    }
                  ]
                }
              }
            },
            browserBreakdown: {
              $reduce: {
                input: '$browsers',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                      ]
                    }
                  ]
                }
              }
            },
            topCountries: {
              $slice: [
                {
                  $sort: {
                    input: {
                      $map: {
                        input: { $setUnion: ['$countries', []] },
                        as: 'country',
                        in: {
                          country: '$$country',
                          count: { $size: { $filter: { input: '$countries', cond: { $eq: ['$$this', '$$country'] } } } }
                        }
                      }
                    },
                    by: { count: -1 }
                  }
                },
                10
              ]
            },
            topCities: {
              $slice: [
                {
                  $sort: {
                    input: {
                      $map: {
                        input: { $setUnion: ['$cities', []] },
                        as: 'city',
                        in: {
                          city: '$$city',
                          count: { $size: { $filter: { input: '$cities', cond: { $eq: ['$$this', '$$city'] } } } }
                        }
                      }
                    },
                    by: { count: -1 }
                  }
                },
                10
              ]
            },
            hourlyDistribution: {
              $reduce: {
                input: '$scanHours',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [{ k: { $toString: '$$this' }, v: { $add: [{ $ifNull: [{ $getField: { field: { $toString: '$$this' }, input: '$$value' } }, 0] }, 1] } }]
                      ]
                    }
                  ]
                }
              }
            },
            dailyDistribution: {
              $reduce: {
                input: '$scanDays',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      ]);
      
      return analytics[0] || {
        totalScans: 0,
        uniqueVisitors: 0,
        returningVisitors: 0,
        deviceBreakdown: {},
        browserBreakdown: {},
        topCountries: [],
        topCities: [],
        hourlyDistribution: {},
        dailyDistribution: {}
      };
    } catch (error) {
      console.error('Error getting QR analytics:', error);
      throw new Error('Failed to get QR analytics');
    }
  }
}

export default ScanTracker;
