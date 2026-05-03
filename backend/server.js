const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'QR Builder Authentication API is running.' });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Server Error' });
});

async function createAdminUser() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@qrbuilder.com' });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const admin = new User({
      fullName: 'QR Builder Admin',
      username: 'admin',
      email: 'admin@qrbuilder.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('Admin user created: admin@qrbuilder.com / Admin@123');
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
  }
}

async function startServer() {
  await connectDB();
  await createAdminUser();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
