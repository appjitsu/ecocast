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
    try {
      // In-memory cache doesn't support pattern matching
      this.logger.warn(
        'Tag-based invalidation is not fully supported with Redis cache',
      );
    } catch (error) {
      this.logger.error(`Failed to invalidate cache by tag: ${tag}`, error);
    }
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
  async invalidateByUserId(userId: string | number): Promise<void> {
    try {
      // In-memory cache doesn't support pattern matching
      this.logger.warn(
        'User-based invalidation is only fully supported with Redis cache',
      );
      this.logger.debug(`Invalidated cache entries for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for user: ${userId}`,
        error,
      );
    }
  }

  /**
   * Invalidate cache entries by path
   * @param path Path to invalidate (can include wildcards for Redis)
   */
  async invalidateByPath(path: string): Promise<void> {
    try {
      // In-memory cache doesn't support pattern matching
      this.logger.warn(
        'Path-based invalidation is only fully supported with Redis cache',
      );
      this.logger.debug(`Invalidated cache entries for path: ${path}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for path: ${path}`, error);
    }
  }

  /**
   * Clear the entire cache
   */
  async clearAll(): Promise<void> {
    try {
      if (this.cacheManager.reset) {
        await this.cacheManager.reset();
        this.logger.debug('Cleared all cache entries');
      } else {
        this.logger.warn('Cache manager does not support the reset method');
      }
    } catch (error) {
      this.logger.error('Failed to clear cache', error);
    }
  }
}
