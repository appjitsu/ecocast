# Advanced Caching System

The EcoCast API includes a sophisticated caching system to improve performance and reduce database load.

## Features

- **Multiple Cache Strategies**: Choose between different caching strategies based on your needs
- **Tag-Based Invalidation**: Group cache entries by tags for selective invalidation
- **User-Specific Caching**: Cache responses per user when needed
- **ETag Support**: Validate cache freshness with HTTP ETags
- **Redis Integration**: Scale with distributed Redis caching in production
- **Programmatic Cache Control**: Easily manipulate cache through code

## Usage

### Basic Caching

For simple time-based caching, use the `CacheTTL` decorator:

```typescript
@Get('items')
@CacheTTL(300) // Cache for 5 minutes
getItems() {
  return this.itemsService.findAll();
}
```

### Advanced Caching

For more control, use the `CacheControl` decorator:

```typescript
@Get('users/:id/profile')
@CacheControl({
  ttl: 600,                    // Cache for 10 minutes
  strategy: CacheStrategy.VALIDATE, // Use ETag validation
  tags: ['user-profile', 'users'],  // Tag for selective invalidation
  varyByUser: true,            // Create separate cache entries per user
})
getUserProfile(@Param('id') id: string) {
  return this.usersService.getProfile(id);
}
```

### Cache Strategies

- **CACHE**: Standard caching - serve from cache when available
- **VALIDATE**: Cache with validation - use ETags to check freshness
- **BYPASS**: Skip caching - always fetch fresh data

### Programmatic Cache Invalidation

Inject the `CacheInvalidationService` to control cache from your services:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly cacheInvalidation: CacheInvalidationService) {}

  async updateUser(userId: string, data: UpdateUserDto) {
    // Update user in database
    const updatedUser = await this.usersRepository.update(userId, data);

    // Invalidate related cache entries
    await this.cacheInvalidation.invalidateByTags(['users', 'user-profile']);
    await this.cacheInvalidation.invalidateByUserId(userId);

    return updatedUser;
  }
}
```

## Configuration

Configure caching behavior in `config/cache.config.ts`:

```typescript
export default registerAs('cache', () => ({
  ttl: parseInt(process.env.CACHE_TTL || '300', 10), // Default: 5 minutes
  max: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  excludePaths: ['/auth/login', '/auth/register'],
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    // other Redis options...
  },
}));
```

## Redis Support

In production, enable Redis for distributed caching:

```bash
# .env.production
REDIS_ENABLED=true
REDIS_HOST=redis-server
REDIS_PORT=6379
```

## Best Practices

1. **Cache Selectively**: Only cache responses that are expensive to compute
2. **Choose Appropriate TTLs**: Set reasonable expiration times based on data volatility
3. **Use Tags Wisely**: Group related cache entries under common tags
4. **Consider ETag Validation**: For frequently accessed but rarely changed data
5. **Invalidate Precisely**: Don't clear the entire cache unless necessary
