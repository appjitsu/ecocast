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

    const { error, value } = environmentValidation.validate(validEnv);
    expect(error).toBeUndefined();
    expect(value).toEqual({
      ...validEnv,
      JWT_ACCESS_TOKEN_TTL: 3600,
      JWT_REFRESH_TOKEN_TTL: 86400,
    });
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

    const { error, value } = environmentValidation.validate(minimalEnv);
    expect(error).toBeUndefined();
    expect(value).toEqual({
      ...minimalEnv,
      NODE_ENV: 'development',
      DATABASE_PORT: 5432,
      JWT_ACCESS_TOKEN_TTL: 3600,
      JWT_REFRESH_TOKEN_TTL: 86400,
    });
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

    const { error } = environmentValidation.validate(env);
    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('"NODE_ENV" must be one of');
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

    const { error } = environmentValidation.validate(env);
    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain(
      '"DATABASE_PORT" must be a valid port',
    );
  });

  it('should require all mandatory environment variables', () => {
    const incompleteEnv = {
      NODE_ENV: 'development',
      DATABASE_HOST: 'localhost',
    };

    const { error } = environmentValidation.validate(incompleteEnv);
    expect(error).toBeDefined();
    expect(error?.details.length).toBeGreaterThan(0);
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

    const { error } = environmentValidation.validate(env);
    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain(
      '"JWT_ACCESS_TOKEN_TTL" must be a number',
    );
  });
});
