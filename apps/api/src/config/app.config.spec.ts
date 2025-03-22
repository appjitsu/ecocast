import appConfig from './app.config';

describe('AppConfig', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should load default environment as production', () => {
    delete process.env.NODE_ENV;
    const config = appConfig();
    expect(config.environment).toBe('production');
  });

  it('should load environment from NODE_ENV', () => {
    process.env.NODE_ENV = 'development';
    const config = appConfig();
    expect(config.environment).toBe('development');
  });

  it('should handle test environment', () => {
    process.env.NODE_ENV = 'test';
    const config = appConfig();
    expect(config.environment).toBe('test');
  });
});
