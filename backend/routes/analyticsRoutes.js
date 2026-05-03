import express from 'express';
import {
  getQRAnalytics,
  getProfileAnalytics,
  getScanLogs,
  getUserAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes for users
router.get('/user/overview', authenticate, getUserAnalytics);
router.get('/profile/:profileId', authenticate, getProfileAnalytics);
router.get('/scans/:profileId', authenticate, getScanLogs);

// Admin routes
router.get('/qr/:qrCodeId', authenticate, requireAdmin, getQRAnalytics);

export default router;
