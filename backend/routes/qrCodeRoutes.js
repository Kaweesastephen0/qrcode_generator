import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { generateQR, getQRCodeByProfile } from '../controllers/generateQR.js';

const router = express.Router();

// GET /api/qr-codes/generate/:profileId (protected)
router.get('/generate/:profileId', authenticate, generateQR);

// GET /api/qr-codes/profile/:profileId (protected)
router.get('/profile/:profileId', authenticate, getQRCodeByProfile);

export default router;