# Shared TypeScript Types (@repo/types)

This package defines shared TypeScript types and interfaces used across the EcoCast monorepo, ensuring consistency between the API (`@repo/api`), frontend applications (`@repo/web`), and potentially other packages.

## Purpose

- Provide a single source of truth for data structures.
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

Import types directly from the package:

```typescript
import type { User, Cast, Comment } from '@repo/types';

function displayUser(user: User) {
  console.log(user.name);
}

async function fetchCast(id: string): Promise<Cast | null> {
  // ... implementation
}
```

## Key Types

_(Note: This section should be populated with examples of the most important or commonly used types defined in this package. Examples might include:)_

- `User`: Represents a user profile.
- `Cast`: Represents a piece of content.
- `Comment`: Represents a comment on a Cast.
- `Reaction`: Represents a reaction to a Cast or Comment.
- `ApiResponse`: Standard structure for API responses.
- `Pagination`: Common structure for paginated data.

## Contribution

When adding or modifying types, ensure they are clearly named and exported from the main `index.ts` file (or relevant sub-modules if the package grows).

## Building

This package might not require a build step if it only contains type definitions (`.ts` files). If it includes compiled output (e.g., for JavaScript consumers), a build command would be defined in its `package.json`.

To build (if applicable, run from monorepo root):

```bash
pnpm --filter @repo/types build
```
