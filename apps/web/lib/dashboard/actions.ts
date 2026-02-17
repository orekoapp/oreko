'use server';

import { prisma, Prisma } from '@quotecraft/database';
import { subDays, subMonths, startOfDay, format } from 'date-fns';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
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
  const startOfPrevMonth = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const endOfPrevMonth = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));

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
        status: 'accepted',
      },
      _avg: { total: true },
    }),
    // Previous month revenue
    prisma.invoice.aggregate({
      where: {
        workspaceId,
        status: 'paid',
        deletedAt: null,
        paidAt: { gte: startOfPrevMonth, lt: endOfPrevMonth },
      },
      _sum: { amountPaid: true },
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
    prevMonthRevenue: toNumber(prevMonthRevenueResult._sum.amountPaid),
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
        status: 'accepted',
        ...(dateFilter && { acceptedAt: dateFilter }),
      },
    }),
    prisma.invoice.count({
      where: {
        workspaceId,
        deletedAt: null,
        quoteId: { not: null },
        createdAt: dateFilter,
      },
    }),
    prisma.invoice.count({
      where: {
        workspaceId,
        deletedAt: null,
        quoteId: { not: null },
        status: 'paid',
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
        where: { status: 'paid', deletedAt: null },
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

// Get monthly comparison data
export async function getMonthlyComparisonData(
  months: number = 12
): Promise<MonthlyComparisonData[]> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const now = new Date();

  const result: MonthlyComparisonData[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfDay(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
    const monthEnd = startOfDay(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1));

    const [revenue, quoteCount, invoiceCount, clientCount] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          workspaceId,
          status: 'paid',
          deletedAt: null,
          paidAt: { gte: monthStart, lt: monthEnd },
        },
        _sum: { amountPaid: true },
      }),
      prisma.quote.count({
        where: {
          workspaceId,
          deletedAt: null,
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      }),
      prisma.invoice.count({
        where: {
          workspaceId,
          deletedAt: null,
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      }),
      prisma.client.count({
        where: {
          workspaceId,
          deletedAt: null,
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      }),
    ]);

    result.push({
      month: format(monthDate, 'MMM yyyy'),
      monthKey: format(monthDate, 'yyyy-MM'),
      revenue: toNumber(revenue._sum.amountPaid),
      quoteCount,
      invoiceCount,
      clientCount,
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
          status: 'paid',
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
): Promise<{ id: string; name: string; email?: string; ltv: number }[]> {
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
      email: true,
      invoices: {
        where: {
          status: 'paid',
          deletedAt: null,
        },
        select: {
          amountPaid: true,
        },
      },
    },
  });

  const clientLTVs = clients.map((client) => ({
    id: client.id,
    name: client.company || client.name,
    email: client.email,
    ltv: client.invoices.reduce((sum, inv) => sum + toNumber(inv.amountPaid), 0),
  }));

  return clientLTVs
    .sort((a, b) => b.ltv - a.ltv)
    .slice(0, limit)
    .filter((c) => c.ltv > 0);
}

// Get revenue forecast
export async function getRevenueForecast(
  historicalMonths: number = 6,
  forecastMonths: number = 3
): Promise<ForecastDataPoint[]> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const now = new Date();

  // Get historical monthly revenue
  const historical: ForecastDataPoint[] = [];

  for (let i = historicalMonths - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfDay(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
    const monthEnd = startOfDay(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1));

    const revenue = await prisma.invoice.aggregate({
      where: {
        workspaceId,
        status: 'paid',
        deletedAt: null,
        paidAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amountPaid: true },
    });

    historical.push({
      date: format(monthDate, 'yyyy-MM'),
      actual: toNumber(revenue._sum.amountPaid),
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
