import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from 'next-auth/adapters';
import type { Session } from 'next-auth';
import { prisma } from '@quotecraft/database';
import { authConfig } from './config';

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days — Bug #15: sessions expire instead of lasting forever
  },
  trustHost: true,
  ...authConfig,
});

// Export with explicit typing to avoid TypeScript portability issues
export const handlers: { GET: typeof nextAuth.handlers.GET; POST: typeof nextAuth.handlers.POST } = nextAuth.handlers;
export const auth: () => Promise<Session | null> = nextAuth.auth;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;

export { authConfig };
