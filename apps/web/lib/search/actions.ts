'use server';

import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';

export interface SearchResult {
  id: string;
  type: 'quote' | 'invoice' | 'client' | 'contract' | 'project';
  title: string;
  subtitle: string;
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const { workspaceId } = await getCurrentUserWorkspace();
  const search = query.trim();

  const [quotes, invoices, clients, contracts, projects] = await Promise.all([
    prisma.quote.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { quoteNumber: { contains: search, mode: 'insensitive' } },
          { client: { name: { contains: search, mode: 'insensitive' } } },
        ],
      },
      include: { client: { select: { name: true } } },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { client: { name: { contains: search, mode: 'insensitive' } } },
        ],
      },
      include: { client: { select: { name: true } } },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contract.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
      include: { client: { select: { name: true } } },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const results: SearchResult[] = [
    ...quotes.map((q) => ({
      id: q.id,
      type: 'quote' as const,
      title: `${q.quoteNumber} - ${q.title || 'Untitled Quote'}`,
      subtitle: q.client?.name || 'No client',
      href: `/quotes/${q.id}`,
    })),
    ...invoices.map((i) => ({
      id: i.id,
      type: 'invoice' as const,
      title: i.invoiceNumber,
      subtitle: i.client?.name || 'No client',
      href: `/invoices/${i.id}`,
    })),
    ...clients.map((c) => ({
      id: c.id,
      type: 'client' as const,
      title: c.company || c.name,
      subtitle: c.email,
      href: `/clients/${c.id}`,
    })),
    ...contracts.map((ct) => ({
      id: ct.id,
      type: 'contract' as const,
      title: ct.name,
      subtitle: ct.isTemplate ? 'Template' : 'Contract',
      href: ct.isTemplate ? `/templates/${ct.id}` : `/contracts/${ct.id}`,
    })),
    ...projects.map((p) => ({
      id: p.id,
      type: 'project' as const,
      title: p.name,
      subtitle: p.client?.name || 'No client',
      href: `/projects/${p.id}`,
    })),
  ];

  return results;
}
