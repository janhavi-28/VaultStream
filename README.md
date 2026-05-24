# VaultStream 🎬

A full-stack video upload, sensitivity processing, and streaming platform with real-time progress tracking, multi-tenant architecture, and role-based access control.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Multi-Tenant Architecture](#multi-tenant-architecture)
- [Video Processing Pipeline](#video-processing-pipeline)
- [Assumptions & Design Decisions](#assumptions--design-decisions)

---

## Overview

VaultStream is a comprehensive video management platform that allows organisations to upload, process, and stream video content securely. Videos are automatically analysed for content sensitivity and classified as **Safe** or **Flagged**. Administrators can review flagged content, manage users and organisations, and control access through role-based permissions.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js (LTS) | Runtime environment |
| Express.js | REST API framework |
| MongoDB + Mongoose | Database and ODM |
| Socket.io | Real-time progress updates |
| JWT | Authentication tokens |
| Multer | Video file uploads |
| FFmpeg (fluent-ffmpeg) | Video processing |
| bcrypt | Password hashing |
| Helmet + CORS | Security middleware |

### Frontend
| Technology | Purpose |
|---|---|
| React (Latest) | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Socket.io Client | Real-time updates |
| React Router | Client-side routing |

### Infrastructure
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Render | Backend hosting |
| Vercel | Frontend hosting |

---

## Features

### Core Features
- ✅ Complete video upload with drag-and-drop support
- ✅ Real-time upload and processing progress via Socket.io
- ✅ Automated content sensitivity analysis (Safe/Flagged)
- ✅ Secure video streaming with HTTP range requests
- ✅ Multi-tenant architecture with data isolation
- ✅ Role-based access control (Admin, Editor, Viewer)
- ✅ JWT-based authentication and authorisation

### Admin Features
- Dashboard with system-wide statistics
- Global video library management
- Flagged content moderation (approve/reject)
- User management with role assignment
- Organisation/tenant management

### Editor Features
- Video upload with real-time progress tracking
- Personal video library with Safe/Flagged status
- Video streaming and playback

### Viewer Features
- Watch videos assigned to their organisation
- Video playback with speed controls

---

## Architecture

```
VaultStream/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, error, upload middleware
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Video processing service
│   │   ├── sockets/          # Socket.io handlers
│   │   └── utils/            # JWT utilities
│   ├── seedTenants.js        # Database seeder
│   └── package.json
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── api/              # Axios configuration
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth context
│   │   ├── pages/            # Page components
│   │   └── main.jsx
│   └── package.json
└── database/                 # DB schemas and migrations
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- FFmpeg installed on your system

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/janhavi-28/VaultStream.git
cd VaultStream
```

**2. Setup Backend**
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@vaultstream.com
ADMIN_PASSWORD=Admin123!
CLIENT_URL=http://localhost:5173
```

**3. Seed the Database**
```bash
cd backend
node seedTenants.js
```

This creates:
- 3 organisations: Northstar Media, Acme Corp, Blue Studios
- Admin user with credentials from `.env`
- Sample users for each organisation

**4. Start the Backend**
```bash
npm start        # Production
npm run dev      # Development (with nodemon)
```

Backend runs on: `http://localhost:5000`

**5. Setup Frontend**
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

**6. Start the Frontend**
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Environment Variables

### Backend `.env`

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | Yes |
| `MONGO_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) | Yes |
| `JWT_EXPIRES_IN` | Token expiry (e.g. 7d) | Yes |
| `ADMIN_EMAIL` | Admin account email | Yes |
| `ADMIN_PASSWORD` | Admin account password | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |

### Frontend `.env`

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | Yes |

---

## API Documentation

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/tenants` | Get all organisations | Public |

### Videos
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/videos/upload` | Upload a video | Editor, Admin |
| GET | `/api/videos` | Get user's videos | Editor, Admin |
| DELETE | `/api/videos/:id` | Delete a video | Editor (own), Admin |

### Streaming
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/videos/stream/:id` | Stream video (range requests) | All |

### Admin
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/admin/stats` | System statistics | Admin |
| GET | `/api/admin/users` | All users | Admin |
| PUT | `/api/admin/users/:id/role` | Update user role | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| GET | `/api/admin/tenants` | All organisations | Admin |
| POST | `/api/admin/tenants` | Create organisation | Admin |
| DELETE | `/api/admin/tenants/:id` | Delete organisation | Admin |

### Health Check
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API health status |

---

## User Roles

### Admin
- Pre-seeded in database (not registerable)
- Full system access
- Credentials set via environment variables
- Default: `admin@vaultstream.com` / `Admin123!`

### Editor
- Self-registers via register page
- Can upload, manage, and stream own videos
- Can delete own videos

### Viewer
- Self-registers via register page
- Read-only access to organisation videos
- Cannot upload or delete content

---

## Multi-Tenant Architecture

Each user belongs to one organisation at registration. Data is fully isolated between organisations:

```
Northstar Media  →  sees only Northstar Media videos
Acme Corp        →  sees only Acme Corp videos
Blue Studios     →  sees only Blue Studios videos
Admin            →  sees ALL organisations
```

### Pre-seeded Organisations
| Organisation | Seeded Users |
|---|---|
| Northstar Media | 3 users (1 editor, 2 viewers) |
| Acme Corp | 1 user (1 editor) |
| Blue Studios | 0 users |

### Seeded User Credentials
All seeded users have password: `password123`

| Email | Role | Organisation |
|---|---|---|
| ns1@antigravity.local | Editor | Northstar Media |
| ns2@antigravity.local | Viewer | Northstar Media |
| ns3@antigravity.local | Viewer | Northstar Media |
| acme1@antigravity.local | Editor | Acme Corp |

---

## Video Processing Pipeline

```
1. Upload Validation
   → File type check (MP4, MOV, WEBM)
   → File size check (max 2GB)
   → Duration check (max 2 hours)

2. Storage
   → Saved to uploads/videos/
   → Unique filename generated

3. Processing (FFmpeg)
   → Thumbnail extraction
   → Duration and metadata extraction
   → Sensitivity analysis

4. Classification
   → Safe: Video passes analysis
   → Flagged: Video requires review

5. Real-Time Updates (Socket.io)
   → Uploading → Processing → Complete
   → Safe/Flagged result emitted to client

6. Streaming
   → HTTP range request support
   → Efficient partial content delivery
```

---

## Assumptions & Design Decisions

### Sensitivity Analysis
- Content sensitivity is determined using rule-based analysis via FFmpeg metadata extraction
- Videos are classified as **Safe** or **Flagged** based on processing results
- Flagged videos are queued for admin review before being made fully available
- This approach demonstrates the complete pipeline architecture; a production system could integrate a third-party AI moderation API

### Authentication
- JWT tokens stored in localStorage
- Token expiry set to 7 days
- Admin account is pre-seeded and cannot be registered through the public form
- Role changes require admin approval

### Multi-Tenancy
- Single database with tenant ID field on all documents
- All queries are scoped by tenantId for data isolation
- Admin bypasses tenant scoping to access all data

### File Storage
- Videos stored locally in `backend/uploads/videos/`
- In production, cloud storage (AWS S3) would be recommended
- Render.com persistent disk used for deployment

### Real-Time Communication
- Socket.io used for upload progress and processing status
- Events: `upload:progress`, `processing:start`, `processing:complete`
- Each upload room identified by unique upload session ID

---

## Deployment

### Backend (Render)
- Service: Web Service
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

### Frontend (Vercel)
- Root Directory: `frontend`
- Framework: Vite
- Environment Variable: `VITE_API_URL=<render-backend-url>/api`

---

## Demo

> **Note:** A full demo video is provided showing the complete workflow on localhost including all three user roles, video upload with real-time progress, content sensitivity analysis, and video streaming.

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@vaultstream.com | Admin123! |
| Editor | ns1@antigravity.local | password123 |
| Viewer | ns2@antigravity.local | password123 |

---

## License

This project was built as part of a full-stack development assignment.
