import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
  deleteUser,
  getAllProfiles,
  deleteProfileAdmin,
  getAllQRCodes,
  getAllScanLogs,
  getOverallAnalytics,
} from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/activate', activateUser);
router.delete('/users/:id', deleteUser);

// Profiles management
router.get('/profiles', getAllProfiles);
router.delete('/profiles/:id', deleteProfileAdmin);

// QR Codes
router.get('/qr-codes', getAllQRCodes);

// Scan logs
router.get('/scan-logs', getAllScanLogs);

// Analytics
router.get('/analytics', getOverallAnalytics);

export default router;
