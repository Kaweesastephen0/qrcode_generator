import BusinessProfile from '../models/BusinessProfile.js';
import QRCode from '../models/QRCode.js';
import { validateProfileData } from '../utils/validators.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import QRCodeLib from 'qrcode';

// Create business profile
export const createProfile = asyncHandler(async (req, res) => {
  const { fullName, position, companyName, phone, email, website, address, description, socialLinks } = req.body;

  // Validate input
  const validation = validateProfileData({
    fullName,
    position,
    companyName,
    phone,
    email,
    website,
  });

  if (!validation.isValid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation error',
      errors: validation.errors,
    });
  }

  // Create profile
  const profile = new BusinessProfile({
    userId: req.user.userId,
    fullName,
    position,
    companyName,
    phone,
    email,
    website: website || null,
    address: address || null,
    description: description || null,
    socialLinks: socialLinks || {},
    qrCodeGenerated: false,
  });

  await profile.save();

  // Generate QR code
  const qrLink = `${process.env.DOMAIN_URL}/card/${profile._id}`;
  const qrCodeData = await QRCodeLib.toDataURL(qrLink);

  // Save QR code to database
  const qrCode = new QRCode({
    profileId: profile._id,
    userId: req.user.userId,
    qrCodeData: qrLink,
    qrCodeUrl: qrCodeData,
    totalScans: 0,
  });

  await qrCode.save();

  // Update profile with QR code generated flag
  profile.qrCodeGenerated = true;
  await profile.save();

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.PROFILE_CREATED,
    data: {
      profile,
      qrCode: {
        id: qrCode._id,
        qrCodeUrl: qrCode.qrCodeUrl,
        qrCodeData: qrCode.qrCodeData,
      },
    },
  });
});

// Get all profiles for current user
export const getUserProfiles = asyncHandler(async (req, res) => {
  const profiles = await BusinessProfile.find({ userId: req.user.userId }).sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      profiles,
      count: profiles.length,
    },
  });
});

// Get single profile
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findById(req.params.id);

  if (!profile) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.PROFILE_NOT_FOUND,
    });
  }

  // Check ownership (unless user is admin)
  if (req.user.role !== 'admin' && profile.userId.toString() !== req.user.userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN,
    });
  }

  // Get associated QR code
  const qrCode = await QRCode.findOne({ profileId: profile._id });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      profile,
      qrCode: qrCode || null,
    },
  });
});

// Update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, position, companyName, phone, email, website, address, description, socialLinks } = req.body;

  const profile = await BusinessProfile.findById(req.params.id);

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

  // Update fields
  if (fullName) profile.fullName = fullName;
  if (position) profile.position = position;
  if (companyName) profile.companyName = companyName;
  if (phone) profile.phone = phone;
  if (email) profile.email = email;
  if (website) profile.website = website;
  if (address) profile.address = address;
  if (description) profile.description = description;
  if (socialLinks) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };

  await profile.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.PROFILE_UPDATED,
    data: { profile },
  });
});

// Delete profile
export const deleteProfile = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findById(req.params.id);

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

  // Delete associated QR codes and scan logs
  await QRCode.deleteMany({ profileId: profile._id });
  await profile.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.PROFILE_DELETED,
  });
});

// Get public profile (for card display)
export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findById(req.params.id);

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
