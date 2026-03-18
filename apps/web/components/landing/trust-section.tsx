'use client';

import { NumberTicker } from '@/components/ui/number-ticker';

const metrics = [
  { value: 500, prefix: '', suffix: '+', label: 'Businesses' },
  { value: 12, prefix: '', suffix: 'k+', label: 'Quotes sent' },
  { value: 2.1, prefix: '$', suffix: 'M+', label: 'Invoiced', decimals: 1 },
  { value: 99.9, prefix: '', suffix: '%', label: 'Uptime', decimals: 1 },
];

export function TrustSection() {
  return (
    <section className="bg-transparent py-12 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <p className="text-sm text-muted-foreground shrink-0">
            Trusted by freelancers and agencies worldwide
          </p>
          <div className="flex items-center gap-10 sm:gap-14">
            {metrics.map((metric, i) => (
              <div key={metric.label} className="text-center">
                <div className="text-xl font-display font-medium text-foreground">
                  <NumberTicker
                    value={metric.value}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                    delay={0.3 + i * 0.15}
                    decimalPlaces={metric.decimals ?? 0}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
