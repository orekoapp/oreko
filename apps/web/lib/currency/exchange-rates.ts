/**
 * Exchange rate utility for multi-currency analytics.
 * Fetches rates from a free API with in-memory cache (24hr TTL).
 * Falls back to static rates if API is unavailable.
 */

// Static fallback rates (USD as base) — approximate, updated manually
const STATIC_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CNY: 7.24,
  INR: 83.1,
  SGD: 1.34,
  NZD: 1.64,
};

interface CachedRates {
  rates: Record<string, number>;
  fetchedAt: number;
}

// In-memory cache — survives across requests in same server instance
let cachedRates: CachedRates | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch latest exchange rates from free API (base: USD).
 * Uses exchangerate-api.com free tier (1500 req/month, no key needed).
 */
async function fetchRatesFromApi(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      { next: { revalidate: 86400 } } // Next.js fetch cache: 24hr
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (data.result !== 'success' || !data.rates) return null;

    return data.rates as Record<string, number>;
  } catch {
    return null;
  }
}

/**
 * Get exchange rates (USD as base). Cached for 24 hours.
 * Returns API rates if available, otherwise static fallback.
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  // Return cached if fresh
  if (cachedRates && Date.now() - cachedRates.fetchedAt < CACHE_TTL_MS) {
    return cachedRates.rates;
  }

  // Try API
  const apiRates = await fetchRatesFromApi();
  if (apiRates) {
    cachedRates = { rates: apiRates, fetchedAt: Date.now() };
    return apiRates;
  }

  // Fallback to static
  if (cachedRates) {
    // Use stale cache rather than static if we had a previous successful fetch
    return cachedRates.rates;
  }

  return STATIC_RATES;
}

/**
 * Convert an amount from one currency to another.
 * Both currencies use USD as the intermediate base.
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency || amount === 0) return amount;

  const rates = await getExchangeRates();
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) return amount; // Unknown currency, return as-is

  // Convert: amount in fromCurrency → USD → toCurrency
  const amountInUsd = amount / fromRate;
  return amountInUsd * toRate;
}

/**
 * Convert an amount to USD (synchronous, using pre-fetched rates).
 * Use this in loops where you already have the rates.
 */
export function convertToBase(
  amount: number,
  fromCurrency: string,
  baseCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === baseCurrency || amount === 0) return amount;

  const fromRate = rates[fromCurrency];
  const toRate = rates[baseCurrency];

  if (!fromRate || !toRate) return amount;

  return (amount / fromRate) * toRate;
}
