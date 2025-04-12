import 'reflect-metadata';
import { SanitizationType } from '../pipes/sanitization.pipe';

/**
 * Metadata key for storing sanitization options
 */
export const SANITIZE_OPTIONS_KEY = 'sanitize_options';

interface SanitizeOptions {
  [key: string | symbol]: SanitizationType;
}

/**
 * Decorator for marking a property for sanitization
 * @param type The type of sanitization to apply
 * @returns PropertyDecorator
 */
export function Sanitize(
  type: SanitizationType = SanitizationType.ALL,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingOptions: SanitizeOptions =
      (Reflect.getMetadata(SANITIZE_OPTIONS_KEY, target) as SanitizeOptions) ||
      {};

    const newOptions: SanitizeOptions = {
      ...existingOptions,
      [propertyKey]: type,
    };

    Reflect.defineMetadata(SANITIZE_OPTIONS_KEY, newOptions, target);
  };
}

/**
 * Decorator for marking a property to skip sanitization
 * @returns PropertyDecorator
 */
export function SkipSanitize(): PropertyDecorator {
  return Sanitize(SanitizationType.NONE);
}

/**
 * Decorator for sanitizing HTML in a property
 * @returns PropertyDecorator
 */
export function SanitizeHtml(): PropertyDecorator {
  return Sanitize(SanitizationType.HTML);
}

/**
 * Decorator for sanitizing SQL in a property
 * @returns PropertyDecorator
 */
export function SanitizeSql(): PropertyDecorator {
  return Sanitize(SanitizationType.SQL);
}
