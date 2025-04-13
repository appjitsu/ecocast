import { Logger } from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as DOMPurify from 'isomorphic-dompurify';
import 'reflect-metadata'; // Ensure reflect-metadata is imported if used implicitly by class-transformer/validator

const logger = new Logger('SanitizeObjectUtil');

/**
 * Converts plain object to class instance, validates, and sanitizes string properties.
 * @param cls The class constructor.
 * @param plain The plain object to convert.
 * @param options Class-transformer options.
 * @returns The sanitized and validated class instance.
 * @throws Error if validation fails.
 */
export function sanitizeObject<T extends object>(
  cls: { new (...args: any[]): T },
  plain: Record<string, any>,
  options?: ClassTransformOptions,
): T {
  const instance = plainToInstance(cls, plain, {
    excludeExtraneousValues: true,
    ...options,
  });

  const errors = validateSync(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: false,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    // Unused metadata retrieval removed
    logger.error(
      `Validation failed for class ${cls.name}: ${JSON.stringify(errors)}`,
    );
    throw new Error(
      `Validation failed: ${errors.map((e) => e.toString()).join(', ')}`,
    );
  }

  // Sanitize string properties
  // Using a type assertion as instance[key] could be any type
  for (const key in instance) {
    if (Object.prototype.hasOwnProperty.call(instance, key)) {
      const value = (instance as Record<string, any>)[key];
      if (typeof value === 'string') {
        (instance as Record<string, any>)[key] = DOMPurify.sanitize(value);
      }
    }
  }

  return instance;
}

// Remove any duplicate or older implementations if they existed.
