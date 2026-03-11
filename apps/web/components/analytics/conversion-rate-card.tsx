'use client';

import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConversionFunnelData } from '@/lib/dashboard/types';

interface ConversionRateCardProps {
  data?: {
    conversionRate: number;
    acceptedCount: number;
    totalSentCount: number;
    prevConversionRate?: number;
  };
  conversionFunnel?: ConversionFunnelData;
}

function RadialProgress({ value, size = 80, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.min(value, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="block -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-muted"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary-500)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - filled}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export function ConversionRateCard({ data: propData, conversionFunnel }: ConversionRateCardProps) {
  const data = useMemo(() => {
    if (propData) {
      return {
        currentRate: propData.conversionRate,
        previousRate: propData.prevConversionRate ?? propData.conversionRate,
        acceptedCount: propData.acceptedCount,
        totalSentCount: propData.totalSentCount,
      };
    }
    if (conversionFunnel) {
      const totalSent = conversionFunnel.quotesSent || 1;
      const accepted = conversionFunnel.quotesAccepted;
      const rate = (accepted / totalSent) * 100;
      return {
        currentRate: rate,
        previousRate: rate,
        acceptedCount: accepted,
        totalSentCount: totalSent,
      };
    }
    return {
      currentRate: 0,
      previousRate: 0,
      acceptedCount: 0,
      totalSentCount: 0,
    };
  }, [propData, conversionFunnel]);

  const trend = useMemo(() => {
    const change = data.currentRate - data.previousRate;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5">
          {/* SVG Radial */}
          <div className="relative shrink-0">
            <RadialProgress value={data.currentRate} size={80} strokeWidth={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold tabular-nums">{data.currentRate}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                  trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground/60">vs prev</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.acceptedCount} of {data.totalSentCount} quotes converted
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
