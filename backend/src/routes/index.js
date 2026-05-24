import express from 'express';
import authRoutes from './authRoutes.js';
import videoRoutes from './videoRoutes.js';
import streamRoutes from './streamRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/videos/stream', streamRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

/**
 * @route GET /api/health
 * @desc Check API health status
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'VaultStream API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
