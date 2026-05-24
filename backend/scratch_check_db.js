import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Video = mongoose.model('Video', new mongoose.Schema({}, { strict: false }));

    const users = await User.find({});
    console.log('--- ALL USERS ---');
    console.log(JSON.stringify(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, tenantId: u.tenantId })), null, 2));

    const videos = await Video.find({});
    console.log('--- ALL VIDEOS ---');
    console.log(JSON.stringify(videos.map(v => ({ id: v._id, title: v.title, status: v.status, sensitivity: v.sensitivity, tenantId: v.tenantId, uploadedBy: v.uploadedBy, userId: v.userId })), null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error querying DB:', error);
    process.exit(1);
  }
};

checkDb();
