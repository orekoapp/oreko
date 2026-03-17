/**
 * Bug #14: Validate request origin to prevent CSRF attacks on API routes.
 * Checks the Origin or Referer header against the expected app URL.
 * Returns true if the request origin is valid, false otherwise.
 */
export function validateRequestOrigin(request: { headers: { get(name: string): string | null } }): boolean {
  // Build set of allowed hosts from all known URL env vars
  const allowedHosts = new Set<string>();

  for (const envVar of [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined,
    'http://localhost:3000',
  ]) {
    if (envVar) {
      try { allowedHosts.add(new URL(envVar).host); } catch { /* skip invalid */ }
    }
  }

  // Check Origin header first (most reliable for CSRF)
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return allowedHosts.has(new URL(origin).host);
    } catch {
      return false;
    }
  }

  // Fall back to Referer header
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return allowedHosts.has(new URL(referer).host);
    } catch {
      return false;
    }
  }

  // No Origin or Referer — allow same-origin requests (e.g., from curl, Postman, server-side)
  // These won't have Origin/Referer headers. Browser cross-origin requests always include Origin.
  return true;
}
