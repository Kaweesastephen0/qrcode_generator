import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';

// Parse user agent to get device info
export const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Unknown',
    operatingSystem: result.os.name || 'Unknown',
    deviceType: result.device.type || 'desktop',
    userAgent: userAgent,
  };
};

// Get geolocation from IP address
export const getLocationFromIP = (ipAddress) => {
  try {
    // Remove IPv6 prefix if exists
    const cleanIP = ipAddress.replace(/^::ffff:/, '');
    const geo = geoip.lookup(cleanIP);

    if (!geo) {
      return {
        city: null,
        country: null,
        countryCode: null,
        latitude: null,
        longitude: null,
      };
    }

    return {
      city: geo.city || null,
      country: geo.country || null,
      countryCode: geo.country || null,
      latitude: geo.ll ? geo.ll[0] : null,
      longitude: geo.ll ? geo.ll[1] : null,
    };
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return {
      city: null,
      country: null,
      countryCode: null,
      latitude: null,
      longitude: null,
    };
  }
};

// Get client IP from request
export const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'Unknown'
  );
};
