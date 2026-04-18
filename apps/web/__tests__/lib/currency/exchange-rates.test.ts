import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('exchange rate utilities', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns API rates and caches them for subsequent calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: 'success',
        rates: { USD: 1, EUR: 0.9, GBP: 0.8 },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { getExchangeRates } = await import('@/lib/currency/exchange-rates');

    const first = await getExchangeRates();
    const second = await getExchangeRates();

    expect(first).toEqual({ USD: 1, EUR: 0.9, GBP: 0.8 });
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to static rates when the API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const { getExchangeRates } = await import('@/lib/currency/exchange-rates');
    const rates = await getExchangeRates();

    expect(rates.USD).toBe(1);
    expect(rates.EUR).toBeGreaterThan(0);
    expect(rates.JPY).toBeGreaterThan(0);
  });

  it('converts currencies using fetched rates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          result: 'success',
          rates: { USD: 1, EUR: 0.8, GBP: 0.5 },
        }),
      })
    );

    const { convertCurrency } = await import('@/lib/currency/exchange-rates');
    const converted = await convertCurrency(80, 'EUR', 'GBP');

    expect(converted).toBe(50);
  });

  it('returns the original amount for unknown currencies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          result: 'success',
          rates: { USD: 1, EUR: 0.9 },
        }),
      })
    );

    const { convertCurrency } = await import('@/lib/currency/exchange-rates');
    await expect(convertCurrency(25, 'EUR', 'ZZZ')).resolves.toBe(25);
  });

  it('converts synchronously with pre-fetched rates', async () => {
    const { convertToBase } = await import('@/lib/currency/exchange-rates');
    const rates = { USD: 1, EUR: 0.8, GBP: 0.5 };

    expect(convertToBase(80, 'EUR', 'USD', rates)).toBe(100);
    expect(convertToBase(80, 'EUR', 'GBP', rates)).toBe(50);
    expect(convertToBase(10, 'USD', 'USD', rates)).toBe(10);
  });
});
