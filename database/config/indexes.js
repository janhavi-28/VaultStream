import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Session } from '../models/Session.js';

export const setupIndexes = async () => {
  try {
    // Explicitly sync indexes (Mongoose usually handles this on startup, but this is for migrations/safety)
    await User.syncIndexes();
    await Video.syncIndexes();
    await Session.syncIndexes();
    console.log('Database indexes synchronized successfully.');
  } catch (err) {
    console.error('Error syncing indexes:', err);
  }
};
