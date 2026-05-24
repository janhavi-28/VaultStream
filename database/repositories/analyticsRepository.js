import { Analytics } from '../models/Analytics.js';

export const analyticsRepository = {
  updateUserStats: async (userId, statsUpdates) => {
    return Analytics.findOneAndUpdate(
      { userId },
      { $inc: statsUpdates },
      { upsert: true, new: true }
    );
  },
  getUserStats: async (userId) => Analytics.findOne({ userId })
};
