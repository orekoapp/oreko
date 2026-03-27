/**
 * Onboarding Types
 */

export type OnboardingStep =
  | 'welcome'
  | 'business'
  | 'branding'
  | 'payment'
  | 'complete';

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isComplete: boolean;
  businessProfileComplete: boolean;
  brandingComplete: boolean;
  paymentSetupSkipped: boolean;
}

export interface OnboardingStepInfo {
  id: OnboardingStep;
  title: string;
  description: string;
  isRequired: boolean;
}

export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
  {
    id: 'welcome',
    title: 'Welcome to Oreko',
    description: 'Let\'s get your account set up',
    isRequired: true,
  },
  {
    id: 'business',
    title: 'Business Profile',
    description: 'Tell us about your business',
    isRequired: true,
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Customize your quote and invoice appearance',
    isRequired: false,
  },
  {
    id: 'payment',
    title: 'Payment Setup',
    description: 'Connect Stripe to accept payments',
    isRequired: false,
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'Your account is ready to use',
    isRequired: true,
  },
];
