import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';

/**
 * POST /api/quotes/[quoteId]/autosave
 * Bug #206: Lightweight endpoint for navigator.sendBeacon auto-save on page unload.
 * Accepts a JSON body with quote fields to update.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    if (!quoteId || typeof quoteId !== 'string') {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }

    let workspaceId: string;
    try {
      const result = await getCurrentUserWorkspace();
      workspaceId = result.workspaceId;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate the quote belongs to this workspace
    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, workspaceId, deletedAt: null },
      select: { id: true, settings: true },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Only update allowed fields
    const updateData: Record<string, unknown> = {};
    if (typeof body.title === 'string' && body.title.trim()) {
      updateData.title = body.title.slice(0, 500);
    }
    if (typeof body.notes === 'string') {
      updateData.notes = body.notes.slice(0, 10000);
    }
    if (typeof body.terms === 'string') {
      updateData.terms = body.terms.slice(0, 10000);
    }
    if (typeof body.internalNotes === 'string') {
      updateData.internalNotes = body.internalNotes.slice(0, 10000);
    }
    if (Array.isArray(body.blocks)) {
      const existingSettings =
        typeof quote.settings === 'object' && quote.settings !== null
          ? quote.settings
          : {};
      updateData.settings = { ...(existingSettings as Record<string, unknown>), blocks: body.blocks };
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.quote.update({
        where: { id: quoteId },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Auto-save failed' }, { status: 500 });
  }
}
