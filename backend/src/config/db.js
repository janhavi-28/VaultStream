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
    
    // Do NOT exit the process on Vercel/serverless environments, so that Mongoose connection
    // errors can bubble up to Express and be returned as JSON to the client.
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
  }
};

export default connectDB;
