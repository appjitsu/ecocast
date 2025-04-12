import { ZodError } from 'zod';
import environmentValidation from './environment.validation';

describe('EnvironmentValidation', () => {
  it('should validate required environment variables', () => {
    const validEnv = {
      NODE_ENV: 'development',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: 5432,
      DATABASE_NAME: 'testdb',
      DATABASE_USER: 'testuser',
      DATABASE_PASSWORD: 'testpass',
      PROFILE_API_KEY: 'profile-key',
      JWT_SECRET: 'jwt-secret',
      JWT_TOKEN_AUDIENCE: 'test-audience',
      JWT_TOKEN_ISSUER: 'test-issuer',
      SENTRY_DSN: 'sentry-dsn',
      NEWS_API_KEY: 'news-key',
      OPENAI_API_KEY: 'openai-key',
      VOICE_API_KEY: 'voice-key',
    };

    const result = environmentValidation.safeParse(validEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        ...validEnv,
        JWT_ACCESS_TOKEN_TTL: 3600,
        JWT_REFRESH_TOKEN_TTL: 86400,
        THROTTLE_TTL: 60,
        THROTTLE_LIMIT: 10,
      });
    }
  });

  it('should use default values when optional variables are not provided', () => {
    const minimalEnv = {
      DATABASE_HOST: 'localhost',
      DATABASE_NAME: 'testdb',
      DATABASE_USER: 'testuser',
      DATABASE_PASSWORD: 'testpass',
      PROFILE_API_KEY: 'profile-key',
      JWT_SECRET: 'jwt-secret',
      JWT_TOKEN_AUDIENCE: 'test-audience',
      JWT_TOKEN_ISSUER: 'test-issuer',
      SENTRY_DSN: 'sentry-dsn',
      NEWS_API_KEY: 'news-key',
      OPENAI_API_KEY: 'openai-key',
      VOICE_API_KEY: 'voice-key',
    };

    const result = environmentValidation.safeParse(minimalEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        ...minimalEnv,
        NODE_ENV: 'development',
        DATABASE_PORT: 5432,
        JWT_ACCESS_TOKEN_TTL: 3600,
        JWT_REFRESH_TOKEN_TTL: 86400,
        THROTTLE_TTL: 60,
        THROTTLE_LIMIT: 10,
      });
    }
  });

  it('should validate NODE_ENV values', () => {
    const env = {
      NODE_ENV: 'invalid',
      DATABASE_HOST: 'localhost',
      DATABASE_NAME: 'testdb',
      DATABASE_USER: 'testuser',
      DATABASE_PASSWORD: 'testpass',
      PROFILE_API_KEY: 'profile-key',
      JWT_SECRET: 'jwt-secret',
      JWT_TOKEN_AUDIENCE: 'test-audience',
      JWT_TOKEN_ISSUER: 'test-issuer',
      SENTRY_DSN: 'sentry-dsn',
      NEWS_API_KEY: 'news-key',
      OPENAI_API_KEY: 'openai-key',
      VOICE_API_KEY: 'voice-key',
    };

    const result = environmentValidation.safeParse(env);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.errors[0].message).toContain('Invalid enum value');
    }
  });

  it('should validate DATABASE_PORT as a valid port number', () => {
    const env = {
      NODE_ENV: 'development',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: 70000, // Invalid port number
      DATABASE_NAME: 'testdb',
      DATABASE_USER: 'testuser',
      DATABASE_PASSWORD: 'testpass',
      PROFILE_API_KEY: 'profile-key',
      JWT_SECRET: 'jwt-secret',
      JWT_TOKEN_AUDIENCE: 'test-audience',
      JWT_TOKEN_ISSUER: 'test-issuer',
      SENTRY_DSN: 'sentry-dsn',
      NEWS_API_KEY: 'news-key',
      OPENAI_API_KEY: 'openai-key',
      VOICE_API_KEY: 'voice-key',
    };

    const result = environmentValidation.safeParse(env);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.errors[0].message).toContain(
        'Number must be less than or equal to 65535',
      );
    }
  });

  it('should require all mandatory environment variables', () => {
    const incompleteEnv = {
      NODE_ENV: 'development',
      DATABASE_HOST: 'localhost',
    };

    const result = environmentValidation.safeParse(incompleteEnv);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.errors.length).toBeGreaterThan(0);
    }
  });

  it('should validate JWT token TTL values as numbers', () => {
    const env = {
      NODE_ENV: 'development',
      DATABASE_HOST: 'localhost',
      DATABASE_NAME: 'testdb',
      DATABASE_USER: 'testuser',
      DATABASE_PASSWORD: 'testpass',
      PROFILE_API_KEY: 'profile-key',
      JWT_SECRET: 'jwt-secret',
      JWT_TOKEN_AUDIENCE: 'test-audience',
      JWT_TOKEN_ISSUER: 'test-issuer',
      JWT_ACCESS_TOKEN_TTL: 'invalid',
      JWT_REFRESH_TOKEN_TTL: 'invalid',
      SENTRY_DSN: 'sentry-dsn',
      NEWS_API_KEY: 'news-key',
      OPENAI_API_KEY: 'openai-key',
      VOICE_API_KEY: 'voice-key',
    };

    const result = environmentValidation.safeParse(env);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.errors[0].message).toContain('Expected number');
    }
  });
});
