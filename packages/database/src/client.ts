import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Cache Prisma client on globalThis to prevent multiple instances
// In dev: prevents HMR from creating new clients
// In production/serverless: ensures connection reuse within warm instances
globalForPrisma.prisma = prisma;

export type { PrismaClient };
