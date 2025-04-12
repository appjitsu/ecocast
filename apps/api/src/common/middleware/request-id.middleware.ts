import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';

// Define a custom property on Request
declare module 'express' {
  interface Request {
    id: string;
    startTime: number;
  }
}

/**
 * Middleware that adds a unique request ID to each incoming HTTP request
 * This is useful for tracing requests across multiple services and logs
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('RequestMiddleware');
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Get request ID from header or generate a new one
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    // Attach request ID to request object
    req.id = requestId;
    req.startTime = Date.now();

    // Set request ID header on response
    res.setHeader('X-Request-ID', requestId);

    // Log request start with basic information
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const method = req.method;
    const url = req.originalUrl || req.url;

    this.logger.info({
      requestId,
      type: 'REQUEST_START',
      method,
      url,
      ip,
      userAgent,
      query: req.query,
      params: req.params,
    });

    // Capture response data when request is complete
    res.on('finish', () => {
      const duration = Date.now() - (req.startTime || Date.now());
      const statusCode = res.statusCode;

      // Log request completion
      this.logger.info({
        requestId,
        type: 'REQUEST_END',
        method,
        url,
        statusCode,
        duration,
        contentLength: res.getHeader('content-length'),
        // Add response time header for client/monitoring
        ...(statusCode >= 500 && { level: 'error' }),
        ...(statusCode >= 400 && statusCode < 500 && { level: 'warn' }),
      });

      // Add response time header for client/monitoring
      res.setHeader('X-Response-Time', `${duration}ms`);
    });

    next();
  }
}
