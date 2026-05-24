import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initializeSockets } from './sockets/socketHandler.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// When deployed on Vercel with experimentalServices, the backend is mounted at
// /_/backend — so socket.io must also listen on that sub-path.
// VERCEL_URL is automatically set by Vercel in the environment.
const isVercel = !!process.env.VERCEL_URL || process.env.NODE_ENV === 'production';
const socketPath = isVercel ? '/_/backend/socket.io' : '/socket.io';

// Initialize Socket.io
const io = new Server(server, {
  path: socketPath,
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

initializeSockets(io);

// Make io accessible in all controllers via req.app.get('io')
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Socket.io path: ${socketPath}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
