import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function InvoicePortalSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-10 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </header>

      {/* Content skeleton */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Status banner skeleton */}
        <div className="mb-6 h-16 animate-pulse rounded-lg bg-muted" />

        {/* Invoice content skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <div className="space-y-3">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </CardContent>
        </Card>

        {/* Totals skeleton */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="ml-auto w-64 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pay button skeleton */}
        <div className="flex justify-center">
          <div className="h-11 w-40 animate-pulse rounded bg-muted" />
        </div>
      </main>
    </div>
  );
}
