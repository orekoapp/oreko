import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders, defaultRateLimitOptions } from '@/lib/rate-limit';

/**
 * GET /api/quotes
 * Returns quotes for the current user's workspace
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
  const rateLimitResult = checkRateLimit(`quotes:${clientIp}`, defaultRateLimitOptions);
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders });
    }

    // Get user's workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20));
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where = {
      workspaceId: membership.workspaceId,
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { quoteNumber: { contains: search, mode: 'insensitive' as const } },
          { client: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    // Fetch quotes with pagination
    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, email: true, company: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.quote.count({ where }),
    ]);

    // Transform to API response shape
    const data = quotes.map((quote) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      title: quote.title,
      status: quote.status,
      total: Number(quote.total),
      subtotal: Number(quote.subtotal),
      taxTotal: Number(quote.taxTotal),
      issueDate: quote.issueDate.toISOString(),
      expirationDate: quote.expirationDate?.toISOString() || null,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
      client: quote.client,
    }));

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
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
