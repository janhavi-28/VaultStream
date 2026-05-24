import { Session } from '../models/Session.js';

export const sessionRepository = {
  createSession: async (data) => Session.create(data),
  findValidSession: async (token) => Session.findOne({ token, expiresAt: { $gt: new Date() } }),
  revokeSession: async (token) => Session.deleteOne({ token }),
  revokeAllUserSessions: async (userId) => Session.deleteMany({ userId })
};
