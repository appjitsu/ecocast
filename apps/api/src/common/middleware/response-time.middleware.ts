import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NextFunction, Request, Response } from 'express';

interface RequestUser {
  id?: string;
}

@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ResponseTimeMiddleware.name);
  private readonly slowResponseThreshold: number;
  private readonly excludePaths: string[];

  constructor(private readonly eventEmitter: EventEmitter2) {
    // Configure the threshold for logging slow responses (in ms)
    this.slowResponseThreshold = parseInt(
      process.env.SLOW_RESPONSE_THRESHOLD || '1000',
      10,
    );

    // Paths to exclude from response time tracking
    this.excludePaths = ['/health', '/metrics', '/favicon.ico', '/api/docs'];
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Skip tracking for excluded paths
    if (this.shouldSkipPath(req.path)) {
      return next();
    }

    // Record start time
    const startTime = process.hrtime();

    // Add response timing data once the response is finished
    res.on('finish', () => {
      // Calculate response time
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const responseTimeMs = seconds * 1000 + nanoseconds / 1000000;

      // Add response time header
      res.setHeader('X-Response-Time', `${responseTimeMs.toFixed(2)}ms`);

      // Prepare metadata for logs and events
      const requestData = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: responseTimeMs,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        userId: (req.user as RequestUser)?.id,
      };

      // Emit response time event for metrics collection
      this.eventEmitter.emit('api.response.time', requestData);

      // Log slow responses
      if (responseTimeMs > this.slowResponseThreshold) {
        this.logger.warn(
          `Slow response detected: ${responseTimeMs.toFixed(2)}ms for ${req.method} ${req.path}`,
          requestData,
        );

        // Emit event for slow responses
        this.eventEmitter.emit('api.response.slow', requestData);
      }

      // Debug level logging for normal responses
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(
          `${req.method} ${req.path} ${res.statusCode} - ${responseTimeMs.toFixed(2)}ms`,
        );
      }
    });

    next();
  }

  private shouldSkipPath(path: string): boolean {
    return this.excludePaths.some((excludePath) => {
      // Exact match
      if (excludePath === path) return true;

      // Wildcard match (if excludePath ends with *)
      if (excludePath.endsWith('*')) {
        const prefix = excludePath.slice(0, -1);
        return path.startsWith(prefix);
      }

      return false;
    });
  }
}
