'use server';

import { prisma, Prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { subDays, subMonths, startOfDay, format } from 'date-fns';
import type {
  DashboardStats,
  QuoteStatusCounts,
  InvoiceStatusCounts,
  RevenueDataPoint,
  ActivityItem,
  RecentQuote,
  RecentInvoice,
  DashboardData,
  DashboardPeriod,
} from './types';

// Helper to get current user's workspace
async function getCurrentUserWorkspace(): Promise<{ workspaceId: string; userId: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  if (!workspaceMember) {
    throw new Error('No workspace found');
  }

  return {
    workspaceId: workspaceMember.workspaceId,
    userId: session.user.id,
  };
}

// Helper to convert Prisma Decimal to number
function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return value.toNumber();
}

// Get period start date
function getPeriodStartDate(period: DashboardPeriod): Date | null {
  const now = new Date();
  switch (period) {
    case '7d':
      return subDays(now, 7);
    case '30d':
      return subDays(now, 30);
    case '90d':
      return subDays(now, 90);
    case '12m':
      return subMonths(now, 12);
    case 'all':
      return null;
  }
}

// Get dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const startOfMonth = startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const [
    totalQuotes,
    totalInvoices,
    totalClients,
    paidInvoices,
    unpaidInvoices,
    overdueInvoices,
    quotesThisMonth,
    invoicesThisMonth,
    paidThisMonth,
    acceptedQuotes,
    sentQuotes,
  ] = await Promise.all([
    // Total counts
    prisma.quote.count({
      where: { workspaceId, deletedAt: null },
    }),
    prisma.invoice.count({
      where: { workspaceId, deletedAt: null },
    }),
    prisma.client.count({
      where: { workspaceId, deletedAt: null },
    }),
    // Paid invoices (total revenue)
    prisma.invoice.aggregate({
      where: { workspaceId, status: 'paid', deletedAt: null },
      _sum: { amountPaid: true },
    }),
    // Unpaid invoices (outstanding)
    prisma.invoice.aggregate({
      where: {
        workspaceId,
        deletedAt: null,
        status: { in: ['sent', 'viewed', 'partial'] },
      },
      _sum: { total: true, amountPaid: true },
    }),
    // Overdue invoices
    prisma.invoice.aggregate({
      where: {
        workspaceId,
        deletedAt: null,
        status: 'overdue',
      },
      _sum: { total: true, amountPaid: true },
    }),
    // This month's quotes
    prisma.quote.count({
      where: {
        workspaceId,
        deletedAt: null,
        createdAt: { gte: startOfMonth },
      },
    }),
    // This month's invoices
    prisma.invoice.count({
      where: {
        workspaceId,
        deletedAt: null,
        createdAt: { gte: startOfMonth },
      },
    }),
    // Revenue this month
    prisma.invoice.aggregate({
      where: {
        workspaceId,
        status: 'paid',
        deletedAt: null,
        paidAt: { gte: startOfMonth },
      },
      _sum: { amountPaid: true },
    }),
    // Accepted quotes (for conversion rate)
    prisma.quote.count({
      where: { workspaceId, status: 'accepted', deletedAt: null },
    }),
    // Sent quotes (for conversion rate)
    prisma.quote.count({
      where: {
        workspaceId,
        deletedAt: null,
        status: { in: ['sent', 'viewed', 'accepted', 'declined', 'expired'] },
      },
    }),
  ]);

  const totalRevenue = toNumber(paidInvoices._sum.amountPaid);
  const outstandingAmount =
    toNumber(unpaidInvoices._sum.total) - toNumber(unpaidInvoices._sum.amountPaid);
  const overdueAmount =
    toNumber(overdueInvoices._sum.total) - toNumber(overdueInvoices._sum.amountPaid);
  const revenueThisMonth = toNumber(paidThisMonth._sum.amountPaid);
  const conversionRate = sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0;

  return {
    totalQuotes,
    totalInvoices,
    totalClients,
    totalRevenue,
    outstandingAmount,
    overdueAmount,
    quotesThisMonth,
    invoicesThisMonth,
    revenueThisMonth,
    conversionRate,
  };
}

// Get quote status counts
export async function getQuoteStatusCounts(): Promise<QuoteStatusCounts> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const counts = await prisma.quote.groupBy({
    by: ['status'],
    where: { workspaceId, deletedAt: null },
    _count: true,
  });

  const statusMap = new Map(counts.map((c) => [c.status, c._count]));

  return {
    draft: statusMap.get('draft') || 0,
    sent: statusMap.get('sent') || 0,
    viewed: statusMap.get('viewed') || 0,
    accepted: statusMap.get('accepted') || 0,
    declined: statusMap.get('declined') || 0,
    expired: statusMap.get('expired') || 0,
  };
}

// Get invoice status counts
export async function getInvoiceStatusCounts(): Promise<InvoiceStatusCounts> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const counts = await prisma.invoice.groupBy({
    by: ['status'],
    where: { workspaceId, deletedAt: null },
    _count: true,
  });

  const statusMap = new Map(counts.map((c) => [c.status, c._count]));

  return {
    draft: statusMap.get('draft') || 0,
    sent: statusMap.get('sent') || 0,
    viewed: statusMap.get('viewed') || 0,
    paid: statusMap.get('paid') || 0,
    partial: statusMap.get('partial') || 0,
    overdue: statusMap.get('overdue') || 0,
    void: statusMap.get('void') || 0,
  };
}

// Get revenue over time
export async function getRevenueData(period: DashboardPeriod = '30d'): Promise<RevenueDataPoint[]> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const startDate = getPeriodStartDate(period);

  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      status: 'paid',
      deletedAt: null,
      paidAt: startDate ? { gte: startDate } : undefined,
    },
    select: {
      paidAt: true,
      amountPaid: true,
    },
    orderBy: { paidAt: 'asc' },
  });

  // Group by date
  const dataMap = new Map<string, { revenue: number; count: number }>();

  invoices.forEach((invoice) => {
    if (!invoice.paidAt) return;
    const dateKey = format(invoice.paidAt, 'yyyy-MM-dd');
    const existing = dataMap.get(dateKey) || { revenue: 0, count: 0 };
    dataMap.set(dateKey, {
      revenue: existing.revenue + toNumber(invoice.amountPaid),
      count: existing.count + 1,
    });
  });

  return Array.from(dataMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    invoiceCount: data.count,
  }));
}

// Get recent quotes
export async function getRecentQuotes(limit = 5): Promise<RecentQuote[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const quotes = await prisma.quote.findMany({
    where: { workspaceId, deletedAt: null },
    include: {
      client: { select: { name: true, company: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return quotes.map((q) => ({
    id: q.id,
    title: q.title || 'Untitled Quote',
    clientName: q.client.company || q.client.name,
    total: toNumber(q.total),
    status: q.status,
    createdAt: q.createdAt,
    expiresAt: q.expirationDate,
  }));
}

// Get recent invoices
export async function getRecentInvoices(limit = 5): Promise<RecentInvoice[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId, deletedAt: null },
    include: {
      client: { select: { name: true, company: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return invoices.map((i) => ({
    id: i.id,
    invoiceNumber: i.invoiceNumber,
    clientName: i.client.company || i.client.name,
    total: toNumber(i.total),
    amountPaid: toNumber(i.amountPaid),
    status: i.status,
    dueDate: i.dueDate,
    createdAt: i.createdAt,
  }));
}

// Get recent activity
export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // Get recent quote events
  const quoteEvents = await prisma.quoteEvent.findMany({
    where: {
      quote: { workspaceId },
    },
    include: {
      quote: {
        include: {
          client: { select: { name: true, company: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Get recent invoice events
  const invoiceEvents = await prisma.invoiceEvent.findMany({
    where: {
      invoice: { workspaceId },
    },
    include: {
      invoice: {
        include: {
          client: { select: { name: true, company: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const activities: ActivityItem[] = [
    ...quoteEvents.map((e) => ({
      id: e.id,
      type: mapQuoteEventType(e.eventType),
      title: getEventTitle(e.eventType, e.quote.title || 'Untitled'),
      clientName: e.quote.client.company || e.quote.client.name,
      amount: toNumber(e.quote.total),
      date: e.createdAt,
      relatedId: e.quoteId,
      relatedType: 'quote' as const,
    })),
    ...invoiceEvents.map((e) => ({
      id: e.id,
      type: mapInvoiceEventType(e.eventType),
      title: getEventTitle(e.eventType, e.invoice.invoiceNumber),
      clientName: e.invoice.client.company || e.invoice.client.name,
      amount: toNumber(e.invoice.total),
      date: e.createdAt,
      relatedId: e.invoiceId,
      relatedType: 'invoice' as const,
    })),
  ];

  // Sort by date and limit
  return activities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

function mapQuoteEventType(type: string): ActivityItem['type'] {
  switch (type) {
    case 'created':
      return 'quote_created';
    case 'sent':
      return 'quote_sent';
    case 'accepted':
      return 'quote_accepted';
    case 'declined':
      return 'quote_declined';
    case 'expired':
      return 'quote_expired';
    default:
      return 'quote_created';
  }
}

function mapInvoiceEventType(type: string): ActivityItem['type'] {
  switch (type) {
    case 'created':
      return 'invoice_created';
    case 'sent':
      return 'invoice_sent';
    case 'paid':
      return 'invoice_paid';
    case 'overdue':
      return 'invoice_overdue';
    default:
      return 'invoice_created';
  }
}

function getEventTitle(type: string, reference: string): string {
  switch (type) {
    case 'created':
      return `${reference} was created`;
    case 'sent':
      return `${reference} was sent`;
    case 'accepted':
      return `${reference} was accepted`;
    case 'declined':
      return `${reference} was declined`;
    case 'expired':
      return `${reference} expired`;
    case 'paid':
      return `${reference} was paid`;
    case 'overdue':
      return `${reference} is overdue`;
    default:
      return reference;
  }
}

// Get all dashboard data
export async function getDashboardData(): Promise<DashboardData> {
  const [
    stats,
    quoteStatusCounts,
    invoiceStatusCounts,
    recentQuotes,
    recentInvoices,
    recentActivity,
    revenueData,
  ] = await Promise.all([
    getDashboardStats(),
    getQuoteStatusCounts(),
    getInvoiceStatusCounts(),
    getRecentQuotes(5),
    getRecentInvoices(5),
    getRecentActivity(10),
    getRevenueData('30d'),
  ]);

  return {
    stats,
    quoteStatusCounts,
    invoiceStatusCounts,
    recentQuotes,
    recentInvoices,
    recentActivity,
    revenueData,
  };
}
