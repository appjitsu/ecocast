const { config: baseConfig } = require('@repo/eslint-config/base');

/** @type {import("eslint").Linter.Config} */
module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: '.',
      },
    },
  },
];
