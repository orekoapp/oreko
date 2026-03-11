/**
 * Chart utilities for analytics dashboard
 * Provides consistent colors, formatters, and helpers for Recharts
 */

import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import type { DashboardPeriod, AnalyticsDateRange } from './types';

// ============================================
// Color Palette (matches design system)
// ============================================

// Theme-aligned color palette (primary OKLCH values from globals.css)
export const CHART_COLORS = {
  primary: 'oklch(0.6898 0.1101 233.96)',   // primary-500
  secondary: 'oklch(0.5915 0.1022 236.73)', // primary-600
  success: 'oklch(0.648 0.150 160)',        // success/chart-2
  warning: 'oklch(0.769 0.189 70.08)',      // warning/chart-4
  danger: 'oklch(0.577 0.245 27.325)',      // destructive
  muted: 'oklch(0.554 0.0246 234.94)',      // base-500
  teal: 'oklch(0.7527 0.1062 232.98)',      // primary-400
  emerald: 'oklch(0.648 0.150 160)',        // chart-2
  orange: 'oklch(0.7 0.15 45)',             // chart-5
  pink: 'oklch(0.5033 0.0865 237.61)',      // primary-700
} as const;

// Status colors using theme primary gradient shades
export const QUOTE_STATUS_COLORS: Record<string, string> = {
  draft: 'oklch(0.554 0.0246 234.94)',      // base-500 (muted)
  sent: 'oklch(0.6898 0.1101 233.96)',      // primary-500
  viewed: 'oklch(0.769 0.189 70.08)',       // warning
  accepted: 'oklch(0.648 0.150 160)',       // success
  declined: 'oklch(0.577 0.245 27.325)',    // destructive
  expired: 'oklch(0.7047 0.0227 234.18)',   // base-400
  converted: 'oklch(0.5033 0.0865 237.61)', // primary-700
};

// Invoice status colors matching the theme
export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'oklch(0.554 0.0246 234.94)',      // base-500 (muted)
  sent: 'oklch(0.6898 0.1101 233.96)',      // primary-500
  viewed: 'oklch(0.769 0.189 70.08)',       // warning
  paid: 'oklch(0.648 0.150 160)',           // success
  partial: 'oklch(0.7 0.15 45)',            // chart-5 (orange)
  overdue: 'oklch(0.577 0.245 27.325)',     // destructive
  voided: 'oklch(0.7047 0.0227 234.18)',    // base-400
};

// Payment aging bucket colors (gradient from green to red)
export const AGING_COLORS = {
  current: '#22C55E',    // Green-500
  days1to30: '#84CC16',  // Lime-500
  days31to60: '#EAB308', // Yellow-500
  days61to90: '#F97316', // Orange-500
  days90plus: '#EF4444', // Red-500
};

// Chart color palette for general use (multiple series)
export const CHART_PALETTE = [
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#EC4899', // Pink
  '#F97316', // Orange
];

// ============================================
// Formatters
// ============================================

/**
 * Format number as currency for chart display
 * Values are already in dollars (not cents)
 */
export function formatChartCurrency(value: number, currency: string = 'USD'): string {
  // For compact display, use symbol prefix from Intl
  const symbol = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 })
    .formatToParts(0)
    .find(p => p.type === 'currency')?.value ?? '$';

  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}K`;
  }
  return `${symbol}${value.toFixed(0)}`;
}

/**
 * Format number as full currency for tooltips
 * Values are already in dollars (not cents)
 */
export function formatFullCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date for chart axis based on period
 */
export function formatChartDate(dateStr: string, period: DashboardPeriod): string {
  const date = new Date(dateStr);

  switch (period) {
    case '7d':
      return format(date, 'EEE'); // Mon, Tue, etc.
    case '30d':
      return format(date, 'MMM d'); // Jan 15
    case '90d':
      return format(date, 'MMM d'); // Jan 15
    case '12m':
      return format(date, 'MMM'); // Jan
    case 'all':
      return format(date, 'MMM yy'); // Jan 24
    default:
      return format(date, 'MMM d');
  }
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M suffix
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

// ============================================
// Date Range Helpers
// ============================================

/**
 * Get date range from period preset
 */
export function getDateRangeFromPeriod(period: DashboardPeriod): AnalyticsDateRange {
  const now = new Date();
  let from: Date;

  switch (period) {
    case '7d':
      from = subDays(now, 7);
      break;
    case '30d':
      from = subDays(now, 30);
      break;
    case '90d':
      from = subDays(now, 90);
      break;
    case '12m':
      from = subMonths(now, 12);
      break;
    case 'all':
      from = new Date(2020, 0, 1); // Far enough back
      break;
    default:
      from = subDays(now, 30);
  }

  return {
    from,
    to: now,
    preset: period,
  };
}

/**
 * Get YTD date range
 */
export function getYTDDateRange(): AnalyticsDateRange {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), 0, 1),
    to: now,
    preset: 'ytd',
  };
}

/**
 * Format date range for display
 */
export function formatDateRange(range: AnalyticsDateRange): string {
  if (range.preset && range.preset !== 'custom') {
    const presetLabels: Record<string, string> = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      '12m': 'Last 12 months',
      'ytd': 'Year to date',
      'all': 'All time',
    };
    return presetLabels[range.preset] || 'Custom range';
  }

  return `${format(range.from, 'MMM d, yyyy')} - ${format(range.to, 'MMM d, yyyy')}`;
}

// ============================================
// Calculation Helpers
// ============================================

/**
 * Calculate growth rate between two values
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(converted: number, total: number): number {
  if (total === 0) return 0;
  return (converted / total) * 100;
}

/**
 * Simple linear regression for forecasting
 */
export function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const val = data[i] ?? 0;
    sumX += i;
    sumY += val;
    sumXY += i * val;
    sumXX += i * i;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Generate forecast data points
 */
export function generateForecast(
  historicalData: number[],
  forecastPeriods: number = 3,
  confidenceInterval: number = 0.15
): { forecast: number; lower: number; upper: number }[] {
  const { slope, intercept } = linearRegression(historicalData);
  const startIndex = historicalData.length;

  const forecasts: { forecast: number; lower: number; upper: number }[] = [];

  for (let i = 0; i < forecastPeriods; i++) {
    const forecast = Math.max(0, slope * (startIndex + i) + intercept);
    const margin = forecast * confidenceInterval;
    forecasts.push({
      forecast,
      lower: Math.max(0, forecast - margin),
      upper: forecast + margin,
    });
  }

  return forecasts;
}

// ============================================
// Status Helpers
// ============================================

/**
 * Get status label for display
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    sent: 'Sent',
    viewed: 'Viewed',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    signed: 'Signed',
    converted: 'Converted',
    paid: 'Paid',
    partial: 'Partially Paid',
    overdue: 'Overdue',
    voided: 'Voided',
  };
  return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Get aging bucket label
 */
export function getAgingLabel(bucket: string): string {
  const labels: Record<string, string> = {
    current: 'Current',
    days1to30: '1-30 Days',
    days31to60: '31-60 Days',
    days61to90: '61-90 Days',
    days90plus: '90+ Days',
  };
  return labels[bucket] || bucket;
}

// ============================================
// Chart Data Transformers
// ============================================

/**
 * Transform status counts to chart data
 */
export function transformStatusToChartData(
  counts: Record<string, number>,
  colors: Record<string, string>
): Array<{ name: string; value: number; fill: string }> {
  return Object.entries(counts)
    .filter(([_, value]) => value > 0)
    .map(([status, value]) => ({
      name: getStatusLabel(status),
      value,
      fill: colors[status] || CHART_COLORS.muted,
    }));
}

/**
 * Calculate total from status counts
 */
export function calculateTotal(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}
