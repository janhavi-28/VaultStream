import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  totalUploads: {
    type: Number,
    default: 0
  },
  totalFlagged: {
    type: Number,
    default: 0
  },
  processingTime: {
    type: Number, // In seconds
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, { timestamps: true });

// Compound index
analyticsSchema.index({ userId: 1, createdAt: -1 });

export default analyticsSchema;
