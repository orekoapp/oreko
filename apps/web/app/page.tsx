import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import {
  MarketingHeader,
  HeroSection,
  TrustSection,
  FeaturesSection,
  TestimonialsSection,
  PricingSection,
  OpenSourceSection,
  CtaSection,
  MarketingFooter,
  DotBackground,
} from '@/components/landing';

export default async function HomePage() {
  // Redirect logged-in users to dashboard
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }
  return (
    <div className="min-h-screen bg-background relative">
      <DotBackground />
      <div className="relative z-10">
        <MarketingHeader />
        <main>
          <HeroSection />
          <TrustSection />
          <FeaturesSection />
          <TestimonialsSection />
          <PricingSection />
          <OpenSourceSection />
          <CtaSection />
        </main>
        <MarketingFooter />
      </div>
    </div>
  );
}
