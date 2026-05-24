import { Role } from '../models/Role.js';
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
