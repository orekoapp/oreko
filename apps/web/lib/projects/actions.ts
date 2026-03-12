'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { z } from 'zod';
import type { ProjectActivity, ProjectNote, ProjectContract } from './types';

// Constants
const DEFAULT_PAGE_SIZE = 25;

/**
 * Get the current user's active workspace
 */
async function getActiveWorkspace() {
  const { workspaceId, userId } = await getCurrentUserWorkspace();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  return {
    userId,
    workspace,
  };
}

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Invalid client ID'),
});

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectInput) {
  const { workspace } = await getActiveWorkspace();

  const validated = createProjectSchema.parse(data);

  // Verify client belongs to workspace
  const client = await prisma.client.findFirst({
    where: {
      id: validated.clientId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  const project = await prisma.project.create({
    data: {
      name: validated.name,
      description: validated.description,
      clientId: validated.clientId,
      workspaceId: workspace.id,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
        },
      },
    },
  });

  revalidatePath('/projects');
  revalidatePath(`/clients/${validated.clientId}`);

  return project;
}

/**
 * Get all projects for the current workspace
 */
export async function getProjects(options?: {
  clientId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { workspace } = await getActiveWorkspace();

  const {
    clientId,
    isActive = true,
    search,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = options || {};

  const where = {
    workspaceId: workspace.id,
    deletedAt: null,
    ...(typeof isActive === 'boolean' ? { isActive } : {}),
    ...(clientId ? { clientId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        _count: {
          select: {
            quotes: true,
            invoices: true,
            contractInstances: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string) {
  const { workspace } = await getActiveWorkspace();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          phone: true,
        },
      },
      quotes: {
        where: { deletedAt: null },
        select: {
          id: true,
          quoteNumber: true,
          title: true,
          status: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      invoices: {
        where: { deletedAt: null },
        select: {
          id: true,
          invoiceNumber: true,
          title: true,
          status: true,
          total: true,
          amountDue: true,
          dueDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          quotes: true,
          invoices: true,
          contractInstances: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectInput
) {
  const { workspace } = await getActiveWorkspace();

  const validated = updateProjectSchema.parse(data);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: validated,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
        },
      },
    },
  });

  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/clients/${project.clientId}`);

  return updated;
}

/**
 * Soft delete a project (sets deletedAt timestamp)
 */
export async function deleteProject(projectId: string) {
  const { workspace } = await getActiveWorkspace();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/projects');
  revalidatePath(`/clients/${project.clientId}`);

  return { success: true };
}

/**
 * Deactivate a project (sets isActive to false)
 */
export async function deactivateProject(projectId: string) {
  return updateProject(projectId, { isActive: false });
}

/**
 * Reactivate a project (sets isActive to true)
 */
export async function reactivateProject(projectId: string) {
  return updateProject(projectId, { isActive: true });
}

/**
 * Get projects for a specific client (used in dropdowns)
 */
export async function getClientProjects(clientId: string) {
  const { workspace } = await getActiveWorkspace();

  const projects = await prisma.project.findMany({
    where: {
      workspaceId: workspace.id,
      clientId,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { name: 'asc' },
  });

  return projects;
}

/**
 * Get project statistics for analytics
 */
export async function getProjectStats(projectId: string) {
  const { workspace } = await getActiveWorkspace();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      quotes: {
        where: { deletedAt: null },
        select: {
          status: true,
          total: true,
        },
      },
      invoices: {
        where: { deletedAt: null },
        select: {
          status: true,
          total: true,
          amountDue: true,
          amountPaid: true,
          dueDate: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Calculate quote stats
  const quoteStats = {
    total: project.quotes.length,
    draft: project.quotes.filter((q) => q.status === 'draft').length,
    sent: project.quotes.filter((q) => q.status === 'sent').length,
    accepted: project.quotes.filter((q) => q.status === 'accepted').length,
    expired: project.quotes.filter((q) => q.status === 'expired').length,
    totalValue: project.quotes.reduce(
      (sum, q) => sum + Number(q.total),
      0
    ),
    acceptedValue: project.quotes
      .filter((q) => q.status === 'accepted')
      .reduce((sum, q) => sum + Number(q.total), 0),
  };

  // Calculate invoice stats
  const invoiceStats = {
    total: project.invoices.length,
    pending: project.invoices.filter((i) =>
      ['draft', 'sent', 'viewed'].includes(i.status)
    ).length,
    paid: project.invoices.filter((i) => i.status === 'paid').length,
    overdue: project.invoices.filter((i) => i.status !== 'paid' && i.status !== 'voided' && i.status !== 'draft' && i.dueDate && new Date(i.dueDate) < new Date()).length,
    partial: project.invoices.filter((i) => i.status === 'partial').length,
    totalValue: project.invoices.reduce(
      (sum, i) => sum + Number(i.total),
      0
    ),
    totalPaid: project.invoices.reduce(
      (sum, i) => sum + Number(i.amountPaid),
      0
    ),
    totalDue: project.invoices.reduce(
      (sum, i) => sum + Number(i.amountDue),
      0
    ),
  };

  return {
    quotes: quoteStats,
    invoices: invoiceStats,
  };
}

/**
 * Get summary statistics for all projects (optimized with aggregate queries)
 * Used on the projects list page for dashboard stats
 */
export async function getProjectSummaryStats() {
  const { workspace } = await getActiveWorkspace();

  const baseWhere = {
    workspaceId: workspace.id,
    deletedAt: null,
  };

  const [totalProjects, activeProjects, totalQuotes, totalInvoices] = await Promise.all([
    prisma.project.count({ where: baseWhere }),
    prisma.project.count({ where: { ...baseWhere, isActive: true } }),
    prisma.quote.count({
      where: {
        project: { workspaceId: workspace.id, deletedAt: null },
        deletedAt: null,
      },
    }),
    prisma.invoice.count({
      where: {
        project: { workspaceId: workspace.id, deletedAt: null },
        deletedAt: null,
      },
    }),
  ]);

  return {
    totalProjects,
    activeProjects,
    totalQuotes,
    totalInvoices,
  };
}

/**
 * Get project activity timeline
 * Derives activity from quotes and invoices associated with the project
 */
export async function getProjectActivity(projectId: string): Promise<ProjectActivity[]> {
  const { workspace } = await getActiveWorkspace();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      quotes: {
        where: { deletedAt: null },
        select: {
          id: true,
          quoteNumber: true,
          status: true,
          total: true,
          createdAt: true,
          sentAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        where: { deletedAt: null },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          total: true,
          amountPaid: true,
          createdAt: true,
          sentAt: true,
          paidAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const activities: ProjectActivity[] = [];

  // Derive activities from quotes
  for (const quote of project.quotes) {
    if (quote.status === 'accepted') {
      activities.push({
        id: `qa-${quote.id}`,
        type: 'quote_accepted',
        title: `Quote ${quote.quoteNumber} accepted`,
        amount: Number(quote.total),
        date: quote.createdAt,
      });
    }
    if (quote.sentAt) {
      activities.push({
        id: `qs-${quote.id}`,
        type: 'quote_sent',
        title: `Quote ${quote.quoteNumber} sent`,
        amount: Number(quote.total),
        date: quote.sentAt,
      });
    }
  }

  // Derive activities from invoices
  for (const invoice of project.invoices) {
    activities.push({
      id: `ic-${invoice.id}`,
      type: 'invoice_created',
      title: `Invoice ${invoice.invoiceNumber} created`,
      amount: Number(invoice.total),
      date: invoice.createdAt,
    });
    if (invoice.sentAt) {
      activities.push({
        id: `is-${invoice.id}`,
        type: 'invoice_sent',
        title: `Invoice ${invoice.invoiceNumber} sent`,
        amount: Number(invoice.total),
        date: invoice.sentAt,
      });
    }
    if (invoice.paidAt) {
      activities.push({
        id: `ip-${invoice.id}`,
        type: 'invoice_paid',
        title: `Invoice ${invoice.invoiceNumber} paid`,
        amount: Number(invoice.amountPaid),
        date: invoice.paidAt,
      });
    }
  }

  // Sort by date descending
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return activities;
}

/**
 * Get project notes
 * Currently returns empty array — notes feature not yet implemented in DB
 */
export async function getProjectNotes(projectId: string): Promise<ProjectNote[]> {
  // Notes are not yet modeled in the Prisma schema.
  // Return empty array until the feature is built.
  return [];
}

/**
 * Get project contracts
 * Derives from contractInstances relation on the project
 */
export async function getProjectContracts(projectId: string): Promise<ProjectContract[]> {
  const { workspace } = await getActiveWorkspace();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      contractInstances: {
        where: { deletedAt: null },
        include: {
          contract: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return project.contractInstances.map((ci) => ({
    id: ci.id,
    name: ci.contract.name,
    addedAt: ci.createdAt,
    isSigned: ci.status === 'signed',
    linkedInvoiceId: undefined,
  }));
}
