import fs from 'fs';
import path from 'path';
import Video from '../models/Video.js';

// In-memory cache to store resolved video paths by ID.
// This prevents redundant, slow MongoDB Atlas round-trips on every range/chunk request.
const videoPathCache = new Map();

// ─────────────────────────────────────────────
// @desc    Stream a video using HTTP Range Requests
// @route   GET /api/videos/stream/:id
// @access  Public
// ─────────────────────────────────────────────
export const streamVideo = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    let videoPath = videoPathCache.get(videoId);

    if (!videoPath) {
      // 1. Look up the video document in MongoDB (only done once per video lifetime/restart)
      const video = await Video.findById(videoId);

      if (!video) {
        res.status(404);
        return next(new Error('Video not found'));
      }

      // 2. Resolve the file path on disk
      videoPath = path.resolve(video.path);
      
      // Cache the resolved path
      videoPathCache.set(videoId, videoPath);
    }

    // 3. Check that the file actually exists on disk
    if (!fs.existsSync(videoPath)) {
      res.status(404);
      // Remove stale path from cache
      videoPathCache.delete(videoId);
      return next(new Error('Video file not found on server'));
    }

    // 4. Get the total file size
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    // 5. Parse the Range header from the browser
    //    Example: "bytes=0-999999"
    const range = req.headers.range;

    if (!range) {
      // No Range header — send the full file (fallback for download)
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(videoPath).pipe(res);
      return;
    }

    // 6. Parse the Range header into start/end byte positions
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);

    // If end is not specified, let the browser request the remaining file (fileSize - 1)
    // rather than throttling to a tiny 1MB chunk which triggers excessive HTTP requests.
    // The browser's native video player will naturally throttle consumption via TCP backpressure.
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    // 7. Validate that the range is within bounds
    if (start >= fileSize || end >= fileSize) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      return next(new Error('Requested range is out of bounds'));
    }

    const chunkSize = end - start + 1;

    // 8. Send 206 Partial Content response with proper headers
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
      // Allow caching for better performance on repeat views
      'Cache-Control': 'public, max-age=3600',
    });

    // 9. Stream only the requested chunk — memory efficient, no buffering
    const fileStream = fs.createReadStream(videoPath, { start, end });
    fileStream.pipe(res);

    // 10. Handle stream errors (e.g., file deleted during stream)
    fileStream.on('error', (err) => {
      console.error(`Stream error for video ${req.params.id}:`, err.message);
      if (!res.headersSent) {
        res.status(500);
        next(new Error('Stream interrupted'));
      }
    });

  } catch (error) {
    next(error);
  }
};

