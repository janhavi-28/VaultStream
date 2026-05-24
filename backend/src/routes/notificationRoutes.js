import express from 'express';
import { getNotifications, markAsRead, clearNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/', getNotifications);
router.put('/read', markAsRead);
router.delete('/', clearNotifications);

export default router;
