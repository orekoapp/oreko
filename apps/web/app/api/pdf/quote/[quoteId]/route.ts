import { NextRequest, NextResponse } from 'next/server';
import { getQuotePdfData } from '@/lib/pdf/actions';
import { generateQuotePdfHtml } from '@/lib/pdf/templates';

/**
 * GET /api/pdf/quote/[quoteId]
 * Returns HTML for quote PDF rendering (used by Puppeteer)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;

    const data = await getQuotePdfData(quoteId);

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
