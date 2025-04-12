import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';

interface ThrottlerOptions {
  ttl: number;
  limit: number;
}

interface ThrottlerResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  timeToReset: number;
  totalAttempts: number;
}

interface MemoryStorageValue {
  count: number;
  resetTime: number;
}

@Injectable()
export class AppThrottlerGuard implements CanActivate {
  private readonly logger = new Logger(AppThrottlerGuard.name);
  private readonly memoryStorage = new Map<string, MemoryStorageValue>();

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const { ttl, limit } = this.getThrottlerOptions(req);
    const key = this.generateKey(req);

    // Check if request is within rate limits
    const result = this.handleMemoryRequest(key, ttl, limit);
    if (!result.allowed) {
      this.logger.warn(
        `Rate limit exceeded: ${req.method} ${req.path} from ${req.ip}`,
        {
          ip: req.ip,
          path: req.path,
          method: req.method,
          userAgent: req.headers['user-agent'],
          remaining: 0,
          limit,
          ttl,
        },
      );

      // Implement automatic IP blocking if threshold is reached
      const blockThreshold = this.configService.get<number>(
        'throttler.blockThreshold',
        100,
      );
      const blockDuration = this.configService.get<number>(
        'throttler.blockDuration',
        3600,
      ); // 1 hour

      if (result.totalAttempts > blockThreshold) {
        const clientIp = this.getClientIp(req);
        this.blockIp(clientIp, blockDuration);
        this.logger.warn(
          `IP ${clientIp} has been blocked for ${blockDuration} seconds due to excessive requests`,
        );
      }

      throw new ThrottlerException(
        `Too many requests. Try again in ${result.timeToReset} seconds.`,
      );
    }

    // Set headers to inform about rate limiting
    const response = context.switchToHttp().getResponse<Response>();
    response.setHeader('X-RateLimit-Limit', limit.toString());
    response.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    response.setHeader('X-RateLimit-Reset', result.resetTime.toString());

    return true;
  }

  private getThrottlerOptions(req: Request): ThrottlerOptions {
    const defaultTtl = this.configService.get<number>('throttler.ttl', 60);
    const defaultLimit = this.configService.get<number>('throttler.limit', 10);

    // Check for route-specific throttler options
    const routeOptions = this.reflector.get<ThrottlerOptions>(
      'throttler',
      req.route?.stack?.[0]?.handle,
    );

    return {
      ttl: routeOptions?.ttl ?? defaultTtl,
      limit: routeOptions?.limit ?? defaultLimit,
    };
  }

  private generateKey(request: Request): string {
    const ip = this.getClientIp(request);
    return `throttler:${ip}:${request.method}:${request.path}`;
  }

  private getClientIp(request: Request): string {
    return (
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }

  private async blockIp(ip: string, duration: number): Promise<void> {
    // Fallback to memory storage if Redis is not available
    this.memoryStorage.set(`blocked:${ip}`, {
      count: 1,
      resetTime: Date.now() + duration * 1000,
    });
  }

  private async isIpBlocked(ip: string): Promise<boolean> {
    const blocked = this.memoryStorage.get(`blocked:${ip}`);
    return blocked !== undefined && blocked.resetTime > Date.now();
  }

  private handleMemoryRequest(
    key: string,
    ttl: number,
    limit: number,
  ): ThrottlerResult {
    const now = Date.now();
    const stored = this.memoryStorage.get(key);

    if (!stored || stored.resetTime <= now) {
      // Reset counter if no stored value or if reset time has passed
      this.memoryStorage.set(key, {
        count: 1,
        resetTime: now + ttl * 1000,
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + ttl * 1000,
        timeToReset: ttl,
        totalAttempts: 1,
      };
    }

    // Check if limit is exceeded
    if (stored.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: stored.resetTime,
        timeToReset: Math.ceil((stored.resetTime - now) / 1000),
        totalAttempts: stored.count,
      };
    }

    // Increment counter
    stored.count++;
    this.memoryStorage.set(key, stored);

    return {
      allowed: true,
      remaining: limit - stored.count,
      resetTime: stored.resetTime,
      timeToReset: Math.ceil((stored.resetTime - now) / 1000),
      totalAttempts: stored.count,
    };
  }
}
