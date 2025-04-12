// @ts-check
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        useESM: false,
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    // Mock all @repo/types imports with our local mock
    '^@repo/types$': '<rootDir>/src/__mocks__/repo-types.ts',
    // Mock all @repo/utils imports with our local mock
    '^@repo/utils$': '<rootDir>/src/__mocks__/repo-utils.ts',
  },
  transformIgnorePatterns: ['node_modules/(?!(@repo/types|@repo/utils)/)'],
  extensionsToTreatAsEsm: [],
  watchPathIgnorePatterns: ['<rootDir>/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
