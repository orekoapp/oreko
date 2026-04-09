import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@oreko/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { validateRequestOrigin } from '@/lib/csrf';

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
    // MEDIUM #5: CSRF protection on autosave
    if (!validateRequestOrigin(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }
    const { quoteId } = await params;
    if (!quoteId || typeof quoteId !== 'string') {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }

    let workspaceId: string;
    let userId: string;
    try {
      const result = await getCurrentUserWorkspace();
      workspaceId = result.workspaceId;
      userId = result.userId;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // MEDIUM #3: Rate limit autosave to prevent abuse
    const rateLimitResult = await checkRateLimit(`autosave:${userId}:${quoteId}`, {
      limit: 30,
      windowMs: 60000, // 30 saves per minute per user per quote
    });
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many autosave requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
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
      // Limit blocks array size to prevent abuse
      if (body.blocks.length > 200) {
        return NextResponse.json(
          { error: 'Too many blocks (max 200)' },
          { status: 400 }
        );
      }
      // Limit total JSON size
      const blocksSize = JSON.stringify(body.blocks).length;
      if (blocksSize > 500000) { // 500KB
        return NextResponse.json(
          { error: 'Blocks data too large (max 500KB)' },
          { status: 400 }
        );
      }
      // MEDIUM #4: Basic shape validation for blocks array
      const validBlocks = body.blocks.every(
        (block: unknown) =>
          typeof block === 'object' &&
          block !== null &&
          typeof (block as Record<string, unknown>).id === 'string' &&
          typeof (block as Record<string, unknown>).type === 'string'
      );
      if (!validBlocks) {
        return NextResponse.json(
          { error: 'Invalid blocks format: each block must have id and type' },
          { status: 400 }
        );
      }
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
