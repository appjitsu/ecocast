import * as Joi from 'joi';

export const configSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),

  // Server settings
  PORT: Joi.number().default(3000),
  HOST: Joi.string().default('localhost'),

  // Database settings
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SSL: Joi.boolean().default(false),

  // JWT settings
  JWT_SECRET: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.string().default('ecocast-api'),
  JWT_TOKEN_ISSUER: Joi.string().default('ecocast'),
  JWT_ACCESS_TOKEN_TTL: Joi.number().default(3600),
  JWT_REFRESH_TOKEN_TTL: Joi.number().default(86400),

  // Throttling settings
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  // CORS settings
  CORS_ORIGIN: Joi.string().allow('').optional(),

  // OAuth settings
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_CALLBACK_URL: Joi.string().allow('').optional(),

  // Session settings
  SESSION_SECRET: Joi.string().allow('').optional(),
  COOKIE_DOMAIN: Joi.string().allow('').optional(),

  // Environment validation options
  ENABLE_ENV_VALIDATION: Joi.boolean().default(true),
});
