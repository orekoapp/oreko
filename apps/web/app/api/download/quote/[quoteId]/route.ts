import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@quotecraft/database';
import { getQuotePdfData, getQuotePdfDataByToken } from '@/lib/pdf/actions';
import { generateQuotePdfHtml } from '@/lib/pdf/templates';
import { generatePdfFromHtml } from '@/lib/services/pdf';

/**
 * GET /api/download/quote/[quoteId]
 * Returns the quote as a PDF file download.
 * Supports two modes:
 *   1. Authenticated user (dashboard) — uses session cookie
 *   2. Public access (client portal) — uses ?token= query parameter
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    const accessToken = _request.nextUrl.searchParams.get('token');

    let data;
    let actorId: string | null = null;
    let actorType: 'user' | 'client' = 'user';

    if (accessToken) {
      // Public access via client portal — validate token matches this quote
      const quote = await prisma.quote.findFirst({
        where: { id: quoteId, accessToken, deletedAt: null },
        select: { id: true },
      });
      if (!quote) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      data = await getQuotePdfDataByToken(accessToken);
      actorType = 'client';
      actorId = null;
    } else {
      // Authenticated user access
      const session = await auth();
      if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      actorId = session.user.id;
      data = await getQuotePdfData(quoteId);
    }

    if (!data) {
      return new NextResponse('Quote not found', { status: 404 });
    }

    const html = generateQuotePdfHtml(data);
    const pdfBuffer = await generatePdfFromHtml(html, {
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; padding: 5px 15mm; color: #9ca3af; display: flex; justify-content: space-between;">
          <span>${data.quoteNumber}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    const filename = `Quote-${data.quoteNumber.replace(/[^a-zA-Z0-9\-_]/g, '')}.pdf`;

    // Audit trail: log PDF download event
    prisma.quoteEvent.create({
      data: {
        quoteId,
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
    console.error('Error generating quote PDF:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
