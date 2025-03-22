import { z } from 'zod';

export const emailSchema = z
  .string()
  .email()
  .transform((str) => str.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8)
  .max(100)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  );

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const urlSchema = z
  .string()
  .url()
  .transform((str) => str.replace(/\/$/, ''));

export type Email = z.infer<typeof emailSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type Slug = z.infer<typeof slugSchema>;
export type Url = z.infer<typeof urlSchema>;
