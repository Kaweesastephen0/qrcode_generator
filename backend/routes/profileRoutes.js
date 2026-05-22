import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createProfile, getUserProfiles } from '../controllers/createProfile.js';

const router = express.Router();

// POST /api/profiles/create (protected)
router.post('/create', authenticate, createProfile);

// GET /api/profiles/my-profiles (protected)
router.get('/my-profiles', authenticate, getUserProfiles);

export default router;