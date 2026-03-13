'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Period Selector Skeleton */}
      <Skeleton className="h-9 w-[260px] rounded-lg" />

      {/* Overview Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-lg border bg-card divide-x divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 space-y-3">
            <Skeleton className="h-3 w-[80px]" />
            <Skeleton className="h-7 w-[100px]" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-[140px]" />
              <Skeleton className="h-3 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-[120px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
