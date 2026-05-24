import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { notFound } from './middleware/notFoundMiddleware.js';

dotenv.config();

const app = express();

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow requests from the frontend. In production, set CLIENT_URL in env vars.
// e.g. CLIENT_URL=https://vaultstream.vercel.app
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
};

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // allow media loading
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pre-flight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded videos statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api', apiRoutes);

// Handle 404
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
