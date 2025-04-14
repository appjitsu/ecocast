# Shared TypeScript Types (@repo/types)

This package defines shared TypeScript types, interfaces, and Data Transfer Objects (DTOs) used across the EcoCast monorepo, ensuring consistency between the API (`@repo/api`), frontend applications (`@repo/web`), and potentially other packages. It may also utilize [Zod](https://zod.dev/) for schema validation definitions within the types.

## Purpose

- Provide a single source of truth for data structures and API contracts.
- Enable type safety across different parts of the application stack.
- Reduce duplication of type definitions.

## Installation

This package is intended to be used as a workspace dependency.

Add to the `package.json` of any app or package that needs these types:

```json
"dependencies": {
  "@repo/types": "workspace:*"
}
// or
"devDependencies": {
  "@repo/types": "workspace:*"
}
```

## Usage

Import types, DTOs, or enums directly from the package:

```typescript
import type {
  User,
  Cast,
  ICreateCastDTO,
  PaginatedResponse,
} from '@repo/types';
import { AuthType } from '@repo/types';

function displayUser(user: User) {
  console.log(user.name);
}

async function createCast(data: ICreateCastDTO): Promise<Cast> {
  // ... implementation using API
}
```

## Key Exports

This package exports various types, interfaces, DTOs, and potentially enums/constants. Some key examples include:

- **Authentication:** `AuthTokens`, `RequestWithUser`, `ActiveUserData`, `AuthType` (enum), `GoogleUser`
- **Users:** `User`
- **Casts:** `Cast`, `ICreateCastDTO`, `IGetCastsDto`, `IPatchCastDTO`
- **API Structures:** `PaginatedResponse`
- **Environment:** `EnvironmentVariables` (likely used with Zod for validation)

Refer to the `src/` directory and the main `src/index.ts` export file for a complete list.

## Contribution

When adding or modifying types/DTOs, ensure they are clearly named and exported from the main `index.ts` file or relevant sub-modules. If using Zod, define schemas alongside the corresponding types where appropriate.

## Building

This package uses [tsup](https://tsup.egoist.dev/) to bundle the TypeScript source into JavaScript (`.js`, `.mjs`) and declaration files (`.d.ts`) in the `dist/` directory. A build step is required after making changes.

To build (run from monorepo root):

```bash
pnpm --filter @repo/types build
```

To watch for changes and rebuild automatically during development:

```bash
pnpm --filter @repo/types dev
```
