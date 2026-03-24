import { Redis } from '@upstash/redis';

/**
 * Shared Upstash Redis client.
 * Falls back to null if env vars are not configured (dev without Redis).
 */
let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

/**
 * Check if Redis is available.
 */
export function isRedisAvailable(): boolean {
  return !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
}
