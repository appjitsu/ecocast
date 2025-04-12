import { ArgumentMetadata } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';
import { SanitizationPipe } from '../pipes/sanitization.pipe';

// Initialize sanitization pipe
const sanitizationPipe = new SanitizationPipe();

/**
 * Utility function to sanitize an object based on its class decorators
 * @param obj The object to sanitize
 * @param type The class type of the object
 * @returns Sanitized object
 */
export function sanitizeObject<T extends object>(
  obj: T,
  type: new (...args: unknown[]) => T,
): T {
  // Convert plain object to class instance to get metadata
  const instance = plainToInstance(type, obj);

  // Create metadata mock for the sanitization pipe
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: type,
    data: '',
  };

  // Transform the object using the sanitization pipe
  return sanitizationPipe.transform(instance) as T;
}

/**
 * Utility function to sanitize a collection of objects
 * @param objects Array of objects to sanitize
 * @param type The class type of the objects
 * @returns Sanitized array of objects
 */
export function sanitizeCollection<T extends object>(
  objects: T[],
  type: new (...args: unknown[]) => T,
): T[] {
  return objects.map((obj) => sanitizeObject(obj, type));
}
