import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'QuoteCraft',
    template: '%s | QuoteCraft',
  },
  description: 'Visual quote and invoice management software for freelancers and businesses',
  keywords: ['quotes', 'invoices', 'freelance', 'business', 'billing', 'proposals'],
  authors: [{ name: 'QuoteCraft' }],
  creator: 'QuoteCraft',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'QuoteCraft',
    title: 'QuoteCraft - Visual Quote & Invoice Management',
    description: 'Create beautiful quotes and invoices with our visual builder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuoteCraft',
    description: 'Visual quote and invoice management software',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
