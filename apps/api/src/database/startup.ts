import { Logger } from '@nestjs/common';
import { config } from 'dotenv';
import dataSource from './data-source';

// Load environment variables
config();

const logger = new Logger('Database');

// Number of connection retries
const MAX_RETRIES = 5;
// Delay between retries in ms (starts at 1s, then 2s, 4s, etc - exponential backoff)
const INITIAL_RETRY_DELAY = 1000;

export async function runMigrations() {
  try {
    logger.log('Running database migrations...');

    // Run migrations
    await dataSource.runMigrations();

    logger.log('Database migrations completed successfully');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error running database migrations:', error.message);
    } else {
      logger.error('Error running database migrations: Unknown error');
    }
    throw error;
  }
}

export async function initializeDatabase(): Promise<void> {
  logger.log('Initializing database connection...');

  let retries = 0;
  let delay = INITIAL_RETRY_DELAY;

  while (retries < MAX_RETRIES) {
    try {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
        logger.log('Database connection established successfully!');
      }

      // Run migrations if needed
      logger.log('Checking for pending migrations...');
      const pendingMigrations = await dataSource.showMigrations();

      if (pendingMigrations) {
        logger.log('Running database migrations...');
        await dataSource.runMigrations();
        logger.log('Migrations completed successfully.');
      } else {
        logger.log('No pending migrations.');
      }

      return;
    } catch (error) {
      retries++;

      // Connection failed
      if (error instanceof Error) {
        logger.error(
          `Database connection attempt ${retries}/${MAX_RETRIES} failed:`,
          error.message,
        );

        if (retries >= MAX_RETRIES) {
          logger.error(
            'Maximum number of database connection retries reached. Exiting.',
          );
          throw new Error(
            `Failed to connect to database after ${MAX_RETRIES} attempts: ${error.message}`,
          );
        }
      } else {
        logger.error(
          `Database connection attempt ${retries}/${MAX_RETRIES} failed: Unknown error`,
        );

        if (retries >= MAX_RETRIES) {
          logger.error(
            'Maximum number of database connection retries reached. Exiting.',
          );
          throw new Error(
            `Failed to connect to database after ${MAX_RETRIES} attempts: Unknown error`,
          );
        }
      }

      // Wait with exponential backoff before retrying
      logger.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff
      delay *= 2;
    }
  }
}
