import { NextResponse } from 'next/server';
import { prisma } from '@quotecraft/database';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// Low #13: Rate limit health endpoint to prevent abuse
export async function GET() {
  const rl = await checkRateLimit('health', { limit: 60, windowMs: 60000 });
  if (rl.limited) {
    return NextResponse.json({ status: 'rate_limited' }, { status: 429 });
  }
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ err: error }, 'Health check failed');

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
        },
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
