import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: unknown };

/**
 * Utility function to merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
