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
}

export function AnalyticsSection({
  revenueData,
}: AnalyticsSectionProps) {
  const [revenuePeriod, setRevenuePeriod] = useState<DashboardPeriod>('30d');

  return (
    <div data-testid="analytics-section">
      <RevenueChart
        data={revenueData}
        period={revenuePeriod}
        onPeriodChange={setRevenuePeriod}
      />
    </div>
  );
}
