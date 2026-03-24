import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@quotecraft/ui', '@quotecraft/utils', '@quotecraft/types'],
  // Bug #23: Prevent access token leakage via referrer headers on portal pages
  async headers() {
    // Security headers for all routes (mirrors vercel.json for Docker/self-hosted deployments)
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/q/:token*',
        headers: [
          ...securityHeaders,
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        source: '/i/:token*',
        headers: [
          ...securityHeaders,
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        source: '/c/:token*',
        headers: [
          ...securityHeaders,
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
