import express from 'express';
import {
  createProfile,
  getUserProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  getPublicProfile,
} from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/create', authenticate, createProfile);
router.get('/my-profiles', authenticate, getUserProfiles);
router.get('/:id', authenticate, getProfile);
router.put('/:id', authenticate, updateProfile);
router.delete('/:id', authenticate, deleteProfile);

// Public route
router.get('/public/:id', getPublicProfile);

export default router;
