'use client';

import { useState } from 'react';
import {
  RevenueChart,
  CircularProgressCard,
  QuotePipeline,
} from './charts';
import type {
  RevenueDataPoint,
  DashboardPeriod,
  ConversionFunnelData,
} from '@/lib/dashboard/types';

interface AnalyticsSectionProps {
  revenueData: RevenueDataPoint[];
  conversionFunnelData?: ConversionFunnelData;
  winRate: number;
  collectionRate: number;
}

export function AnalyticsSection({
  revenueData,
  conversionFunnelData,
  winRate,
  collectionRate,
}: AnalyticsSectionProps) {
  const [revenuePeriod, setRevenuePeriod] = useState<DashboardPeriod>('30d');

  return (
    <div className="space-y-6" data-testid="analytics-section">
      {/* Revenue Chart */}
      <RevenueChart
        data={revenueData}
        period={revenuePeriod}
        onPeriodChange={setRevenuePeriod}
      />

      {/* Win Rate | Collection Rate | Pipeline */}
      <div className="grid gap-6 md:grid-cols-3">
        <CircularProgressCard
          label="Win Rate"
          percentage={winRate}
          color="hsl(var(--chart-1, 220 70% 50%))"
        />
        <CircularProgressCard
          label="Collection Rate"
          percentage={collectionRate}
          color="hsl(142 71% 45%)"
        />
        {conversionFunnelData && (
          <QuotePipeline data={conversionFunnelData} />
        )}
      </div>
    </div>
  );
}
