'use client';

import { formatFullCurrency, formatPercentage } from '@/lib/dashboard/chart-utils';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string) => string;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  isCurrency = false,
  isPercentage = false,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedLabel = labelFormatter ? labelFormatter(label || '') : label;

  const formatValue = (value: number, name: string): string => {
    if (formatter) return formatter(value, name);
    if (isCurrency) return formatFullCurrency(value);
    if (isPercentage) return formatPercentage(value);
    return value.toLocaleString();
  };

  return (
    <div
      className="rounded-lg border bg-background px-3 py-2 shadow-md"
      role="tooltip"
    >
      {formattedLabel && (
        <p className="mb-1 text-sm font-medium text-foreground">{formattedLabel}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{formatValue(entry.value, entry.name)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Revenue-specific tooltip
export function RevenueTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload as { date?: string; revenue?: number; invoiceCount?: number } | undefined;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Revenue:</span>
          <span className="font-medium">{formatFullCurrency(data?.revenue || 0)}</span>
        </div>
        {data?.invoiceCount !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Invoices:</span>
            <span className="font-medium">{data.invoiceCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Status chart tooltip
export function StatusTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  if (!data) return null;

  const total = (data.payload as { total?: number })?.total || 0;
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: data.fill }}
        />
        <span className="font-medium">{data.name}</span>
      </div>
      <div className="mt-1 space-y-0.5 text-sm">
        <p>
          <span className="text-muted-foreground">Count: </span>
          <span className="font-medium">{data.value}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Percentage: </span>
          <span className="font-medium">{percentage}%</span>
        </p>
      </div>
    </div>
  );
}

// Aging chart tooltip
export function AgingTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div className="space-y-1 text-sm">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="font-medium">{formatFullCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
