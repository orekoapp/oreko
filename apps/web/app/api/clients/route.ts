import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { checkRateLimit, getRateLimitHeaders, defaultRateLimitOptions } from '@/lib/rate-limit';
import { safeParseAddress } from '@/lib/clients/types';

/**
 * GET /api/clients
 * Returns clients for the current user's workspace
 */
export async function GET(request: NextRequest) {
  // Bug #56/#59: Apply rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
  const rateLimitResult = checkRateLimit(`clients:${clientIp}`, defaultRateLimitOptions);
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  try {
    let workspaceId: string;
    try {
      const result = await getCurrentUserWorkspace();
      workspaceId = result.workspaceId;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20));
    const rawSearch = searchParams.get('search');
    const search = rawSearch ? rawSearch.slice(0, 200) : null;

    // Build where clause
    const where = {
      workspaceId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { company: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Fetch clients with pagination
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.client.count({ where }),
    ]);

    // Transform to API response shape
    // Bug #136: Safely parse address JSON instead of raw casts
    const data = clients.map((client) => {
      const addr = safeParseAddress(client.address);
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        company: client.company || '',
        address: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postalCode || '',
        country: addr.country || '',
        notes: client.notes || '',
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      { headers: rateLimitHeaders }
    );
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
