import { setupIndexes } from '../config/indexes.js';
import mongoose from 'mongoose';

export const runIndexMigration = async () => {
  try {
    await setupIndexes();
    console.log('Indexes migrated successfully.');
  } catch (error) {
    console.error('Index migration failed:', error);
  }
};
