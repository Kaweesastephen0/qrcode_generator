import BusinessProfile from '../models/BusinessProfile.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

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