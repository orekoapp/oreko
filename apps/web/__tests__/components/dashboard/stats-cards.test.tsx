import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import type { DashboardStats } from '@/lib/dashboard/types';

const mockStats: DashboardStats = {
  totalRevenue: 15000000, // $150,000.00 in cents
  revenueThisMonth: 2500000, // $25,000.00
  outstandingAmount: 500000, // $5,000.00
  overdueAmount: 100000, // $1,000.00
  totalQuotes: 45,
  quotesThisMonth: 8,
  totalInvoices: 32,
  invoicesThisMonth: 5,
  totalClients: 18,
  conversionRate: 65.5,
};

describe('StatsCards', () => {
  it('renders all six stat cards', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Outstanding')).toBeInTheDocument();
    expect(screen.getByText('Total Quotes')).toBeInTheDocument();
    expect(screen.getByText('Total Invoices')).toBeInTheDocument();
    expect(screen.getByText('Total Clients')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('displays total revenue formatted as currency', () => {
    render(<StatsCards stats={mockStats} />);

    // $150,000.00 total revenue
    expect(screen.getByText('$150,000.00')).toBeInTheDocument();
  });

  it('displays this month revenue in description', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('$25,000.00 this month')).toBeInTheDocument();
  });

  it('displays outstanding amount', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
  });

  it('displays overdue amount when present', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('$1,000.00 overdue')).toBeInTheDocument();
  });

  it('displays "No overdue invoices" when no overdue amount', () => {
    const statsWithNoOverdue = { ...mockStats, overdueAmount: 0 };
    render(<StatsCards stats={statsWithNoOverdue} />);

    expect(screen.getByText('No overdue invoices')).toBeInTheDocument();
  });

  it('displays total quotes count', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('8 this month')).toBeInTheDocument();
  });

  it('displays total invoices count', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('5 this month')).toBeInTheDocument();
  });

  it('displays total clients count', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('Active clients')).toBeInTheDocument();
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
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
    expect(grid).toHaveClass('xl:grid-cols-6');
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
    };

    render(<StatsCards stats={zeroStats} />);

    expect(screen.getByText('$0.00 this month')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('handles large numbers', () => {
    const largeStats: DashboardStats = {
      ...mockStats,
      totalRevenue: 999999900, // $9,999,999.00
      totalClients: 1500,
      totalQuotes: 10000,
    };

    render(<StatsCards stats={largeStats} />);

    expect(screen.getByText('$9,999,999.00')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
  });
});
