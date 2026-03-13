'use client';

import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientLTV {
  id: string;
  name: string;
  email?: string;
  ltv: number;
  growth?: number;
  isGrowing?: boolean;
}

interface ClientLifetimeValueCardProps {
  data?: ClientLTV[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ClientLifetimeValueCard({ data: propData }: ClientLifetimeValueCardProps) {
  const { clientData, averageLTV } = useMemo(() => {
    if (!propData || propData.length === 0) {
      return { clientData: [], averageLTV: 0 };
    }
    const avg = propData.reduce((sum, c) => sum + c.ltv, 0) / propData.length;
    return { clientData: propData, averageLTV: avg };
  }, [propData]);

  if (clientData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">Client Lifetime Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
            No client LTV data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-sm font-medium">Client Lifetime Value</CardTitle>
          <span className="text-xs text-muted-foreground/60">
            Avg {formatCurrency(averageLTV)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clientData.map((client) => {
            const initials = client.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={client.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{client.name}</p>
                  {client.email && (
                    <p className="text-xs text-muted-foreground/60 truncate">{client.email}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(client.ltv)}
                  </p>
                  {client.growth !== undefined && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${
                        client.isGrowing !== false
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {client.isGrowing !== false ? (
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      ) : (
                        <ArrowDownRight className="h-2.5 w-2.5" />
                      )}
                      {Math.abs(client.growth ?? 0)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
