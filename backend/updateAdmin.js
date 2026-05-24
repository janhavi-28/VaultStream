import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
    });
    console.log('MongoDB Connected');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vaultstream.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Update any existing admin to the new email and password
    const result = await User.findOneAndUpdate(
      { role: 'admin' },
      { email: adminEmail, password: hashedPassword },
      { new: true }
    );

    if (result) {
      console.log(`Admin user updated successfully to ${adminEmail}`);
    } else {
      console.log('No admin user found to update');
      // Create if it doesn't exist
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log(`Created new admin user ${adminEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

updateAdmin();
