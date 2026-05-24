import { User } from '../models/User.js';
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
