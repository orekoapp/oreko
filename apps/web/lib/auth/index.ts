import '@/lib/env'; // Trim env vars early — fixes Vercel trailing \n issue
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from 'next-auth/adapters';
import type { Session } from 'next-auth';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { prisma } from '@quotecraft/database';
import { authConfig } from './config';

// HIGH #33: Validate NEXTAUTH_SECRET in production (skip during next build)
if (
  process.env.NODE_ENV === 'production' &&
  !process.env.NEXTAUTH_SECRET &&
  process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD
) {
  throw new Error('NEXTAUTH_SECRET is required in production');
}

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days — Bug #15: sessions expire instead of lasting forever
  },
  // Bug #87: Only trust host header in environments with known-good reverse proxies
  // (Vercel, Docker with Traefik). In local dev this is safe since there's no proxy.
  trustHost: process.env.VERCEL === '1' || process.env.NODE_ENV === 'development' || process.env.TRUST_HOST === 'true',
  ...authConfig,
});

// Export with explicit typing to avoid TypeScript portability issues
export const handlers: { GET: typeof nextAuth.handlers.GET; POST: typeof nextAuth.handlers.POST } = nextAuth.handlers;
export const auth: () => Promise<Session | null> = nextAuth.auth;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;

export { authConfig };
