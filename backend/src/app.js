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
// On Vercel experimental services, frontend & backend share the same domain.
// Same-origin requests have no Origin header → always allowed.
// VERCEL_URL is auto-set by Vercel (e.g. vaultstream.vercel.app).
const buildAllowedOrigins = () => {
  const origins = ['http://localhost:5173', 'http://localhost:3000'];

  if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(',').forEach((o) => origins.push(o.trim()));
  }
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  return origins;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = buildAllowedOrigins();
    // Allow requests with no origin, or if origin is in allowed list, or if it is a Vercel domain (*.vercel.app)
    if (
      !origin || 
      allowed.includes(origin) || 
      origin.endsWith('.vercel.app') ||
      (typeof origin === 'string' && origin.includes('.vercel.app'))
    ) {
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
app.options(/(.*)/, cors(corsOptions)); // pre-flight for all routes
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
