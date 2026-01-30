'use server';

import { revalidatePath } from 'next/cache';
import { prisma, Prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { assertNotDemo } from '@/lib/demo/guard';
import { NotFoundError, UnauthorizedError } from '@/lib/api/errors';
import type {
  ClientListItem,
  ClientDetail,
  ClientFilter,
  PaginatedClients,
  ClientStats,
  ClientActivity,
  CreateClientInput,
  UpdateClientInput,
  ClientImportResult,
  ClientContact,
  ClientAddress,
  ClientMetadata,
} from './types';
import { nanoid } from 'nanoid';

// Helper to convert Decimal to number
function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value) || 0;
}

// Helper to get current user and their workspace
async function getCurrentUserWorkspace() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  // Get user's first workspace (for now, single workspace support)
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  if (!workspaceMember) {
    throw new UnauthorizedError('No workspace found');
  }

  return {
    userId: session.user.id,
    workspaceId: workspaceMember.workspaceId,
  };
}

// Get paginated clients
export async function getClients(filter: ClientFilter = {}): Promise<PaginatedClients> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const {
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filter;

  // Build where clause
  const where: Prisma.ClientWhereInput = {
    workspaceId,
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get total count
  const total = await prisma.client.count({ where });

  // Get clients with counts
  const clients = await prisma.client.findMany({
    where,
    include: {
      _count: {
        select: {
          quotes: true,
          invoices: true,
        },
      },
      invoices: {
        where: {
          status: 'paid',
        },
        select: {
          total: true,
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Transform to list items
  const data: ClientListItem[] = clients.map((client) => {
    const metadata = (client.metadata as ClientMetadata) || {};
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      type: metadata.type || 'individual',
      totalQuotes: client._count.quotes,
      totalInvoices: client._count.invoices,
      totalRevenue: client.invoices.reduce((sum, inv) => sum + toNumber(inv.total), 0),
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  });

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get client by ID
export async function getClientById(id: string): Promise<ClientDetail> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const client = await prisma.client.findFirst({
    where: {
      id,
      workspaceId,
      deletedAt: null,
    },
    include: {
      quotes: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          quotes: true,
          invoices: true,
        },
      },
    },
  });

  if (!client) {
    throw new NotFoundError('Client', id);
  }

  // Calculate totals
  const totals = await prisma.invoice.aggregate({
    where: {
      clientId: id,
      workspaceId,
    },
    _sum: {
      total: true,
      amountPaid: true,
    },
  });

  const totalRevenue = toNumber(totals._sum?.amountPaid);
  const totalInvoiced = toNumber(totals._sum?.total);
  const outstandingAmount = totalInvoiced - totalRevenue;

  const metadata = (client.metadata as ClientMetadata) || {};

  return {
    id: client.id,
    workspaceId: client.workspaceId,
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    address: (client.address as ClientAddress) || null,
    billingAddress: (client.billingAddress as ClientAddress) || null,
    taxId: client.taxId,
    notes: client.notes,
    metadata,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    deletedAt: client.deletedAt,
    quotes: client.quotes,
    invoices: client.invoices,
    _count: client._count,
    // Computed fields from metadata
    contacts: metadata.contacts || [],
    tags: metadata.tags || [],
    type: metadata.type || 'individual',
    website: metadata.website || null,
    totalRevenue,
    outstandingAmount,
  };
}

// Get client activity
export async function getClientActivity(clientId: string): Promise<ClientActivity[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify client belongs to workspace
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!client) {
    throw new NotFoundError('Client', clientId);
  }

  // Get quotes and invoices for activity
  const [quotes, invoices] = await Promise.all([
    prisma.quote.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        status: true,
        total: true,
        createdAt: true,
        sentAt: true,
        acceptedAt: true,
        declinedAt: true,
      },
    }),
    prisma.invoice.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        total: true,
        createdAt: true,
        sentAt: true,
        paidAt: true,
        dueDate: true,
      },
    }),
  ]);

  const activities: ClientActivity[] = [];

  // Add quote activities
  for (const quote of quotes) {
    activities.push({
      id: `quote-created-${quote.id}`,
      type: 'quote_created',
      title: `Quote created: ${quote.title}`,
      amount: toNumber(quote.total),
      date: quote.createdAt,
      relatedId: quote.id,
    });

    if (quote.sentAt) {
      activities.push({
        id: `quote-sent-${quote.id}`,
        type: 'quote_sent',
        title: `Quote sent: ${quote.title}`,
        amount: toNumber(quote.total),
        date: quote.sentAt,
        relatedId: quote.id,
      });
    }

    if (quote.acceptedAt) {
      activities.push({
        id: `quote-accepted-${quote.id}`,
        type: 'quote_accepted',
        title: `Quote accepted: ${quote.title}`,
        amount: toNumber(quote.total),
        date: quote.acceptedAt,
        relatedId: quote.id,
      });
    }

    if (quote.declinedAt) {
      activities.push({
        id: `quote-declined-${quote.id}`,
        type: 'quote_declined',
        title: `Quote declined: ${quote.title}`,
        amount: toNumber(quote.total),
        date: quote.declinedAt,
        relatedId: quote.id,
      });
    }
  }

  // Add invoice activities
  for (const invoice of invoices) {
    activities.push({
      id: `invoice-created-${invoice.id}`,
      type: 'invoice_created',
      title: `Invoice created: ${invoice.invoiceNumber}`,
      amount: toNumber(invoice.total),
      date: invoice.createdAt,
      relatedId: invoice.id,
    });

    if (invoice.sentAt) {
      activities.push({
        id: `invoice-sent-${invoice.id}`,
        type: 'invoice_sent',
        title: `Invoice sent: ${invoice.invoiceNumber}`,
        amount: toNumber(invoice.total),
        date: invoice.sentAt,
        relatedId: invoice.id,
      });
    }

    if (invoice.paidAt) {
      activities.push({
        id: `invoice-paid-${invoice.id}`,
        type: 'invoice_paid',
        title: `Invoice paid: ${invoice.invoiceNumber}`,
        amount: toNumber(invoice.total),
        date: invoice.paidAt,
        relatedId: invoice.id,
      });
    }

    if (invoice.status === 'overdue') {
      activities.push({
        id: `invoice-overdue-${invoice.id}`,
        type: 'invoice_overdue',
        title: `Invoice overdue: ${invoice.invoiceNumber}`,
        description: `Due date was ${invoice.dueDate.toLocaleDateString()}`,
        amount: toNumber(invoice.total),
        date: invoice.dueDate,
        relatedId: invoice.id,
      });
    }
  }

  // Sort by date descending
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return activities.slice(0, 50);
}

// Create client
export async function createClient(input: CreateClientInput): Promise<{ id: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Build metadata
  const metadata: ClientMetadata = {
    type: input.type || 'individual',
    website: input.website,
    tags: input.tags || [],
    contacts: input.contacts?.map((contact) => ({
      ...contact,
      id: nanoid(),
    })) || [],
  };

  const client = await prisma.client.create({
    data: {
      workspaceId,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      company: input.company || null,
      taxId: input.taxId || null,
      address: input.address ? (input.address as Prisma.InputJsonValue) : Prisma.JsonNull,
      billingAddress: input.billingAddress ? (input.billingAddress as Prisma.InputJsonValue) : Prisma.JsonNull,
      notes: input.notes || null,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });

  revalidatePath('/clients');

  return { id: client.id };
}

// Update client
export async function updateClient(input: UpdateClientInput): Promise<{ id: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify ownership
  const existing = await prisma.client.findFirst({
    where: {
      id: input.id,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new NotFoundError('Client', input.id);
  }

  // Merge metadata
  const existingMetadata = (existing.metadata as ClientMetadata) || {};
  const metadata: ClientMetadata = {
    ...existingMetadata,
    ...(input.type !== undefined && { type: input.type }),
    ...(input.website !== undefined && { website: input.website }),
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.contacts !== undefined && {
      contacts: input.contacts.map((contact) => ({
        ...contact,
        id: 'id' in contact ? (contact as ClientContact).id : nanoid(),
      })),
    }),
  };

  const updateData: Prisma.ClientUpdateInput = {
    metadata: metadata as Prisma.InputJsonValue,
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.phone !== undefined) updateData.phone = input.phone || null;
  if (input.company !== undefined) updateData.company = input.company || null;
  if (input.taxId !== undefined) updateData.taxId = input.taxId || null;
  if (input.notes !== undefined) updateData.notes = input.notes || null;
  if (input.address !== undefined) {
    updateData.address = input.address ? (input.address as Prisma.InputJsonValue) : Prisma.JsonNull;
  }
  if (input.billingAddress !== undefined) {
    updateData.billingAddress = input.billingAddress ? (input.billingAddress as Prisma.InputJsonValue) : Prisma.JsonNull;
  }

  const client = await prisma.client.update({
    where: { id: input.id },
    data: updateData,
  });

  revalidatePath('/clients');
  revalidatePath(`/clients/${input.id}`);

  return { id: client.id };
}

// Delete client (soft delete)
export async function deleteClient(id: string): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify ownership
  const existing = await prisma.client.findFirst({
    where: {
      id,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new NotFoundError('Client', id);
  }

  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/clients');
}

// Bulk delete clients
export async function deleteClients(ids: string[]): Promise<{ deleted: number }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const result = await prisma.client.updateMany({
    where: {
      id: { in: ids },
      workspaceId,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/clients');

  return { deleted: result.count };
}

// Get client stats
export async function getClientStats(): Promise<ClientStats> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const clients = await prisma.client.findMany({
    where: { workspaceId, deletedAt: null },
    select: {
      metadata: true,
      _count: {
        select: {
          quotes: {
            where: { status: { in: ['draft', 'sent', 'viewed'] } },
          },
          invoices: {
            where: { status: { in: ['sent', 'viewed', 'overdue'] } },
          },
        },
      },
    },
  });

  let individuals = 0;
  let companies = 0;
  let withActiveQuotes = 0;
  let withUnpaidInvoices = 0;

  for (const client of clients) {
    const metadata = (client.metadata as ClientMetadata) || {};
    if (metadata.type === 'company') {
      companies++;
    } else {
      individuals++;
    }
    if (client._count.quotes > 0) {
      withActiveQuotes++;
    }
    if (client._count.invoices > 0) {
      withUnpaidInvoices++;
    }
  }

  return {
    total: clients.length,
    individuals,
    companies,
    withActiveQuotes,
    withUnpaidInvoices,
  };
}

// Import clients from CSV data
export async function importClients(
  data: Array<{
    name: string;
    email: string;
    phone?: string;
    company?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>,
  skipDuplicates = true
): Promise<ClientImportResult> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const result: ClientImportResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i]!;

    try {
      // Check for duplicate email
      if (skipDuplicates) {
        const existing = await prisma.client.findFirst({
          where: {
            workspaceId,
            email: row.email,
            deletedAt: null,
          },
        });

        if (existing) {
          result.skipped++;
          continue;
        }
      }

      // Build address if any address fields provided
      let address: ClientAddress | null = null;
      if (row.street || row.city || row.state || row.postalCode || row.country) {
        address = {
          street: row.street,
          city: row.city,
          state: row.state,
          postalCode: row.postalCode,
          country: row.country,
        };
      }

      const metadata: ClientMetadata = {
        type: row.company ? 'company' : 'individual',
        contacts: [],
        tags: [],
      };

      await prisma.client.create({
        data: {
          workspaceId,
          name: row.name,
          email: row.email,
          phone: row.phone || null,
          company: row.company || null,
          address: address ? (address as Prisma.InputJsonValue) : Prisma.JsonNull,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });

      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  revalidatePath('/clients');

  return result;
}

// Search clients (for autocomplete)
export async function searchClients(query: string, limit = 10): Promise<Array<{
  id: string;
  name: string;
  email: string;
  company: string | null;
}>> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const clients = await prisma.client.findMany({
    where: {
      workspaceId,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
    },
    take: limit,
    orderBy: { name: 'asc' },
  });

  return clients;
}
