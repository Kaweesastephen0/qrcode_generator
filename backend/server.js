import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import only 3 routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import qrCodeRoutes from './routes/qrCodeRoutes.js';
import publicRoutes from './routes/publicRoutes.js'

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);      // POST /api/auth/register
app.use('/api/profiles', profileRoutes); // POST /api/profiles/create
app.use('/api/qr-codes', qrCodeRoutes);  // GET /api/qr-codes/generate/:profileId
app.use('/api', publicRoutes)

// ✅ HEALTH CHECK ENDPOINT - ADD THIS LINE
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(errorHandler);

// DEBUG: Print all registered routes
console.log('=== REGISTERED ROUTES ===');
const printRoutes = (stack, base = '') => {
  stack.forEach((r) => {
    if (r.route) {
      const methods = Object.keys(r.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${base}${r.route.path}`);
    } else if (r.handle && r.handle.stack) {
      // This is a router middleware
      const routerPath = r.regexp.source
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace(/\^/g, '')
        .replace(/\?/g, '');
      printRoutes(r.handle.stack, routerPath);
    }
  });
};
printRoutes(app._router.stack);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});