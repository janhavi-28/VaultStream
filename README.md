# VaultStream 🎬

> A full-stack, multi-tenant video management and streaming platform with real-time processing, automated content sensitivity analysis, and role-based access control.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Roles & Permissions](#user-roles--permissions)
- [Multi-Tenant Architecture](#multi-tenant-architecture)
- [Video Processing Pipeline](#video-processing-pipeline)
- [Real-Time Events](#real-time-events)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)
- [Demo Credentials](#demo-credentials)

---

## Overview

VaultStream is a comprehensive video management platform for organisations (tenants) to upload, process, and stream video content securely. Videos are automatically analysed for content sensitivity and classified as **Safe** or **Flagged** immediately after upload. Administrators have a full control panel to review flagged content, manage users across all organisations, monitor system health, and configure platform-wide settings.

The platform supports three distinct user roles — **Admin**, **Editor**, and **Viewer** — each with a tailored dashboard experience, enforced at both the frontend route level and backend middleware level.

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime environment |
| Express.js | 5.x | REST API framework |
| MongoDB + Mongoose | 9.x | Database and ODM |
| Socket.io | 4.x | Real-time progress events |
| JSON Web Tokens | 9.x | Stateless authentication |
| Multer | 2.x | Multipart video uploads |
| fluent-ffmpeg | 2.x | Video metadata extraction |
| bcrypt | 6.x | Password hashing |
| Helmet + CORS | latest | Security middleware |
| express-rate-limit | 8.x | API rate limiting |
| express-validator | 7.x | Request validation |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8.x | Build tool and dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| React Router | 7.x | Client-side routing |
| Axios | 1.x | HTTP client with interceptors |
| Socket.io Client | 4.x | Real-time event consumption |
| Framer Motion | 12.x | Page and component animations |
| Lucide React | latest | Icon library |
| react-hot-toast | 2.x | Toast notifications |

### Infrastructure

| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Render | Backend API hosting (with persistent disk) |
| Vercel | Frontend hosting |

---

## Features

### All Users
- Public video library (`/browse`) — no login required
- Dark/light theme toggle (`Ctrl+J`)
- Command palette (`Ctrl+K`) for quick navigation
- Offline detection banner
- Real-time in-app notification centre
- Fully responsive layout with bottom navigation on mobile

### Viewer
- Personal video library scoped to their organisation
- Full-featured video player with playback speed controls, seeking, and volume
- Help & FAQ page

### Editor
- Drag-and-drop video upload with multi-file queue management
- Real-time upload and processing progress bars via Socket.io
- Full video library with search, filters, sort, and pagination
- View sensitivity status (Safe / Flagged) for each upload

### Admin
- **Dashboard** — system-wide stats: total users, videos, tenants, flagged content
- **User Management** — view, promote, demote, and delete users across all organisations
- **Tenant Management** — create, view, and delete organisations (tenants)
- **Video Management** — global library with full metadata and status visibility
- **Moderation** — review flagged videos; approve or reject with one click
- **Processing Dashboard** — live activity feed, processing queue, and real-time progress bars
- **Analytics Dashboard** — view trend charts (bar and line) for system usage
- **System Settings** — platform-wide configuration panel

---

## Project Structure

```
VaultStream/
├── backend/                        # Node.js + Express API
│   └── src/
│       ├── config/                 # MongoDB connection
│       ├── controllers/            # Route handler logic
│       │   ├── adminController.js
│       │   ├── authController.js
│       │   ├── dashboardController.js
│       │   ├── notificationController.js
│       │   ├── streamController.js
│       │   └── videoController.js
│       ├── middleware/             # Auth, tenant, upload, error handling
│       ├── models/                 # Mongoose document models
│       ├── routes/                 # Express route definitions
│       ├── services/
│       │   └── videoProcessor.js  # Async sensitivity analysis pipeline
│       ├── sockets/
│       │   └── socketHandler.js   # Socket.io event emitters
│       └── utils/
│           └── jwt.js             # Token generation/verification
│
├── frontend/                       # React + Vite SPA
│   └── src/
│       ├── api/                    # Axios instance + interceptors
│       ├── components/
│       │   ├── admin/              # Admin-specific charts, tables, cards
│       │   ├── auth/               # ProtectedRoute, RoleGuard, AuthGateModal
│       │   ├── feedback/           # Toast, NotificationCenter, OfflineBanner
│       │   ├── filters/            # SearchBar, FilterDrawer, Pagination
│       │   ├── upload/             # UploadDropzone, UploadQueue, UploadCard
│       │   └── video/              # VideoPlayer
│       ├── context/                # AuthContext, SocketContext, TenantContext,
│       │                           # NotificationContext, UploadQueueContext
│       ├── hooks/                  # useUploadQueue, useVideoLibraryFilters,
│       │                           # useVideoPlayer, useVideoValidation, etc.
│       ├── layouts/                # AdminLayout, EditorLayout, ViewerLayout
│       └── pages/
│           ├── admin/              # AdminDashboard, ManageUsers, Moderation, etc.
│           ├── editor/             # EditorDashboard, Library, UploadVideo
│           └── viewer/             # MyVideos, WatchVideo, Help
│
└── database/                       # Shared DB layer (schemas, seeders, migrations)
    ├── aggregation/                # MongoDB aggregation pipelines
    ├── config/                     # Mongoose configuration and indexes
    ├── constants/                  # Roles, statuses
    ├── migrations/                 # Schema migration scripts
    ├── models/                     # Mongoose model wrappers
    ├── repositories/               # Data access layer
    ├── schemas/                    # Mongoose schema definitions
    ├── seeders/                    # Admin, role, demo data seeders
    └── transactions/               # Multi-document MongoDB transactions
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB Atlas** account (or a local MongoDB instance)
- **FFmpeg** installed and available on your system `PATH`
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### 1. Clone the repository

```bash
git clone https://github.com/janhavi-28/VaultStream.git
cd VaultStream
```

### 2. Install all dependencies (monorepo shortcut)

```bash
npm run install:all
```

This runs `npm install` in the root, `frontend/`, and `backend/` directories in one command.

### 3. Configure environment variables

**Backend** — create `backend/.env` (see [Environment Variables](#environment-variables) for all options):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/vaultstream?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@vaultstream.com
ADMIN_PASSWORD=Admin123!
CLIENT_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Seed the database

```bash
node backend/seedTenants.js
```

This creates three demo organisations and an admin account using the credentials from your `.env`:

| Organisation | Slug |
|---|---|
| Northstar Media | `northstar-media` |
| Acme Corp | `acme-corp` |
| Blue Studios | `blue-studios` |

### 5. Start the development servers

```bash
# Start both frontend and backend simultaneously (from the root)
npm run dev
```

Or start them individually:

```bash
# Backend  →  http://localhost:5000
cd backend && npm run dev

# Frontend →  http://localhost:5173
cd frontend && npm run dev
```

---

## Environment Variables

### Backend `backend/.env`

| Variable | Description | Required | Default |
|---|---|---|---|
| `PORT` | API server port | No | `5000` |
| `NODE_ENV` | `development` or `production` | Yes | — |
| `MONGO_URI` | MongoDB Atlas connection string | Yes | — |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) | Yes | — |
| `JWT_EXPIRES_IN` | Token lifespan (e.g. `7d`, `24h`) | Yes | `7d` |
| `ADMIN_EMAIL` | Email for the seeded admin account | Yes | — |
| `ADMIN_PASSWORD` | Password for the seeded admin account | Yes | — |
| `CLIENT_URL` | Comma-separated frontend origin(s) for CORS | Yes | — |

### Frontend `frontend/.env`

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Full base URL of the backend API | Yes |
| `VITE_SOCKET_URL` | Base URL for the Socket.io connection | Yes |

---

## API Reference

All routes are prefixed with `/api`.

### Auth

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user (editor or viewer) | Public |
| `POST` | `/auth/login` | Authenticate and receive a JWT | Public |
| `GET` | `/auth/me` | Get the authenticated user's profile | Private |
| `GET` | `/tenants` | List all organisations (for registration) | Public |

### Videos

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/videos/upload` | Upload a video (triggers processing pipeline) | Editor, Admin |
| `GET` | `/videos` | List videos scoped to the user's tenant | Editor, Admin |
| `GET` | `/videos/:id` | Get a single video by ID | Private |
| `DELETE` | `/videos/:id` | Delete a video | Editor (own), Admin |

### Streaming

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/videos/stream/:id` | Stream video via HTTP range requests | Any authenticated |

### Dashboard

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Summary stats for the current user's tenant | Private |

### Notifications

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/notifications` | Fetch all notifications for the current user | Private |
| `PUT` | `/notifications/:id/read` | Mark a notification as read | Private |

### Admin

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/admin/stats` | Platform-wide statistics | Admin |
| `GET` | `/admin/users` | List all users | Admin |
| `PUT` | `/admin/users/:id/role` | Update a user's role | Admin |
| `DELETE` | `/admin/users/:id` | Delete a user | Admin |
| `GET` | `/admin/tenants` | List all organisations | Admin |
| `POST` | `/admin/tenants` | Create a new organisation | Admin |
| `DELETE` | `/admin/tenants/:id` | Delete an organisation | Admin |
| `GET` | `/admin/videos` | Global video library | Admin |
| `PUT` | `/admin/videos/:id/moderate` | Approve or reject a flagged video | Admin |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns API status, uptime, and timestamp |

---

## User Roles & Permissions

| Permission | Viewer | Editor | Admin |
|---|:---:|:---:|:---:|
| Watch videos | ✅ | ✅ | ✅ |
| Browse public library | ✅ | ✅ | ✅ |
| Upload videos | — | ✅ | ✅ |
| Delete own videos | — | ✅ | ✅ |
| View personal video library | ✅ | ✅ | ✅ |
| Manage all users | — | — | ✅ |
| Manage all tenants | — | — | ✅ |
| View global video library | — | — | ✅ |
| Moderate flagged content | — | — | ✅ |
| View processing dashboard | — | — | ✅ |
| View analytics | — | — | ✅ |
| Configure system settings | — | — | ✅ |

> **Note:** The Admin account is seeded directly from the environment variables and is not registerable through the public sign-up form. Editor and Viewer accounts are self-service.

---

## Multi-Tenant Architecture

VaultStream uses a **shared database, scoped queries** model. Every document that belongs to an organisation (users, videos) carries a `tenantId` field. All API queries automatically filter by the requesting user's `tenantId` via the `tenantMiddleware`.

```
Organisation A (Northstar Media)
  └── Editors → can only see/upload Northstar Media videos
  └── Viewers → can only watch Northstar Media videos

Organisation B (Acme Corp)
  └── Editors → completely isolated from Organisation A data
  └── Viewers → completely isolated from Organisation A data

Admin (global)
  └── Bypasses tenant scoping → sees all organisations and all videos
```

Tenant scoping is enforced both in the backend middleware (`tenantMiddleware.js`) and carried through all repository queries, making cross-tenant data leakage impossible by default.

---

## Video Processing Pipeline

After a file is received by Multer, the following pipeline runs synchronously (to support serverless environments like Vercel) before the API responds:

```
1. Upload
   └── Multer receives the multipart file
   └── Unique filename generated (UUID)
   └── Video metadata saved to MongoDB with status: "uploading"
   └── Socket event: upload:started → emitted to uploader

2. Processing begins
   └── Status updated to "processing" in MongoDB
   └── Socket event: processing:started → emitted to uploader

3. Progress simulation (5 steps)
   └── Delay: 2000ms per step (local) / 50ms per step (serverless)
   └── Socket event: processing:progress → emitted at each step with percentage

4. Sensitivity analysis (rule-based)
   ├── FLAGGED if: file size > 500MB
   ├── FLAGGED if: file format is not .mp4 or .mov
   ├── FLAGGED if: title/description/filename contains restricted keywords
   │              (hack, exploit, nsfw, illegal, violence, scam)
   └── SAFE otherwise

5. Finalisation
   └── Status updated to "completed", sensitivity set to "safe" or "flagged"
   └── Socket event: processing:completed → emitted with final result
   └── In-app notification created for the uploader
```

Flagged videos are queued for admin review in the Moderation panel and remain visible to the uploader with their flag status clearly indicated.

---

## Real-Time Events

VaultStream uses Socket.io for bidirectional real-time communication. The server emits the following events to per-user rooms (identified by `userId`):

| Event | Payload | Description |
|---|---|---|
| `upload:started` | `{ videoId, title, filename, size }` | Fired immediately after file is accepted |
| `processing:started` | `{ videoId, title }` | Fired when the analysis pipeline begins |
| `processing:progress` | `{ videoId, title, percent, message }` | Fired at each of 5 processing steps |
| `processing:completed` | `{ videoId, title, sensitivity, status }` | Fired when analysis is done |
| `notification:new` | `{ message, type, ... }` | Fired when a new in-app notification is created |

The frontend `SocketContext` manages the connection lifecycle, joins the user's room on login, and distributes events to consuming components via React context.

---

## Deployment

### Backend → Render

A `render.yaml` is included at the project root for one-click Render deployment.

1. Create a new **Web Service** on [render.com](https://render.com), connected to this repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Add a **Persistent Disk** (mount path: `/opt/render/project/src/backend/src/uploads`, 1 GB minimum) for video storage.
5. Add the following environment variables in the Render dashboard:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | *(your Atlas URI)* |
   | `JWT_SECRET` | *(strong random string)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ADMIN_EMAIL` | *(your admin email)* |
   | `ADMIN_PASSWORD` | *(your admin password)* |
   | `CLIENT_URL` | *(your Vercel frontend URL, added after step below)* |

### Frontend → Vercel

1. Import the repository into [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add environment variables:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://<your-render-service>.onrender.com` |

5. Deploy, then go back to Render and set `CLIENT_URL` to your Vercel deployment URL.

> **Health check:** Once deployed, visit `https://<your-render-service>.onrender.com/api/health` to confirm the backend is live.

---

## Design Decisions

### Sensitivity Analysis
Content sensitivity is determined by a rule-based pipeline that checks file size, file format, and keyword matching against the video's title, description, and filename. This approach provides a fully working, zero-dependency moderation workflow. A production system could swap or extend this with a third-party AI moderation API (e.g. AWS Rekognition, Google Video Intelligence) with no changes to the surrounding pipeline architecture.

### Authentication
JWT tokens are stored in `localStorage` and attached to every request via an Axios request interceptor. Token expiry defaults to 7 days. The admin account is seeded directly from environment variables and intentionally excluded from public registration to prevent privilege escalation.

### Multi-Tenancy Model
A single database with `tenantId` on all scoped documents was chosen for simplicity and cost-efficiency. All queries are filtered by the middleware before reaching controllers. The admin role bypasses tenant scoping globally, implemented as a single conditional in `tenantMiddleware.js`.

### File Storage
Videos are stored on the local filesystem (`backend/src/uploads/videos/`), served statically by Express, and streamed via HTTP range requests. Render's persistent disk provides durability in production. For a high-availability setup, this would be replaced with object storage (AWS S3 / Cloudflare R2) and a CDN.

### Real-Time Architecture
Socket.io rooms are keyed by `userId`. This means events are delivered only to the user who triggered an action (e.g. their own upload progress), preventing event bleed-over between users or tenants.

### Frontend Code Splitting
All page-level components are lazy-loaded via `React.lazy()` and wrapped in `<Suspense>`. This keeps the initial bundle small and loads role-specific code only when the user navigates to that section.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@vaultstream.com` | `Admin123!` |
| Editor | `test1234@gmail.com` | `password123` |
| Viewer | `test123@gmail.com` | `password123` |

> A full demo walkthrough video (`sample_demo.mp4`) is included in the repository root, covering the complete workflow across all three roles — upload, real-time processing, sensitivity flagging, moderation, and streaming — Vercel for Frontend and Render for Backend.
