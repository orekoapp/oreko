import { NextRequest, NextResponse } from 'next/server';
import { getInvoicePdfData, getInvoicePdfDataByToken } from '@/lib/pdf/actions';
import { generateInvoicePdfHtml } from '@/lib/pdf/templates';
import { auth } from '@/lib/auth';
import { prisma } from '@oreko/database';
import { logger } from '@/lib/logger';

/**
 * GET /api/pdf/invoice/[invoiceId]
 * Returns HTML for invoice PDF rendering (used by Puppeteer).
 * Supports authenticated access and public access via ?token= query parameter.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    // Rate limit PDF generation (CPU-intensive)
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const clientIp = _request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(`pdf:${clientIp}`, { limit: 20, windowMs: 60000 });
    if (rl.limited) {
      return new NextResponse('Too many PDF requests', { status: 429 });
    }

    const { invoiceId } = await params;
    const accessToken = _request.nextUrl.searchParams.get('token');

    let data;

    if (accessToken) {
      // Public access — validate token matches this invoice
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, accessToken, deletedAt: null },
        select: { id: true },
      });
      if (!invoice) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      data = await getInvoicePdfDataByToken(accessToken);
    } else {
      // Authenticated access
      const session = await auth();
      if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      data = await getInvoicePdfData(invoiceId);
    }

    if (!data) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    const html = generateInvoicePdfHtml(data);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error generating invoice PDF HTML');
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
