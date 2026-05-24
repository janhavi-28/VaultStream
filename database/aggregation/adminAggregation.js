import { User } from '../models/User.js';

export const getAdminUserStats = async () => {
  return User.aggregate([
    { $group: {
      _id: '$role',
      count: { $sum: 1 }
    }}
  ]);
};
