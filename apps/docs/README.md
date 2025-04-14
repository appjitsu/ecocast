# EcoCast Documentation (@repo/docs)

This site contains the official documentation for the EcoCast project, built using [Next.js](https://nextjs.org/) and components from `@repo/ui`.

## Purpose

- Provide comprehensive guides for users and developers.
- Document the project architecture, API endpoints, and shared packages.
- Offer tutorials and examples.

## Technology

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Components**: `@repo/ui`
- **Development Server**: Uses Turbopack (`next dev --turbopack`)

## Getting Started

Ensure you have the prerequisites installed (Node.js 18+, pnpm 8+) and run `pnpm install` from the monorepo root.

No specific environment variables are required for basic local setup.

## Development Commands (Run from Monorepo Root)

```bash
# Start the documentation site in development mode
# Access at http://localhost:4002
pnpm --filter @repo/docs dev

# Build the documentation site for production
# Output will be in apps/docs/.next
pnpm --filter @repo/docs build

# Start the production server (requires build first)
pnpm --filter @repo/docs start

# Run linters
pnpm --filter @repo/docs lint

# Check TypeScript types
pnpm --filter @repo/docs check-types
```

## Project Structure

- **Pages/Content**: Located within the `apps/docs/app` directory following Next.js App Router conventions.
- **Styling**: Likely uses Tailwind CSS (if `@repo/ui` uses it) or standard CSS Modules/global CSS.
- **Configuration**: `next.config.js`, `tsconfig.json`.

## Deployment

This Next.js application can be deployed to platforms like [Vercel](https://vercel.com/) (recommended), [Netlify](https://www.netlify.com/), or as a standalone Node.js server.

## Contributing

Documentation contributions are welcome! Please follow the structure and style of existing documentation pages.

## Further Information

Refer to the main project [README.md](../../README.md) for overall architecture and contribution guidelines.
