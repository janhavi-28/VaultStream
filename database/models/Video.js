import mongoose from 'mongoose';
import videoSchema from '../schemas/videoSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const Video = mongoose.model('Video', videoSchema, COLLECTIONS.VIDEOS);
