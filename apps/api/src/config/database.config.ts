import { registerAs } from '@nestjs/config';

// Ensure this configuration reads from the environment variables provided by ECS:
// DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10) || 5432,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_SYNC === 'true',
  autoLoadEntities: process.env.DATABASE_AUTOLOAD === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  poolSize: parseInt(process.env.DATABASE_POOL_SIZE ?? '10', 10),
  ssl: process.env.DATABASE_SSL === 'true',
  rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED !== 'false',
  slowQueryThreshold: parseInt(
    process.env.DATABASE_SLOW_QUERY_THRESHOLD ?? '1000',
    10,
  ),
  logAllQueries: process.env.DATABASE_LOG_ALL_QUERIES === 'true',
}));
