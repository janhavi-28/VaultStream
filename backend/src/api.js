import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import app from './app.js';

// Connect to MongoDB on each cold start (cached after first call)
connectDB();

// Export the Express app — Vercel's @vercel/node wraps this as a serverless function
export default app;
