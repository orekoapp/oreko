import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@quotecraft/ui', '@quotecraft/utils', '@quotecraft/types'],
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
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
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // For monorepo with Prisma, include root directory in file tracing
  outputFileTracingRoot: path.resolve('./../../'),
};

export default nextConfig;
