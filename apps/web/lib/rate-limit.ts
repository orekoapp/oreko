/**
 * Simple in-memory rate limiter
 * For production, consider using Redis for distributed rate limiting
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean every minute

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
 * Check rate limit for a given key (typically IP address or user ID)
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
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
