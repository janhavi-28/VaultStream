import { Video } from '../models/Video.js';
import { VIDEO_STATUSES } from '../constants/statuses.js';

export const migrateStatuses = async () => {
  try {
    await Video.updateMany(
      { status: { $nin: Object.values(VIDEO_STATUSES) } },
      { $set: { status: VIDEO_STATUSES.PROCESSING } }
    );
    console.log('Statuses normalized successfully.');
  } catch (error) {
    console.error('Status normalization failed:', error);
  }
};
