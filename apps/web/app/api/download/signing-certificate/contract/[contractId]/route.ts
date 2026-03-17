import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@quotecraft/database';
import { generateSigningCertificateHtml } from '@/lib/signing/certificate-template';
import { generatePdfFromHtml } from '@/lib/services/pdf';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';

/**
 * GET /api/download/signing-certificate/contract/[contractId]
 * Generate and download the signing certificate PDF for a signed contract.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { contractId } = await params;

    const { workspaceId } = await getCurrentUserWorkspace();

    const instance = await prisma.contractInstance.findFirst({
      where: { id: contractId, workspaceId },
      select: {
        id: true,
        signedAt: true,
        signatureData: true,
        signerIpAddress: true,
        signerUserAgent: true,
        viewedAt: true,
        sentAt: true,
        createdAt: true,
        contract: { select: { name: true } },
        client: { select: { name: true, email: true, company: true } },
        workspace: {
          select: {
            name: true,
            businessProfile: { select: { businessName: true } },
          },
        },
      },
    });

    if (!instance) {
      return new NextResponse('Contract not found', { status: 404 });
    }

    if (!instance.signedAt) {
      return new NextResponse('Contract has not been signed', { status: 400 });
    }

    const sigData = instance.signatureData as Record<string, unknown> | null;

    // Build audit events from available timestamps
    const events: Array<{
      type: string;
      timestamp: string;
      ipAddress: string | null;
      userAgent: string | null;
    }> = [];

    events.push({
      type: 'created',
      timestamp: instance.createdAt.toISOString(),
      ipAddress: null,
      userAgent: null,
    });

    if (instance.sentAt) {
      events.push({
        type: 'sent',
        timestamp: instance.sentAt.toISOString(),
        ipAddress: null,
        userAgent: null,
      });
    }

    if (instance.viewedAt) {
      events.push({
        type: 'viewed',
        timestamp: instance.viewedAt.toISOString(),
        ipAddress: null,
        userAgent: null,
      });
    }

    events.push({
      type: 'signed',
      timestamp: instance.signedAt.toISOString(),
      ipAddress: instance.signerIpAddress,
      userAgent: instance.signerUserAgent,
    });

    const html = generateSigningCertificateHtml({
      documentType: 'contract',
      documentId: instance.id,
      documentNumber: instance.id.slice(0, 8).toUpperCase(),
      documentTitle: instance.contract?.name || 'Untitled Contract',
      businessName: instance.workspace.businessProfile?.businessName || instance.workspace.name,
      clientName: instance.client?.company || instance.client?.name || 'Unknown',
      clientEmail: instance.client?.email || 'N/A',
      signerName: (sigData?.name as string) || instance.client?.name || 'Unknown',
      signedAt: instance.signedAt.toISOString(),
      ipAddress: instance.signerIpAddress || 'N/A',
      userAgent: instance.signerUserAgent || 'N/A',
      documentHash: (sigData?.documentHash as string) || null,
      signatureImageUrl: sigData?.type === 'drawn' ? (sigData?.value as string) : null,
      termsSnapshot: null,
      events,
    });

    const pdfBuffer = await generatePdfFromHtml(html);

    const safeName = (instance.contract?.name || 'Contract').replace(/[^a-zA-Z0-9\-_]/g, '');
    const filename = `Signing-Certificate-${safeName}.pdf`;

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
    console.error('Error generating signing certificate:', error);
    return new NextResponse('Failed to generate signing certificate', { status: 500 });
  }
}
