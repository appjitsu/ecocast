import {
  BadRequestException,
  Injectable,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  private readonly logger = new Logger(CustomValidationPipe.name);

  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Custom exception factory for more detailed error messages
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        // Format validation errors for better readability and frontend consumption
        const formattedErrors = this.formatValidationErrors(validationErrors);

        // Log the validation errors for debugging
        this.logger.debug(
          `Validation failed: ${JSON.stringify(formattedErrors)}`,
        );

        // Create a readable error message for the response
        const errorMessage = this.buildErrorMessage(validationErrors);

        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
          errorMessage,
        });
      },
    });
  }

  /**
   * Format validation errors into a more readable and structured format
   */
  private formatValidationErrors(
    errors: ValidationError[],
    parentPath = '',
  ): Record<string, string> {
    return errors.reduce(
      (acc, error) => {
        const path = parentPath
          ? `${parentPath}.${error.property}`
          : error.property;

        if (error.constraints) {
          acc[path] = Object.values(error.constraints)[0];
        }

        if (error.children && error.children.length > 0) {
          const childErrors = this.formatValidationErrors(error.children, path);
          Object.assign(acc, childErrors);
        }

        return acc;
      },
      {} as Record<string, string>,
    );
  }

  /**
   * Build a human-readable error message from validation errors
   */
  private buildErrorMessage(errors: ValidationError[]): string {
    const messages = errors.map((error) => {
      if (error.constraints) {
        return Object.values(error.constraints)[0];
      }

      if (error.children && error.children.length) {
        return this.buildErrorMessage(error.children);
      }

      return `Invalid value for ${error.property}`;
    });

    return messages.join('. ');
  }
}
