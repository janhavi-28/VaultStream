import { Video } from '../models/Video.js';
import { ROLES } from '../constants/roles.js';

export const videoRepository = {
  create: async (data, session) => {
    const video = new Video(data);
    return video.save({ session });
  },
  
  findById: async (id, userId, role) => {
    const query = { _id: id };
    if (role !== ROLES.ADMIN) query.userId = userId;
    return Video.findOne(query);
  },

  findAll: async (userId, role, filters = {}) => {
    const query = { ...filters };
    if (role !== ROLES.ADMIN) query.userId = userId;
    return Video.find(query).sort({ createdAt: -1 });
  },

  updateProgress: async (id, progress, status) => {
    return Video.findByIdAndUpdate(id, { progress, status }, { new: true });
  },

  deleteById: async (id, userId, role, session) => {
    const query = { _id: id };
    if (role !== ROLES.ADMIN) query.userId = userId;
    return Video.findOneAndDelete(query, { session });
  }
};
