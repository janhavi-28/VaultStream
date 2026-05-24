import express from 'express';
import { streamVideo } from '../controllers/streamController.js';

const router = express.Router();

// @route   GET /api/stream/:id
// @desc    Stream a video using HTTP Range Requests (supports seeking)
// @access  Public
router.get('/:id', streamVideo);

export default router;
