import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

// Updated interfaces to properly extend Cache
interface CacheManagerWithDel extends Omit<Cache, 'del'> {
  del(key: string): Promise<void>;
}

interface CacheManagerWithReset extends Omit<Cache, 'reset'> {
  reset(): Promise<void>;
}

/**
 * Service for invalidating cache entries
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);
  private readonly cacheManager: CacheManagerWithDel & CacheManagerWithReset;

  constructor(@Inject(CACHE_MANAGER) cacheManager: Cache) {
    this.cacheManager = cacheManager as CacheManagerWithDel &
      CacheManagerWithReset;
  }

  /**
   * Invalidate a specific cache key
   * @param key Cache key to invalidate
   */
  async invalidateKey(key: string): Promise<void> {
    try {
      if (typeof this.cacheManager.del === 'function') {
        await this.cacheManager.del(key);
        this.logger.debug(`Invalidated cache key: ${key}`);
      } else {
        this.logger.warn('Cache manager does not support the del method');
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate cache key: ${key}`, error);
    }
  }

  /**
   * Invalidate all cache entries with a specific tag
   * @param tag Tag to invalidate
   */
  async invalidateByTag(tag: string): Promise<void> {
    this.logger.warn(
      `Attempting tag-based invalidation for [${tag}]. Full pattern matching may not be supported by the current cache store.`,
    );
    // If using a store like Redis, you might access underlying client methods here, e.g.:
    // const redisClient = (this.cacheManager.store as any).getClient();
    // const keys = await redisClient.keys(`${tag}:*`);
    // for (const key of keys) { await this.cacheManager.del(key); }
  }

  /**
   * Invalidate all cache entries matching multiple tags
   * @param tags Tags to invalidate
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.invalidateByTag(tag);
    }
  }

  /**
   * Invalidate cache entries by user ID
   * @param userId User ID
   */
  async invalidateByUserId(userId: string): Promise<void> {
    this.logger.warn(
      `Attempting user ID-based invalidation for [${userId}]. Full pattern matching may not be supported by the current cache store.`,
    );
    // Similar pattern to invalidateByTag if using a store that supports key patterns.
  }

  /**
   * Invalidate cache entries by path
   * @param path Path to invalidate (can include wildcards for Redis)
   */
  async invalidateByPath(path: string): Promise<void> {
    try {
      this.logger.log(`Invalidating cache entry for exact path: ${path}`);
      await this.cacheManager.del(path); // Await direct deletion by key
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for path: ${path}`, error);
    }
  }

  /**
   * Clear the entire cache
   */
  async invalidateAll(): Promise<void> {
    try {
      this.logger.log('Invalidating all cache entries');
      await this.cacheManager.reset();
    } catch (error) {
      this.logger.error('Failed to reset cache', error);
    }
  }
}
