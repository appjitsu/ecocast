import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@repo/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
    '^@repo/types/(.*)$': '<rootDir>/../../packages/types/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/styleMock.js',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Add coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/_*.{js,jsx,ts,tsx}',
    '!app/**/layout.{js,jsx,ts,tsx}',
    '!app/**/not-found.{js,jsx,ts,tsx}',
    '!app/**/loading.{js,jsx,ts,tsx}',
    '!app/**/error.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Add test environment settings
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    customExportConditions: [''],
  },
  // Add transform configuration
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  // Add module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Add test paths to ignore
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  // Add watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
