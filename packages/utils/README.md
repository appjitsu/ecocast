# @repo/utils

Shared utility functions for the EcoCast project. These utilities provide common functionality that can be reused across the codebase, leveraging libraries like [date-fns](https://date-fns.org/) for dates, [Zod](https://zod.dev/) for validation schemas, and [clsx](https://github.com/lukeed/clsx)/[tailwind-merge](https://github.com/dcastil/tailwind-merge) for UI class utilities.

## Installation

No installation required. This package is available as a workspace dependency.

Add to your package.json:

```json
"dependencies": {
  "@repo/utils": "workspace:*"
}
```

## Utilities

### Object Utilities

- **pick**: Create a new object with only the specified keys
- **omit**: Create a new object without the specified keys
- **deepClone**: Create a deep clone of an object
- **isEqual**: Compare two values for deep equality

```typescript
import { pick, omit, deepClone, isEqual } from '@repo/utils';

// Examples
const subset = pick(user, ['id', 'name', 'email']);
const withoutSensitive = omit(user, ['password']);
const copy = deepClone(originalData);
const hasChanged = !isEqual(previousState, currentState);
```

### Array Utilities

- **chunk**: Split an array into chunks of a specified size
- **unique**: Remove duplicates from an array
- **shuffle**: Randomly shuffle an array
- **groupBy**: Group array items by a specified key

```typescript
import { chunk, unique, shuffle, groupBy } from '@repo/utils';
```

### String Utilities

- **truncate**: Truncate a string to a specified length
- **capitalize**: Capitalize a string
- **slugify**: Convert a string to a URL-friendly slug
- **generateRandomString**: Generate a random string of specified length

```typescript
import {
  truncate,
  capitalize,
  slugify,
  generateRandomString,
} from '@repo/utils';
```

### Date Utilities

- **formatDate**: Format a date as "Month day, year"
- **formatDateTime**: Format a date with time
- **timeAgo**: Get a relative time string (e.g., "2 hours ago")

```typescript
import { formatDate, formatDateTime, timeAgo } from '@repo/utils';
```

### Validation Utilities

- **emailSchema**: Zod schema for validating emails
- **passwordSchema**: Zod schema for validating passwords
- **slugSchema**: Zod schema for validating URL slugs
- **urlSchema**: Zod schema for validating URLs

```typescript
import {
  emailSchema,
  passwordSchema,
  slugSchema,
  urlSchema,
} from '@repo/utils';
```

### UI Utilities

- **cn**: Utility for merging Tailwind CSS classes with clsx

```typescript
import { cn } from '@repo/utils';

// Example
<div className={cn('default-class', isActive && 'active-class')}>
```

## Usage Guidelines

1. Always import from the main package, not individual files:

```typescript
// ✅ Do this
import { slugify, formatDate } from '@repo/utils';

// ❌ Don't do this
import { slugify } from '@repo/utils/string';
```

2. When adding new utilities, make sure they're properly typed and exported from the main index.ts file.

3. Consider adding tests for any new functionality to ensure reliability.

## Building

This package uses [tsup](https://tsup.egoist.dev/) to bundle the utilities.

```bash
# Build once (run from monorepo root)
pnpm --filter @repo/utils build

# Watch for changes (run from monorepo root)
pnpm --filter @repo/utils dev
```

## Testing

Tests are written using [Jest](https://jestjs.io/).

```bash
# Run tests once (run from monorepo root)
pnpm --filter @repo/utils test
```
