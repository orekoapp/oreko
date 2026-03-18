'use client';

import Link from 'next/link';
import { Github, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { FlipWords } from '@/components/ui/flip-words';
import { TextShimmer } from '@/components/ui/text-shimmer';

export function HeroSection() {
  return (
    <section className="relative bg-transparent pt-24 pb-16 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Badge with spinning border */}
        <motion.a
          href="https://github.com/quotecraft/quotecraft"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Animated border glow on hover */}
          <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="absolute inset-[-1px] rounded-full bg-[conic-gradient(from_0deg,transparent_0_340deg,var(--primary)_360deg)] animate-border-spin" />
            <span className="absolute inset-[1px] rounded-full bg-background" />
          </span>
          <span className="relative flex items-center gap-2">
            <Github className="h-3.5 w-3.5" />
            Open source &amp; self-hosted
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span className="text-primary">Star on GitHub</span>
          </span>
        </motion.a>

        {/* Heading with FlipWords */}
        <motion.h1
          className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-medium text-foreground tracking-tight leading-[1.1] max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          Run your business,{' '}
          <br className="hidden sm:block" />
          <TextShimmer>
            not your{' '}
            <FlipWords
              words={['paperwork', 'spreadsheets', 'busywork', 'chaos']}
              duration={2800}
              className="text-primary"
            />
          </TextShimmer>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          Quotes, invoices, contracts, clients, and payments — one open-source
          platform that handles the business side so you can focus on the work.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-8 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        >
          <Link
            href="/register"
            className="group relative inline-flex items-center px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-md transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            <span className="absolute inset-0 rounded-md bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative">Start free trial</span>
          </Link>
          <Link
            href="/features"
            className="group inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            See how it works
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Product Screenshot */}
        <motion.div
          className="mt-16 rounded-xl border border-border shadow-xl overflow-hidden bg-card transition-shadow duration-500 hover:shadow-2xl"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        >
          <Image
            src="/screenshots/dashboard.png"
            alt="QuoteCraft dashboard"
            width={1280}
            height={800}
            className="w-full h-auto"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
