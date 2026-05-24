import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('videos').updateMany({ uploadedBy: { $exists: true } }, { $rename: { 'uploadedBy': 'userId' } });
  await db.collection('videos').updateMany({ owner: { $exists: true } }, { $rename: { 'owner': 'userId' } });
  await db.collection('videos').updateMany({ status: 'completed' }, { $set: { status: 'safe' } });
  console.log('Fixed DB schema mismatch');
  process.exit(0);
});
