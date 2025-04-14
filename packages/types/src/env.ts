/**
 * Common environment variables shared between apps
 */
export type NodeEnv = 'development' | 'production' | 'test';

/**
 * Web app specific environment variables
 */
export interface WebEnv {
  NODE_ENV: NodeEnv;
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_APP_URL?: string;
  ANALYZE?: 'true' | 'false';
}

/**
 * API app specific environment variables
 */
export interface ApiEnv {
  // Server
  NODE_ENV: NodeEnv;
  PORT?: string;
  HOST?: string;

  // Database
  DATABASE_HOST: string;
  DATABASE_PORT?: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_SYNC?: 'true' | 'false';
  DATABASE_AUTOLOAD?: 'true' | 'false';
  DATABASE_LOGGING?: 'true' | 'false';

  // JWT
  JWT_SECRET: string;
  JWT_TOKEN_AUDIENCE: string;
  JWT_TOKEN_ISSUER: string;
  JWT_ACCESS_TOKEN_TTL?: string;
  JWT_REFRESH_TOKEN_TTL?: string;

  // Auth
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  // Profile
  API_KEY?: string;

  // CORS
  NEXT_PUBLIC_APP_URL?: string;
}
