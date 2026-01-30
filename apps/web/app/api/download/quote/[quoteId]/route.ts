import { NextRequest, NextResponse } from 'next/server';
import { getQuotePdfData } from '@/lib/pdf/actions';
import { generateQuotePdfHtml } from '@/lib/pdf/templates';
import { generatePdfFromHtml } from '@/lib/services/pdf';

/**
 * GET /api/download/quote/[quoteId]
 * Returns the quote as a PDF file download
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
    const pdfBuffer = await generatePdfFromHtml(html, {
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; padding: 5px 15mm; color: #9ca3af; display: flex; justify-content: space-between;">
          <span>${data.quoteNumber}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    const filename = `Quote-${data.quoteNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating quote PDF:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
