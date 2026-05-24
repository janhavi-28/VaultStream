import mongoose from 'mongoose';
import sessionSchema from '../schemas/sessionSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const Session = mongoose.model('Session', sessionSchema, COLLECTIONS.SESSIONS);
