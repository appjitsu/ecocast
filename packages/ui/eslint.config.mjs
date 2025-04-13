import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default tseslint.config(
  // 1. Global ignores based on ignorePatterns and common excludes
  {
    ignores: [
      'dist/**',
      'scripts/**',
      'src/components/shadcn/**',
      'node_modules/**',
      '.turbo/**',
      'storybook-static/**', // Common storybook build output
      'coverage/**', // Common test coverage output
    ],
  },

  // 2. Base Recommended JS Rules
  js.configs.recommended,

  // 2.5 Configure basic TS parsing & recommended non-type-aware rules for ALL .ts/.tsx files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // No 'project' setting here for base TS parsing
      },
    },
    rules: {
      ...tseslint.configs.eslintRecommended.rules, // Basic TS rules compatible without type info
      // Add other non-type-aware TS or React rules if needed for all TS/TSX files
    },
  },

  // 3. Apply stricter Type-Checked rules ONLY to project files (excluding storybook)
  {
    files: ['**/*.{ts,tsx}'], // Apply to TS/TSX files...
    ignores: ['.storybook/**'], // ...but ignore storybook for this specific type-aware block
    extends: [
      // Note: Extending recommendedTypeChecked here adds the rules.
      // The parser/plugin should already be configured by block 2.5
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: true, // Enable type-aware linting
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Override or add specific type-aware rules here if needed
      // e.g., '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // 4. Configure Globals for common JS/TS files (replaces env)
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Note: If @repo/ui needs specific React rules, you might want to
  // import and spread your shared react-internal config as well.
  // Example:
  // import reactConfig from "@repo/eslint-config/react-internal";
  // ...reactConfig
);
