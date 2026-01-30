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

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <main>
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
