import { z } from 'zod';

export default z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_HOST: z.string().min(1, 'Host is required'),
  DATABASE_PORT: z.coerce.number().min(1).max(65535).default(5432),
  DATABASE_NAME: z.string().min(1, 'Database name is required'),
  DATABASE_USER: z.string().min(1, 'Database user is required'),
  DATABASE_PASSWORD: z.string().min(1, 'Database password is required'),
  API_KEY: z.string().min(1, 'Profile API key is required'),
  JWT_SECRET: z.string().min(1, 'JWT secret is required'),
  JWT_TOKEN_AUDIENCE: z.string().min(1, 'JWT token audience is required'),
  JWT_TOKEN_ISSUER: z.string().min(1, 'JWT token issuer is required'),
  JWT_ACCESS_TOKEN_TTL: z.coerce.number().default(3600),
  JWT_REFRESH_TOKEN_TTL: z.coerce.number().default(86400),
  SENTRY_DSN: z.string().min(1, 'Sentry DSN is required'),
  NEWS_API_KEY: z.string().min(1, 'News API key is required'),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  VOICE_API_KEY: z.string().min(1, 'Voice API key is required'),
  DATABASE_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  THROTTLE_TTL: z.coerce.number().default(60),
  THROTTLE_LIMIT: z.coerce.number().default(10),
});
