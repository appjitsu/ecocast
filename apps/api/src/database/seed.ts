import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { runSeeds } from './seeds';

// Load environment variables
config();

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  try {
    await runSeeds(dataSource);
    console.log('Seeding completed successfully');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    await app.close();
    process.exit(1);
  }
}

void seed().catch((error) => {
  console.error('Unhandled error during seeding:', error);
  process.exit(1);
});
