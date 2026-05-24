import Video from '../models/Video.js';
import { buildTenantFilter } from '../middleware/tenantMiddleware.js';

// ─────────────────────────────────────────────
// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
// ─────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);

    // Run all aggregations in parallel for maximum performance
    const [sensitivityStats, statusStats, storageResult, uploadTrend] =
      await Promise.all([

        // 1. Count by sensitivity (safe / flagged / pending)
        Video.aggregate([
          { $match: tenantFilter },
          {
            $group: {
              _id: '$sensitivity',
              count: { $sum: 1 },
            },
          },
        ]),

        // 2. Count by status (uploading / processing / completed / failed)
        Video.aggregate([
          { $match: tenantFilter },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),

        // 3. Total storage used (sum of all file sizes in bytes)
        Video.aggregate([
          { $match: tenantFilter },
          {
            $group: {
              _id: null,
              totalBytes: { $sum: '$size' },
              totalVideos: { $sum: 1 },
            },
          },
        ]),

        // 4. Upload trend — count per day for the last 7 days
        Video.aggregate([
          {
            $match: {
              ...tenantFilter,
              createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    // ── Reshape sensitivity results into a clean object ──
    const sensitivityMap = { safe: 0, flagged: 0, pending: 0 };
    sensitivityStats.forEach(({ _id, count }) => {
      if (_id in sensitivityMap) sensitivityMap[_id] = count;
    });

    // ── Reshape status results ──
    const statusMap = { uploading: 0, processing: 0, completed: 0, failed: 0 };
    statusStats.forEach(({ _id, count }) => {
      if (_id in statusMap) statusMap[_id] = count;
    });

    // ── Storage values ──
    const totalBytes = storageResult[0]?.totalBytes || 0;
    const totalVideos = storageResult[0]?.totalVideos || 0;

    res.status(200).json({
      success: true,
      stats: {
        // Counts
        totalVideos,
        safeVideos: sensitivityMap.safe,
        flaggedVideos: sensitivityMap.flagged,
        pendingVideos: sensitivityMap.pending,
        processingVideos: statusMap.processing,
        completedVideos: statusMap.completed,
        failedVideos: statusMap.failed,

        // Storage
        storage: {
          totalBytes,
          totalMB: parseFloat((totalBytes / (1024 * 1024)).toFixed(2)),
          totalGB: parseFloat((totalBytes / (1024 * 1024 * 1024)).toFixed(3)),
        },

        // Upload trend (last 7 days)
        uploadTrend: uploadTrend.map(({ _id, count }) => ({
          date: _id,
          uploads: count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get recent uploads
// @route   GET /api/dashboard/recent
// @access  Private
// ─────────────────────────────────────────────
export const getRecentUploads = async (req, res, next) => {
  try {
    const tenantFilter = buildTenantFilter(req);

    // How many to return — default 10, max 50
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const videos = await Video.find(tenantFilter)
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title originalName size status sensitivity createdAt uploadedBy');

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    next(error);
  }
};
