import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  createProfile,
  getUserProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  getPublicProfile,
  getProfileImage,
} from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Setup __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/profiles/');
console.log('Upload directory:', uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created upload directory:', uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Multer destination:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Multer filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Protected routes
router.post('/create', authenticate, upload.single('profilePhoto'), createProfile);
router.get('/my-profiles', authenticate, getUserProfiles);
router.get('/:id', authenticate, getProfile);
router.put('/:id', authenticate, upload.single('profilePhoto'), updateProfile);
router.delete('/:id', authenticate, deleteProfile);

// Public route
router.get('/public/:id', getPublicProfile);

// Profile image route (public for CORS handling)
router.get('/image/:filename', getProfileImage);

export default router;
