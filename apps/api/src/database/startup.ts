import { Logger } from '@nestjs/common';
import { config } from 'dotenv';
import dataSource from './data-source';

// Load environment variables
config();

const logger = new Logger('Database');

export async function runMigrations() {
  try {
    logger.log('Running database migrations...');

    // Run migrations
    await dataSource.runMigrations();

    logger.log('Database migrations completed successfully');
  } catch (error) {
    logger.error('Error running database migrations:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    // Initialize connection
    await dataSource.initialize();
    logger.log('Database connection established');

    // Run migrations
    await runMigrations();

    // Close connection
    await dataSource.destroy();
    logger.log('Database connection closed');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}
