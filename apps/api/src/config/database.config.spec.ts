import databaseConfig from './database.config';

describe('DatabaseConfig', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should load default values when environment variables are not set', () => {
    const config = databaseConfig();
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.synchronize).toBe(false);
    expect(config.autoLoadEntities).toBe(false);
    expect(config.logging).toBe(false);
  });

  it('should load values from environment variables', () => {
    process.env.DATABASE_HOST = 'test-host';
    process.env.DATABASE_PORT = '5433';
    process.env.DATABASE_USER = 'test-user';
    process.env.DATABASE_PASSWORD = 'test-password';
    process.env.DATABASE_NAME = 'test-db';
    process.env.DATABASE_SYNC = 'true';
    process.env.DATABASE_AUTOLOAD = 'true';
    process.env.DATABASE_LOGGING = 'true';

    const config = databaseConfig();
    expect(config.host).toBe('test-host');
    expect(config.port).toBe(5433);
    expect(config.user).toBe('test-user');
    expect(config.password).toBe('test-password');
    expect(config.name).toBe('test-db');
    expect(config.synchronize).toBe(true);
    expect(config.autoLoadEntities).toBe(true);
    expect(config.logging).toBe(true);
  });

  it('should handle invalid port number', () => {
    process.env.DATABASE_PORT = 'invalid';
    const config = databaseConfig();
    expect(config.port).toBe(5432); // Should use default port
  });

  it('should handle boolean conversions correctly', () => {
    process.env.DATABASE_SYNC = 'false';
    process.env.DATABASE_AUTOLOAD = 'false';
    process.env.DATABASE_LOGGING = 'false';

    const config = databaseConfig();
    expect(config.synchronize).toBe(false);
    expect(config.autoLoadEntities).toBe(false);
    expect(config.logging).toBe(false);
  });

  it('should handle empty environment variables', () => {
    process.env.DATABASE_HOST = '';
    process.env.DATABASE_USER = '';
    process.env.DATABASE_PASSWORD = '';
    process.env.DATABASE_NAME = '';

    const config = databaseConfig();
    expect(config.host).toBe('localhost'); // Should use default host
    expect(config.user).toBe(''); // Should allow empty string
    expect(config.password).toBe(''); // Should allow empty string
    expect(config.name).toBe(''); // Should allow empty string
  });
});
