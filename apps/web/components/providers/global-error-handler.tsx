'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Bug #127: Global error handler for async/event handler errors
 * that React error boundaries can't catch.
 *
 * Catches:
 * - Unhandled promise rejections (failed API calls, server action errors)
 * - Uncaught runtime errors in event handlers, setTimeout, etc.
 *
 * Shows a toast to the user and logs to console for debugging.
 * When Sentry is added later, plug it in here.
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Don't show toast for cancelled requests or AbortError
      const reason = event.reason;
      if (reason?.name === 'AbortError') return;

      const message =
        reason instanceof Error ? reason.message : String(reason || 'Unknown error');

      // Don't show duplicate toasts for common non-actionable errors
      if (message.includes('NEXT_NOT_FOUND') || message.includes('NEXT_REDIRECT')) return;

      console.error('[GlobalErrorHandler] Unhandled promise rejection:', reason);
      toast.error('Something went wrong. Please try again.', {
        description: process.env.NODE_ENV === 'development' ? message : undefined,
      });

      // TODO: Send to Sentry when configured
      // Sentry.captureException(reason);
    };

    const handleError = (event: ErrorEvent) => {
      // Ignore ResizeObserver loop errors (benign browser issue)
      if (event.message?.includes('ResizeObserver')) return;

      console.error('[GlobalErrorHandler] Uncaught error:', event.error || event.message);
      toast.error('An unexpected error occurred.', {
        description:
          process.env.NODE_ENV === 'development'
            ? event.message
            : undefined,
      });

      // TODO: Send to Sentry when configured
      // Sentry.captureException(event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
