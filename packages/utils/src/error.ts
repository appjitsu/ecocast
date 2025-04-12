// Declare Error.captureStackTrace for TypeScript
declare global {
  interface ErrorConstructor {
    captureStackTrace(
      error: Error,
      constructor: abstract new (...args: unknown[]) => object,
    ): void;
  }
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    // Fix for TypeScript Error.captureStackTrace
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(
        this,
        this.constructor as abstract new (...args: unknown[]) => object,
      );
    } else {
      this.stack = new Error().stack;
    }
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message = 'Validation failed',
    errors: Record<string, string[]> = {},
  ) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Convert any error to a standardized AppError
 * @param error Error to convert
 * @returns Standardized AppError
 */
export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, false);
  }

  return new AppError(
    typeof error === 'string' ? error : 'An unknown error occurred',
    500,
    false,
  );
};

/**
 * Check if an error is an instance of AppError
 * @param error Error to check
 * @returns Whether the error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

/**
 * Get a user-friendly error message
 * @param error Error to get message from
 * @param fallback Fallback message
 * @returns User-friendly error message
 */
export const getUserFriendlyErrorMessage = (
  error: unknown,
  fallback = 'An unexpected error occurred',
): string => {
  if (error instanceof AppError && error.isOperational) {
    return error.message;
  }

  if (error instanceof Error) {
    // Only return actual error messages in development
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      return error.message;
    }
  }

  return fallback;
};
