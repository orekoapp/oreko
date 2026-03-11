import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quote.persuado.tech';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/quotes/',
          '/invoices/',
          '/clients/',
          '/settings/',
          '/api/',
          '/onboarding/',
          '/q/',
          '/i/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
