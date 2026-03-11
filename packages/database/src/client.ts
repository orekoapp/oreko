import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Bug #115: Configure transaction and query timeouts to prevent long-running queries
    transactionOptions: {
      maxWait: 10000,  // 10s max wait to acquire a connection
      timeout: 30000,  // 30s max transaction duration
    },
  });

// Cache Prisma client on globalThis to prevent multiple instances
// In dev: prevents HMR from creating new clients
// In production/serverless: ensures connection reuse within warm instances
globalForPrisma.prisma = prisma;

export type { PrismaClient };
