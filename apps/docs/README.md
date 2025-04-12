# EcoCast Documentation (@repo/docs)

This site contains the official documentation for the EcoCast project.

## Purpose

- Provide comprehensive guides for users and developers.
- Document the project architecture, API endpoints, and shared packages.
- Offer tutorials and examples.

## Technology

This documentation site is built using [Next.js](https://nextjs.org/) and likely utilizes a documentation-specific framework like [Nextra](https://nextra.site/) or is custom-built.

(Note: Update the specific technology if a framework like Nextra, Docusaurus, etc., is used).

## Getting Started

Ensure you have the prerequisites installed (Node.js 18+, pnpm 8+) and run `pnpm install` from the monorepo root.

## Development Commands (Run from Monorepo Root)

```bash
# Start the documentation site in development mode (check console for port)
pnpm --filter @repo/docs dev

# Build the documentation site for production
pnpm --filter @repo/docs build

# Start the production server
pnpm --filter @repo/docs start

# Run linters
pnpm --filter @repo/docs lint
```

## Contributing

Documentation contributions are welcome! Please follow the structure and style of existing documentation pages.

## Further Information

Refer to the main project [README.md](../../README.md) for overall architecture and contribution guidelines.
