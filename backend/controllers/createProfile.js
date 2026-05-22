import BusinessProfile from '../models/BusinessProfile.js';
import { validateProfileData } from '../utils/validators.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createProfile = asyncHandler(async (req, res) => {
  const { 
    companyName, 
    location, 
    workingHours, 
    slogan, 
    projectsServices, 
    phone, 
    email, 
    website, 
    socialLinks 
  } = req.body;

  // Validate input
  const validation = validateProfileData({
    companyName,
    location,
    projectsServices,
    phone,
    email,
  });

  if (!validation.isValid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation error',
      errors: validation.errors,
    });
  }

  // Create profile linked to authenticated user
  const profile = new BusinessProfile({
    userId: req.user.userId,
    companyName,
    location,
    workingHours: workingHours || null,
    slogan: slogan || null,
    projectsServices,
    phone,
    email,
    website: website || null,
    socialLinks: socialLinks || {},
  });

  await profile.save();

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.PROFILE_CREATED,
    data: { profile },
  });
});

export const getUserProfiles = asyncHandler(async (req, res) => {
  const profiles = await BusinessProfile.find({ userId: req.user.userId })
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      profiles,
      count: profiles.length,
    },
  });
});