import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Load environment variables
config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'ecocast',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

async function runMigration() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    await dataSource.runMigrations();
    console.log('Migrations completed successfully');

    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error running migrations:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

void runMigration().catch((error) => {
  console.error('Error running migrations:', error);
  process.exit(1);
});
