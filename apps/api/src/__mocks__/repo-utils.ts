import { z } from 'zod';

// Mock the slugSchema
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

// Mock the urlSchema
export const urlSchema = z.string().url();

// Mock the validation functions
export const ZodValidation = () => {
  return () => {
    // This is a no-op decorator for testing
  };
};

// Mock the object utilities
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
};

// Mock the error utilities
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
  }
}

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

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const getUserFriendlyErrorMessage = (
  error: unknown,
  fallback = 'An unexpected error occurred',
): string => {
  return fallback;
};
