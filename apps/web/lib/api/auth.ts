import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@quotecraft/database';
import { checkRateLimit, getRateLimitHeaders, defaultRateLimitOptions } from '@/lib/rate-limit';

export interface ApiContext {
  workspaceId: string;
  apiKeyId: string;
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Authenticate an API request using Bearer token.
 * Returns workspace context or an error response.
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<{ context: ApiContext } | { error: NextResponse }> {
  // Rate limit by IP
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimitResult = checkRateLimit(`api:${clientIp}`, defaultRateLimitOptions);

  if (rateLimitResult.limited) {
    return {
      error: NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      ),
    };
  }

  // Extract Bearer token
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'Missing or invalid Authorization header. Use: Bearer <api_key>' },
        { status: 401 }
      ),
    };
  }

  const rawKey = authHeader.slice(7);
  if (!rawKey || !rawKey.startsWith('qc_sk_')) {
    return {
      error: NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 401 }
      ),
    };
  }

  // Look up the key by hash
  const keyHash = hashKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, workspaceId: true, revokedAt: true, expiresAt: true },
  });

  if (!apiKey || apiKey.revokedAt) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or revoked API key' },
        { status: 401 }
      ),
    };
  }

  // CR #7: Check expiry with 5-second buffer for clock skew
  if (apiKey.expiresAt && apiKey.expiresAt.getTime() < Date.now() - 5000) {
    return {
      error: NextResponse.json(
        { error: 'API key has expired' },
        { status: 401 }
      ),
    };
  }

  // Update lastUsedAt (fire and forget — don't block the request)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return {
    context: {
      workspaceId: apiKey.workspaceId,
      apiKeyId: apiKey.id,
    },
  };
}

/**
 * Helper to create standard JSON responses with consistent format.
 */
export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
