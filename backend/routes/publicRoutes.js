import express from 'express';
import { getPublicProfile } from '../controllers/profileController.js';
import { 
  scanTrackerMiddleware, 
  publicCardCors, 
  publicCardCache,
  validateScanTarget 
} from '../middleware/scanTracker.js';

const router = express.Router();

// Public card route with automatic scan tracking
// This route is accessed when QR codes are scanned
router.get('/card/:profileId', 
  publicCardCors,
  publicCardCache,
  validateScanTarget,
  scanTrackerMiddleware,
  getPublicProfile
);

export default router;
