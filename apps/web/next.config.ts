import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Bug #20: Enable standalone output for Docker production builds
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  transpilePackages: ['@quotecraft/ui', '@quotecraft/utils', '@quotecraft/types'],
  // Bug #23: Prevent access token leakage via referrer headers on portal pages
  async headers() {
    // Bug #5: Security headers for all routes (mirrors vercel.json for Docker/self-hosted deployments)
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), usb=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' https://fonts.gstatic.com",
          "frame-src https://js.stripe.com",
          "connect-src 'self' https://api.stripe.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
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
