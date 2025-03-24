import { WebEnv } from '@repo/types';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  ANALYZE: z.enum(['true', 'false']).optional(),
}) satisfies z.ZodType<WebEnv>;

// Validate environment variables at build/startup time
const validateEnv = (): WebEnv => {
  try {
    const parsed = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      ANALYZE: process.env.ANALYZE as 'true' | 'false' | undefined,
    });
    return parsed;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err: z.ZodIssue) =>
        err.path.join('.'),
      );
      throw new Error(
        `❌ Invalid or missing environment variables: ${missingVars.join(
          ', ',
        )}\n\nPlease check your .env file and make sure all required variables are defined.`,
      );
    }
    throw error;
  }
};

export const env = validateEnv();
