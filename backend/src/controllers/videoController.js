import Video from '../models/Video.js';
import {
  emitUploadStarted,
} from '../sockets/socketHandler.js';
import { processVideoAsync } from '../services/videoProcessor.js';
import { buildTenantFilter } from '../middleware/tenantMiddleware.js';
import Notification from '../models/Notification.js';
import { emitNotification } from '../sockets/socketHandler.js';

// ─────────────────────────────────────────────
// @desc    Upload a new video
// @route   POST /api/videos/upload
// @access  Private
// ─────────────────────────────────────────────
export const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('Please upload a video file'));
    }

    const { title, description } = req.body;

    if (!title) {
      res.status(400);
      return next(new Error('Video title is required'));
    }

    // Save video metadata, scoped to the user's tenant
    const video = await Video.create({
      title,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadedBy: req.user._id,
      tenantId: req.tenantId || null, // Attach tenant scope
      status: 'uploading',
      sensitivity: 'pending',
    });

    const io = req.app.get('io');
    const userId = req.user._id.toString();

    emitUploadStarted(io, userId, {
      videoId: video._id,
      title: video.title,
      filename: video.filename,
      size: video.size,
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully. Processing started.',
      video,
    });

    // Fire-and-forget: process in background
    processVideoAsync(io, userId, video._id);

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get all videos (tenant-scoped)
// @route   GET /api/videos
// @access  Private
// ─────────────────────────────────────────────
export const getVideos = async (req, res, next) => {
  try {
    // Build a filter that locks results to the current user's tenant
    const filter = buildTenantFilter(req);

    const videos = await Video.find(filter)
      .populate('uploadedBy', 'name email avatar')
      .populate('tenantId', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get single video by ID (tenant-scoped)
// @route   GET /api/videos/:id
// @access  Private
// ─────────────────────────────────────────────
export const getVideoById = async (req, res, next) => {
  try {
    // Build filter with the specific ID AND tenant scope
    const filter = buildTenantFilter(req, { _id: req.params.id });

    const video = await Video.findOne(filter)
      .populate('uploadedBy', 'name email avatar');

    if (!video) {
      // Return 404 whether it doesn't exist OR belongs to another tenant
      res.status(404);
      return next(new Error('Video not found'));
    }

    res.status(200).json({
      success: true,
      video,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get all public videos (NO AUTH REQUIRED)
// @route   GET /api/videos/public
// @access  Public
// ─────────────────────────────────────────────
export const getPublicVideos = async (req, res, next) => {
  try {
    // Only return videos that are safe and fully processed
    // Note: In a real system, you might filter by a specific "demo" tenant ID here
    const filter = {
      status: 'completed',
      sensitivity: 'safe'
    };

    const videos = await Video.find(filter)
      .populate('uploadedBy', 'name avatar') // Avoid sending sensitive info like email
      .sort({ createdAt: -1 })
      .limit(12); // Limit for the landing page

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get single public video by ID (NO AUTH REQUIRED)
// @route   GET /api/videos/public/:id
// @access  Public
// ─────────────────────────────────────────────
export const getPublicVideoById = async (req, res, next) => {
  try {
    const filter = {
      _id: req.params.id,
      status: 'completed',
      sensitivity: 'safe'
    };

    const video = await Video.findOne(filter)
      .populate('uploadedBy', 'name avatar');

    if (!video) {
      res.status(404);
      return next(new Error('Video not found or is not publicly available'));
    }

    res.status(200).json({
      success: true,
      video,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Delete video by ID
// @route   DELETE /api/videos/:id
// @access  Private
// ─────────────────────────────────────────────
import fs from 'fs/promises';
import path from 'path';

export const deleteVideo = async (req, res, next) => {
  try {
    const filter = buildTenantFilter(req, { _id: req.params.id });
    const video = await Video.findOne(filter);

    if (!video) {
      res.status(404);
      return next(new Error('Video not found or unauthorized'));
    }

    // Explicit Role Check: Editors can strictly ONLY delete their own uploaded videos
    if (req.user.role === 'editor' && video.uploadedBy.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Unauthorized: Editors can only delete their own uploaded videos'));
    }

    // Try to delete the file from disk if it exists
    if (video.path) {
      try {
        await fs.unlink(video.path);
      } catch (err) {
        console.error(`Could not delete file ${video.path}:`, err.message);
      }
    }

    await video.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get all videos globally (Admin only)
// @route   GET /api/videos/admin/all
// @access  Private/Admin
// ─────────────────────────────────────────────
export const getAdminAllVideos = async (req, res, next) => {
  try {
    // Proactive Migration: Fix any videos with legacy userId instead of uploadedBy
    // Use updateOne to avoid Mongoose validation errors on stale/corrupt documents
    const legacyVideos = await Video.find({ uploadedBy: { $exists: false }, userId: { $exists: true } });
    if (legacyVideos.length > 0) {
      console.log(`Migrating ${legacyVideos.length} legacy videos with userId to uploadedBy...`);
      for (const v of legacyVideos) {
        await Video.updateOne({ _id: v._id }, { $set: { uploadedBy: v.get('userId') } });
      }
    }

    // Proactive Migration: Sync tenantId from uploader if missing on video
    const noTenantVideos = await Video.find({ tenantId: null }).populate('uploadedBy');
    for (const v of noTenantVideos) {
      if (v.uploadedBy && v.uploadedBy.tenantId) {
        await Video.updateOne({ _id: v._id }, { $set: { tenantId: v.uploadedBy.tenantId } });
      }
    }

    const videos = await Video.find()
      .populate('uploadedBy', 'name email avatar tenantId')
      .populate('tenantId', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Update video globally (Admin only)
// @route   PUT /api/videos/admin/:id
// @access  Private/Admin
// ─────────────────────────────────────────────
export const updateAdminVideo = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      res.status(404);
      return next(new Error('Video not found'));
    }

    if (title) video.title = title;
    if (description !== undefined) video.description = description;

    const updatedVideo = await video.save();

    res.status(200).json({
      success: true,
      video: updatedVideo,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Delete video globally (Admin only)
// @route   DELETE /api/videos/admin/:id
// @access  Private/Admin
// ─────────────────────────────────────────────
export const deleteAdminVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      res.status(404);
      return next(new Error('Video not found'));
    }

    if (video.path) {
      try {
        await fs.unlink(video.path);
      } catch (err) {
        console.error(`Could not delete file ${video.path}:`, err.message);
      }
    }

    await video.deleteOne();

    // Create a notification for the uploader
    const notification = await Notification.create({
      userId: video.uploadedBy,
      title: 'Video Deleted',
      message: `Your video "${video.title}" has been deleted by an administrator.`,
      type: 'warning',
    });

    const io = req.app.get('io');
    if (io) {
      emitNotification(io, video.uploadedBy.toString(), notification);
    }

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully by admin',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get all flagged videos (Moderation queue)
// @route   GET /api/videos/admin/flagged
// @access  Private/Admin
// ─────────────────────────────────────────────
export const getFlaggedVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({ sensitivity: 'flagged' })
      .populate('uploadedBy', 'name email')
      .populate('tenantId', 'name slug')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Approve a flagged video (mark as safe)
// @route   PUT /api/videos/admin/:id/approve
// @access  Private/Admin
// ─────────────────────────────────────────────
export const approveVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      res.status(404);
      return next(new Error('Video not found'));
    }

    video.sensitivity = 'safe';
    await video.save();

    // Notify uploader that their video was approved
    if (video.uploadedBy) {
      const notification = await Notification.create({
        userId: video.uploadedBy,
        title: 'Video Approved',
        message: `Your video "${video.title}" has been reviewed and approved by a moderator.`,
        type: 'success',
      });
      const io = req.app.get('io');
      if (io) {
        emitNotification(io, video.uploadedBy.toString(), notification);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Video approved and marked as safe',
    });
  } catch (error) {
    next(error);
  }
};
