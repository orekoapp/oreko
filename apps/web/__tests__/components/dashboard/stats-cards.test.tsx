import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import type { DashboardStats } from '@/lib/dashboard/types';

const mockStats: DashboardStats = {
  totalRevenue: 150000,
  revenueThisMonth: 25000,
  outstandingAmount: 5000,
  overdueAmount: 1000,
  totalQuotes: 45,
  quotesThisMonth: 8,
  totalInvoices: 32,
  invoicesThisMonth: 5,
  totalClients: 18,
  conversionRate: 65.5,
  winRate: 70.0,
  collectionRate: 85.0,
};

describe('StatsCards', () => {
  it('renders all four stat cards', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('Revenue this Month')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Outstanding')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('displays total revenue formatted as currency', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('$150,000.00')).toBeInTheDocument();
  });

  it('displays this month revenue in description', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('$25,000.00')).toBeInTheDocument();
  });

  it('displays outstanding amount', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
  });

  it('displays overdue amount when present', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('$1,000.00 overdue')).toBeInTheDocument();
  });

  it('hides overdue description when no overdue amount', () => {
    const statsWithNoOverdue = { ...mockStats, overdueAmount: 0 };
    render(<StatsCards stats={statsWithNoOverdue} />);

    expect(screen.queryByText(/overdue/)).not.toBeInTheDocument();
  });

  it('displays conversion rate with percentage', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('65.5%')).toBeInTheDocument();
    expect(screen.getByText('Quotes accepted')).toBeInTheDocument();
  });

  it('formats conversion rate to one decimal place', () => {
    const statsWithLongDecimal = { ...mockStats, conversionRate: 72.3456 };
    render(<StatsCards stats={statsWithLongDecimal} />);

    expect(screen.getByText('72.3%')).toBeInTheDocument();
  });

  it('renders with responsive grid layout', () => {
    const { container } = render(<StatsCards stats={mockStats} />);

    const grid = container.firstChild;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-4');
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-4');
  });

  it('handles zero values gracefully', () => {
    const zeroStats: DashboardStats = {
      totalRevenue: 0,
      revenueThisMonth: 0,
      outstandingAmount: 0,
      overdueAmount: 0,
      totalQuotes: 0,
      quotesThisMonth: 0,
      totalInvoices: 0,
      invoicesThisMonth: 0,
      totalClients: 0,
      conversionRate: 0,
      winRate: 0,
      collectionRate: 0,
    };

    render(<StatsCards stats={zeroStats} />);

    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('handles large numbers', () => {
    const largeStats: DashboardStats = {
      ...mockStats,
      totalRevenue: 9999999,
    };

    render(<StatsCards stats={largeStats} />);

    expect(screen.getByText('$9,999,999.00')).toBeInTheDocument();
  });
});
