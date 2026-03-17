import type { Metadata } from 'next';
import {
  MarketingHeader,
  HeroSection,
  FeaturesSection,
  TestimonialsSection,
  PricingSection,
  OpenSourceSection,
  MarketingFooter,
} from '@/components/landing';

export const metadata: Metadata = {
  title: 'QuoteCraft - Manage clients. Send quotes. Get paid faster.',
  description:
    'The open-source alternative to Bloom and Bonsai. Visual quote builder, e-signatures, one-click invoice conversion. Free self-hosted or cloud.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <OpenSourceSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
