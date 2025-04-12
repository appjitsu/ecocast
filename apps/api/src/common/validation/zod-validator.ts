import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ZodSchema } from 'zod';

/**
 * Custom validator constraint for validating with Zod schemas
 */
@ValidatorConstraint({ name: 'zod', async: false })
export class ZodValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const schema = args.constraints[0] as ZodSchema;
    const result = schema.safeParse(value);
    return result.success;
  }

  defaultMessage(args: ValidationArguments): string {
    const schema = args.constraints[0] as ZodSchema;
    const result = schema.safeParse(args.value);
    if (!result.success) {
      // Extract and format all validation issues from Zod
      return result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
    }
    return 'Value does not satisfy the validation schema';
  }
}

/**
 * Decorator for validating with Zod schemas
 * @param schema The Zod schema to validate against
 * @param validationOptions Class validator options
 */
export function ZodValidation(
  schema: ZodSchema,
  validationOptions?: ValidationOptions,
) {
  return function (target: object, propertyName: string): void {
    registerDecorator({
      name: 'zodValidation',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [schema],
      validator: ZodValidator,
    });
  };
}
