import express from 'express';
import { getDashboardStats, getRecentUploads } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { resolveTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// All dashboard routes require login + tenant resolution
router.use(protect, resolveTenant);

// @route   GET /api/dashboard/stats
// @desc    Get aggregated video statistics for the dashboard
// @access  Private
router.get('/stats', getDashboardStats);

// @route   GET /api/dashboard/recent
// @desc    Get recent uploads (supports ?limit=N, max 50)
// @access  Private
router.get('/recent', getRecentUploads);

export default router;
