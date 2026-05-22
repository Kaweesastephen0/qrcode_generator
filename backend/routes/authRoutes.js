import express from 'express';
import { register } from '../controllers/register.js';
import { login } from '../controllers/login.js';
import { authenticate } from '../middleware/auth.js';
import { getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (protected)
router.get('/me', authenticate, getCurrentUser);

export default router;