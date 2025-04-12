# Shared UI Components (@repo/ui)

This package contains shared React UI components used across the EcoCast frontend applications (e.g., `@repo/web`). It leverages [Tailwind CSS](https://tailwindcss.com/) for styling and potentially uses [shadcn/ui](https://ui.shadcn.com/) components.

## Purpose

- Provide a consistent look and feel across applications.
- Promote code reuse for common UI elements.
- Centralize UI component logic and styling.

## Installation

This package is intended to be used as a workspace dependency.

Add to your application's `package.json`:

```json
"dependencies": {
  "@repo/ui": "workspace:*"
}
```

## Available Components

Components are exported from the package root.

```typescript
import { Button, Input, Card } from '@repo/ui';

// Example usage:
<Button>Click Me</Button>
<Input placeholder="Enter text..." />
<Card>...</Card>
```

_(Note: This list is illustrative. A more detailed list or link to Storybook documentation should be added here based on the actual components in `src/components`.)_

## Development & Storybook

This package likely uses [Storybook](https://storybook.js.org/) for component development and visualization.

To run Storybook (from the monorepo root):

```bash
# Ensure dependencies are installed
pnpm install

# Run Storybook for the UI package
pnpm --filter @repo/ui storybook
```

This will typically open Storybook in your browser, allowing you to view and interact with the components in isolation.

## Building

To build the component library (from the monorepo root):

```bash
pnpm --filter @repo/ui build
```

## Styling

- Components are styled using Tailwind CSS.
- The `tailwind.config.mjs` file defines the theme and plugins.
- Ensure the consuming application's Tailwind configuration is set up to scan content from `@repo/ui`:

  ```javascript
  // Example in apps/web/tailwind.config.js
  module.exports = {
    content: [
      // ... other paths
      '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    ],
    // ... rest of config
  };
  ```
