import { auth } from '@/lib/auth';
import type { NextMiddleware } from 'next/server';

// @ts-expect-error - NextAuth middleware types have portability issues
const middleware: NextMiddleware = auth((req) => {
  // Middleware logic is handled in auth callbacks
  // This file just ensures auth middleware runs
});

export default middleware;

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
