<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MediCore CMS - Clinic Management System

A comprehensive Clinic Management System with:
- **Patient Portal**: Public patient access via secure tokens
- **Doctor Dashboard**: Split-screen consultation mode with full medical history
- **Admin Panel**: Complete system management
- **RESTful API**: NestJS backend with PostgreSQL via Prisma

---

## 🏗️ Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Google Gemini AI integration
- React Router
- Lucide Icons

### Backend
- NestJS (Node.js framework)
- Prisma ORM
- PostgreSQL database
- JWT Authentication
- Role-based Authorization (RBAC)

---

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (recommended: [Supabase](https://supabase.com) or [Neon](https://neon.tech))
- Gemini API Key ([Get it here](https://ai.google.dev))

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Setup Environment Variables

Create `.env.local` in the root directory:

```bash
# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

Create `backend/.env` in the backend directory:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/medicore?schema=public"

# JWT Secret (use a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Server Port
PORT=3000
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 4. Run Development Servers

```bash
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend (NestJS)
npm run backend:dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

---

## 🗂️ Project Structure

```
medicore-cms/
├── backend/                  # NestJS Backend
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── src/
│   │   ├── main.ts          # Entry point
│   │   ├── app.module.ts    # Root module
│   │   ├── auth/            # Authentication
│   │   ├── patients/        # Patients management
│   │   ├── appointments/    # Appointments
│   │   ├── medical-records/ # Medical records
│   │   └── portal/          # Patient portal
│   ├── package.json
│   └── tsconfig.json
├── src/                      # React Frontend
│   ├── App.tsx
│   ├── components/
│   └── services/
├── package.json
├── vercel.json              # Vercel deployment config
└── README.md
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login
GET    /api/auth/profile         # Get user profile
```

### Patients (Admin/Doctor only)
```
GET    /api/patients             # List all patients
GET    /api/patients/:id         # Get patient details
GET    /api/patients/:id/history # Get full medical history
PUT    /api/patients/:id         # Update patient info
```

### Appointments
```
POST   /api/appointments         # Create appointment
GET    /api/appointments         # List appointments (role-filtered)
GET    /api/appointments/:id     # Get appointment details
PATCH  /api/appointments/:id/status  # Update status
```

### Medical Records (Doctor only)
```
POST   /api/medical-records              # Create medical record
GET    /api/medical-records/patient/:id  # Get patient records
GET    /api/medical-records/:id          # Get single record
```

### Patient Portal (Public Access)
```
POST   /api/portal/generate-token    # Generate access token (admin/doctor)
GET    /api/portal/:token            # Get patient info (public)
GET    /api/portal/:token/records    # Get medical records (public)
POST   /api/portal/:token/deactivate # Deactivate token (admin/doctor)
```

---

## 🌐 Deploy to Vercel

### 1. Prerequisites

- GitHub account
- [Vercel account](https://vercel.com)
- PostgreSQL database (Supabase/Neon recommended)

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/medicore-cms.git
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Select your GitHub repository
4. **Add Environment Variables:**
   ```
   DATABASE_URL = your_postgresql_connection_string
   JWT_SECRET = your_super_secret_jwt_key
   GEMINI_API_KEY = your_gemini_api_key
   FRONTEND_URL = https://your-project.vercel.app
   ```
5. Click "Deploy"

### 4. After Deployment

```bash
# Run database migrations on production
# (from Vercel project settings → Deployments → ... → View Function Logs)
# Or use Prisma Studio/CLI with production DATABASE_URL
```

---

## 👥 User Roles

### PATIENT
- Book appointments
- View own medical records
- Update profile

### DOCTOR
- View all patients
- Access patient medical history (Consultation Mode)
- Create medical records
- Manage appointments

### ADMIN
- Full system access
- User management
- Generate patient portal tokens

---

## 🔐 Security Features

- JWT-based authentication (7-day expiry)
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Secure patient portal with tokens
- CORS protection
- Input validation with class-validator

---

## 📚 Additional Documentation

- [Backend Development Rules](./BACKEND_RULES.md)
- [API Documentation](https://your-project.vercel.app/api)

---

## 🛠️ Development Commands

```bash
# Frontend
npm run dev              # Run dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Backend
npm run backend:dev      # Run backend dev server
npm run backend:build    # Build backend

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations

# Full Build
npm run build            # Build both frontend & backend
```

---

## 📄 License

This project is private and confidential.

---

## 🆘 Support

For issues or questions, please contact the development team.
# ttyyttmed
