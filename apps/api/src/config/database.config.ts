import { registerAs } from '@nestjs/config';

// Ensure this configuration reads from the environment variables provided by ECS:
// DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD

// Prioritize DATABASE_URL if available, otherwise use individual components.
export default registerAs('database', () => {
  if (process.env.DATABASE_URL) {
    // If DATABASE_URL is provided, use it directly.
    return {
      url: process.env.DATABASE_URL,
      // Still include other non-connection specific settings from env vars
      synchronize: process.env.DATABASE_SYNC === 'true',
      autoLoadEntities: process.env.DATABASE_AUTOLOAD === 'true',
      logging: process.env.DATABASE_LOGGING === 'true',
      poolSize: parseInt(process.env.DATABASE_POOL_SIZE ?? '10', 10),
      slowQueryThreshold: parseInt(
        process.env.DATABASE_SLOW_QUERY_THRESHOLD ?? '1000',
        10,
      ),
      logAllQueries: process.env.DATABASE_LOG_ALL_QUERIES === 'true',
      // Note: SSL settings are typically part of the DATABASE_URL string (e.g., ?ssl=true)
    };
  } else {
    // Fallback to individual components if DATABASE_URL is not set (e.g., for local dev)
    return {
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
    };
  }
});
