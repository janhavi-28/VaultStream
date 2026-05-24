import fs from 'fs';
import path from 'path';

const baseDir = path.join(process.cwd(), 'src', 'database');

const dirs = [
  'config',
  'models',
  'schemas',
  'repositories',
  'validators',
  'aggregation',
  'transactions',
  'seeders',
  'migrations',
  'constants'
];

dirs.forEach(d => fs.mkdirSync(path.join(baseDir, d), { recursive: true }));

const files = {
  'constants/roles.js': `export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.EDITOR]: ['upload_video', 'edit_own_video', 'delete_own_video', 'view_all'],
  [ROLES.VIEWER]: ['view_own_video']
};
`,

  'constants/statuses.js': `export const VIDEO_STATUSES = {
  PROCESSING: 'processing',
  SAFE: 'safe',
  FLAGGED: 'flagged'
};

export const PROCESSING_STEPS = {
  UPLOADED: 'uploaded',
  EXTRACTING_FRAMES: 'extracting_frames',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};
`,

  'constants/collections.js': `export const COLLECTIONS = {
  USERS: 'users',
  VIDEOS: 'videos',
  PROCESSING_LOGS: 'processinglogs',
  SESSIONS: 'sessions',
  ROLES: 'roles',
  ANALYTICS: 'analytics'
};
`,

  'config/db.js': `import mongoose from 'mongoose';
import { setupIndexes } from './indexes.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
    });
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
    await setupIndexes();
  } catch (error) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};
`,

  'config/mongoose.js': `import mongoose from 'mongoose';

// Global Mongoose configurations can be set here
mongoose.set('strictQuery', true);

export default mongoose;
`,

  'config/indexes.js': `import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Session } from '../models/Session.js';

export const setupIndexes = async () => {
  try {
    // Explicitly sync indexes (Mongoose usually handles this on startup, but this is for migrations/safety)
    await User.syncIndexes();
    await Video.syncIndexes();
    await Session.syncIndexes();
    console.log('Database indexes synchronized successfully.');
  } catch (err) {
    console.error('Error syncing indexes:', err);
  }
};
`,

  'schemas/userSchema.js': `import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    index: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.VIEWER
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default userSchema;
`,

  'schemas/videoSchema.js': `import mongoose from 'mongoose';
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
`,

  'schemas/processingSchema.js': `import mongoose from 'mongoose';
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
`,

  'schemas/sessionSchema.js': `import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: String,
  userAgent: String,
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1s' } // TTL Index
  }
}, { timestamps: true });

export default sessionSchema;
`,

  'schemas/roleSchema.js': `import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [{
    type: String
  }]
}, { timestamps: true });

export default roleSchema;
`,

  'schemas/analyticsSchema.js': `import mongoose from 'mongoose';

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
`,

  'models/User.js': `import mongoose from 'mongoose';
import userSchema from '../schemas/userSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const User = mongoose.model('User', userSchema, COLLECTIONS.USERS);
`,

  'models/Video.js': `import mongoose from 'mongoose';
import videoSchema from '../schemas/videoSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const Video = mongoose.model('Video', videoSchema, COLLECTIONS.VIDEOS);
`,

  'models/ProcessingLog.js': `import mongoose from 'mongoose';
import processingSchema from '../schemas/processingSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const ProcessingLog = mongoose.model('ProcessingLog', processingSchema, COLLECTIONS.PROCESSING_LOGS);
`,

  'models/Session.js': `import mongoose from 'mongoose';
import sessionSchema from '../schemas/sessionSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const Session = mongoose.model('Session', sessionSchema, COLLECTIONS.SESSIONS);
`,

  'models/Role.js': `import mongoose from 'mongoose';
import roleSchema from '../schemas/roleSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const Role = mongoose.model('Role', roleSchema, COLLECTIONS.ROLES);
`,

  'models/Analytics.js': `import mongoose from 'mongoose';
import analyticsSchema from '../schemas/analyticsSchema.js';
import { COLLECTIONS } from '../constants/collections.js';

export const Analytics = mongoose.model('Analytics', analyticsSchema, COLLECTIONS.ANALYTICS);
`,

  'repositories/userRepository.js': `import { User } from '../models/User.js';

export const userRepository = {
  findById: async (id) => User.findById(id),
  findByEmail: async (email) => User.findOne({ email }).select('+password'),
  create: async (userData) => User.create(userData),
  update: async (id, data) => User.findByIdAndUpdate(id, data, { new: true }),
  findAll: async () => User.find({}).select('-password')
};
`,

  'repositories/videoRepository.js': `import { Video } from '../models/Video.js';
import { ROLES } from '../constants/roles.js';

export const videoRepository = {
  create: async (data, session) => {
    const video = new Video(data);
    return video.save({ session });
  },
  
  findById: async (id, userId, role) => {
    const query = { _id: id };
    if (role !== ROLES.ADMIN) query.userId = userId;
    return Video.findOne(query);
  },

  findAll: async (userId, role, filters = {}) => {
    const query = { ...filters };
    if (role !== ROLES.ADMIN) query.userId = userId;
    return Video.find(query).sort({ createdAt: -1 });
  },

  updateProgress: async (id, progress, status) => {
    return Video.findByIdAndUpdate(id, { progress, status }, { new: true });
  },

  deleteById: async (id, userId, role, session) => {
    const query = { _id: id };
    if (role !== ROLES.ADMIN) query.userId = userId;
    return Video.findOneAndDelete(query, { session });
  }
};
`,

  'repositories/processingRepository.js': `import { ProcessingLog } from '../models/ProcessingLog.js';

export const processingRepository = {
  createLog: async (data) => ProcessingLog.create(data),
  findByVideoId: async (videoId) => ProcessingLog.find({ videoId }).sort({ createdAt: 1 })
};
`,

  'repositories/sessionRepository.js': `import { Session } from '../models/Session.js';

export const sessionRepository = {
  createSession: async (data) => Session.create(data),
  findValidSession: async (token) => Session.findOne({ token, expiresAt: { $gt: new Date() } }),
  revokeSession: async (token) => Session.deleteOne({ token }),
  revokeAllUserSessions: async (userId) => Session.deleteMany({ userId })
};
`,

  'repositories/analyticsRepository.js': `import { Analytics } from '../models/Analytics.js';

export const analyticsRepository = {
  updateUserStats: async (userId, statsUpdates) => {
    return Analytics.findOneAndUpdate(
      { userId },
      { $inc: statsUpdates },
      { upsert: true, new: true }
    );
  },
  getUserStats: async (userId) => Analytics.findOne({ userId })
};
`,

  'validators/authValidator.js': `import { check } from 'express-validator';

export const validateRegistration = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

export const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];
`,

  'validators/videoValidator.js': `import { check } from 'express-validator';

export const validateVideoMetadata = [
  check('title', 'Title is required').not().isEmpty().isLength({ max: 100 }),
  check('description', 'Description max length is 500').optional().isLength({ max: 500 })
];
`,

  'validators/userValidator.js': `import { check } from 'express-validator';
import { ROLES } from '../constants/roles.js';

export const validateRoleUpdate = [
  check('role', 'Invalid role').isIn(Object.values(ROLES))
];
`,

  'aggregation/dashboardAggregation.js': `import { Video } from '../models/Video.js';
import { ROLES } from '../constants/roles.js';

export const getDashboardStats = async (userId, role) => {
  const matchStage = role === ROLES.ADMIN ? {} : { userId };
  
  return Video.aggregate([
    { $match: matchStage },
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalSize: { $sum: '$size' }
    }}
  ]);
};
`,

  'aggregation/analyticsAggregation.js': `import { Analytics } from '../models/Analytics.js';

export const getSystemWideAnalytics = async () => {
  return Analytics.aggregate([
    { $group: {
      _id: null,
      totalUploads: { $sum: '$totalUploads' },
      totalFlagged: { $sum: '$totalFlagged' },
      avgProcessingTime: { $avg: '$processingTime' }
    }}
  ]);
};
`,

  'aggregation/adminAggregation.js': `import { User } from '../models/User.js';

export const getAdminUserStats = async () => {
  return User.aggregate([
    { $group: {
      _id: '$role',
      count: { $sum: 1 }
    }}
  ]);
};
`,

  'transactions/uploadTransaction.js': `import mongoose from 'mongoose';
import { videoRepository } from '../repositories/videoRepository.js';
import { analyticsRepository } from '../repositories/analyticsRepository.js';

export const executeUploadTransaction = async (videoData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const video = await videoRepository.create(videoData, session);
    await analyticsRepository.updateUserStats(userId, { totalUploads: 1 });
    
    await session.commitTransaction();
    return video;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
`,

  'transactions/deleteVideoTransaction.js': `import mongoose from 'mongoose';
import { videoRepository } from '../repositories/videoRepository.js';
import { analyticsRepository } from '../repositories/analyticsRepository.js';

export const executeDeleteTransaction = async (videoId, userId, role) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const deleted = await videoRepository.deleteById(videoId, userId, role, session);
    if (deleted) {
      await analyticsRepository.updateUserStats(deleted.userId, { totalUploads: -1 });
    }
    
    await session.commitTransaction();
    return deleted;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
`,

  'seeders/roleSeeder.js': `import { Role } from '../models/Role.js';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles.js';

export const seedRoles = async () => {
  try {
    for (const [key, roleName] of Object.entries(ROLES)) {
      await Role.findOneAndUpdate(
        { name: roleName },
        { name: roleName, permissions: ROLE_PERMISSIONS[roleName] },
        { upsert: true }
      );
    }
    console.log('Roles seeded successfully.');
  } catch (error) {
    console.error('Error seeding roles:', error);
  }
};
`,

  'seeders/adminSeeder.js': `import { User } from '../models/User.js';
import { ROLES } from '../constants/roles.js';

export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@antigravity.local';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin123!',
        role: ROLES.ADMIN
      });
      console.log('Admin user seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};
`,

  'seeders/demoSeeder.js': `import { seedRoles } from './roleSeeder.js';
import { seedAdmin } from './adminSeeder.js';

export const runAllSeeders = async () => {
  await seedRoles();
  await seedAdmin();
  console.log('All seeders completed.');
};
`,

  'migrations/createIndexes.js': `import { setupIndexes } from '../config/indexes.js';
import mongoose from 'mongoose';

export const runIndexMigration = async () => {
  try {
    await setupIndexes();
    console.log('Indexes migrated successfully.');
  } catch (error) {
    console.error('Index migration failed:', error);
  }
};
`,

  'migrations/addVideoDuration.js': `import { Video } from '../models/Video.js';

export const migrateVideoDurations = async () => {
  try {
    await Video.updateMany({ duration: { $exists: false } }, { $set: { duration: 0 } });
    console.log('Video durations migrated successfully.');
  } catch (error) {
    console.error('Duration migration failed:', error);
  }
};
`,

  'migrations/normalizeStatuses.js': `import { Video } from '../models/Video.js';
import { VIDEO_STATUSES } from '../constants/statuses.js';

export const migrateStatuses = async () => {
  try {
    await Video.updateMany(
      { status: { $nin: Object.values(VIDEO_STATUSES) } },
      { $set: { status: VIDEO_STATUSES.PROCESSING } }
    );
    console.log('Statuses normalized successfully.');
  } catch (error) {
    console.error('Status normalization failed:', error);
  }
};
`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filename), content);
  console.log("Created " + filename);
}
