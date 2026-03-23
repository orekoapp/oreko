/**
 * Quote-related utility functions
 */

/**
 * Calculate deposit amount based on type and value
 */
export function calculateDepositAmount(
  total: number,
  depositType: 'percentage' | 'fixed',
  depositValue: number
): number {
  if (depositType === 'percentage') {
    return Math.round(total * (depositValue / 100) * 100) / 100;
  }
  return Math.min(depositValue, total);
}

/**
 * Format currency based on currency code
 */
export function formatQuoteCurrency(amount: number, currency: string = 'USD'): string {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).formatToParts(amount);
  return parts.map((p, i) => {
    if (p.type === 'currency' && parts[i + 1]?.type !== 'literal') return p.value + ' ';
    return p.value;
  }).join('');
}

/**
 * Check if a quote is expired
 */
export function isQuoteExpired(expirationDate: string | Date | null): boolean {
  if (!expirationDate) return false;
  return new Date(expirationDate) < new Date();
}
