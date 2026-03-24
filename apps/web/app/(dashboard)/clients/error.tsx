'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Low #80: Route-level error boundary — sidebar and header stay visible
export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Clients section error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {process.env.NODE_ENV === 'development' ? error.message : 'An error occurred loading this page.'}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mb-4">Reference: {error.digest}</p>
      )}
      <Button onClick={reset}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
