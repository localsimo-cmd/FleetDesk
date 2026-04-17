import { format, isValid } from 'date-fns';

/**
 * Safely formats a date. Returns a fallback string if the date is invalid.
 * Prevents application crashes caused by date-fns format() throwing on Invalid Dates.
 */
export function safeFormat(date: Date | string | number | null | undefined, formatStr: string, fallback = 'N/A'): string {
  if (!date) return fallback;
  
  const d = new Date(date);
  if (!isValid(d)) return fallback;
  
  try {
    return format(d, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return fallback;
  }
}

export function safeGetISOString(date: Date | string | number | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  return isValid(d) ? d.toISOString() : null;
}
