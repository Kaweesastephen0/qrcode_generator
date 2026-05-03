# QR Code Business Card Builder & Analytics Management System

## 🎯 Overview

A production-ready full-stack MERN web application for creating digital business cards with QR code generation and real-time analytics tracking. Features comprehensive admin dashboard and user profile management.

## ✨ Key Features

- **QR Code Generation**: Auto-generate scannable QR codes for business cards
- **Real-time Analytics**: Track scans with device, location, and browser info
- **Digital Business Cards**: Public-facing business card pages
- **Admin Dashboard**: Comprehensive system management
- **User Management**: Role-based access control (Admin/User)
- **Charts & Visualization**: Chart.js powered analytics dashboards
- **Responsive Design**: Mobile-friendly Tailwind CSS interface
- **Secure Authentication**: JWT + bcrypt password hashing

## 🚀 Quick Start

### 1️⃣ Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run seed        # Creates admin user
npm run dev         # Starts on port 5000
```

### 2️⃣ Frontend Setup (New Terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # Starts on port 5173
```

### 3️⃣ Login
- **URL**: http://localhost:5173
- **Admin Email**: admin@qrcode.com
- **Admin Password**: admin123

## 📚 Full Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:
- Detailed installation instructions
- Environment variables configuration
- API endpoint reference
- Database models documentation
- Troubleshooting guide
- Deployment instructions

## 📁 Project Structure

```
backend/                 # Node.js + Express API
├── config/             # Database & constants
├── controllers/        # Business logic
├── middleware/         # Auth & error handling
├── models/            # MongoDB schemas
├── routes/            # API endpoints
├── utils/             # Helpers & utilities
└── server.js          # Entry point

frontend/              # React + Vite UI
├── src/
│   ├── api/           # API client
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── context/       # Auth context
│   ├── routes/        # Route protection
│   └── App.jsx        # Main component
└── index.html
```

## 🔐 User Roles

### Admin
- Dashboard with system stats
- Manage all users
- Manage all profiles
- View system analytics

### Normal User
- Create business profiles
- Generate/download QR codes
- View personal analytics
- Manage own profiles

## 💻 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Vite, Tailwind CSS, Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, bcrypt |
| **QR Codes** | qrcode library |
| **Analytics** | GeoIP, UA Parser |

## 📊 Analytics Tracked

- Total scans per QR code
- Daily scan trends
- Device distribution (mobile/tablet/desktop)
- Geographic distribution (country/city)
- Browser & OS information
- IP addresses and geolocation

## 🔗 API Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

**Profiles**
- `POST /api/profiles/create` - Create profile
- `GET /api/profiles/my-profiles` - List user profiles
- `PUT /api/profiles/:id` - Update profile

**QR Codes**
- `GET /api/qr-codes/my-codes` - List QR codes
- `POST /api/qr-codes/regenerate/:id` - Regenerate QR
- `GET /api/qr-codes/download/:id` - Download QR PNG

**Analytics**
- `POST /api/analytics/log/:id` - Log scan
- `GET /api/analytics/profile/:id` - Get analytics
- `GET /api/analytics/scans/:id` - Get scan logs

**Admin**
- `GET /api/admin/dashboard/stats` - Dashboard stats
- `GET /api/admin/users` - List all users
- `GET /api/admin/profiles` - List all profiles

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete API documentation.

## 🎨 Pages & Components

### User Pages
- 🔐 Login & Register
- 📊 Dashboard (Overview)
- 💼 Create Profile
- 📁 My Profiles (List & Manage)
- 📈 Analytics (Charts & Logs)
- 🎫 Public Business Card (Sharable)

### Admin Pages
- 📊 Admin Dashboard
- 👥 Manage Users
- 💼 Manage Profiles
- 📋 View Scan Logs

## 🔐 Security Features

✅ JWT token-based authentication
✅ bcrypt password hashing
✅ Protected routes with middleware
✅ Role-based authorization
✅ CORS protection
✅ XSS prevention with React
✅ SQL Injection prevention (MongoDB)

## 📦 Installation Requirements

- Node.js >= 14
- MongoDB (local or Atlas)
- npm or yarn

## 🚦 Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Production Build
```bash
# Backend (no build needed)
npm start

# Frontend
npm run build
npm run preview
```

## 🗂️ Database Setup

**MongoDB Local**
```bash
mongod
```

**MongoDB Atlas (Cloud)**
1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

## 🧑‍💻 Development Workflow

1. Backend runs on `http://localhost:5000`
2. Frontend runs on `http://localhost:5173`
3. Frontend proxies API calls to backend
4. Hot reload enabled for both

## 🐛 Common Issues

**Can't connect to MongoDB**
- Ensure MongoDB service is running
- Check connection string in `.env`
- Verify credentials

**Frontend shows "Cannot GET /api/**"**
- Backend not running on port 5000
- Check `VITE_API_URL` in frontend `.env`

**Admin login fails**
- Run `npm run seed` in backend
- Verify JWT_SECRET is set

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete troubleshooting.

## 📚 Code Examples

### Create a Profile
```javascript
const response = await profileAPI.createProfile({
  fullName: 'John Doe',
  position: 'Developer',
  companyName: 'Tech Corp',
  phone: '+1-234-567-8900',
  email: 'john@example.com',
  website: 'https://johndoe.com',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe'
  }
});
```

### Get Analytics
```javascript
const response = await analyticsAPI.getProfileAnalytics(profileId);
console.log(response.data.data); // { totalScans, dailyScans, deviceDistribution, ... }
```

### Protected API Call
```javascript
// Token automatically added by interceptor
const response = await api.get('/api/auth/me');
```

## 🎓 Learning Resources

- [React Hooks](https://react.dev/reference/react)
- [Express.js Routing](https://expressjs.com/en/guide/routing.html)
- [MongoDB Aggregation](https://docs.mongodb.com/manual/aggregation)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push and create PR

## 📄 License

MIT - Free for commercial and personal use

## 📞 Support

- 📖 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed help
- 🐛 Report issues on GitHub
- 💬 Check troubleshooting section

---

**Built with ❤️ using Modern MERN Stack**

[View SETUP_GUIDE.md →](./SETUP_GUIDE.md)
