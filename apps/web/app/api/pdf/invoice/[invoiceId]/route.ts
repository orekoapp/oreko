import { NextRequest, NextResponse } from 'next/server';
import { getInvoicePdfData, getInvoicePdfDataByToken } from '@/lib/pdf/actions';
import { generateInvoicePdfHtml } from '@/lib/pdf/templates';
import { auth } from '@/lib/auth';
import { prisma } from '@quotecraft/database';

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
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF HTML:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
