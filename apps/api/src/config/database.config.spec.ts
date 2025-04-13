import databaseConfig from './database.config';

describe('DatabaseConfig', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should load default values when environment variables are not set', () => {
    // Ensure relevant env vars are unset
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USERNAME;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    // Add others if needed for defaults

    const config = databaseConfig();

    expect(config.host).toBe('localhost'); // Default host
    expect(config.port).toBe(5432); // Default port
    expect(config.user).toBeUndefined(); // Should be undefined if not set
    expect(config.password).toBeUndefined(); // Should be undefined if not set
    expect(config.name).toBeUndefined(); // Should be undefined if not set
    // Check other defaults
    expect(config.poolSize).toBe(10);
    expect(config.ssl).toBe(false);
  });

  it('should load values from environment variables', () => {
    // Set test environment variables using DB_* names
    process.env.DB_HOST = 'test-host';
    process.env.DB_PORT = '5433';
    process.env.DB_USERNAME = 'test-user';
    process.env.DB_PASSWORD = 'test-password';
    process.env.DB_NAME = 'test-db';
    process.env.DATABASE_SYNC = 'true';
    process.env.DATABASE_AUTOLOAD = 'false';
    process.env.DATABASE_LOGGING = 'true';
    process.env.DB_POOL_SIZE = '20';
    process.env.DB_SSL = 'true';
    process.env.DB_REJECT_UNAUTHORIZED = 'false';
    process.env.DB_SLOW_QUERY_THRESHOLD = '500';
    process.env.DB_LOG_ALL_QUERIES = 'true';

    const config = databaseConfig();

    expect(config.host).toBe('test-host');
    expect(config.port).toBe(5433);
    expect(config.user).toBe('test-user');
    expect(config.password).toBe('test-password');
    expect(config.name).toBe('test-db');
    expect(config.synchronize).toBe(true);
    expect(config.autoLoadEntities).toBe(false);
    expect(config.logging).toBe(true);
    expect(config.poolSize).toBe(20);
    expect(config.ssl).toBe(true);
    expect(config.rejectUnauthorized).toBe(false);
    expect(config.slowQueryThreshold).toBe(500);
    expect(config.logAllQueries).toBe(true);
  });

  it('should handle empty environment variables', () => {
    // Set empty environment variables
    process.env.DB_HOST = ''; // Test edge case
    process.env.DB_PORT = ''; // Test edge case for parseInt
    process.env.DB_USERNAME = '';
    process.env.DB_PASSWORD = '';
    process.env.DB_NAME = '';

    const config = databaseConfig();

    expect(config.host).toBe('localhost'); // Should use default host as empty is falsy
    expect(config.port).toBe(5432); // Should use default port as parseInt('') is NaN
    expect(config.user).toBe(''); // Should allow empty string
    expect(config.password).toBe(''); // Should allow empty string
    expect(config.name).toBe(''); // Should allow empty string
  });

  it('should correctly parse numeric values with defaults', () => {
    delete process.env.DB_PORT;
    delete process.env.DB_POOL_SIZE;
    delete process.env.DB_SLOW_QUERY_THRESHOLD;

    const config = databaseConfig();
    expect(config.port).toBe(5432);
    expect(config.poolSize).toBe(10);
    expect(config.slowQueryThreshold).toBe(1000);
  });

  it('should correctly parse boolean values with defaults', () => {
    delete process.env.DB_SSL;
    delete process.env.DB_REJECT_UNAUTHORIZED;
    delete process.env.DB_LOG_ALL_QUERIES;

    const config = databaseConfig();
    expect(config.ssl).toBe(false);
    expect(config.rejectUnauthorized).toBe(true); // Default is true
    expect(config.logAllQueries).toBe(false);
  });
});
