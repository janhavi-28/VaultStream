import { seedRoles } from './roleSeeder.js';
import { seedAdmin } from './adminSeeder.js';

export const runAllSeeders = async () => {
  await seedRoles();
  await seedAdmin();
  console.log('All seeders completed.');
};
