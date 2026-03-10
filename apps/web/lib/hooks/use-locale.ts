'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { defaultLocale } from '@/i18n/config';

/**
 * Returns the current locale from next-intl context.
 * Falls back to 'en' if not available.
 */
export function useLocale(): Locale {
  try {
    return useNextIntlLocale() as Locale;
  } catch {
    return defaultLocale;
  }
}
