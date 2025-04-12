import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => {
  const useRedis = process.env.THROTTLER_REDIS === 'true';

  // Default base configuration
  const config = {
    // Global settings
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10), // Default 60 seconds window
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // Default 100 requests per window

    // Redis-specific settings
    useRedis,

    // Advanced protection
    blockThreshold: parseInt(process.env.THROTTLE_BLOCK_THRESHOLD || '100', 10), // Block after 100 failed attempts
    blockDuration: parseInt(process.env.THROTTLE_BLOCK_DURATION || '3600', 10), // Block for 1 hour

    // Default IPs to skip throttling (e.g., for internal services)
    skipIps: (process.env.THROTTLE_SKIP_IPS || '127.0.0.1,::1')
      .split(',')
      .map((ip) => ip.trim()),
  };

  // Specific throttling strategies based on endpoint types
  const strategies = {
    default: {
      ttl: config.ttl,
      limit: config.limit,
    },

    // More restrictive for authentication endpoints to prevent brute force
    login: {
      ttl: 300, // 5 minutes
      limit: 5, // 5 attempts
    },

    // Signup and account recovery
    signup: {
      ttl: 600, // 10 minutes
      limit: 3, // 3 attempts
    },

    // For public APIs that are unauthenticated
    public: {
      ttl: 60, // 1 minute
      limit: 30, // 30 requests
    },

    // For APIs that need higher limits
    highVolume: {
      ttl: 60,
      limit: 300, // 300 requests per minute
    },

    // For admin operations
    admin: {
      ttl: 60,
      limit: 60, // 60 requests per minute
    },
  };

  // Route-specific strategy mapping
  const routes = {
    // Authentication routes
    '/auth/login': 'login',
    '/auth/register': 'signup',
    '/auth/forgot-password': 'signup',
    '/auth/reset-password': 'signup',

    // Public routes
    '/api/docs/*': 'public',
    '/casts/public/*': 'public',

    // Admin routes
    '/admin/*': 'admin',

    // High volume routes
    '/uploads/status': 'highVolume',
    '/events/*': 'highVolume',
  };

  return {
    ...config,
    strategies,
    routes,
  };
});
