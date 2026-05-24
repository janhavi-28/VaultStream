import { ProcessingLog } from '../models/ProcessingLog.js';

export const processingRepository = {
  createLog: async (data) => ProcessingLog.create(data),
  findByVideoId: async (videoId) => ProcessingLog.find({ videoId }).sort({ createdAt: 1 })
};
