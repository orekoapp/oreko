'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data - will be replaced with server actions
const mockQuotesData = [
  { status: 'Draft', count: 12, color: '#94A3B8' },
  { status: 'Sent', count: 24, color: '#3B82F6' },
  { status: 'Viewed', count: 18, color: '#FACC15' },
  { status: 'Accepted', count: 34, color: '#22C55E' },
  { status: 'Declined', count: 8, color: '#EF4444' },
  { status: 'Expired', count: 6, color: '#F97316' },
];

export function QuotesByStatusChart() {
  const total = mockQuotesData.reduce((acc, item) => acc + item.count, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Quotes by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockQuotesData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="count"
                nameKey="status"
              >
                {mockQuotesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const item = payload[0].payload;
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.status}</span>
                      </div>
                      <p className="text-sm">
                        Count: <span className="font-medium">{item.count}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{percentage}%</p>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
