import { QUOTE_STATUS, INVOICE_STATUS, type QuoteStatus, type InvoiceStatus } from './constants';

/**
 * Generate a random string
 */
// Low #31: Use rejection sampling to avoid modulo bias
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const maxValid = 256 - (256 % chars.length); // 256 - (256 % 62) = 248
  const result: string[] = [];
  while (result.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2)); // Over-allocate to reduce loops
    for (const byte of bytes) {
      if (byte < maxValid && result.length < length) {
        result.push(chars[byte % chars.length]!);
      }
    }
  }
  return result.join('');
}

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(str: string): string {
  const slug = str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `item-${Date.now()}`;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Sleep/delay helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Omit keys from an object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

/**
 * Pick keys from an object
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, maxLength);
}

/**
 * Calculate line item amount
 */
export function calculateLineItemAmount(quantity: number, rate: number): number {
  return Math.round(quantity * rate * 100) / 100;
}

/**
 * Calculate tax amount
 */
export function calculateTaxAmount(amount: number, taxRate: number): number {
  return Math.round(amount * (taxRate / 100) * 100) / 100;
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(
  subtotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return Math.round(subtotal * (discountValue / 100) * 100) / 100;
  }
  return Math.min(discountValue, subtotal);
}

/**
 * Get status badge variant based on quote status
 */
export function getQuoteStatusVariant(
  status: QuoteStatus
): 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline' {
  switch (status) {
    case QUOTE_STATUS.DRAFT:
      return 'secondary';
    case QUOTE_STATUS.SENT:
      return 'default';
    case QUOTE_STATUS.VIEWED:
      return 'outline';
    case QUOTE_STATUS.ACCEPTED:
    case QUOTE_STATUS.CONVERTED:
      return 'success';
    case QUOTE_STATUS.DECLINED:
      return 'destructive';
    case QUOTE_STATUS.EXPIRED:
      return 'warning';
    default:
      return 'default';
  }
}

/**
 * Get status badge variant based on invoice status
 */
export function getInvoiceStatusVariant(
  status: InvoiceStatus
): 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline' {
  switch (status) {
    case INVOICE_STATUS.DRAFT:
      return 'secondary';
    case INVOICE_STATUS.SENT:
      return 'default';
    case INVOICE_STATUS.VIEWED:
      return 'outline';
    case INVOICE_STATUS.PARTIAL:
      return 'warning';
    case INVOICE_STATUS.PAID:
      return 'success';
    case INVOICE_STATUS.OVERDUE:
      return 'destructive';
    case INVOICE_STATUS.VOIDED:
      return 'secondary';
    default:
      return 'default';
  }
}
