import type { Metadata } from 'next';
import {
  MarketingHeader,
  HeroSection,
  ProblemSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  TestimonialsSection,
  OpenSourceSection,
  FAQSection,
  FinalCTASection,
  MarketingFooter,
} from '@/components/landing';

export const metadata: Metadata = {
  title: 'QuoteCraft - Beautiful Invoices. No Expensive Subscription.',
  description:
    'The open-source alternative to Bloom and Bonsai. Visual quote builder, e-signatures, one-click invoice conversion. Free self-hosted or cloud.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <main id="main-content">
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <OpenSourceSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <MarketingFooter />
    </div>
  );
}
