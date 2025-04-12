import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiVersion } from '../decorators/api-version.decorator';
import {
  ApiResponse,
  PaginationMeta,
} from '../interfaces/api-response.interface';

interface Route {
  stack?: Array<{ handle?: unknown }>;
}

interface RequestWithMetadata extends Request {
  requestId?: string;
  route: Route;
}

interface RouteHandlerWithMetadata {
  handle?: Type<unknown>;
}

interface ApiResponseMeta {
  timestamp: number;
  requestId: string;
  version: string;
  pagination?: PaginationMeta;
}

/**
 * Intercepts responses and transforms them into a standard format
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  private readonly logger = new Logger(ResponseTransformInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const request = context.switchToHttp().getRequest<RequestWithMetadata>();

    return next.handle().pipe(
      map((data) => {
        // Skip transformation for specific paths like health checks
        if (this.shouldSkipTransformation(request.path)) {
          return data as T;
        }

        // Get metadata from request
        const requestId = request.requestId || 'unknown';
        const version = this.getApiVersion(request);

        // Determine if the response is paginated
        const pagination = this.extractPaginationData(data);

        // Create base metadata
        const baseMeta: ApiResponseMeta = {
          timestamp: Date.now(),
          requestId,
          version,
        };

        if (pagination) {
          baseMeta.pagination = pagination;
        }

        // Check if this is an already structured response
        if (this.isApiResponse(data)) {
          data.meta = {
            ...data.meta,
            ...baseMeta,
          };
          return data;
        }

        // Transform to standard format
        return {
          status: 'success',
          data: data as T,
          meta: baseMeta,
        };
      }),
    );
  }

  /**
   * Check if a path should be excluded from transformation
   */
  private shouldSkipTransformation(path: string): boolean {
    const skipPaths = [
      '/health',
      '/metrics',
      '/docs',
      '/docs-json',
      '/api-docs',
      '/api-docs-json',
    ];
    return skipPaths.some((skipPath) => path.startsWith(skipPath));
  }

  /**
   * Get API version from request metadata
   */
  private getApiVersion(request: RequestWithMetadata): string {
    const routeHandler = request.route?.stack?.[0]
      ?.handle as RouteHandlerWithMetadata;
    const version = routeHandler?.handle
      ? this.reflector.get<string>(ApiVersion, routeHandler.handle)
      : undefined;
    return version || '1.0.0';
  }

  /**
   * Check if data is already in ApiResponse format
   */
  private isApiResponse(data: unknown): data is ApiResponse<T> {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const response = data as Partial<ApiResponse<T>>;
    return (
      typeof response.status === 'string' &&
      'data' in response &&
      (!response.meta ||
        (typeof response.meta === 'object' && response.meta !== null))
    );
  }

  /**
   * Extract pagination data from response
   */
  private extractPaginationData(data: unknown): PaginationMeta | null {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const response = data as { meta?: { pagination?: PaginationMeta } };
    if (!response.meta?.pagination) {
      return null;
    }

    const { pagination } = response.meta;
    if (
      typeof pagination === 'object' &&
      pagination !== null &&
      'currentPage' in pagination &&
      'totalPages' in pagination &&
      'itemsPerPage' in pagination &&
      'totalItems' in pagination &&
      typeof pagination.currentPage === 'number' &&
      typeof pagination.totalPages === 'number' &&
      typeof pagination.itemsPerPage === 'number' &&
      typeof pagination.totalItems === 'number'
    ) {
      return pagination;
    }

    return null;
  }
}
