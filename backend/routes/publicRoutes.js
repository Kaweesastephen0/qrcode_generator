import express from 'express';
import { getPublicProfile } from '../controllers/publicController.js';

const router = express.Router();

// GET /card/:profileId - Public business card (no auth required)
router.get('/card/:profileId', getPublicProfile);

export default router;