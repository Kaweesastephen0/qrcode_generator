import QRCode from '../models/QRCode.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import QRCodeLib from 'qrcode';

/**
 * Generate a QR code for a business profile
 * Checks profile exists, generates QR, saves to database, returns QR data
 */
export const generateQR = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  // Pre-condition: Check if profile exists
  const profile = await BusinessProfile.findById(profileId);
  if (!profile) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.PROFILE_NOT_FOUND,
    });
  }

  // Generate QR code
  const domainUrl = process.env.DOMAIN_URL || 'http://localhost:5000';
  const qrLink = `${domainUrl}/card/${profileId}`;
  let qrCodeData;

  try {
    qrCodeData = await QRCodeLib.toDataURL(qrLink);
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      message: 'QR code generation failed',
    });
  }

  // Save QR code record
  const qrCode = new QRCode({
    profileId,
    userId: req.user.userId,
    qrCodeData: qrLink,
    qrCodeUrl: qrCodeData,
    totalScans: 0,
  });

  await qrCode.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { qrCode },
  });
});

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

export const getPublicProfile = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  const profile = await BusinessProfile.findById(profileId);

  if (!profile) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.PROFILE_NOT_FOUND,
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { profile },
  });
});