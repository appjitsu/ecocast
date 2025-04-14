import { config } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

// Load environment variables from the root directory
// Adjust the path if your .env file is elsewhere relative to the compiled output
config({ path: join(__dirname, '..', '..', '.env') }); // Assuming .env is in apps/api/

let dataSourceOptions: DataSourceOptions;

if (process.env.DATABASE_URL) {
  // If DATABASE_URL is provided, use it directly.
  dataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: false, // Always false for CLI/migrations
    logging: false, // Or true/"all" for debugging migrations
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
    synchronize: false, // Always false for CLI/migrations
    logging: false, // Or true/"all" for debugging migrations
  };
}

export default new DataSource(dataSourceOptions);
