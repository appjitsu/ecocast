import { SetMetadata } from '@nestjs/common';
import {
  CACHE_CONTROL_METADATA,
  CACHE_KEY_OPTIONS_METADATA,
  CacheControlOptions,
  CacheKeyOptions,
  NO_CACHE_METADATA,
} from '../interceptors/cache.interceptor';

/**
 * Decorator to set cache control options for a route
 * @param options Cache control options
 * @returns Decorator
 */
export function CacheControl(options: CacheControlOptions) {
  return SetMetadata(CACHE_CONTROL_METADATA, options);
}

/**
 * Decorator to disable caching for a route
 * @returns Decorator
 */
export function NoCache() {
  return SetMetadata(NO_CACHE_METADATA, true);
}

/**
 * Decorator to set cache key options for a route
 * @param options Cache key options
 * @returns Decorator
 */
export function CacheKey(options: CacheKeyOptions) {
  return SetMetadata(CACHE_KEY_OPTIONS_METADATA, options);
}

/**
 * Decorator to enable public caching with the specified max age
 * @param maxAge Maximum age in seconds
 * @param staleWhileRevalidate Optional stale-while-revalidate value
 * @returns Decorator
 */
export function PublicCache(maxAge = 60, staleWhileRevalidate?: number) {
  return CacheControl({
    public: true,
    maxAge,
    staleWhileRevalidate,
  });
}

/**
 * Decorator to enable private (user-specific) caching
 * @param maxAge Maximum age in seconds
 * @returns Decorator
 */
export function PrivateCache(maxAge = 60) {
  return CacheControl({
    private: true,
    maxAge,
  });
}

/**
 * Decorator to enable browser caching but validate on each request
 * @returns Decorator
 */
export function MustRevalidate() {
  return CacheControl({
    public: true,
    noCache: true,
    mustRevalidate: true,
  });
}

/**
 * Decorator to completely disable caching
 * @returns Decorator
 */
export function NeverCache() {
  return CacheControl({
    noStore: true,
    noCache: true,
    maxAge: 0,
  });
}

/**
 * Decorator for immutable content that doesn't change (e.g. static assets)
 * @param maxAge Maximum age in seconds (default: 1 year)
 * @returns Decorator
 */
export function ImmutableCache(maxAge = 31536000) {
  return CacheControl({
    public: true,
    maxAge,
    immutable: true,
  });
}

/**
 * Decorator for CDN-optimized caching
 * @param browserMaxAge Client cache max age
 * @param cdnMaxAge CDN cache max age
 * @returns Decorator
 */
export function CdnCache(browserMaxAge = 60, cdnMaxAge = 2592000) {
  return CacheControl({
    public: true,
    maxAge: browserMaxAge,
    sharedMaxAge: cdnMaxAge,
    staleWhileRevalidate: 60,
    staleIfError: 86400,
  });
}
