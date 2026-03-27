'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Github, Shield, Server, Code, Star, GitFork } from 'lucide-react';
import { motion, useInView } from 'motion/react';

const benefits = [
  {
    icon: Server,
    title: 'Self-hosted',
    description:
      'Deploy with Docker in minutes. Your server, your rules, your data.',
  },
  {
    icon: Code,
    title: 'Fully extensible',
    description:
      'Built with Next.js, Prisma, and PostgreSQL. Fork it and make it yours.',
  },
  {
    icon: Shield,
    title: 'Privacy first',
    description:
      'No tracking, no analytics on your data. Client information stays on your server.',
  },
];

function AnimatedCount({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      className="font-medium text-foreground tabular-nums"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {value.toLocaleString()}
        {suffix}
      </motion.span>
    </motion.span>
  );
}

export function OpenSourceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="bg-accent/50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top — heading + GitHub CTA */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
              <Github className="h-4 w-4" />
              <span>Open source</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-snug">
              Own your data.{' '}
              <span className="text-primary">Host it yourself.</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Oreko is open source under the MIT license. Deploy on your own
              server, keep client data private, and customize it however you need.
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 shrink-0"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            <Link
              href="https://github.com/orekoapp/oreko"
              className="group inline-flex items-center gap-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 px-5 py-2.5 rounded-md transition-all hover:shadow-lg"
            >
              <Github className="h-4 w-4 transition-transform group-hover:scale-110" />
              Star on GitHub
            </Link>
            <Link
              href="https://github.com/orekoapp/oreko/fork"
              className="group inline-flex items-center gap-2 text-sm font-medium border border-border text-foreground hover:bg-accent px-5 py-2.5 rounded-md transition-all"
            >
              <GitFork className="h-4 w-4 transition-transform group-hover:-rotate-12" />
              Fork
            </Link>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          className="flex flex-wrap items-center gap-8 mb-16 pb-16 border-b border-border"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500" />
            <AnimatedCount value={2400} suffix="+" /> stars
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitFork className="h-4 w-4" />
            <AnimatedCount value={380} suffix="+" /> forks
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">MIT</span> license
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <motion.span
              className="h-2 w-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="font-medium text-foreground">Active</span>{' '}
            development
          </div>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-3 gap-10">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              className="group"
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.45,
                delay: 0.35 + i * 0.1,
                ease: 'easeOut',
              }}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/20">
                <benefit.icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
              </div>
              <h3 className="font-display font-medium text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
