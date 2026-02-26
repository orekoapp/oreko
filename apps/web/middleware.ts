import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

// Use a lightweight NextAuth instance for middleware (Edge Runtime compatible).
// This does NOT import the Prisma adapter, which requires Node.js runtime.
// The full auth config (with adapter) is used in server components and API routes.
const { auth } = NextAuth({
  session: { strategy: 'jwt' },
  trustHost: true,
  ...authConfig,
});

export default auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - handled separately
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
