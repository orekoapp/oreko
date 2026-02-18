import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getInvoicePdfData } from '@/lib/pdf/actions';
import { generateInvoicePdfHtml } from '@/lib/pdf/templates';
import { generatePdfFromHtml } from '@/lib/services/pdf';

/**
 * GET /api/download/invoice/[invoiceId]
 * Returns the invoice as a PDF file download
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { invoiceId } = await params;

    const data = await getInvoicePdfData(invoiceId);

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

    const filename = `Invoice-${data.invoiceNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
