# EcoCast

A modern web application for environmental awareness and sustainability tracking.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **API:** NestJS
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** JWT + Google OAuth
- **Styling:** Tailwind CSS
- **State Management:** React Query + Zustand
- **Testing:** Jest + Playwright
- **Documentation:** Compodoc (API) + TypeDoc (Web)

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+

## Project Structure

```
.
├── apps/
│   ├── api/          # NestJS API
│   ├── docs/         # Documentation site
│   └── web/          # Next.js web app
├── packages/
│   ├── eslint-config/    # Shared ESLint config
│   ├── typescript-config/ # Shared TypeScript config
│   ├── ui/              # Shared UI components
│   ├── utils/           # Shared utilities
│   └── types/          # Shared TypeScript types
```

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ecocast.git
   cd ecocast
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   ```

4. Start the development servers:
   ```bash
   pnpm dev
   ```

## Development

- **Web App:** [http://localhost:3000](http://localhost:3000)
- **API:** [http://localhost:3001](http://localhost:3001)
- **API Docs:** [http://localhost:3001/docs](http://localhost:3001/docs)
- **Component Docs:** [http://localhost:3002](http://localhost:3002)

### Commands

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm lint` - Lint all files
- `pnpm format` - Format all files

## Testing

- Unit tests: `pnpm test`
- E2E tests: `pnpm test:e2e`
- Coverage report: `pnpm test:coverage`

## Deployment

The application is automatically deployed through GitHub Actions:

- Push to `main` - Deploys to staging
- Create a release - Deploys to production

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `pnpm test`
4. Commit your changes using conventional commits
5. Push to the branch: `git push origin feature/your-feature`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
