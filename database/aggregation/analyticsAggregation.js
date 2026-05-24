import { Analytics } from '../models/Analytics.js';

export const getSystemWideAnalytics = async () => {
  return Analytics.aggregate([
    { $group: {
      _id: null,
      totalUploads: { $sum: '$totalUploads' },
      totalFlagged: { $sum: '$totalFlagged' },
      avgProcessingTime: { $avg: '$processingTime' }
    }}
  ]);
};
