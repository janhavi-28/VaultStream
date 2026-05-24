import express from 'express';
import { uploadVideo, getVideos, getVideoById, getPublicVideos, getPublicVideoById, deleteVideo, getAdminAllVideos, updateAdminVideo, deleteAdminVideo, getFlaggedVideos, approveVideo } from '../controllers/videoController.js';
import { streamVideo } from '../controllers/streamController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { resolveTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// @route   GET /api/videos/admin/all
// @route   PUT /api/videos/admin/:id
// @route   DELETE /api/videos/admin/:id
// @access  Private — Admin only
router.get('/admin/all', protect, authorize('admin'), getAdminAllVideos);
router.get('/admin/flagged', protect, authorize('admin'), getFlaggedVideos);
router.put('/admin/:id/approve', protect, authorize('admin'), approveVideo);
router.put('/admin/:id', protect, authorize('admin'), updateAdminVideo);
router.delete('/admin/:id', protect, authorize('admin'), deleteAdminVideo);

// @route   GET /api/videos/stream/:id
// @access  Public
router.get('/stream/:id', streamVideo);

// @route   POST /api/videos/upload
// @access  Private — JWT required, tenant scoped
router.post('/upload', protect, resolveTenant, upload.single('video'), uploadVideo);

// @route   GET /api/videos/public
// @access  Public
router.get('/public', getPublicVideos);

// @route   GET /api/videos/public/:id
// @access  Public
router.get('/public/:id', getPublicVideoById);

// @route   GET /api/videos
// @access  Private — only see your tenant's videos
router.get('/', protect, resolveTenant, getVideos);

// @route   GET /api/videos/:id
// @access  Private — only if video belongs to your tenant
router.get('/:id', protect, resolveTenant, getVideoById);

// @route   DELETE /api/videos/:id
// @access  Private — only if video belongs to your tenant
router.delete('/:id', protect, resolveTenant, deleteVideo);

export default router;
