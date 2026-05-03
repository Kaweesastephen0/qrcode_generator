import express from 'express';
import {
  logScan,
  getProfileAnalytics,
  getScanLogs,
  getUserAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public route - log scan when QR is accessed
router.post('/log/:profileId', logScan);

// Protected routes
router.get('/profile/:profileId', authenticate, getProfileAnalytics);
router.get('/scans/:profileId', authenticate, getScanLogs);
router.get('/user/overview', authenticate, getUserAnalytics);

export default router;
