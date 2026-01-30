'use client';

import { AlertTriangle, Rocket, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DemoBannerProps {
  className?: string;
}

export function DemoBanner({ className }: DemoBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">Demo Mode</span>
            <span className="hidden sm:inline">
              &mdash; Changes will not be saved. Create an account to save your work.
            </span>
            <span className="sm:hidden">&mdash; Changes won't be saved</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="bg-amber-900 text-amber-50 hover:bg-amber-800"
            >
              <Link href="/register">
                <Rocket className="mr-1.5 h-3.5 w-3.5" />
                Create Account
              </Link>
            </Button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded hover:bg-amber-600/50 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Server component wrapper that checks if user is in demo mode
 * and renders the banner accordingly
 */
export function DemoBannerWrapper({
  isDemo,
  className,
}: {
  isDemo: boolean;
  className?: string;
}) {
  if (!isDemo) {
    return null;
  }

  return <DemoBanner className={className} />;
}
