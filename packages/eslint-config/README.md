# ESLint Config (@repo/eslint-config)

This package provides shared ESLint configurations for the EcoCast monorepo.

## Available Configurations

- **`@repo/eslint-config/base`**: Base configuration suitable for TypeScript projects (Node.js, libraries).
- **`@repo/eslint-config/next`**: Configuration tailored for Next.js applications (includes React rules).
- **`@repo/eslint-config/react-internal`**: Configuration for internal React libraries/packages (if any).

## Usage

In the `package.json` of an app or package, add this package as a dev dependency:

```json
"devDependencies": {
  "@repo/eslint-config": "workspace:*",
  // ... other deps
}
```

Then, create an `eslint.config.js` (or `.eslintrc.js`) file in that app/package and extend the desired configuration:

**Example for a Next.js app (`apps/web/eslint.config.js`):**

```javascript
const baseConfig = require('@repo/eslint-config/next');

module.exports = [
  {
    ignores: [
      // Add files or directories to ignore here
      '.next/**',
    ],
  },
  ...baseConfig,
  // Add project-specific rules or overrides here
];
```

**Example for a Node.js/library package (`packages/utils/eslint.config.js`):**

```javascript
const baseConfig = require('@repo/eslint-config/base');

module.exports = [
  {
    ignores: [
      // Add files or directories to ignore here
      'dist/**',
    ],
  },
  ...baseConfig,
  // Add project-specific rules or overrides here
];
```

Refer to the specific configuration files (`base.js`, `next.js`, `react-internal.js`) for details on the included plugins and rules.
