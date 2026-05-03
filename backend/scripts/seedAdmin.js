import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@qrcode.com' });

    if (adminExists) {
      console.log('✓ Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admin@qrcode.com',
      password: 'admin123', // Change this in production
      role: 'admin',
      status: 'active',
    });

    await adminUser.save();

    console.log(`
╔════════════════════════════════════════════════════╗
║  Admin User Created Successfully                   ║
╠════════════════════════════════════════════════════╣
║  Email: admin@qrcode.com                          ║
║  Password: admin123                               ║
║                                                    ║
║  ⚠️  IMPORTANT: Change this password in production ║
╚════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();
