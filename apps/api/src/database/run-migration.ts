import { config } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

// Load environment variables
config({ path: join(__dirname, '..', '..', '.env') });

let dataSourceOptions: DataSourceOptions;

if (process.env.DATABASE_URL) {
  // If DATABASE_URL is provided, use it directly.
  dataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: false,
  };
} else {
  // Fallback to individual components if DATABASE_URL is not set
  dataSourceOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'ecocast',
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: false,
  };
}

const dataSource = new DataSource(dataSourceOptions);

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
