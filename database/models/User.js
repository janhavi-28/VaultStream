import mongoose from 'mongoose';
import userSchema from '../schemas/userSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const User = mongoose.model('User', userSchema, COLLECTIONS.USERS);
