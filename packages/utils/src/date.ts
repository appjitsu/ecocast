import {
  format,
  formatDistance,
  formatRelative,
  isValid,
  parseISO,
} from 'date-fns';

/**
 * Formats a date in the format "Month day, yyyy"
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';

  return format(parsedDate, 'MMMM do, yyyy');
};

/**
 * Formats a date and time in the format "Month day, yyyy HH:mm"
 * @param date Date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';

  return format(parsedDate, 'MMMM do, yyyy HH:mm');
};

/**
 * Returns a relative time string (e.g. "5 minutes ago")
 * @param date Date to format
 * @returns Relative time string
 */
export const timeAgo = (date: Date | string): string => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';

  return formatDistance(parsedDate, new Date(), { addSuffix: true });
};

/**
 * Returns a relative date string compared to today (e.g. "yesterday", "last Friday")
 * @param date Date to format
 * @returns Relative date string
 */
export const relativeDate = (date: Date | string): string => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';

  return formatRelative(parsedDate, new Date());
};

/**
 * Safely parses an ISO date string to a Date object
 * @param dateString ISO date string to parse
 * @returns Date object or null if invalid
 */
export const safeParseDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

/**
 * Formats a date using a custom format string
 * @param date Date to format
 * @param formatString Format string (date-fns format)
 * @returns Formatted date string
 */
export const formatCustom = (
  date: Date | string,
  formatString: string,
): string => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';

  return format(parsedDate, formatString);
};
