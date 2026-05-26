# QR Generator - Premium Business Card & Analytics Platform

## Overview 

A production-grade MERN web application that creates stunning digital business cards with advanced QR code generation and comprehensive analytics intelligence. Built with modern ES6 syntax, premium UI/UX, and mobile-first responsive design.

## Premium Features

### Modern UI/UX Design
- **Glassmorphism Design**: Premium frosted glass effects with backdrop blur
- **Framer Motion Animations**: Smooth micro-interactions and page transitions
- **Lucide React Icons**: Beautiful, consistent icon system
- **Mobile-First Responsive**: Perfect optimization across all devices
- **Premium Color Gradients**: Modern gradient backgrounds and accents

### Advanced Analytics Intelligence
- **Real-Time Scan Tracking**: Automatic capture on every QR scan
- **Geographic Intelligence**: City, region, country with lat/lng coordinates
- **Device Fingerprinting**: Browser, OS, device type, vendor, model detection
- **Visitor Behavior**: First-time vs returning visitor analysis
- **Time-Based Analytics**: Hourly and daily scan distribution patterns
- **Advanced Charts**: Recharts-powered interactive visualizations

### Enterprise Security
- **JWT Authentication**: Secure token-based auth with role management
- **bcrypt Password Hashing**: Industry-standard password protection
- **Rate Limiting**: Protection against scan spam and abuse
- **CORS Security**: Proper cross-origin resource sharing
- **Input Validation**: Comprehensive data validation and sanitization

### Production Architecture
- **MVC Backend Pattern**: Clean, scalable code organization
- **RESTful API Design**: Standardized endpoint structure
- **MongoDB Indexing**: Optimized database queries
- **Error Handling**: Comprehensive error management
- **Logging System**: Request tracking and debugging support

### Mobile-Centric Features
- **Touch-Friendly UI**: Optimized for smartphone interactions
- **Responsive Grids**: Fluid layouts across all screen sizes
- **Collapsible Navigation**: Mobile-optimized sidebar
- **Fast Loading**: Performance-optimized for mobile networks
- **Public Card Pages**: Smartphone-optimized business card display

## Quick Start

### Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run seed        # Creates admin user
npm run dev         # Starts on port 5000
```

### Frontend Setup (New Terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # Starts on port 5173
```

### Login
- **URL**: http://localhost:5173
- **Admin Email**: admin@qrcode.com
- **Admin Password**: admin123

## Full Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:
- Detailed installation instructions
- Environment variables configuration
- API endpoint reference
- Database models documentation
- Troubleshooting guide
- Deployment instructions

##  Project Structure

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

##  User Roles

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

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Vite, Tailwind CSS, Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, bcrypt |
| **QR Codes** | qrcode library |
| **Analytics** | GeoIP, UA Parser |

## Analytics Tracked

- Total scans per QR code
- Daily scan trends
- Device distribution (mobile/tablet/desktop)
- Geographic distribution (country/city)
- Browser & OS information
- IP addresses and geolocation

##  API Endpoints

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

##  Pages & Components

### User Pages
-  Login & Register
-  Dashboard (Overview)
-  Create Profile
-  My Profiles (List & Manage)
-  Analytics (Charts & Logs)
-  Public Business Card (Sharable)

### Admin Pages
-  Admin Dashboard
-  Manage Users
-  Manage Profiles
-  View Scan Logs

## Security Features

 JWT token-based authentication
 bcrypt password hashing
 Protected routes with middleware
 Role-based authorization
 CORS protection
 XSS prevention with React
 SQL Injection prevention (MongoDB)

## Installation Requirements

- Node.js >= 14
- MongoDB (local or Atlas)
- npm or yarn

## Running the Application

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

##  Database Setup

**MongoDB Local**
```bash
mongod
```

**MongoDB Atlas (Cloud)**
1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

##  Development Workflow

1. Backend runs on `http://localhost:5000`
2. Frontend runs on `http://localhost:5173`
3. Frontend proxies API calls to backend
4. Hot reload enabled for both

##  Common Issues

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



##  Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push and create PR

##  License

MIT - Free for commercial and personal use

##  Support


-  Report issues on GitHub
-  Check troubleshooting section

---

**Built with Modern MERN Stack**

