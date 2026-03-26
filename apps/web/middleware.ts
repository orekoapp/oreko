import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

// Clean secret — Vercel env vars may have literal \n suffix
const secret = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '')
  .replace(/\\n$/g, '').replace(/\n$/g, '').trim();

// Use a lightweight NextAuth instance for middleware (Edge Runtime compatible).
// This does NOT import the Prisma adapter, which requires Node.js runtime.
// The full auth config (with adapter) is used in server components and API routes.
const { auth } = NextAuth({
  secret,
  session: { strategy: 'jwt' },
  trustHost: process.env.NODE_ENV === 'development' || !!process.env.VERCEL || process.env.AUTH_TRUST_HOST === 'true',
  ...authConfig,
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
