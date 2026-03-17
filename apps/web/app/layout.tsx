import { getBaseUrl } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { FontSizeProvider } from '@/components/providers/font-size-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'QuoteCraft - Beautiful Invoices. No Expensive Subscription.',
    template: '%s | QuoteCraft',
  },
  description:
    'The open-source alternative to Bloom and Bonsai. Create stunning quotes, get them signed, convert to invoices with one click. Self-hosted free or cloud from $9/mo.',
  keywords: [
    'open source invoice software',
    'free invoice generator',
    'invoice builder',
    'quote to invoice software',
    'bloom alternative',
    'bonsai alternative',
    'freelancer invoice software',
    'self-hosted invoicing',
    'visual invoice builder',
    'quote builder',
    'e-signature invoices',
    'invoice software for contractors',
  ],
  authors: [{ name: 'QuoteCraft' }],
  creator: 'QuoteCraft',
  publisher: 'QuoteCraft',
  metadataBase: new URL(getBaseUrl()),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'QuoteCraft',
    title: 'QuoteCraft - Beautiful Invoices. No Expensive Subscription.',
    description:
      'The open-source alternative to Bloom and Bonsai. Visual quote builder, e-signatures, one-click invoice conversion. Free self-hosted or $9/mo cloud.',
    // Bug #395: OG image auto-discovered from opengraph-image.tsx (PNG)
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'QuoteCraft - Beautiful Invoices. No Expensive Subscription.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuoteCraft - Beautiful Invoices. No Expensive Subscription.',
    description:
      'The open-source alternative to Bloom and Bonsai. Create stunning quotes and invoices for free.',
    // Bug #396: Twitter image auto-discovered from twitter-image.tsx (PNG)
    images: ['/twitter-image'],
    creator: '@quotecraft',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Business Software',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'QuoteCraft',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Docker',
  description:
    'Open-source visual quote and invoice builder for freelancers and small businesses',
  url: getBaseUrl(),
  downloadUrl: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/WisdmLabs/quote-software',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      name: 'Open Source',
      description: 'Self-hosted, all features included',
    },
    {
      '@type': 'Offer',
      price: '9',
      priceCurrency: 'USD',
      name: 'Cloud Starter',
      description: 'Managed hosting, email support',
    },
    {
      '@type': 'Offer',
      price: '19',
      priceCurrency: 'USD',
      name: 'Cloud Pro',
      description: 'Priority support, unlimited quotes',
    },
  ],
  author: {
    '@type': 'Organization',
    name: 'QuoteCraft',
    url: getBaseUrl(),
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <FontSizeProvider>
                {children}
                <Toaster richColors position="top-right" />
              </FontSizeProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
