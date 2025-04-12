import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  ttl: parseInt(process.env.CACHE_TTL || '300', 10), // Default cache TTL: 5 minutes (300 seconds)
  max: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10), // Maximum number of items in cache
  isGlobal: true,
  excludePaths: [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/uploads/*',
    '/users/profile',
  ], // Paths to exclude from caching
  includePaths: ['/casts/*', '/health'], // Paths to include in caching (higher priority than excludes)
}));
