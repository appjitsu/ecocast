# EcoCast Web App (@repo/web)

This Next.js application serves as the primary user interface for the EcoCast platform. Users can use this application to browse, create, manage, and publish eco-focused content (Casts).

## Features

- **Content Creation & Management**: Rich text editor and tools for creating and managing Casts.
- **User Authentication**: Login, registration, and profile management integrated with the EcoCast API.
- **Content Discovery**: Browsing, searching, and filtering Casts.
- **Interaction**: Commenting and reacting to Casts.
- **Responsive Design**: UI adapted for various screen sizes using Tailwind CSS.
- **Shared UI Components**: Utilizes components from the `@repo/ui` package.
- **TypeScript**: Fully typed codebase.

## Getting Started

Ensure you have the prerequisites installed (Node.js 18+, pnpm 8+) and run `pnpm install` from the monorepo root.

Set up the necessary environment variables in an `apps/web/.env` file. The primary variable needed is:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

(Adjust the URL if your API runs on a different port or host).

## Development Commands (Run from Monorepo Root)

```bash
# Start the web app in development mode (usually on port 4000)
pnpm --filter @repo/web dev

# Build the web app for production
pnpm --filter @repo/web build

# Start the production server
pnpm --filter @repo/web start

# Run linters
pnpm --filter @repo/web lint
```

## Key Technologies

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- Shared components from `@repo/ui`
- Shared utilities from `@repo/utils`

## Further Information

Refer to the main project [README.md](../../README.md) for overall architecture, deployment, and contribution guidelines.
