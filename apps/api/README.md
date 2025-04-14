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
- **Module Structure**: Organized into feature modules (e.g., `Auth`, `Users`, `Casts`, `Comments`). Core functionality is in `src/common`.

## Getting Started

Ensure you have the prerequisites installed (Node.js 18+, pnpm 8+) and run `pnpm install` from the monorepo root.

### Environment Variables

Configuration is managed via environment variables.

1. **Local Development:** Copy `apps/api/.env.example` to `apps/api/.env.local`. Update the values, especially the database connection details:

   - `PORT`: Port the API will run on (default: 3000 or 4001 depending on context).
   - `DATABASE_HOST`: Database server hostname (e.g., `localhost`).
   - `DATABASE_PORT`: Database server port (e.g., `5432`).
   - `DATABASE_NAME`: Name of the database.
   - `DATABASE_USER`: Database username.
   - `DATABASE_PASSWORD`: Database password.
   - `JWT_SECRET`: A long, random string for signing JWTs.
   - Review `.env.local` for other optional settings (Redis, Sentry, etc.).

2. **Docker:** A separate `apps/api/.env.docker` file is provided for running within Docker. It typically uses `host.docker.internal` or a specific container network address for `DATABASE_HOST`.

### Database Setup

- Ensure you have a PostgreSQL server running and accessible.
- Create the database specified by `DATABASE_NAME` in your `.env.local` or `.env.docker` file.
- Run database migrations (see Development Commands).

## Development Commands (Run from Monorepo Root)

**Note:** Ensure your `.env.local` file is correctly configured before running these commands. Migration commands require valid database credentials.

```bash
# Start the API in development watch mode (builds dependencies)
pnpm --filter @repo/api dev

# Build the API for production
pnpm --filter @repo/api build

# Start the production build (requires .env variables set)
pnpm --filter @repo/api start:prod

# Run linters
pnpm --filter @repo/api lint

# Run unit tests
pnpm --filter @repo/api test

# Run e2e tests (requires a running database)
pnpm --filter @repo/api test:e2e

# Run database migrations
# Make sure DATABASE_* variables are set correctly in the relevant .env file
pnpm --filter @repo/api migration:run

# Generate a new migration file based on entity changes
# Replace <migration-name> with a descriptive name (e.g., AddUserProfile)
pnpm --filter @repo/api migration:generate <migration-name>

# Revert the last applied migration
pnpm --filter @repo/api migration:revert

# Run database seed script (if configured)
pnpm --filter @repo/api seed
```

## Running with Docker

1. **Build the Image:**

   - Ensure the Docker daemon is running.
   - Navigate to the monorepo root or use the `-f` flag to specify the Dockerfile location.

   ```bash
   # Standard build (uses cache)
   docker build -t ecocast-api-local -f apps/api/Dockerfile .

   # Build without cache (useful for troubleshooting build issues)
   docker buildx build --no-cache -t ecocast-api-local -f apps/api/Dockerfile .
   ```

2. **Run the Container:**

   - Ensure your database is accessible from the Docker container (see `.env.docker` for `DATABASE_HOST`).
   - Use the `apps/api/.env.docker` file for environment variables.
   - If running Docker on Linux/WSL and connecting to a host database, you typically need `--add-host`. Find your bridge IP with `docker network inspect bridge --format='{{(index .IPAM.Config 0).Gateway}}' | cat`.

   ```bash
   # Stop and remove any existing container with the same name first
   docker stop ecocast-api || true && docker rm ecocast-api || true

   # Example for Linux/WSL connecting to host DB (replace IP if different)
   docker run --add-host=host.docker.internal:172.17.0.1 --env-file apps/api/.env.docker -p 3000:3000 --name ecocast-api ecocast-api-local

   # Example for Docker Desktop (Mac/Windows)
   # docker run --env-file apps/api/.env.docker -p 3000:3000 --name ecocast-api ecocast-api-local

   # Run in detached mode (in the background)
   # Add the -d flag:
   # docker run -d --add-host=... --env-file ... -p ... --name ecocast-api ecocast-api-local
   ```

3. **Other Useful Docker Commands:**

   ```bash
   # View logs of the running container
   docker logs ecocast-api

   # Follow logs in real-time
   docker logs -f ecocast-api

   # Stop the container
   docker stop ecocast-api

   # Start a stopped container
   docker start ecocast-api

   # Remove the container (must be stopped first)
   docker rm ecocast-api

   # Execute a command inside the running container (e.g., open a shell)
   docker exec -it ecocast-api sh
   ```

## API Documentation

While the API is running (locally or in Docker), access the interactive Swagger documentation at [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

## Further Information

Refer to the main project [README.md](../../README.md) for overall architecture, deployment, and contribution guidelines.
