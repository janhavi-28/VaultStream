import mongoose from 'mongoose';
import processingSchema from '../schemas/processingSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const ProcessingLog = mongoose.model('ProcessingLog', processingSchema, COLLECTIONS.PROCESSING_LOGS);
