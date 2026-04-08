import { NextRequest } from 'next/server';
import { prisma } from '@oreko/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { logger } from '@/lib/logger';

// POST /api/v1/clients/import — Bulk import clients from a JSON array
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request);
    if ('error' in auth) return auth.error;
    const { workspaceId } = auth.context;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON body', 400);
    }

    const { clients, skipDuplicates = true } = body as {
      clients?: Array<{
        name: string;
        email: string;
        phone?: string;
        company?: string;
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      }>;
      skipDuplicates?: boolean;
    };

    if (!clients || !Array.isArray(clients)) {
      return apiError('clients array is required', 400);
    }

    if (clients.length === 0) {
      return apiError('clients array cannot be empty', 400);
    }

    if (clients.length > 500) {
      return apiError('Maximum 500 clients per import', 400);
    }

    const result = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; message: string }>,
      created: [] as Array<{ id: string; name: string; email: string }>,
    };

    // Batch duplicate check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const existingEmailSet = new Set<string>();

    if (skipDuplicates) {
      const existingClients = await prisma.client.findMany({
        where: {
          workspaceId,
          email: { in: clients.map((r) => r.email).filter(Boolean) },
          deletedAt: null,
        },
        select: { email: true },
      });
      for (const c of existingClients) {
        existingEmailSet.add(c.email.toLowerCase());
      }
    }

    // Pre-validate all rows before the transaction
    const validRows: Array<{ index: number; row: typeof clients[number] }> = [];

    for (let i = 0; i < clients.length; i++) {
      const row = clients[i]!;

      // Validate required fields
      if (!row.name || typeof row.name !== 'string' || row.name.trim().length === 0) {
        result.failed++;
        result.errors.push({ row: i + 1, message: 'name is required' });
        continue;
      }

      if (!row.email || !emailRegex.test(row.email)) {
        result.failed++;
        result.errors.push({ row: i + 1, message: 'Invalid email format' });
        continue;
      }

      // Check for duplicate
      if (skipDuplicates && existingEmailSet.has(row.email.toLowerCase())) {
        result.skipped++;
        continue;
      }

      // Check for duplicates within the import batch itself
      if (existingEmailSet.has(row.email.toLowerCase())) {
        result.skipped++;
        continue;
      }

      existingEmailSet.add(row.email.toLowerCase());
      validRows.push({ index: i, row });
    }

    // Wrap all client creations in a transaction for atomicity
    if (validRows.length > 0) {
      try {
        const createdClients = await prisma.$transaction(
          validRows.map(({ row }) => {
            // Build address if any address fields provided
            let address: Record<string, string | undefined> | undefined;
            if (row.street || row.city || row.state || row.postalCode || row.country) {
              address = {
                street: row.street,
                city: row.city,
                state: row.state,
                postalCode: row.postalCode,
                country: row.country,
              };
            }

            const metadata = {
              type: row.company ? 'company' : 'individual',
              contacts: [],
              tags: [],
            };

            return prisma.client.create({
              data: {
                workspaceId,
                name: row.name.trim(),
                email: row.email.trim().toLowerCase(),
                phone: row.phone || null,
                company: row.company || null,
                address: (address || undefined) as any,
                metadata: metadata as any,
              },
            });
          })
        );

        for (const client of createdClients) {
          result.success++;
          result.created.push({ id: client.id, name: client.name, email: client.email });
        }
      } catch (err: any) {
        // If transaction fails, all rows fail
        for (const { index } of validRows) {
          result.failed++;
          result.errors.push({
            row: index + 1,
            message: err?.code === 'P2002' ? 'Duplicate email' : 'Failed to create client',
          });
        }
      }
    }

    return apiSuccess({
      message: `Import complete: ${result.success} created, ${result.skipped} skipped, ${result.failed} failed`,
      ...result,
    }, 201);
  } catch (err) {
    logger.error({ err }, 'Client import API error');
    return apiError('Internal server error', 500);
  }
}
