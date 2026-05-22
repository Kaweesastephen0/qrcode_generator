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
  },
  { timestamps: true }
);

export default mongoose.model('QRCode', qrCodeSchema);