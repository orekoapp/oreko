import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  value: number | string,
  locale: string = 'en-US'
): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  return new Intl.NumberFormat(locale).format(numericValue);
}

/**
 * Format a date string or Date object
 */
export function formatDate(
  date: string | Date,
  formatString: string = 'MMM d, yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a percentage
 */
export function formatPercentage(
  value: number | string,
  decimals: number = 0
): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${numericValue.toFixed(decimals)}%`;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format phone number (US format)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Generate a quote/invoice number with padding
 */
export function formatDocumentNumber(
  value: number,
  prefix: string = '',
  suffix: string = '',
  padding: number = 4
): string {
  const paddedValue = value.toString().padStart(padding, '0');
  return `${prefix}${paddedValue}${suffix}`;
}
