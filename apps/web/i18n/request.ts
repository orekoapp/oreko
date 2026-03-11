import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './config';

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

function parseAcceptLanguage(header: string): string | null {
  const languages = header
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=');
      return { lang: (lang ?? '').trim().split('-')[0] ?? '', q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of languages) {
    if (lang && isValidLocale(lang)) return lang;
  }
  return null;
}

export default getRequestConfig(async () => {
  // 1. Check cookie for explicit user preference
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return {
      locale: cookieLocale,
      messages: (await import(`../messages/${cookieLocale}.json`)).default,
    };
  }

  // 2. Fall back to Accept-Language header
  const headerStore = await headers();
  const acceptLang = headerStore.get('accept-language');
  if (acceptLang) {
    const detected = parseAcceptLanguage(acceptLang);
    if (detected && isValidLocale(detected)) {
      return {
        locale: detected,
        messages: (await import(`../messages/${detected}.json`)).default,
      };
    }
  }

  // 3. Default locale
  return {
    locale: defaultLocale,
    messages: (await import(`../messages/${defaultLocale}.json`)).default,
  };
});
