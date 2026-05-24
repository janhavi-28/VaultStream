import mongoose from 'mongoose';
import { videoRepository } from '../repositories/videoRepository.js';
import { analyticsRepository } from '../repositories/analyticsRepository.js';

export const executeDeleteTransaction = async (videoId, userId, role) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const deleted = await videoRepository.deleteById(videoId, userId, role, session);
    if (deleted) {
      await analyticsRepository.updateUserStats(deleted.userId, { totalUploads: -1 });
    }
    
    await session.commitTransaction();
    return deleted;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
