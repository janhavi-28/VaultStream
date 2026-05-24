import mongoose from 'mongoose';
import { PROCESSING_STEPS, VIDEO_STATUSES } from '../constants/statuses.js';

const processingSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: Object.values(VIDEO_STATUSES),
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  processingStep: {
    type: String,
    enum: Object.values(PROCESSING_STEPS),
    required: true
  }
}, { timestamps: true });

export default processingSchema;
