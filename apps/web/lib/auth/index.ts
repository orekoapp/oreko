import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from 'next-auth/adapters';
import type { Session } from 'next-auth';
import { prisma } from '@quotecraft/database';
import { authConfig } from './config';

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: 'jwt' },
  ...authConfig,
});

// Export with explicit typing to avoid TypeScript portability issues
export const handlers: { GET: typeof nextAuth.handlers.GET; POST: typeof nextAuth.handlers.POST } = nextAuth.handlers;
export const auth: () => Promise<Session | null> = nextAuth.auth;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;

export { authConfig };
