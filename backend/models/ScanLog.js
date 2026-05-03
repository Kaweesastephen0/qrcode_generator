import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema(
  {
    qrCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRCode',
      required: [true, 'QR Code ID is required'],
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: [true, 'Profile ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    ipAddress: {
      type: String,
      required: [true, 'IP Address is required'],
    },
    city: {
      type: String,
      default: null,
    },
    region: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    browser: {
      type: String,
      default: null,
    },
    browserVersion: {
      type: String,
      default: null,
    },
    operatingSystem: {
      type: String,
      default: null,
    },
    deviceVendor: {
      type: String,
      default: null,
    },
    deviceModel: {
      type: String,
      default: null,
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'bot'],
      default: 'desktop',
    },
    platform: {
      type: String,
      default: null,
    },
    referrer: {
      type: String,
      default: null,
    },
    visitorFingerprint: {
      type: String,
      required: [true, 'Visitor fingerprint is required'],
      index: true,
    },
    visitorStatus: {
      type: String,
      enum: ['first_time', 'returning'],
      default: 'first_time',
    },
    language: {
      type: String,
      default: null,
    },
    scanHour: {
      type: Number,
      min: 0,
      max: 23,
      required: true,
    },
    scanDay: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

// Index for aggregation queries
scanLogSchema.index({ qrCodeId: 1, scannedAt: -1 });
scanLogSchema.index({ userId: 1, scannedAt: -1 });
scanLogSchema.index({ profileId: 1, scannedAt: -1 });
scanLogSchema.index({ visitorFingerprint: 1, scannedAt: -1 });
scanLogSchema.index({ country: 1, scannedAt: -1 });
scanLogSchema.index({ deviceType: 1, scannedAt: -1 });
scanLogSchema.index({ scanHour: 1 });
scanLogSchema.index({ scanDay: 1 });

export default mongoose.model('ScanLog', scanLogSchema);
