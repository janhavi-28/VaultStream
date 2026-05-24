import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Define storage location and filename format
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the folder exists in the project root
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    // Extract original extension
    const ext = path.extname(file.originalname);
    // Generate UUID filename to prevent collisions: e.g. "a1b2c3d4-e5f6...mp4"
    cb(null, `${uuidv4()}${ext}`);
  },
});

// File filter to restrict non-MP4 uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'video/mp4') {
    cb(null, true);
  } else {
    cb(new Error('Only MP4 video files are allowed'), false);
  }
};

// Initialize multer upload middleware
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // Parse MAX_FILE_SIZE from string (or default to 500MB)
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 524288000,
  },
});
