import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';

/**
 * GET /api/clients
 * Returns clients for the current user's workspace
 */
export async function GET(request: NextRequest) {
  try {
    let workspaceId: string;
    try {
      const result = await getCurrentUserWorkspace();
      workspaceId = result.workspaceId;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = searchParams.get('search');

    // Build where clause
    const where = {
      workspaceId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { company: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Fetch clients with pagination
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.client.count({ where }),
    ]);

    // Transform to API response shape
    const data = clients.map((client) => {
      // Address is stored as JSON
      const address = (client.address as Record<string, string> | null) || {};
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        company: client.company || '',
        address: address.street || address.line1 || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || address.zip || '',
        country: address.country || '',
        notes: client.notes || '',
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
