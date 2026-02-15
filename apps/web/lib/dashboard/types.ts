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

// ============================================
// Analytics Types
// ============================================

// Date range for analytics filtering
export interface AnalyticsDateRange {
  from: Date;
  to: Date;
  preset?: DashboardPeriod | 'ytd' | 'custom';
}

// Conversion funnel data (Quote -> Payment pipeline)
export interface ConversionFunnelData {
  quotesCreated: number;
  quotesSent: number;
  quotesViewed: number;
  quotesAccepted: number;
  invoicesCreated: number;
  invoicesPaid: number;
}

// Payment aging buckets (for outstanding invoices)
export interface PaymentAgingData {
  current: number;      // Not yet due
  days1to30: number;    // 1-30 days overdue
  days31to60: number;   // 31-60 days overdue
  days61to90: number;   // 61-90 days overdue
  days90plus: number;   // 90+ days overdue
  totalOutstanding: number;
}

// Client distribution by region
export interface ClientDistributionData {
  region: string;       // State/Country name
  clientCount: number;
  totalRevenue: number;
  quoteCount: number;
  invoiceCount: number;
}

// Monthly comparison data
export interface MonthlyComparisonData {
  month: string;        // Format: 'Jan 2026'
  monthKey: string;     // Format: '2026-01'
  revenue: number;
  quoteCount: number;
  invoiceCount: number;
  clientCount: number;
  prevYearRevenue?: number;
  prevYearQuoteCount?: number;
  prevYearInvoiceCount?: number;
}

// Forecast data point
export interface ForecastDataPoint {
  date: string;         // Format: 'yyyy-MM-dd' or 'yyyy-MM'
  actual?: number;      // Actual historical value
  forecast?: number;    // Projected value
  lowerBound?: number;  // Confidence interval lower
  upperBound?: number;  // Confidence interval upper
  isProjection: boolean;
}

// Extended analytics data (combines all analytics)
export interface AnalyticsData {
  stats: DashboardStats;
  quoteStatusCounts: QuoteStatusCounts;
  invoiceStatusCounts: InvoiceStatusCounts;
  revenueData: RevenueDataPoint[];
  conversionFunnel: ConversionFunnelData;
  paymentAging: PaymentAgingData;
  clientDistribution: ClientDistributionData[];
  monthlyComparison: MonthlyComparisonData[];
  forecast: ForecastDataPoint[];
}

// Analytics stats (extends DashboardStats with additional metrics)
export interface AnalyticsStats extends DashboardStats {
  avgDealValue: number;
  prevMonthRevenue: number;
  prevMonthQuotes: number;
}

// Export options
export interface ExportOptions {
  format: 'csv' | 'pdf';
  sections: ('overview' | 'revenue' | 'quotes' | 'invoices' | 'clients')[];
  dateRange: AnalyticsDateRange;
  includeCharts?: boolean;
}

// Chart click event data for drill-down
export interface ChartDrillDownData {
  metric: string;
  value: string | number;
  filters: Record<string, string | number>;
}
