import mongoose from 'mongoose';
import analyticsSchema from '../schemas/analyticsSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const Analytics = mongoose.model('Analytics', analyticsSchema, COLLECTIONS.ANALYTICS);
