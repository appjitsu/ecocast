import { SetMetadata } from '@nestjs/common';

/**
 * Cache strategy options
 */
export enum CacheStrategy {
  /**
   * Bypass cache and always fetch fresh data
   */
  BYPASS = 'bypass',

  /**
   * Cache data and serve from cache when available
   */
  CACHE = 'cache',

  /**
   * Cache data but validate if it's stale before using
   * Uses If-None-Match/ETag mechanism
   */
  VALIDATE = 'validate',
}

/**
 * Cache control options interface
 */
export interface CacheControlOptions {
  /**
   * Cache Time-To-Live in seconds
   */
  ttl?: number;

  /**
   * Cache strategy
   */
  strategy?: CacheStrategy;

  /**
   * Cache tags for targeted invalidation
   */
  tags?: string[];

  /**
   * Whether to vary cache by user
   * If true, separate cache entries will be created per user
   */
  varyByUser?: boolean;

  /**
   * Custom key generator function
   * If provided, this will be used to generate a cache key
   */
  keyGenerator?: (req: Request) => string;
}

export const CACHE_CONTROL_KEY = 'cache-control';

/**
 * Decorator for fine-grained cache control
 * @param options Cache control options
 */
export const CacheControl = (options: CacheControlOptions) =>
  SetMetadata(CACHE_CONTROL_KEY, options);
