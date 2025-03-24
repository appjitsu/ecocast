import { DataSource } from 'typeorm';
import { seedCasts } from './cast.seed';
import { seedUsers } from './user.seed';

export async function runSeeds(dataSource: DataSource) {
  try {
    console.log('Starting database seeding...');

    // Run seeds in sequence
    await seedUsers(dataSource);
    await seedCasts(dataSource);

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
