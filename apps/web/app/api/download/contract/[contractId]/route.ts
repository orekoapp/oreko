import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@oreko/database';
import { getContractPdfData, getContractPdfDataByToken } from '@/lib/pdf/actions';
import { generateContractPdfHtml } from '@/lib/pdf/templates';
import { generatePdfFromHtml } from '@/lib/services/pdf';
import { logger } from '@/lib/logger';

/**
 * GET /api/download/contract/[contractId]
 * Returns the contract as a PDF file download.
 * Supports two modes:
 *   1. Authenticated user (dashboard) — uses session cookie
 *   2. Public access (client portal) — uses ?token= query parameter
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    // Rate limit PDF downloads
    const clientIp = _request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || _request.headers.get('x-real-ip') || 'unknown';
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const rl = await checkRateLimit(`pdf-download:${clientIp}`, { limit: 10, windowMs: 60000 });
    if (rl.limited) return new NextResponse('Too many requests', { status: 429 });

    const { contractId } = await params;
    const accessToken = _request.nextUrl.searchParams.get('token');

    let data;

    if (accessToken) {
      // Public access via client portal — validate token matches this contract
      const instance = await prisma.contractInstance.findFirst({
        where: { id: contractId, accessToken, deletedAt: null },
        select: { id: true },
      });
      if (!instance) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      data = await getContractPdfDataByToken(accessToken);
    } else {
      // Authenticated user access
      const session = await auth();
      if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      data = await getContractPdfData(contractId);
    }

    if (!data) {
      return new NextResponse('Contract not found', { status: 404 });
    }

    const html = generateContractPdfHtml(data);
    const pdfBuffer = await generatePdfFromHtml(html, {
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; padding: 5px 15mm; color: #9ca3af; display: flex; justify-content: space-between;">
          <span>${data.contractName}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    const filename = `Contract-${data.contractName.replace(/[^a-zA-Z0-9\-_ ]/g, '').replace(/\s+/g, '-')}.pdf`;

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
    logger.error({ err: error }, 'Error generating contract PDF');
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
