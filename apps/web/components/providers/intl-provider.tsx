'use client';

import { NextIntlClientProvider } from 'next-intl';

interface IntlProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
}

export function IntlProvider({ locale, messages, children }: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
