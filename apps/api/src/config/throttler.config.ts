import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10), // Time-to-live in seconds
  limit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10), // Number of requests allowed within TTL
}));
