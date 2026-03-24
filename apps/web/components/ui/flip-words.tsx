'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}

export function FlipWords({
  words,
  duration = 3000,
  className,
}: FlipWordsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  }, [words.length]);

  useEffect(() => {
    intervalRef.current = setInterval(startAnimation, duration);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAnimation, duration]);

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => setIsAnimating(false)}
    >
      <motion.span
        key={words[currentIndex]}
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn('inline-block', className)}
      >
        {words[currentIndex]}
      </motion.span>
    </AnimatePresence>
  );
}
