# TypeScript Config (@repo/typescript-config)

This package provides shared base TypeScript configurations (`tsconfig.json`) for the EcoCast monorepo.

## Purpose

- Ensure consistent TypeScript settings across different types of projects (base, Next.js, React libraries).
- Reduce duplication in `tsconfig.json` files throughout the monorepo.

## Available Configurations

- **`@repo/typescript-config/base.json`**: Base configuration suitable for Node.js libraries or backend services. Includes common strict settings.
- **`@repo/typescript-config/nextjs.json`**: Extends `base.json` with settings specific to Next.js applications (e.g., JSX settings, DOM library).
- **`@repo/typescript-config/react-library.json`**: Extends `base.json` with settings suitable for React component libraries (e.g., JSX settings).

## Usage

In the `tsconfig.json` of an app or package, extend the appropriate configuration file from this package:

**Example for a Next.js app (`apps/web/tsconfig.json`):**

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    // Project-specific overrides or additions
    "baseUrl": ".",
    "paths": {
      // ... path aliases
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Example for a base Node.js package (`packages/utils/tsconfig.json`):**

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    // Project-specific overrides
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Example for a React library (`packages/ui/tsconfig.json`):**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    // Project-specific overrides
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Refer to the individual `.json` files within this package for the specific compiler options they set.
