import mongoose from 'mongoose';
import roleSchema from '../schemas/roleSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const Role = mongoose.model('Role', roleSchema, COLLECTIONS.ROLES);
