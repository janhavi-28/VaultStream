import mongoose from 'mongoose';
import { VIDEO_STATUSES } from '../constants/statuses.js';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  resolution: {
    type: String,
    default: 'unknown'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: Object.values(VIDEO_STATUSES),
    default: VIDEO_STATUSES.PROCESSING,
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sensitivityScore: {
    type: Number,
    default: 0
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, { timestamps: true });

// Text index for search
videoSchema.index({ title: 'text', description: 'text' });

export default videoSchema;
