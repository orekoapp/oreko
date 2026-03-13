'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, ArrowRight, Building2, Palette, CreditCard, PartyPopper, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OnboardingBusinessStep } from './steps/business-step';
import { OnboardingBrandingStep } from './steps/branding-step';
import { OnboardingPaymentStep } from './steps/payment-step';
import { OnboardingCompleteStep } from './steps/complete-step';
import { completeOnboarding } from '@/lib/onboarding/actions';
import type { OnboardingProgress, OnboardingStep } from '@/lib/onboarding/types';

interface OnboardingWizardProps {
  initialProgress: OnboardingProgress;
  stripeEnabled: boolean;
}

const steps = [
  { id: 'business' as OnboardingStep, title: 'Business', icon: Building2 },
  { id: 'branding' as OnboardingStep, title: 'Branding', icon: Palette },
  { id: 'payment' as OnboardingStep, title: 'Payments', icon: CreditCard },
  { id: 'complete' as OnboardingStep, title: 'Complete', icon: PartyPopper },
];

export function OnboardingWizard({ initialProgress, stripeEnabled }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialProgress.currentStep);
  const [isLoading, setIsLoading] = useState(false);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]!.id);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]!.id);
    }
  };

  const skipStep = () => {
    goToNextStep();
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding();
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Welcome to QuoteCraft</CardTitle>
          <CardDescription>
            Let&apos;s set up your account in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const isCompleted = currentStepIndex > index;
                const isCurrent = currentStepIndex === index;
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center gap-1 ${
                      isCurrent
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        isCurrent
                          ? 'border-primary bg-primary/10'
                          : isCompleted
                            ? 'border-green-600 bg-green-600'
                            : 'border-muted-foreground/30'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 'business' && (
              <OnboardingBusinessStep
                onNext={goToNextStep}
                initialComplete={initialProgress.businessProfileComplete}
              />
            )}
            {currentStep === 'branding' && (
              <OnboardingBrandingStep
                onNext={goToNextStep}
                onSkip={skipStep}
                onBack={goToPreviousStep}
              />
            )}
            {currentStep === 'payment' && (
              <OnboardingPaymentStep
                onNext={goToNextStep}
                onSkip={skipStep}
                onBack={goToPreviousStep}
                stripeEnabled={stripeEnabled}
              />
            )}
            {currentStep === 'complete' && (
              <OnboardingCompleteStep
                onComplete={handleComplete}
                isLoading={isLoading}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
