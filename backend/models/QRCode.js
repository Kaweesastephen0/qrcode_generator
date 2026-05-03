import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema(
  {
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
    qrCodeData: {
      type: String,
      required: [true, 'QR Code data is required'],
    },
    qrCodeUrl: {
      type: String,
      required: [true, 'QR Code URL is required'],
    },
    totalScans: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
qrCodeSchema.index({ profileId: 1 });
qrCodeSchema.index({ userId: 1 });

export default mongoose.model('QRCode', qrCodeSchema);
