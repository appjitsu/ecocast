# EcoCast Web App (@repo/web)

This Next.js application serves as the primary user interface for the EcoCast platform. Users can use this application to browse, create, manage, and publish eco-focused content (Casts).

## Features

- **Content Creation & Management**: Rich text editor and tools for creating and managing Casts.
- **User Authentication**: Login, registration, and profile management integrated with the EcoCast API.
- **Content Discovery**: Browsing, searching, and filtering Casts.
- **Interaction**: Commenting and reacting to Casts.
- **Responsive Design**: UI adapted for various screen sizes.
- **Shared UI Components**: Utilizes components from the `@repo/ui` package.
- **Type Safety**: Fully typed codebase with TypeScript.

## Key Technologies

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI**: [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/) / [Shadcn/ui](https://ui.shadcn.com/) (via `@repo/ui`), [Lucide Icons](https://lucide.dev/)
- **State Management**: React Context/Hooks (potentially others like Zustand or Jotai if used)
- **Testing**: [Jest](https://jestjs.io/) (Unit/Integration), [Playwright](https://playwright.dev/) (E2E)
- **Utilities**: `@repo/utils`, `@repo/types`

## Getting Started

Ensure you have the prerequisites installed (Node.js 18+, pnpm 8+) and run `pnpm install` from the monorepo root.

### Environment Variables

Configuration is managed via environment variables. Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in the required values:

- **`NEXT_PUBLIC_API_URL` (Required)**: The full URL of the running EcoCast API backend (e.g., `http://localhost:4001` or `http://localhost:3000` if using the default Docker port).
- `NEXT_PUBLIC_APP_URL`: The public URL of this web application itself (e.g., `http://localhost:4000`).
- Other `NEXT_PUBLIC_*` variables in `.env.example` are optional for features like Sentry, Analytics, Stripe etc.

**Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do not put secrets in these.

## Development Commands (Run from Monorepo Root)

```bash
# Start the web app in development mode
# Access at http://localhost:4000
# Also builds @repo/utils and runs Jest in watch mode concurrently.
pnpm --filter @repo/web dev

# Build the web app for production
# Output will be in apps/web/.next
pnpm --filter @repo/web build

# Start the production server (requires build first)
pnpm --filter @repo/web start

# Run linters
pnpm --filter @repo/web lint

# Check TypeScript types
pnpm --filter @repo/web type-check
```

## Testing

```bash
# Run unit/integration tests once
pnpm --filter @repo/web test

# Run unit/integration tests in watch mode
pnpm --filter @repo/web test:watch

# Run end-to-end tests using Playwright (requires a running app and API)
pnpm --filter @repo/web test:e2e
```

## Deployment

This Next.js application is typically deployed to platforms like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/). Ensure all required environment variables (including non-public ones if any) are set in the deployment environment.

## Further Information

Refer to the main project [README.md](../../README.md) for overall architecture, deployment, and contribution guidelines.
