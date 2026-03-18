/**
 * In-memory rate limiter with sliding window.
 *
 * IMPORTANT: This is a per-instance rate limiter. On serverless platforms
 * (Vercel, AWS Lambda), each function instance has its own memory, so rate
 * limits are NOT shared across instances. This means an attacker can bypass
 * limits by spreading requests across instances.
 *
 * For production hardening, replace with a distributed rate limiter:
 * - Upstash Redis (@upstash/ratelimit)
 * - Vercel KV
 * - Redis (ioredis)
 *
 * The current implementation still provides basic protection against:
 * - Single-instance bursts (warm lambda reuse)
 * - Development/self-hosted single-process deployments
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

// Track last cleanup time for lazy cleanup (no setInterval in serverless)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60000; // 1 minute

/**
 * Lazy cleanup: remove expired entries when enough time has passed.
 * Called on every rate limit check instead of using setInterval,
 * which is problematic in serverless environments.
 */
function lazyCleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key);
    }
  }
}

export interface RateLimitOptions {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is rate limited */
  limited: boolean;
  /** Maximum requests allowed */
  limit: number;
  /** Remaining requests in the window */
  remaining: number;
  /** Unix timestamp when the window resets */
  reset: number;
}

/**
 * Check rate limit for a given key (typically IP address or user ID).
 *
 * NOTE: Per-instance only. See module-level comment for limitations.
 *
 * TODO (MEDIUM #7): IP-based rate limiting is bypassable via X-Forwarded-For
 * header spoofing. On serverless platforms, the IP is derived from
 * X-Forwarded-For which clients can forge. Mitigations:
 * - Use Vercel's `request.ip` (trusted proxy IP) instead of raw headers
 * - Prefer user/session-based keys over IP-based keys where possible
 * - For unauthenticated endpoints, combine IP with fingerprinting
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  lazyCleanup();

  const now = Date.now();
  const record = requestCounts.get(key);

  // If no record exists or window has expired, create new window
  if (!record || now > record.resetAt) {
    const resetAt = now + options.windowMs;
    requestCounts.set(key, { count: 1, resetAt });
    return {
      limited: false,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: Math.floor(resetAt / 1000),
    };
  }

  // Increment count
  record.count++;

  // Check if over limit
  if (record.count > options.limit) {
    return {
      limited: true,
      limit: options.limit,
      remaining: 0,
      reset: Math.floor(record.resetAt / 1000),
    };
  }

  return {
    limited: false,
    limit: options.limit,
    remaining: options.limit - record.count,
    reset: Math.floor(record.resetAt / 1000),
  };
}

/**
 * Get rate limit headers to add to response
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };
}

/**
 * Default rate limit configuration for API routes
 */
export const defaultRateLimitOptions: RateLimitOptions = {
  limit: 100,
  windowMs: 60000, // 1 minute
};

/**
 * Stricter rate limit for sensitive operations
 */
export const strictRateLimitOptions: RateLimitOptions = {
  limit: 10,
  windowMs: 60000, // 1 minute
};
