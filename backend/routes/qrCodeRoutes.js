import express from 'express';
import {
  getUserQRCodes,
  getQRCodeByProfile,
  regenerateQRCode,
  downloadQRCode,
} from '../controllers/qrCodeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/my-codes', authenticate, getUserQRCodes);
router.get('/profile/:profileId', authenticate, getQRCodeByProfile);
router.post('/regenerate/:profileId', authenticate, regenerateQRCode);
router.get('/download/:profileId', authenticate, downloadQRCode);

export default router;
