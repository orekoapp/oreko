'use client';

import { useState } from 'react';
import {
  RevenueChart,
} from './charts';
import type {
  RevenueDataPoint,
  DashboardPeriod,
} from '@/lib/dashboard/types';

interface AnalyticsSectionProps {
  revenueData: RevenueDataPoint[];
  currency?: string;
}

export function AnalyticsSection({
  revenueData,
  currency = 'USD',
}: AnalyticsSectionProps) {
  const [revenuePeriod, setRevenuePeriod] = useState<DashboardPeriod>('30d');

  return (
    <div data-testid="analytics-section">
      <RevenueChart
        data={revenueData}
        period={revenuePeriod}
        onPeriodChange={setRevenuePeriod}
        currency={currency}
      />
    </div>
  );
}
