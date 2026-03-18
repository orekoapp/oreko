'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatusVariant } from '@/lib/portal/types';

interface PortalStatusBannerProps {
  label: string;
  description: string;
  variant: StatusVariant;
  additionalMessage?: string;
}

const variantStyles: Record<StatusVariant, { bg: string; text: string; border: string }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-800 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-800',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/50',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/50',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800',
  },
  muted: {
    bg: 'bg-muted/50',
    text: 'text-muted-foreground',
    border: 'border-border',
  },
};

const variantIcons: Record<StatusVariant, React.ReactNode> = {
  info: <Info className="h-5 w-5 flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 flex-shrink-0" />,
  success: <CheckCircle2 className="h-5 w-5 flex-shrink-0" />,
  error: <XCircle className="h-5 w-5 flex-shrink-0" />,
  muted: <AlertCircle className="h-5 w-5 flex-shrink-0" />,
};

export function PortalStatusBanner({
  label,
  description,
  variant,
  additionalMessage,
}: PortalStatusBannerProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        styles.bg,
        styles.border
      )}
    >
      <div className={styles.text}>{variantIcons[variant]}</div>
      <div className="flex-1">
        <p className={cn('font-semibold', styles.text)}>{label}</p>
        <p className={cn('text-sm opacity-90', styles.text)}>{description}</p>
        {additionalMessage && (
          <p className={cn('mt-1 text-sm font-medium', styles.text)}>
            {additionalMessage}
          </p>
        )}
      </div>
    </div>
  );
}
