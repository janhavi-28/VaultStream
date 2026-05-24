import mongoose from 'mongoose';
import { videoRepository } from '../repositories/videoRepository.js';
import { analyticsRepository } from '../repositories/analyticsRepository.js';

export const executeUploadTransaction = async (videoData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const video = await videoRepository.create(videoData, session);
    await analyticsRepository.updateUserStats(userId, { totalUploads: 1 });
    
    await session.commitTransaction();
    return video;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
