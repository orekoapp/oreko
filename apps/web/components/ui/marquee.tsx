'use client';

import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  speed?: number;
}

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
  speed = 40,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'group flex overflow-hidden [--gap:1rem] [gap:var(--gap)]',
        className
      )}
    >
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 justify-around [gap:var(--gap)]',
            'animate-marquee',
            reverse && '[animation-direction:reverse]',
            pauseOnHover && 'group-hover:[animation-play-state:paused]'
          )}
          style={{ animationDuration: `${speed}s` }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
