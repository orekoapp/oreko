/**
 * Bug #14: Validate request origin to prevent CSRF attacks on API routes.
 * Checks the Origin or Referer header against the expected app URL.
 * Returns true if the request origin is valid, false otherwise.
 */
export function validateRequestOrigin(request: { headers: { get(name: string): string | null } }): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  let expectedHost: string;
  try {
    expectedHost = new URL(appUrl).host;
  } catch {
    expectedHost = 'localhost:3000';
  }

  // Check Origin header first (most reliable for CSRF)
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).host === expectedHost;
    } catch {
      return false;
    }
  }

  // Fall back to Referer header
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).host === expectedHost;
    } catch {
      return false;
    }
  }

  // No Origin or Referer — allow same-origin requests (e.g., from curl, Postman, server-side)
  // These won't have Origin/Referer headers. Browser cross-origin requests always include Origin.
  return true;
}
