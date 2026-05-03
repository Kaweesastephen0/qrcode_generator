import QRCode from '../models/QRCode.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import QRCodeLib from 'qrcode';

// Get all QR codes for current user
export const getUserQRCodes = asyncHandler(async (req, res) => {
  const qrCodes = await QRCode.find({ userId: req.user.userId })
    .populate('profileId', 'fullName companyName')
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      qrCodes,
      count: qrCodes.length,
    },
  });
});

// Get QR code by profile ID
export const getQRCodeByProfile = asyncHandler(async (req, res) => {
  const qrCode = await QRCode.findOne({ profileId: req.params.profileId });

  if (!qrCode) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.QRCODE_NOT_FOUND,
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { qrCode },
  });
});

// Regenerate QR code
export const regenerateQRCode = asyncHandler(async (req, res) => {
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

  // Generate new QR code
  const qrLink = `${process.env.DOMAIN_URL}/card/${profile._id}`;
  const qrCodeData = await QRCodeLib.toDataURL(qrLink);

  // Update or create QR code
  let qrCode = await QRCode.findOne({ profileId });

  if (qrCode) {
    qrCode.qrCodeUrl = qrCodeData;
    qrCode.qrCodeData = qrLink;
    await qrCode.save();
  } else {
    qrCode = new QRCode({
      profileId: profile._id,
      userId: req.user.userId,
      qrCodeData: qrLink,
      qrCodeUrl: qrCodeData,
      totalScans: 0,
    });
    await qrCode.save();
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'QR Code regenerated successfully',
    data: { qrCode },
  });
});

// Download QR code as image
export const downloadQRCode = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  const qrCode = await QRCode.findOne({ profileId });

  if (!qrCode) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.QRCODE_NOT_FOUND,
    });
  }

  // Generate PNG buffer
  try {
    const profile = await BusinessProfile.findById(profileId);
    const pngBuffer = await QRCodeLib.toBuffer(qrCode.qrCodeData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-code-${profile.fullName}.png"`);
    res.send(pngBuffer);
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      message: 'Error generating QR code image',
    });
  }
});
