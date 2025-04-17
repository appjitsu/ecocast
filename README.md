# EcoCast

A turbo-based web application for creating and publishing AI-generated podcasts from news streams.

[![CI/CD Pipeline](https://github.com/appjitsu/ecocast/actions/workflows/ci.yml/badge.svg)](https://github.com/appjitsu/ecocast/actions/workflows/ci.yml)

## Project Overview

EcoCast consists of multiple applications and shared packages:

- **Web App**: Next.js frontend for content management and publishing
- **API**: NestJS backend for data storage and business logic
- **Docs**: Documentation site
- **Shared Packages**: Common utilities, UI components, and types

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ecocast3.git
cd ecocast3

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development servers
pnpm dev
```

## Architecture

### Apps

- `apps/web`: Next.js frontend application (port 4000)
- `apps/api`: NestJS backend API (port 3000)
- `apps/docs`: Documentation site

### Packages

- `packages/types`: Shared TypeScript types
- `packages/ui`: Shared UI components
- `packages/utils`: Shared utility functions
- `packages/eslint-config`: ESLint configuration
- `packages/typescript-config`: TypeScript configuration

## Development Workflow

### Running Apps

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter @repo/web dev
pnpm --filter @repo/api dev
```

### Building

```bash
# Build all packages and apps
pnpm build

# Build specific package or app
pnpm --filter @repo/utils build
```

### Linting

```bash
# Lint all packages and apps
pnpm lint

# Lint specific package or app
pnpm --filter @repo/web lint
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package or app
pnpm --filter @repo/api test
```

## Best Practices

### Code Organization

- Each app and package has its own `package.json` and build configuration
- Use the shared packages for code reuse across apps
- Follow the established patterns in each app

### Utilities Package

- Import utilities from `@repo/utils` instead of implementing common functions
- Available utilities include:
  - Object operations: pick, omit, deepClone, isEqual
  - Array operations: chunk, unique, shuffle, groupBy
  - String operations: truncate, capitalize, slugify
  - Date formatting: formatDate, formatDateTime, timeAgo
  - Error handling: AppError, normalizeError, getUserFriendlyErrorMessage
  - UI utilities: cn (class merging)

### API Communication

- Use the fetch helpers in `apps/web/lib/api/fetch-helpers.ts` for API requests
- Handle errors consistently using the error utilities

### UI Components

- Use the shared UI components from `@repo/ui`
- Follow the established styling patterns

## Deployment

## Environment Variables

Create a `.env` file in each app directory with the following variables:

**Web App**:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**API**:

```
DATABASE_URL=postgresql://user:password@localhost:5432/ecocast
JWT_SECRET=your-secret-key
CACHE_TTL=300  # Cache time-to-live in seconds (5 minutes)
CACHE_MAX_ITEMS=1000  # Maximum number of items in cache
```

### Continuous Integration (CI)

The project uses GitHub Actions for CI. The workflow (`.github/workflows/ci.yml`) performs the following checks on push and pull requests:

1. **Setup**: Checks out code, sets up Node.js, pnpm, and caches dependencies.
2. **Lint & Format**: Runs ESLint and Prettier checks.
3. **Type Check**: Verifies TypeScript types across the monorepo.
4. **Build**: Builds all packages and applications.
5. **Test**: Runs unit and integration tests.
6. **E2E Test**: Runs end-to-end tests for the API.

## API Documentation

Interactive API documentation is available using Swagger UI:

- When running the API locally, access it at: `http://localhost:3000/api/docs`
- Documentation includes all endpoints, request parameters, and response formats
- Authentication using JWT Bearer tokens is fully supported
- Test API endpoints directly from the UI

## Monitoring and Health Checks

The API includes a comprehensive health check system:

- Health endpoint: `GET /health`
- Monitors database connectivity, memory usage, and disk space
- Returns standardized health check information following industry best practices
- Suitable for use with container orchestration systems like Kubernetes

Health check response example:

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "disk": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "message": "heap usage: 67MB/250MB"
    },
    "memory_rss": {
      "status": "up",
      "message": "rss usage: 89MB/300MB"
    },
    "disk": {
      "status": "up",
      "message": "disk usage: 78%/90%"
    }
  }
}
```

## Database Management

### Database Migrations

The API uses TypeORM migrations for database schema management:

- All schema changes are versioned and tracked in code
- Migrations run automatically when the application starts
- Manual migration commands are available for development and CI/CD

Available migration commands:

```bash
# Generate a new migration from entity changes
pnpm --filter @repo/api migration:generate

# Create a new empty migration
pnpm --filter @repo/api migration:create

# Run all pending migrations
pnpm --filter @repo/api migration:run

# Revert the most recent migration
pnpm --filter @repo/api migration:revert

# Show all migrations and their status
pnpm --filter @repo/api migration:show
```

### Database Seeding

Seed scripts are available to populate the database with initial data:

```bash
# Run database seeding
pnpm --filter @repo/api seed
```

## Security Features

The API implements several security features to protect against common web vulnerabilities:

### HTTP Security Headers

- **Helmet Middleware**: Adds security HTTP headers to help protect against various attacks:
  - Content-Security-Policy
  - X-XSS-Protection
  - X-Content-Type-Options
  - Referrer-Policy
  - X-Frame-Options

### CSRF Protection

- **CSRF Tokens**: Protection against Cross-Site Request Forgery attacks
- The API sets CSRF tokens via cookies (`XSRF-TOKEN`) and checks for them in request headers (`X-CSRF-Token`)
- Automatically excluded for authentication endpoints and public APIs
- Only applied in production environments

### Rate Limiting

The API implements tiered rate limiting to prevent abuse:

- **Authentication Endpoints**: Stricter limits (5 requests per minute) to prevent brute-force attacks
- **Public Endpoints**: Higher limits (25 requests per 5 seconds) for monitoring and documentation
- **Regular Endpoints**: Standard limits (10 requests per 10 seconds)

Rate limiting is based on client IP addresses and can be configured through environment variables.

### Input Validation

- All input data is validated using class-validator decorators
- Malformed requests are automatically rejected with appropriate error messages
- Input sanitation is applied to prevent injection attacks

### Error Handling

Enhanced error handling that:

- Provides meaningful error messages to clients
- Logs detailed information for debugging
- Obscures sensitive information in production
- Reports critical errors to Sentry (when configured)
- Includes database-specific error handling with user-friendly messages

### OAuth2 Authentication

The API supports OAuth2 authentication with popular providers:

- **Google Authentication**: Users can register and login with their Google accounts
- **Automatic Account Creation**: New accounts are created automatically for first-time OAuth users
- **Email Verification**: Email addresses from OAuth providers are automatically verified
- **Linking Accounts**: Users can link their local accounts with OAuth providers

To enable Google OAuth authentication, set the following environment variables:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:4000
```

Google OAuth authentication flow:

1. User is redirected to `/auth/google` to initiate the authentication process
2. After successful authentication with Google, the user is redirected to the callback URL
3. The API creates or retrieves the user account and generates JWT tokens
4. User is redirected to the frontend with the access token in the URL parameters
5. Refresh token is stored in an HTTP-only cookie for secure token renewal

### Session Management

The API implements a robust session management system with Redis:

- **Persistent Sessions**: User sessions are stored in Redis for persistence across server restarts
- **Secure Cookies**: Session IDs are stored in HTTP-only, secure cookies
- **Configurable Duration**: Session lifetime is configurable via environment variables
- **Distributed Architecture**: Works across multiple server instances for horizontal scaling
- **Auto-Cleanup**: Expired sessions are automatically removed from Redis

Session configuration options:

```
SESSION_SECRET=your-session-secret-key
SESSION_MAX_AGE=604800000  # 7 days in milliseconds
```

When using Redis for sessions, user authentication state is maintained even if the API server restarts, providing a seamless user experience.

## Performance Monitoring

The API includes several performance optimizations and monitoring capabilities:

### Response Compression

All API responses are automatically compressed using gzip, reducing bandwidth usage and improving response times for clients.

### Advanced Logging

- **Structured Logging**: All logs are in JSON format for easier parsing and analysis
- **Log Rotation**: Production logs are automatically rotated based on file size
- **Sensitive Data Redaction**: Authorization headers, cookies, and passwords are automatically redacted from logs
- **Log Levels**: Different log levels (debug, info, warning, error) based on environment
- **Request Context**: Each log entry includes request ID, user ID, and other contextual information

### OpenTelemetry Integration

The API includes OpenTelemetry instrumentation for distributed tracing and metrics:

- **Automatic Instrumentation**: HTTP requests, database queries, and framework operations are automatically traced
- **Custom Metrics**: Key business metrics can be tracked and monitored
- **Exporters**: Configured to send telemetry data to your monitoring system of choice
- **Resource Attributes**: Service name, version, and environment are automatically included

To enable OpenTelemetry, set the following environment variables:

```
ENABLE_TELEMETRY=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-collector:4318
```

This can be used with monitoring systems like Jaeger, Zipkin, or cloud providers' APM solutions.

## WebSockets for Real-time Updates

The API includes WebSocket support for real-time communication:

- **Event Broadcasting**: Send real-time updates to all connected clients
- **User-specific Messages**: Target updates to specific users
- **Connection Management**: Track connected clients and authenticated users
- **Automatic Serialization**: JSON data is automatically serialized/deserialized

WebSockets can be consumed by the frontend using Socket.io client:

```typescript
// Frontend example with Socket.io-client
import { io } from 'socket.io-client';

// Connect to the WebSocket server
const socket = io('http://localhost:3000/events', {
  withCredentials: true,
});

// Listen for events
socket.on('connect', () => {
  console.log('Connected to WebSocket server');

  // Identify the user (after authentication)
  socket.emit('identity', { userId: 'user-id-here' });
});

socket.on('file:created', (data) => {
  console.log('New file uploaded:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});
```

## File Upload Functionality

The API provides a comprehensive file upload system:

- **Single File Upload**: Upload individual files with metadata
- **Multiple File Upload**: Upload up to 10 files simultaneously
- **File Type Validation**: Restrict uploads to allowed file types (images, PDFs, documents)
- **Size Limits**: Prevent oversized uploads (default: 5MB per file)
- **Secure Storage**: Files are stored with unique names and proper permissions
- **Real-time Notifications**: WebSocket events are emitted when files are uploaded or deleted

Example usage:

```typescript
// Upload a single file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/uploads/file', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log('Uploaded file:', result);
// { fileId: '123e4567-e89b-12d3-a456-426614174000', filename: 'document.pdf', url: '/uploads/123e4567-e89b-12d3-a456-426614174000' }
```

## Contributing

1. Create a new branch for your feature: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `pnpm test`
4. Run linting: `pnpm lint`
5. Commit your changes: `git commit -m "Add my feature"`
6. Push to the branch: `git push origin feature/my-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
