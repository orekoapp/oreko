import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@oreko/database';
import { auth } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders, defaultRateLimitOptions } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * GET /api/invoices
 * Returns invoices for the current user's workspace
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
  const rateLimitResult = await checkRateLimit(`invoices:${clientIp}`, defaultRateLimitOptions);
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
    const statusParam = searchParams.get('status');
    const validInvoiceStatuses = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'voided'];
    const status = statusParam && validInvoiceStatuses.includes(statusParam) ? statusParam : null;
    const rawSearch = searchParams.get('search');
    const search = rawSearch ? rawSearch.slice(0, 200) : null;

    // Build where clause
    const where = {
      workspaceId: membership.workspaceId,
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
          { client: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    // Fetch invoices with pagination
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, email: true, company: true },
          },
          payments: {
            select: { amount: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.invoice.count({ where }),
    ]);

    // Transform to API response shape
    const data = invoices.map((invoice) => {
      const amountPaid = invoice.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );
      const invoiceTotal = Number(invoice.total);
      const amountDue = invoiceTotal - amountPaid;

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        total: invoiceTotal,
        subtotal: Number(invoice.subtotal),
        taxTotal: Number(invoice.taxTotal),
        amountPaid,
        amountDue,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        client: invoice.client,
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching invoices');
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
