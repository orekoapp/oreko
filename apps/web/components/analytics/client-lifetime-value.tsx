'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Client Lifetime Value</CardTitle>
              <CardDescription>Total revenue per client over time</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No client LTV data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Client Lifetime Value</CardTitle>
            <CardDescription>
              Total revenue per client over time
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Avg. LTV</p>
            <p className="text-lg font-semibold">{formatCurrency(averageLTV)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clientData.map((client) => {
            const initials = client.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={client.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{client.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(client.ltv)}
                  </p>
                  {client.growth !== undefined && (
                    <div className="flex items-center justify-end gap-1 text-xs">
                      {client.isGrowing !== false ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={client.isGrowing !== false ? 'text-green-500' : 'text-red-500'}>
                        {client.growth >= 0 ? '+' : ''}{client.growth}%
                      </span>
                    </div>
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
