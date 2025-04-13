import { config as baseConfig } from '@repo/eslint-config/base';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default tseslint.config(
  // Separate object for infra-specific ignores
  {
    ignores: [
      'dist/**',
      'cdk.out/**', // Ignore CDK build artifacts
      'node_modules/**',
      '.turbo/**',
    ],
  },
  // Spread the base configuration
  ...baseConfig,

  // Add specific overrides or rules for the infra package here if needed
  // For example:
  // ignores: ["cdk.out/**", "dist/**"],
  // rules: {
  //   "no-console": "warn"
  // }
);
