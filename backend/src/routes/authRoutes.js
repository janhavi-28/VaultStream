import express from 'express';
import { registerUser, loginUser, getMe, changePassword, upgradeToEditor, downgradeToViewer, getPublicTenants } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route GET /api/auth/tenants
router.get('/tenants', getPublicTenants);

// @route POST /api/auth/register
router.post('/register', registerUser);

// @route POST /api/auth/login
router.post('/login', loginUser);

// @route GET /api/auth/me
router.get('/me', protect, getMe);

// @route PUT /api/auth/password
router.put('/password', protect, changePassword);

// @route PUT /api/auth/upgrade
router.put('/upgrade', protect, upgradeToEditor);

// @route PUT /api/auth/downgrade
router.put('/downgrade', protect, downgradeToViewer);

export default router;
