'use client';

import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: React.ReactNode;
  className?: string;
}

export function TextShimmer({ children, className }: TextShimmerProps) {
  return (
    <span
      className={cn(
        'inline-block bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer',
        'bg-gradient-to-r from-primary via-primary/60 to-primary',
        className
      )}
    >
      {children}
    </span>
  );
}
