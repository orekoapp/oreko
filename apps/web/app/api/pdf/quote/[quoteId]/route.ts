import { NextRequest, NextResponse } from 'next/server';
import { getQuotePdfData, getQuotePdfDataByToken } from '@/lib/pdf/actions';
import { generateQuotePdfHtml } from '@/lib/pdf/templates';
import { auth } from '@/lib/auth';
import { prisma } from '@quotecraft/database';

/**
 * GET /api/pdf/quote/[quoteId]
 * Returns HTML for quote PDF rendering (used by Puppeteer).
 * Supports authenticated access and public access via ?token= query parameter.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    const accessToken = _request.nextUrl.searchParams.get('token');

    let data;

    if (accessToken) {
      // Public access — validate token matches this quote
      const quote = await prisma.quote.findFirst({
        where: { id: quoteId, accessToken, deletedAt: null },
        select: { id: true },
      });
      if (!quote) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      data = await getQuotePdfDataByToken(accessToken);
    } else {
      // Authenticated access
      const session = await auth();
      if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      data = await getQuotePdfData(quoteId);
    }

    if (!data) {
      return new NextResponse('Quote not found', { status: 404 });
    }

    const html = generateQuotePdfHtml(data);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating quote PDF HTML:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
