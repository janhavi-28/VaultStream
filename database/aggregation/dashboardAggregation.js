import { Video } from '../models/Video.js';
import { ROLES } from '../constants/roles.js';

export const getDashboardStats = async (userId, role) => {
  const matchStage = role === ROLES.ADMIN ? {} : { userId };
  
  return Video.aggregate([
    { $match: matchStage },
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalSize: { $sum: '$size' }
    }}
  ]);
};
