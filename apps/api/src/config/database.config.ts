import { registerAs } from '@nestjs/config';

// Ensure this configuration reads from the environment variables provided by ECS:
// DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10) || 5432,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  synchronize: process.env.DATABASE_SYNC === 'true',
  autoLoadEntities: process.env.DATABASE_AUTOLOAD === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  poolSize: parseInt(process.env.DB_POOL_SIZE ?? '10', 10),
  ssl: process.env.DB_SSL === 'true',
  rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false',
  slowQueryThreshold: parseInt(
    process.env.DB_SLOW_QUERY_THRESHOLD ?? '1000',
    10,
  ),
  logAllQueries: process.env.DB_LOG_ALL_QUERIES === 'true',
}));
