import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@oreko/database';
import { getInvoicePdfData, getInvoicePdfDataByToken } from '@/lib/pdf/actions';
import { generateInvoicePdfHtml } from '@/lib/pdf/templates';
import { generatePdfFromHtml } from '@/lib/services/pdf';
import { logger } from '@/lib/logger';

/**
 * GET /api/download/invoice/[invoiceId]
 * Returns the invoice as a PDF file download.
 * Supports two modes:
 *   1. Authenticated user (dashboard) — uses session cookie
 *   2. Public access (client portal) — uses ?token= query parameter
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    // Rate limit PDF downloads
    const clientIp = _request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || _request.headers.get('x-real-ip') || 'unknown';
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const rl = await checkRateLimit(`pdf-download:${clientIp}`, { limit: 10, windowMs: 60000 });
    if (rl.limited) return new NextResponse('Too many requests', { status: 429 });

    const { invoiceId } = await params;
    const accessToken = _request.nextUrl.searchParams.get('token');

    let data;
    let actorId: string | null = null;
    let actorType: 'user' | 'client' = 'user';

    if (accessToken) {
      // Public access via client portal — validate token matches this invoice
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, accessToken, deletedAt: null },
        select: { id: true },
      });
      if (!invoice) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      data = await getInvoicePdfDataByToken(accessToken);
      actorType = 'client';
      actorId = null;
    } else {
      // Authenticated user access
      const session = await auth();
      if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      actorId = session.user.id;
      data = await getInvoicePdfData(invoiceId);
    }

    if (!data) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    const html = generateInvoicePdfHtml(data);
    const pdfBuffer = await generatePdfFromHtml(html, {
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; padding: 5px 15mm; color: #9ca3af; display: flex; justify-content: space-between;">
          <span>${data.invoiceNumber}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    const filename = `Invoice-${data.invoiceNumber.replace(/[^a-zA-Z0-9\-_]/g, '')}.pdf`;

    // Audit trail: log PDF download event
    prisma.invoiceEvent.create({
      data: {
        invoiceId,
        eventType: 'pdf_downloaded',
        actorType,
        actorId: actorId ?? 'anonymous',
        metadata: { format: 'pdf', filename },
        ipAddress: _request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        userAgent: _request.headers.get('user-agent') || null,
      },
    }).catch(() => {}); // Fire and forget — don't block download

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error generating invoice PDF');
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
