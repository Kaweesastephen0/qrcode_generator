import mongoose from 'mongoose';
import geoip from 'geoip-lite';

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
    userAgent: {
      type: String,
      default: null,
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      default: 'desktop',
    },
    browser: {
      type: String,
      default: null,
    },
    operatingSystem: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    countryCode: {
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
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

// Index for aggregation queries
scanLogSchema.index({ qrCodeId: 1, timestamp: -1 });
scanLogSchema.index({ userId: 1, timestamp: -1 });
scanLogSchema.index({ profileId: 1, timestamp: -1 });

export default mongoose.model('ScanLog', scanLogSchema);
