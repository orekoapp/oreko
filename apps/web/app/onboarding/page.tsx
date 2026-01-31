import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { OnboardingWizard } from '@/components/onboarding';
import { getOnboardingProgress, needsOnboarding } from '@/lib/onboarding/actions';

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user needs onboarding
  const requiresOnboarding = await needsOnboarding();

  if (!requiresOnboarding) {
    redirect('/dashboard');
  }

  const progress = await getOnboardingProgress();

  // Check if Stripe is configured
  const stripeEnabled = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );

  return (
    <OnboardingWizard
      initialProgress={progress}
      stripeEnabled={stripeEnabled}
    />
  );
}
