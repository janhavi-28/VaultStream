import { User } from '../models/User.js';

export const userRepository = {
  findById: async (id) => User.findById(id),
  findByEmail: async (email) => User.findOne({ email }).select('+password'),
  create: async (userData) => User.create(userData),
  update: async (id, data) => User.findByIdAndUpdate(id, data, { new: true }),
  findAll: async () => User.find({}).select('-password')
};
