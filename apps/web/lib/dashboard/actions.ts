'use server';

import { prisma, Prisma } from '@quotecraft/database';
import { subDays, subMonths, startOfDay, format } from 'date-fns';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type {
  DashboardStats,
  QuoteStatusCounts,
  InvoiceStatusCounts,
  RevenueDataPoint,
  RevenueSparklinePoint,
  ActivityItem,
  RecentQuote,
  RecentInvoice,
  DashboardData,
  DashboardPeriod,
} from './types';

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
  const now = new Date();
  const startOfMonth = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  const endOfMonth = startOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 1));

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
    declinedQuotes,
    totalBilledInvoices,
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
    // Paid invoices (total revenue) — includes partial payments
    prisma.invoice.aggregate({
      where: { workspaceId, status: { in: ['paid', 'partial'] }, deletedAt: null },
      _sum: { amountPaid: true },
    }),
    // Unpaid invoices (outstanding) — includes 'overdue' which may be stored in DB
    prisma.invoice.aggregate({
      where: {
        workspaceId,
        deletedAt: null,
        status: { in: ['sent', 'viewed', 'partial', 'overdue'] },
      },
      _sum: { total: true, amountPaid: true },
    }),
    // Overdue invoices — either stored as 'overdue' status OR computed by dueDate < now
    prisma.invoice.aggregate({
      where: {
        workspaceId,
        deletedAt: null,
        OR: [
          { status: 'overdue' },
          {
            status: { in: ['sent', 'viewed', 'partial'] },
            dueDate: { lt: new Date() },
          },
        ],
      },
      _sum: { total: true, amountPaid: true },
    }),
    // This month's quotes (by business date, not DB insert time)
    prisma.quote.count({
      where: {
        workspaceId,
        deletedAt: null,
        issueDate: { gte: startOfMonth, lt: endOfMonth },
      },
    }),
    // This month's invoices (by business date, not DB insert time)
    prisma.invoice.count({
      where: {
        workspaceId,
        deletedAt: null,
        issueDate: { gte: startOfMonth, lt: endOfMonth },
      },
    }),
    // Revenue this month — sum from Payment records so partial payments are included
    prisma.payment.aggregate({
      where: {
        status: 'completed',
        processedAt: { gte: startOfMonth, lt: endOfMonth },
        invoice: { workspaceId, deletedAt: null },
      },
      _sum: { amount: true },
    }),
    // Accepted quotes (for conversion rate) - include converted since they were accepted first
    prisma.quote.count({
      where: { workspaceId, status: { in: ['accepted', 'converted'] }, deletedAt: null },
    }),
    // Sent quotes (for conversion rate)
    prisma.quote.count({
      where: {
        workspaceId,
        deletedAt: null,
        status: { in: ['sent', 'viewed', 'accepted', 'declined', 'expired', 'converted'] },
      },
    }),
    // Declined quotes (for win rate: accepted / (accepted + declined))
    prisma.quote.count({
      where: { workspaceId, status: 'declined', deletedAt: null },
    }),
    // Total billed invoices (for collection rate: paid total / total billed)
    prisma.invoice.aggregate({
      where: {
        workspaceId,
        deletedAt: null,
        status: { notIn: ['draft', 'voided'] },
      },
      _sum: { total: true, amountPaid: true },
    }),
  ]);

  const totalRevenue = toNumber(paidInvoices._sum.amountPaid);
  const outstandingAmount =
    toNumber(unpaidInvoices._sum.total) - toNumber(unpaidInvoices._sum.amountPaid);
  const overdueAmount =
    toNumber(overdueInvoices._sum.total) - toNumber(overdueInvoices._sum.amountPaid);
  const revenueThisMonth = toNumber(paidThisMonth._sum.amount);
  const conversionRate = sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0;

  // Win rate: accepted / (accepted + declined)
  const winRateDenominator = acceptedQuotes + declinedQuotes;
  const winRate = winRateDenominator > 0 ? (acceptedQuotes / winRateDenominator) * 100 : 0;

  // Collection rate: paid / total billed
  const totalBilled = toNumber(totalBilledInvoices._sum.total);
  const totalCollected = toNumber(totalBilledInvoices._sum.amountPaid);
  const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

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
    winRate,
    collectionRate,
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
    converted: statusMap.get('converted') || 0,
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
    voided: statusMap.get('voided') || 0,
  };
}

// Get revenue over time
export async function getRevenueData(period: DashboardPeriod = '30d'): Promise<RevenueDataPoint[]> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const startDate = getPeriodStartDate(period);

  // Query Payment records so partial payments are included with correct timestamps
  const payments = await prisma.payment.findMany({
    where: {
      status: 'completed',
      processedAt: startDate ? { gte: startDate } : undefined,
      invoice: { workspaceId, deletedAt: null },
    },
    select: {
      processedAt: true,
      amount: true,
    },
    orderBy: { processedAt: 'asc' },
  });

  // Group by date
  const dataMap = new Map<string, { revenue: number; count: number }>();

  payments.forEach((payment) => {
    if (!payment.processedAt) return;
    const dateKey = format(payment.processedAt, 'yyyy-MM-dd');
    const existing = dataMap.get(dateKey) || { revenue: 0, count: 0 };
    dataMap.set(dateKey, {
      revenue: existing.revenue + toNumber(payment.amount),
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
    clientName: q.client?.company || q.client?.name || 'Unknown Client',
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
    clientName: i.client?.company || i.client?.name || 'Unknown Client',
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
    ...quoteEvents
      .filter((e) => e.quote !== null) // Filter out events with deleted quotes
      .map((e) => ({
        id: e.id,
        type: mapQuoteEventType(e.eventType),
        title: getEventTitle(e.eventType, e.quote?.title || 'Untitled'),
        clientName: e.quote?.client?.company || e.quote?.client?.name || 'Unknown Client',
        amount: toNumber(e.quote?.total),
        date: e.createdAt,
        relatedId: e.quoteId,
        relatedType: 'quote' as const,
      })),
    ...invoiceEvents
      .filter((e) => e.invoice !== null) // Filter out events with deleted invoices
      .map((e) => ({
        id: e.id,
        type: mapInvoiceEventType(e.eventType),
        title: getEventTitle(e.eventType, e.invoice?.invoiceNumber || 'Unknown'),
        clientName: e.invoice?.client?.company || e.invoice?.client?.name || 'Unknown Client',
        amount: toNumber(e.invoice?.total),
        date: e.createdAt,
        relatedId: e.invoiceId,
        relatedType: 'invoice' as const,
      })),
  ];

  // If no events found, generate synthetic activity from recent quotes and invoices
  if (activities.length === 0) {
    const [recentQuotes, recentInvoices] = await Promise.all([
      prisma.quote.findMany({
        where: { workspaceId, deletedAt: null },
        include: { client: { select: { name: true, company: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.invoice.findMany({
        where: { workspaceId, deletedAt: null },
        include: { client: { select: { name: true, company: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    activities.push(
      ...recentQuotes.map((q) => ({
        id: `quote-${q.id}`,
        type: 'quote_created' as const,
        title: `${q.title || 'Untitled Quote'} was created`,
        clientName: q.client?.company || q.client?.name || 'Unknown Client',
        amount: toNumber(q.total),
        date: q.createdAt,
        relatedId: q.id,
        relatedType: 'quote' as const,
      })),
      ...recentInvoices.map((i) => ({
        id: `invoice-${i.id}`,
        type: 'invoice_created' as const,
        title: `${i.invoiceNumber} was created`,
        clientName: i.client?.company || i.client?.name || 'Unknown Client',
        amount: toNumber(i.total),
        date: i.createdAt,
        relatedId: i.id,
        relatedType: 'invoice' as const,
      })),
    );
  }

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
    case 'viewed':
      return 'quote_viewed';
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
    case 'viewed':
      return 'invoice_viewed';
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
    case 'viewed':
      return `${reference} was viewed`;
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
    case 'voided':
      return `${reference} was voided`;
    default:
      return `${reference} was updated`;
  }
}

// Get revenue sparkline (last 6 months of monthly revenue)
export async function getRevenueSparkline(): Promise<RevenueSparklinePoint[]> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const now = new Date();
  const sixMonthsAgo = startOfDay(new Date(now.getFullYear(), now.getMonth() - 5, 1));

  // Query Payment records so partial payments are included
  const revenueByMonth = await prisma.$queryRaw<Array<{ month_key: string; total: number }>>`
    SELECT to_char(p.processed_at, 'YYYY-MM') as month_key, COALESCE(SUM(p.amount), 0)::float as total
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE i.workspace_id = ${workspaceId} AND i.deleted_at IS NULL
      AND p.status = 'completed'
      AND p.processed_at >= ${sixMonthsAgo}
    GROUP BY month_key
    ORDER BY month_key ASC
  `;

  const revenueMap = new Map(revenueByMonth.map(r => [r.month_key, Number(r.total)]));

  const result: RevenueSparklinePoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthKey = format(monthDate, 'yyyy-MM');
    result.push({
      date: monthKey,
      revenue: revenueMap.get(monthKey) ?? 0,
    });
  }

  return result;
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
    revenueSparkline,
  ] = await Promise.all([
    getDashboardStats(),
    getQuoteStatusCounts(),
    getInvoiceStatusCounts(),
    getRecentQuotes(5),
    getRecentInvoices(5),
    getRecentActivity(10),
    getRevenueData('30d'),
    getRevenueSparkline(),
  ]);

  return {
    stats,
    quoteStatusCounts,
    invoiceStatusCounts,
    recentQuotes,
    recentInvoices,
    recentActivity,
    revenueData,
    revenueSparkline,
  };
}

// ============================================
// Advanced Analytics Actions
// ============================================

import type {
  ConversionFunnelData,
  PaymentAgingData,
  ClientDistributionData,
  MonthlyComparisonData,
  ForecastDataPoint,
  AnalyticsDateRange,
  AnalyticsStats,
} from './types';

// Get analytics stats (extended dashboard stats with previous month comparison)
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const now = new Date();
  const startOfCurrentMonth = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  const startOfPrevMonth = startOfDay(subMonths(startOfCurrentMonth, 1));
  const endOfPrevMonth = startOfCurrentMonth;

  // Get base dashboard stats
  const baseStats = await getDashboardStats();

  // Get additional analytics-specific data
  const [
    avgDealResult,
    prevMonthRevenueResult,
    prevMonthQuotesResult,
  ] = await Promise.all([
    // Average deal value (from accepted quotes)
    prisma.quote.aggregate({
      where: {
        workspaceId,
        deletedAt: null,
        status: { in: ['accepted', 'converted'] },
      },
      _avg: { total: true },
    }),
    // Previous month revenue — sum from Payment records so partial payments are included
    prisma.payment.aggregate({
      where: {
        status: 'completed',
        processedAt: { gte: startOfPrevMonth, lt: endOfPrevMonth },
        invoice: { workspaceId, deletedAt: null },
      },
      _sum: { amount: true },
    }),
    // Previous month quotes
    prisma.quote.count({
      where: {
        workspaceId,
        deletedAt: null,
        createdAt: { gte: startOfPrevMonth, lt: endOfPrevMonth },
      },
    }),
  ]);

  return {
    ...baseStats,
    avgDealValue: toNumber(avgDealResult._avg.total),
    prevMonthRevenue: toNumber(prevMonthRevenueResult._sum.amount),
    prevMonthQuotes: prevMonthQuotesResult,
  };
}

// Get conversion funnel data
export async function getConversionFunnelData(
  dateRange?: AnalyticsDateRange
): Promise<ConversionFunnelData> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const dateFilter = dateRange
    ? { gte: dateRange.from, lte: dateRange.to }
    : undefined;

  const [
    quotesCreated,
    quotesSent,
    quotesViewed,
    quotesAccepted,
    invoicesCreated,
    invoicesPaid,
  ] = await Promise.all([
    prisma.quote.count({
      where: {
        workspaceId,
        deletedAt: null,
        createdAt: dateFilter,
      },
    }),
    prisma.quote.count({
      where: {
        workspaceId,
        deletedAt: null,
        sentAt: dateFilter || { not: null },
      },
    }),
    prisma.quote.count({
      where: {
        workspaceId,
        deletedAt: null,
        viewedAt: dateFilter || { not: null },
      },
    }),
    prisma.quote.count({
      where: {
        workspaceId,
        deletedAt: null,
        status: { in: ['accepted', 'converted'] },
        ...(dateFilter && { acceptedAt: dateFilter }),
      },
    }),
    // Invoices created FROM accepted/converted quotes (part of the quote->invoice pipeline)
    prisma.invoice.count({
      where: {
        workspaceId,
        deletedAt: null,
        quoteId: { not: null },
        quote: { status: { in: ['accepted', 'converted'] } },
        createdAt: dateFilter,
      },
    }),
    prisma.invoice.count({
      where: {
        workspaceId,
        deletedAt: null,
        status: 'paid',
        quoteId: { not: null },
        ...(dateFilter && { paidAt: dateFilter }),
      },
    }),
  ]);

  return {
    quotesCreated,
    quotesSent,
    quotesViewed,
    quotesAccepted,
    invoicesCreated,
    invoicesPaid,
  };
}

// Get payment aging data
export async function getPaymentAgingData(): Promise<PaymentAgingData> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const now = new Date();

  // Get all unpaid invoices
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      deletedAt: null,
      status: { in: ['sent', 'viewed', 'partial', 'overdue'] },
    },
    select: {
      total: true,
      amountPaid: true,
      dueDate: true,
    },
  });

  const aging: PaymentAgingData = {
    current: 0,
    days1to30: 0,
    days31to60: 0,
    days61to90: 0,
    days90plus: 0,
    totalOutstanding: 0,
  };

  unpaidInvoices.forEach((invoice) => {
    const outstanding = toNumber(invoice.total) - toNumber(invoice.amountPaid);
    aging.totalOutstanding += outstanding;

    if (!invoice.dueDate) {
      aging.current += outstanding;
      return;
    }

    const daysPastDue = Math.floor(
      (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysPastDue <= 0) {
      aging.current += outstanding;
    } else if (daysPastDue <= 30) {
      aging.days1to30 += outstanding;
    } else if (daysPastDue <= 60) {
      aging.days31to60 += outstanding;
    } else if (daysPastDue <= 90) {
      aging.days61to90 += outstanding;
    } else {
      aging.days90plus += outstanding;
    }
  });

  return aging;
}

// Get client distribution by region
export async function getClientDistributionData(
  limit: number = 10
): Promise<ClientDistributionData[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // Get all clients with their addresses and invoice totals
  const clients = await prisma.client.findMany({
    where: {
      workspaceId,
      deletedAt: null,
    },
    select: {
      address: true,
      invoices: {
        where: { status: { in: ['paid', 'partial'] }, deletedAt: null },
        select: { amountPaid: true },
      },
      quotes: {
        where: { deletedAt: null },
        select: { id: true },
      },
      _count: {
        select: { invoices: true },
      },
    },
  });

  // Group by region
  const regionMap = new Map<
    string,
    { clientCount: number; totalRevenue: number; quoteCount: number; invoiceCount: number }
  >();

  clients.forEach((client) => {
    // Parse address to get region (state/country)
    let region = 'Unknown';
    if (client.address) {
      const addr = client.address as { state?: string; country?: string };
      region = addr.state || addr.country || 'Unknown';
    }

    const existing = regionMap.get(region) || {
      clientCount: 0,
      totalRevenue: 0,
      quoteCount: 0,
      invoiceCount: 0,
    };

    const revenue = client.invoices.reduce(
      (sum, inv) => sum + toNumber(inv.amountPaid),
      0
    );

    regionMap.set(region, {
      clientCount: existing.clientCount + 1,
      totalRevenue: existing.totalRevenue + revenue,
      quoteCount: existing.quoteCount + client.quotes.length,
      invoiceCount: existing.invoiceCount + client._count.invoices,
    });
  });

  // Convert to array and sort by client count
  const result = Array.from(regionMap.entries())
    .map(([region, data]) => ({
      region,
      ...data,
    }))
    .sort((a, b) => b.clientCount - a.clientCount)
    .slice(0, limit);

  return result;
}

// Get monthly comparison data (optimized: 4 queries instead of 4*months)
export async function getMonthlyComparisonData(
  months: number = 12
): Promise<MonthlyComparisonData[]> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const now = new Date();
  const rangeStart = startOfDay(new Date(subMonths(now, months - 1).getFullYear(), subMonths(now, months - 1).getMonth(), 1));

  // Run all 4 grouped queries in parallel (using actual DB column names via @map)
  const [revenueByMonth, quotesByMonth, invoicesByMonth, clientsByMonth] = await Promise.all([
    // Revenue from Payment records so partial payments are included
    prisma.$queryRaw<Array<{ month_key: string; total: number }>>`
      SELECT to_char(p.processed_at, 'YYYY-MM') as month_key, COALESCE(SUM(p.amount), 0)::float as total
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.workspace_id = ${workspaceId} AND i.deleted_at IS NULL
        AND p.status = 'completed'
        AND p.processed_at >= ${rangeStart}
      GROUP BY month_key
    `,
    prisma.$queryRaw<Array<{ month_key: string; count: number }>>`
      SELECT to_char(created_at, 'YYYY-MM') as month_key, COUNT(*)::int as count
      FROM quotes
      WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
        AND created_at >= ${rangeStart}
      GROUP BY month_key
    `,
    prisma.$queryRaw<Array<{ month_key: string; count: number }>>`
      SELECT to_char(created_at, 'YYYY-MM') as month_key, COUNT(*)::int as count
      FROM invoices
      WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
        AND created_at >= ${rangeStart}
      GROUP BY month_key
    `,
    prisma.$queryRaw<Array<{ month_key: string; count: number }>>`
      SELECT to_char(created_at, 'YYYY-MM') as month_key, COUNT(*)::int as count
      FROM clients
      WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
        AND created_at >= ${rangeStart}
      GROUP BY month_key
    `,
  ]);

  // Build lookup maps
  const revenueMap = new Map(revenueByMonth.map(r => [r.month_key, Number(r.total)]));
  const quotesMap = new Map(quotesByMonth.map(r => [r.month_key, Number(r.count)]));
  const invoicesMap = new Map(invoicesByMonth.map(r => [r.month_key, Number(r.count)]));
  const clientsMap = new Map(clientsByMonth.map(r => [r.month_key, Number(r.count)]));

  // Build result for each month
  const result: MonthlyComparisonData[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthKey = format(monthDate, 'yyyy-MM');
    result.push({
      month: format(monthDate, 'MMM yyyy'),
      monthKey,
      revenue: revenueMap.get(monthKey) ?? 0,
      quoteCount: quotesMap.get(monthKey) ?? 0,
      invoiceCount: invoicesMap.get(monthKey) ?? 0,
      clientCount: clientsMap.get(monthKey) ?? 0,
    });
  }

  return result;
}

// Get top clients by revenue
export async function getTopClientsByRevenue(
  limit: number = 5
): Promise<{ name: string; revenue: number }[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const clients = await prisma.client.findMany({
    where: {
      workspaceId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      company: true,
      invoices: {
        where: {
          status: { in: ['paid', 'partial'] },
          deletedAt: null,
        },
        select: {
          amountPaid: true,
        },
      },
    },
  });

  const clientRevenues = clients.map((client) => ({
    name: client.company || client.name,
    revenue: client.invoices.reduce((sum, inv) => sum + toNumber(inv.amountPaid), 0),
  }));

  return clientRevenues
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .filter((c) => c.revenue > 0);
}

// Get client lifetime values
export async function getClientLTVData(
  limit: number = 5
): Promise<{ clients: { id: string; name: string; email?: string; ltv: number; growth?: number; isGrowing?: boolean }[]; averageLTV: number; totalClients: number }> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const sixMonthsAgo = subMonths(new Date(), 6);
  const twelveMonthsAgo = subMonths(new Date(), 12);

  const clients = await prisma.client.findMany({
    where: {
      workspaceId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      invoices: {
        where: {
          status: { in: ['paid', 'partial'] },
          deletedAt: null,
        },
        select: {
          amountPaid: true,
          paidAt: true,
        },
      },
    },
  });

  const clientLTVs = clients.map((client) => {
    const totalLtv = client.invoices.reduce((sum, inv) => sum + toNumber(inv.amountPaid), 0);

    // Calculate growth: compare last 6 months revenue vs prior 6 months
    const recentRevenue = client.invoices
      .filter((inv) => inv.paidAt && inv.paidAt >= sixMonthsAgo)
      .reduce((sum, inv) => sum + toNumber(inv.amountPaid), 0);
    const olderRevenue = client.invoices
      .filter((inv) => inv.paidAt && inv.paidAt >= twelveMonthsAgo && inv.paidAt < sixMonthsAgo)
      .reduce((sum, inv) => sum + toNumber(inv.amountPaid), 0);

    let growth: number | undefined;
    let isGrowing: boolean | undefined;
    if (olderRevenue > 0) {
      growth = Math.round(((recentRevenue - olderRevenue) / olderRevenue) * 100);
      isGrowing = growth >= 0;
    } else if (recentRevenue > 0) {
      growth = 100;
      isGrowing = true;
    }

    return {
      id: client.id,
      name: client.company || client.name,
      email: client.email,
      ltv: totalLtv,
      growth,
      isGrowing,
    };
  });

  // Calculate average from ALL clients (including zero-revenue)
  const totalLTV = clientLTVs.reduce((sum, c) => sum + c.ltv, 0);
  const averageLTV = clientLTVs.length > 0 ? totalLTV / clientLTVs.length : 0;

  return {
    clients: clientLTVs.sort((a, b) => b.ltv - a.ltv).slice(0, limit),
    averageLTV,
    totalClients: clientLTVs.length,
  };
}

// Get revenue forecast
export async function getRevenueForecast(
  historicalMonths: number = 6,
  forecastMonths: number = 3
): Promise<ForecastDataPoint[]> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const now = new Date();

  // Get historical monthly revenue (single query instead of N)
  const rangeStart = startOfDay(new Date(subMonths(now, historicalMonths - 1).getFullYear(), subMonths(now, historicalMonths - 1).getMonth(), 1));

  // Query invoices with paid_at date for revenue by month
  const revenueByMonth = await prisma.$queryRaw<Array<{ month_key: string; total: number }>>`
    SELECT to_char(i.paid_at, 'YYYY-MM') as month_key, COALESCE(SUM(i.amount_paid), 0)::float as total
    FROM invoices i
    WHERE i.workspace_id = ${workspaceId} AND i.deleted_at IS NULL
      AND i.status IN ('paid', 'partial')
      AND i.paid_at IS NOT NULL
      AND i.paid_at >= ${rangeStart}
    GROUP BY month_key
  `;

  const revenueMap = new Map(revenueByMonth.map(r => [r.month_key, Number(r.total)]));

  const historical: ForecastDataPoint[] = [];
  for (let i = historicalMonths - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthKey = format(monthDate, 'yyyy-MM');
    historical.push({
      date: monthKey,
      actual: revenueMap.get(monthKey) ?? 0,
      isProjection: false,
    });
  }

  // Simple linear regression for forecast
  const values = historical.map((h) => h.actual || 0);
  const n = values.length;

  if (n < 2) {
    return historical;
  }

  // Calculate regression
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    const val = values[i] ?? 0;
    sumX += i;
    sumY += val;
    sumXY += i * val;
    sumXX += i * i;
  }

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Generate forecast
  const forecast: ForecastDataPoint[] = [];
  for (let i = 0; i < forecastMonths; i++) {
    const monthDate = subMonths(now, -(i + 1));
    const projectedValue = Math.max(0, slope * (n + i) + intercept);
    const margin = projectedValue * 0.15; // 15% confidence interval

    forecast.push({
      date: format(monthDate, 'yyyy-MM'),
      forecast: projectedValue,
      lowerBound: Math.max(0, projectedValue - margin),
      upperBound: projectedValue + margin,
      isProjection: true,
    });
  }

  return [...historical, ...forecast];
}
