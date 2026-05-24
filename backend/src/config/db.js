import mongoose from 'mongoose';

/**
 * Connect to MongoDB using Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose handles connection pooling and timeouts internally,
      // but you can add specific driver options here if needed.
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // In production, you might not want to exit the entire process immediately 
    // on a DB connection drop, but for initial connection failure, it's standard.
    if (process.env.NODE_ENV === 'production') {
      console.error('Critical Error: Failed to connect to database in production environment.');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
