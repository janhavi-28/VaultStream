import { Video } from '../models/Video.js';

export const migrateVideoDurations = async () => {
  try {
    await Video.updateMany({ duration: { $exists: false } }, { $set: { duration: 0 } });
    console.log('Video durations migrated successfully.');
  } catch (error) {
    console.error('Duration migration failed:', error);
  }
};
