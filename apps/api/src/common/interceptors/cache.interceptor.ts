import {
  Cache,
  CacheInterceptor as NestCacheInterceptor,
} from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

interface User {
  id?: string;
}

/**
 * Custom cache key generator options
 */
export interface CacheKeyOptions {
  /**
   * Include query parameters in the cache key
   */
  includeQuery?: boolean;
  /**
   * Include user ID in the cache key for user-specific caching
   */
  includeUserId?: boolean;
  /**
   * Include specific headers in the cache key
   */
  includeHeaders?: string[];
  /**
   * Include HTTP method in the cache key
   */
  includeMethod?: boolean;
  /**
   * Custom cache key prefix
   */
  prefix?: string;
}

/**
 * Cache control decorator options
 */
export const CACHE_CONTROL_METADATA = 'cache_control_metadata';
export interface CacheControlOptions {
  maxAge?: number;
  sharedMaxAge?: number;
  noCache?: boolean;
  noStore?: boolean;
  private?: boolean;
  public?: boolean;
  mustRevalidate?: boolean;
  proxyRevalidate?: boolean;
  immutable?: boolean;
  staleWhileRevalidate?: number;
  staleIfError?: number;
}

/**
 * No cache decorator
 */
export const NO_CACHE_METADATA = 'no_cache_metadata';

/**
 * Cache key options metadata key
 */
export const CACHE_KEY_OPTIONS_METADATA = 'cache_key_options_metadata';

/**
 * Cache key metadata key
 */
export const CACHE_KEY_METADATA = 'cache_key_metadata';

/**
 * Enhanced HTTP cache interceptor that supports advanced cache control
 * and cache key generation options.
 */
@Injectable()
export class HttpCacheInterceptor extends NestCacheInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);
  protected readonly reflector: Reflector;

  constructor(cacheManager: Cache, reflector: Reflector) {
    super(cacheManager, reflector);
    this.reflector = reflector;
  }

  /**
   * Check if request can be cached
   */
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const req = this.getRequest(context);

    // Skip cache for non-GET methods
    if (req.method !== 'GET') {
      return false;
    }

    // Check if cache is explicitly disabled
    const noCache = this.reflector.get<boolean | undefined>(
      NO_CACHE_METADATA,
      context.getHandler(),
    );

    if (noCache) {
      return false;
    }

    // Skip cache for authenticated requests by default, unless they're explicitly cacheable
    const isAuthenticated = req.user != null;
    const explicit = this.reflector.get<string | undefined>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    const options = this.reflector.get<CacheKeyOptions | undefined>(
      CACHE_KEY_OPTIONS_METADATA,
      context.getHandler(),
    );

    // Allow caching authenticated requests if includeUserId is true
    if (isAuthenticated && !explicit && (!options || !options.includeUserId)) {
      return false;
    }

    return super.isRequestCacheable(context);
  }

  /**
   * Generate cache key for the request
   */
  protected generateCacheKey(
    originalKey: string,
    context: ExecutionContext,
  ): string {
    const request = this.getRequest(context);
    const options = this.reflector.get<CacheKeyOptions | undefined>(
      CACHE_KEY_OPTIONS_METADATA,
      context.getHandler(),
    );

    // If no options, return the original key
    if (!options) {
      return originalKey;
    }

    // Build custom cache key
    const keyParts = [options.prefix || 'http-cache'];

    // Add method if specified
    if (options.includeMethod) {
      keyParts.push(request.method);
    }

    // Add path
    keyParts.push(request.path);

    // Add query params if specified
    if (options.includeQuery && Object.keys(request.query).length > 0) {
      const queryString = Object.entries(request.query)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => {
          const stringValue =
            typeof value === 'object' ? JSON.stringify(value) : String(value);
          return `${key}=${stringValue}`;
        })
        .join('&');

      keyParts.push(`query:${queryString}`);
    }

    // Add user ID if specified and available
    if (options.includeUserId && request.user) {
      const user = request.user as User;
      if (user.id) {
        keyParts.push(`user:${user.id}`);
      }
    }

    // Add headers if specified
    if (options.includeHeaders && options.includeHeaders.length > 0) {
      const headerString = options.includeHeaders
        .filter((header) => request.headers[header.toLowerCase()])
        .map(
          (header) =>
            `${header.toLowerCase()}:${String(request.headers[header.toLowerCase()])}`,
        )
        .join('|');

      if (headerString) {
        keyParts.push(`headers:${headerString}`);
      }
    }

    return keyParts.join(':');
  }

  /**
   * Set cache control headers on the response
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    // Get cache control options
    const cacheControlOptions = this.reflector.get<
      CacheControlOptions | undefined
    >(CACHE_CONTROL_METADATA, context.getHandler());

    // Process the request through the cache mechanism
    const result = await super.intercept(context, next);

    // Set cache control headers if options are specified
    if (cacheControlOptions) {
      const response = context.switchToHttp().getResponse<Response>();
      const cacheControlHeader =
        this.buildCacheControlHeader(cacheControlOptions);

      if (cacheControlHeader) {
        response.setHeader('Cache-Control', cacheControlHeader);
      }
    }

    return result;
  }

  /**
   * Build cache control header string from options
   */
  private buildCacheControlHeader(options: CacheControlOptions): string {
    const directives: string[] = [];

    // Add public/private directives
    if (options.public) {
      directives.push('public');
    }
    if (options.private) {
      directives.push('private');
    }

    // Add caching behavior directives
    if (options.noCache) {
      directives.push('no-cache');
    }
    if (options.noStore) {
      directives.push('no-store');
    }
    if (options.mustRevalidate) {
      directives.push('must-revalidate');
    }
    if (options.proxyRevalidate) {
      directives.push('proxy-revalidate');
    }
    if (options.immutable) {
      directives.push('immutable');
    }

    // Add time-based directives
    if (typeof options.maxAge === 'number') {
      directives.push(`max-age=${options.maxAge}`);
    }
    if (typeof options.sharedMaxAge === 'number') {
      directives.push(`s-maxage=${options.sharedMaxAge}`);
    }
    if (typeof options.staleWhileRevalidate === 'number') {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }
    if (typeof options.staleIfError === 'number') {
      directives.push(`stale-if-error=${options.staleIfError}`);
    }

    return directives.join(', ');
  }

  /**
   * Get the request object from the context
   */
  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest<Request>();
  }
}
