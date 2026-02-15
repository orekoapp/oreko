'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Mock data - will be replaced with server actions
const mockClientLTV = [
  {
    id: '1',
    name: 'TechFlow Inc.',
    email: 'billing@techflow.com',
    ltv: 125400,
    growth: 12.5,
    isGrowing: true,
  },
  {
    id: '2',
    name: 'Acme Corp',
    email: 'finance@acme.com',
    ltv: 98200,
    growth: 8.3,
    isGrowing: true,
  },
  {
    id: '3',
    name: 'GlobalTech',
    email: 'accounts@globaltech.io',
    ltv: 87500,
    growth: -2.1,
    isGrowing: false,
  },
  {
    id: '4',
    name: 'StartupXYZ',
    email: 'hello@startupxyz.com',
    ltv: 72800,
    growth: 15.7,
    isGrowing: true,
  },
  {
    id: '5',
    name: 'Digital Agency',
    email: 'billing@digitalagency.co',
    ltv: 65300,
    growth: 5.2,
    isGrowing: true,
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ClientLifetimeValueCard() {
  const data = mockClientLTV;
  const averageLTV = data.reduce((sum, c) => sum + c.ltv, 0) / data.length;

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
          {data.map((client) => {
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
                    +{formatCurrency(client.ltv)}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-xs">
                    {client.isGrowing ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={client.isGrowing ? 'text-green-500' : 'text-red-500'}>
                      {client.isGrowing ? '+' : ''}{client.growth}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
