import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Tenant from './src/models/Tenant.js';
import User from './src/models/User.js';

dotenv.config();

const seedTenants = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
    });
    console.log('MongoDB Connected successfully for Tenant Seeding.');

    // 1. Clear existing seed tenants and their users to make it perfectly idempotent
    console.log('Clearing old seed tenants...');
    const seedTenantNames = ['Northstar Media', 'Acme Corp', 'Blue Studios'];
    
    // Find matching tenant IDs first
    const tenantsToClear = await Tenant.find({ name: { $in: seedTenantNames } });
    const tenantIdsToClear = tenantsToClear.map(t => t._id);
    
    // Delete those tenants and users associated with them
    await Tenant.deleteMany({ _id: { $in: tenantIdsToClear } });
    await User.deleteMany({ tenantId: { $in: tenantIdsToClear } });
    console.log('Cleaned old seeded tenants and users.');

    // 2. Create Tenants
    console.log('Creating seed tenants...');
    
    const northstar = await Tenant.create({
      name: 'Northstar Media',
      slug: 'northstar-media'
    });
    
    const acme = await Tenant.create({
      name: 'Acme Corp',
      slug: 'acme-corp'
    });
    
    const blue = await Tenant.create({
      name: 'Blue Studios',
      slug: 'blue-studios'
    });

    console.log('Created Northstar Media, Acme Corp, and Blue Studios tenants.');

    // 3. Create Seed Users for the Tenants
    console.log('Creating users for tenants...');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    // Northstar Media: 3 Users
    const nsUsers = [
      { name: 'NS Editor 1', email: 'ns1@antigravity.local', password: defaultPasswordHash, role: 'editor', tenantId: northstar._id },
      { name: 'NS Viewer 2', email: 'ns2@antigravity.local', password: defaultPasswordHash, role: 'viewer', tenantId: northstar._id },
      { name: 'NS Viewer 3', email: 'ns3@antigravity.local', password: defaultPasswordHash, role: 'viewer', tenantId: northstar._id }
    ];

    // Acme Corp: 1 User
    const acmeUsers = [
      { name: 'Acme Editor', email: 'acme1@antigravity.local', password: defaultPasswordHash, role: 'editor', tenantId: acme._id }
    ];

    await User.insertMany([...nsUsers, ...acmeUsers]);
    console.log('Successfully seeded 3 users for Northstar Media and 1 user for Acme Corp.');

    console.log('Tenant Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tenants:', error.message);
    process.exit(1);
  }
};

seedTenants();
