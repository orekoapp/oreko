import Link from 'next/link';
import { cn } from '@/lib/utils';

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
            'font-bold text-slate-900 dark:text-white',
            sizes.text
          )}
        >
          Oreko
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
