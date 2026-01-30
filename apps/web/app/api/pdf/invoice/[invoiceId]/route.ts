import { NextRequest, NextResponse } from 'next/server';
import { getInvoicePdfData } from '@/lib/pdf/actions';
import { generateInvoicePdfHtml } from '@/lib/pdf/templates';

/**
 * GET /api/pdf/invoice/[invoiceId]
 * Returns HTML for invoice PDF rendering (used by Puppeteer)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;

    const data = await getInvoicePdfData(invoiceId);

    if (!data) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    const html = generateInvoicePdfHtml(data);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF HTML:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
