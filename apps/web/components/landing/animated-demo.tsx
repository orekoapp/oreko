'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, ArrowRightLeft, ScrollText, BarChart3 } from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   TAB DATA — maps to real product screenshots
   ──────────────────────────────────────────────────────────── */

const tabs = [
  {
    id: 'invoices',
    label: 'Invoices',
    icon: ArrowRightLeft,
    screenshot: '/screenshots/invoices-list.png',
    alt: 'QuoteCraft invoices list with status tracking',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    icon: FileText,
    screenshot: '/screenshots/quote-detail.png',
    alt: 'QuoteCraft quote builder with live preview',
  },
  {
    id: 'contracts',
    label: 'Contracts',
    icon: ScrollText,
    screenshot: '/screenshots/contracts.png',
    alt: 'QuoteCraft contracts management',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    screenshot: '/screenshots/dashboard.png',
    alt: 'QuoteCraft analytics dashboard',
  },
];

const AUTOPLAY_INTERVAL = 4000;

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */

export function AnimatedDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % tabs.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(advance, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, advance]);

  const activeTab = tabs[activeIndex];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-4">
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveIndex(i)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-0 rounded-lg bg-accent border border-border"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          );
        })}

        {/* Progress bar for autoplay */}
        {!isPaused && (
          <div className="ml-auto hidden sm:flex items-center gap-1.5">
            {tabs.map((_, i) => (
              <div
                key={i}
                className="h-0.5 w-6 rounded-full bg-border overflow-hidden"
              >
                {i === activeIndex && (
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
                    key={`progress-${activeIndex}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot showcase */}
      <div className="relative rounded-xl border border-border shadow-xl overflow-hidden bg-card">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/60 border-b border-border">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-background border border-border text-xs text-muted-foreground min-w-[220px] text-center font-mono">
              app.quotecraft.io/{activeTab.id}
            </div>
          </div>
          <div className="w-[52px]" />
        </div>

        {/* Screenshot with crossfade */}
        <div className="relative aspect-[16/10] bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <Image
                src={activeTab.screenshot}
                alt={activeTab.alt}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={activeIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Subtle gradient fade at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/60 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
