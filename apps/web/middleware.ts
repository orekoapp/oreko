import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

// Clean secret — Vercel env vars may have literal \n suffix
const secret = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '')
  .replace(/\\n$/g, '').replace(/\n$/g, '').trim();

// Use a lightweight NextAuth instance for middleware (Edge Runtime compatible).
// This does NOT import the Prisma adapter, which requires Node.js runtime.
// The JWT callback is overridden to skip the Prisma DB check (soft-delete/password-change)
// because Prisma binary engine does not run in Edge Runtime. The full DB check still runs
// in the main auth (server components, server actions) which uses Node.js runtime.
const { auth } = NextAuth({
  secret,
  session: { strategy: 'jwt' },
  trustHost: process.env.NODE_ENV === 'development' || !!process.env.VERCEL || process.env.AUTH_TRUST_HOST === 'true',
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id ?? '';
        token.email = user.email ?? '';
        token.name = user.name ?? '';
        token.avatarUrl = user.avatarUrl;
      }
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.avatarUrl = session.avatarUrl;
      }
      // No DB check here — Edge Runtime cannot import Prisma binary engine.
      // The full JWT callback (with soft-delete + password-change checks) runs
      // in the Node.js auth instance on every server action / server component call.
      return token;
    },
  },
});

export default auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) — intentionally excluded; API routes handle their own
     *   auth via API-key validation or NextAuth session checks in each handler.
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
