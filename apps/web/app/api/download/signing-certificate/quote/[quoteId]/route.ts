import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@quotecraft/database';
import { generateSigningCertificateHtml } from '@/lib/signing/certificate-template';
import { generatePdfFromHtml } from '@/lib/services/pdf';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { logger } from '@/lib/logger';

/**
 * GET /api/download/signing-certificate/quote/[quoteId]
 * Generate and download the signing certificate PDF for a signed quote.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { quoteId } = await params;

    const { workspaceId } = await getCurrentUserWorkspace();

    // Fetch quote with signing data and audit trail
    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, workspaceId, deletedAt: null },
      select: {
        id: true,
        quoteNumber: true,
        title: true,
        signedAt: true,
        signatureData: true,
        client: { select: { name: true, email: true, company: true } },
        workspace: {
          select: {
            name: true,
            businessProfile: { select: { businessName: true } },
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
          select: {
            eventType: true,
            createdAt: true,
            ipAddress: true,
            userAgent: true,
          },
        },
      },
    });

    if (!quote) {
      return new NextResponse('Quote not found', { status: 404 });
    }

    if (!quote.signedAt) {
      return new NextResponse('Quote has not been signed', { status: 400 });
    }

    const sigData = quote.signatureData as Record<string, unknown> | null;

    const html = generateSigningCertificateHtml({
      documentType: 'quote',
      documentId: quote.id,
      documentNumber: quote.quoteNumber,
      documentTitle: quote.title || 'Untitled Quote',
      businessName: quote.workspace.businessProfile?.businessName || quote.workspace.name,
      clientName: quote.client.company || quote.client.name,
      clientEmail: quote.client.email,
      signerName: (sigData?.signerName as string) || quote.client.name,
      signedAt: quote.signedAt.toISOString(),
      ipAddress: (sigData?.ipAddress as string) || 'N/A',
      userAgent: (sigData?.userAgent as string) || 'N/A',
      documentHash: (sigData?.documentHash as string) || null,
      signatureImageUrl: (sigData?.data as string) || null,
      termsSnapshot: null,
      events: quote.events.map((e) => ({
        type: e.eventType,
        timestamp: e.createdAt.toISOString(),
        ipAddress: e.ipAddress,
        userAgent: e.userAgent,
      })),
    });

    const pdfBuffer = await generatePdfFromHtml(html);

    const filename = `Signing-Certificate-${quote.quoteNumber.replace(/[^a-zA-Z0-9\-_]/g, '')}.pdf`;

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
    logger.error({ err: error }, 'Error generating signing certificate');
    return new NextResponse('Failed to generate signing certificate', { status: 500 });
  }
}
