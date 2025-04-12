import { config as base } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config} */
export default [
  ...base,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: '.',
      },
    },
    rules: {
      // Add any utils-specific rules here
    },
  },
];
