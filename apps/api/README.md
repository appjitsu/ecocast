# EcoCast API (@repo/api)

This NestJS application serves as the backend API for the EcoCast project. It handles data persistence, business logic, user authentication, content management, and provides data to the frontend applications.

## Features

- **RESTful API**: Provides endpoints for managing users, content (casts), comments, reactions, etc.
- **Authentication**: JWT-based authentication and authorization.
- **Database**: Uses PostgreSQL with TypeORM for data persistence and migrations.
- **Caching**: Advanced caching system with Redis support (See `src/common/cache/README.md`).
- **Webhooks**: System for notifying external services of events (See `src/common/webhooks/README.md`).
- **Validation**: Input validation using class-validator and Zod schemas (via `@repo/utils`).
- **Configuration**: Environment-based configuration management.
- **Health Checks**: Comprehensive health monitoring endpoint (`/health`).
- **API Documentation**: Interactive Swagger/OpenAPI documentation available at `/api/docs`.

## Getting Started

Ensure you have the prerequisites installed (Node.js 18+, pnpm 8+) and run `pnpm install` from the monorepo root.

Set up the necessary environment variables in an `apps/api/.env` file (refer to the root `README.md` for required variables like `DATABASE_URL`, `JWT_SECRET`, etc.).

## Development Commands (Run from Monorepo Root)

```bash
# Start the API in development watch mode
pnpm --filter @repo/api dev

# Build the API for production
pnpm --filter @repo/api build

# Run linters
pnpm --filter @repo/api lint

# Run unit tests
pnpm --filter @repo/api test

# Run e2e tests
pnpm --filter @repo/api test:e2e

# Run database migrations
pnpm --filter @repo/api migration:run

# Generate a new migration
pnpm --filter @repo/api migration:generate <migration-name>

# Revert the last migration
pnpm --filter @repo/api migration:revert
```

## API Documentation

While the API is running in development mode, access the interactive Swagger documentation at [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

## Further Information

Refer to the main project [README.md](../../README.md) for overall architecture, deployment, and contribution guidelines.
