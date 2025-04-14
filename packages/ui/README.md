# Shared UI Components (@repo/ui)

This package contains shared React UI components used across the EcoCast frontend applications (e.g., `@repo/web`). It is built using [Shadcn/ui](https://ui.shadcn.com/), which utilizes [Radix UI](https://www.radix-ui.com/) primitives and [Tailwind CSS](https://tailwindcss.com/) for styling.

## Purpose

- Provide a consistent look and feel across applications using a shared theme.
- Offer a curated set of common UI elements based on Shadcn/ui.
- Centralize custom UI component logic and styling.

## Installation

This package is intended to be used as a workspace dependency.

Add to your application's `package.json`:

```json
"dependencies": {
  "@repo/ui": "workspace:*"
}
```

## Available Components

Components are exported from the package root or specific subpaths.

- **Shadcn/ui Components:** Standard components (Button, Input, Card, etc.) are likely available directly. Refer to the [Shadcn/ui documentation](https://ui.shadcn.com/docs/components) and the `src/components/shadcn` directory.
- **Custom Components:** Project-specific shared components are located in `src/components/custom`.

```typescript
// Assuming standard shadcn exports are re-exported from the root
import { Button, Input, Card } from '@repo/ui';
// Custom components might be exported similarly or from subpaths
// import { CustomComponent } from '@repo/ui/custom';

// Example usage:
<Button>Click Me</Button>
<Input placeholder="Enter text..." />
<Card>...</Card>
```

**The best way to explore available components and their usage is via Storybook.**

## Development & Storybook

This package uses [Storybook](https://storybook.js.org/) for component development and visualization. A specific configuration for custom components seems to be in use.

To run Storybook (from the monorepo root):

```bash
# Ensure dependencies are installed
pnpm install

# Run the custom Storybook configuration
pnpm --filter @repo/ui storybook:custom
```

This will open Storybook in your browser (usually port 6006), allowing you to view and interact with the components in isolation.

## Building

This package uses [tsup](https://tsup.egoist.dev/) to bundle components. To build the component library (from the monorepo root):

```bash
pnpm --filter @repo/ui build
```

## Testing

Unit/integration tests for custom components are written using [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

```bash
# Run tests for custom components once
pnpm --filter @repo/ui test:custom

# Run tests for custom components in watch mode
pnpm --filter @repo/ui test:custom:watch
```

## Styling

- Components are styled using Tailwind CSS.
- The `tailwind.config.mjs` file defines the theme (colors, fonts, radii) based on CSS variables, typical of Shadcn/ui setups.
- Ensure the consuming application's Tailwind configuration is set up to scan content from `@repo/ui`:

  ```javascript
  // Example in apps/web/tailwind.config.mjs
  module.exports = {
    content: [
      // ... other paths
      '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    ],
    // ... rest of config
  };
  ```

- Consuming applications also need to import the base CSS that defines the Tailwind/Shadcn theme variables, typically in their global CSS file:

  ```css
  /* Example in apps/web/app/globals.css */
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  /* Define theme variables */
  /* ... (e.g., from Shadcn theme generator) ... */
  ```
