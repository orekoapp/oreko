'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LogoProps {
  href?: string;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    icon: 'w-6 h-6',
    text: 'text-sm',
    letter: 'text-sm',
  },
  md: {
    icon: 'w-8 h-8',
    text: 'text-xl',
    letter: 'text-lg',
  },
  lg: {
    icon: 'w-10 h-10',
    text: 'text-2xl',
    letter: 'text-xl',
  },
};

export function Logo({ href, showText = true, className, size = 'md' }: LogoProps) {
  const sizes = sizeClasses[size];

  const content = (
    <div className={cn('flex items-center space-x-2', className)}>
      <div
        className={cn(
          'rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center',
          sizes.icon
        )}
      >
        <span className={cn('text-white font-bold', sizes.letter)}>Q</span>
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold text-slate-900 dark:text-white flex items-center gap-1',
            sizes.text
          )}
        >
          Oreko
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-blue-500 font-medium cursor-default text-sm">β</span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[220px] text-center leading-relaxed">
                Oreko is currently in beta. You may encounter bugs, incomplete features, or unexpected behavior as we continue to improve the platform. Your feedback helps us get better.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
