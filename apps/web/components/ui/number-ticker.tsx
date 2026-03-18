'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, motion, useMotionValue, useTransform, animate } from 'motion/react';
import { cn } from '@/lib/utils';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const [displayValue, setDisplayValue] = useState(
    direction === 'down' ? value : 0
  );

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      const controls = animate(motionValue, direction === 'down' ? 0 : value, {
        duration: 1.5,
        ease: 'easeOut',
        onUpdate: (latest) => {
          setDisplayValue(
            decimalPlaces > 0
              ? parseFloat(latest.toFixed(decimalPlaces))
              : Math.round(latest)
          );
        },
      });
      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, motionValue, value, direction, delay, decimalPlaces]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
