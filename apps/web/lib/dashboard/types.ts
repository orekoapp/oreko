// Dashboard overview stats
export interface DashboardStats {
  totalQuotes: number;
  totalInvoices: number;
  totalClients: number;
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  quotesThisMonth: number;
  invoicesThisMonth: number;
  revenueThisMonth: number;
  conversionRate: number;
}

// Quote status counts
export interface QuoteStatusCounts {
  draft: number;
  sent: number;
  viewed: number;
  accepted: number;
  declined: number;
  expired: number;
}

// Invoice status counts
export interface InvoiceStatusCounts {
  draft: number;
  sent: number;
  viewed: number;
  paid: number;
  partial: number;
  overdue: number;
  void: number;
}

// Revenue over time data point
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  invoiceCount: number;
}

// Activity item
export interface ActivityItem {
  id: string;
  type:
    | 'quote_created'
    | 'quote_sent'
    | 'quote_accepted'
    | 'quote_declined'
    | 'quote_expired'
    | 'invoice_created'
    | 'invoice_sent'
    | 'invoice_paid'
    | 'invoice_overdue'
    | 'client_created';
  title: string;
  description?: string;
  amount?: number;
  clientName?: string;
  date: Date;
  relatedId?: string;
  relatedType?: 'quote' | 'invoice' | 'client';
}

// Recent items
export interface RecentQuote {
  id: string;
  title: string;
  clientName: string;
  total: number;
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  amountPaid: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
}

// Dashboard data
export interface DashboardData {
  stats: DashboardStats;
  quoteStatusCounts: QuoteStatusCounts;
  invoiceStatusCounts: InvoiceStatusCounts;
  recentQuotes: RecentQuote[];
  recentInvoices: RecentInvoice[];
  recentActivity: ActivityItem[];
  revenueData: RevenueDataPoint[];
}

// Period filter
export type DashboardPeriod = '7d' | '30d' | '90d' | '12m' | 'all';
