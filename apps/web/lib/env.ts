import { z } from 'zod';

const envSchema = z.object({
  // Add environment variables with their types and validation
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url(),
  // Add more environment variables as needed
});

type Env = z.infer<typeof envSchema>;

// Validate environment variables at build/startup time
const validateEnv = (): Env => {
  try {
    const parsed = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      // Add more environment variables as needed
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
