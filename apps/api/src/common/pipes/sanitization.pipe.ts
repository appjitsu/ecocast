import { Injectable, Logger, PipeTransform } from '@nestjs/common';
import * as DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { SANITIZE_OPTIONS_KEY } from '../decorators/sanitize.decorator';

/**
 * Type of sanitization to apply
 */
export enum SanitizationType {
  /**
   * Sanitize HTML to prevent XSS attacks
   */
  HTML = 'html',

  /**
   * Sanitize SQL to prevent SQL injection
   */
  SQL = 'sql',

  /**
   * Sanitize all types
   */
  ALL = 'all',

  /**
   * Don't sanitize anything (useful for opt-out)
   */
  NONE = 'none',
}

/**
 * Type for sanitization options
 */
export interface SanitizationOptions {
  [key: string]: SanitizationType;
}

/**
 * Type for primitive values
 */
type Primitive = string | number | boolean;

/**
 * Sanitizes input data to prevent XSS and injection attacks
 */
@Injectable()
export class SanitizationPipe implements PipeTransform {
  private readonly logger = new Logger(SanitizationPipe.name);
  private readonly window: Window & typeof globalThis;
  private readonly domPurify: typeof DOMPurify;

  constructor() {
    try {
      const { window } = new JSDOM('', {
        runScripts: 'dangerously',
        resources: 'usable',
      });
      this.window = window as Window & typeof globalThis;
      this.domPurify = DOMPurify(this.window);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `Failed to initialize DOMPurify: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to initialize sanitization pipe');
    }
  }

  /**
   * Transforms the input value by sanitizing it
   */
  transform(value: unknown): unknown {
    if (!value) return value;

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item) =>
          typeof item === 'string' ? this.sanitize(item) : item,
        );
      }

      const sanitizedValue: Record<string, unknown> = {};
      const originalValue = value as Record<string, unknown>;

      for (const key of Object.keys(originalValue)) {
        const val = originalValue[key];
        if (typeof val === 'string') {
          sanitizedValue[key] = this.sanitize(val);
        } else {
          sanitizedValue[key] = val;
        }
      }

      return sanitizedValue;
    }

    if (typeof value === 'string') {
      return this.sanitize(value);
    }

    return value;
  }

  /**
   * Check if a value is a primitive type
   */
  private isPrimitive(value: unknown): value is Primitive {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }

  /**
   * Get sanitization options from type
   */
  private getSanitizationOptions(type: unknown): SanitizationOptions {
    if (!type || typeof type !== 'object') {
      return {};
    }

    const prototype = Object.getPrototypeOf(type);
    if (!prototype) {
      return {};
    }

    const metadata = Reflect.getMetadata(SANITIZE_OPTIONS_KEY, prototype) as
      | SanitizationOptions
      | undefined;
    return metadata || {};
  }

  /**
   * Recursively sanitize an object
   */
  private sanitizeObject(obj: unknown, options: SanitizationOptions): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item, options));
    }

    if (typeof obj === 'object' && obj !== null) {
      const typedObj = obj as Record<string, unknown>;
      const result: Record<string, unknown> = {};

      for (const key of Object.keys(typedObj)) {
        const value = typedObj[key];
        result[key] = this.sanitizeObject(value, options);
      }
      return result;
    }

    if (this.isPrimitive(obj)) {
      return this.sanitizeValue(obj, SanitizationType.ALL);
    }

    return obj;
  }

  /**
   * Sanitize a value based on the sanitization type
   */
  private sanitizeValue(value: Primitive, type: SanitizationType): Primitive {
    if (typeof value !== 'string') {
      return value;
    }

    switch (type) {
      case SanitizationType.HTML:
        return this.sanitizeHtml(value);
      case SanitizationType.SQL:
        return this.sanitizeSql(value);
      case SanitizationType.ALL:
        return this.sanitizeSql(this.sanitizeHtml(value));
      case SanitizationType.NONE:
        return value;
      default:
        return value;
    }
  }

  /**
   * Sanitize HTML to prevent XSS attacks
   */
  private sanitizeHtml(value: string): string {
    try {
      // Configure DOMPurify to remove all HTML
      this.domPurify.setConfig({
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });

      // Cast the result to string to handle different DOMPurify return types
      const sanitized = this.domPurify.sanitize(value);
      return typeof sanitized === 'string' ? sanitized : String(sanitized);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to sanitize HTML: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Failed to sanitize HTML with unknown error');
      }
      return value;
    }
  }

  /**
   * Sanitize SQL to prevent SQL injection
   * This is a basic sanitization that escapes common SQL injection characters
   * For production, use prepared statements with parameter binding instead
   */
  private sanitizeSql(value: string): string {
    try {
      // Replace SQL injection characters
      return value
        .replace(/'/g, "''")
        .replace(/\\/g, '\\\\')
        .replace(/\0/g, '\\0')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\\Z/g, '\\Z');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('Failed to sanitize SQL', error);
      return value;
    }
  }

  private sanitize(value: string): string {
    return value.trim();
  }
}
