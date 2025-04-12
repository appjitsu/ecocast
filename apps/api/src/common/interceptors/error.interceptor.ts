import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Request, Response } from 'express';
import { TypeORMError } from 'typeorm';

interface User {
  id: string | number;
  email?: string;
  roles?: string[];
  username?: string;
}

// Extend Express Request interface to include the user property
interface RequestWithUser extends Request {
  user?: User;
}

interface ErrorResponse {
  status: 'error';
  message: string;
  error: {
    code?: string;
    message: string;
    details?: Record<string, string>;
  };
  meta: {
    timestamp: number;
    path: string;
    method: string;
    userId?: string | number;
  };
}

interface DatabaseError {
  code: string;
  detail: string;
  table: string;
  constraint: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isDev: boolean;

  constructor(
    @Optional()
    @Inject(ConfigService)
    private readonly configService?: ConfigService,
  ) {
    this.isDev = process.env.NODE_ENV !== 'production';

    // Initialize Sentry if DSN is provided
    const dsn = process.env.SENTRY_DSN || this.configService?.get('SENTRY_DSN');
    if (dsn) {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 1.0,
        // Send errors with stack traces
        attachStacktrace: true,
        // Set sample rate to 1.0 for errors
        sampleRate: 1.0,
        // Configure default integrations
        integrations: [nodeProfilingIntegration()],
      });
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();

    const errorResponse: ErrorResponse = {
      status: 'error',
      message: this.getErrorMessage(exception),
      error: {
        code: this.getErrorCode(exception),
        message: this.getErrorMessage(exception),
        details: this.getErrorDetails(exception),
      },
      meta: {
        timestamp: Date.now(),
        path: request.path,
        method: request.method,
        userId: request.user?.id,
      },
    };

    // Log the error
    this.logError(exception, request);

    // Send the response
    response.status(this.getHttpStatus(exception)).json(errorResponse);
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof TypeORMError) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string'
        ? response
        : (response as { message: string }).message;
    }

    if (exception instanceof TypeORMError) {
      return 'Database error occurred';
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private getErrorCode(exception: unknown): string | undefined {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const code = (response as { code?: unknown }).code;
        return typeof code === 'string' ? code : undefined;
      }
    }

    if (exception instanceof TypeORMError) {
      return 'DATABASE_ERROR';
    }

    return undefined;
  }

  private getErrorDetails(
    exception: unknown,
  ): Record<string, string> | undefined {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        return (response as { details?: Record<string, string> }).details;
      }
    }

    if (exception instanceof TypeORMError) {
      const errors: Record<string, string> = {};
      const error = exception as unknown as DatabaseError;

      if (error.detail) {
        errors[error.constraint || 'database'] = error.detail;
      }

      return Object.keys(errors).length > 0 ? errors : undefined;
    }

    return undefined;
  }

  private logError(exception: unknown, request: RequestWithUser): void {
    const message = this.getErrorMessage(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;
    const userId = request.user?.id;

    this.logger.error(
      {
        message,
        stack,
        path: request.path,
        method: request.method,
        userId,
      },
      'Error occurred',
    );
  }

  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-csrf-token',
      'x-xsrf-token',
    ];
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (header in sanitized) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
