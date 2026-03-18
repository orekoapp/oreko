'use client';

import { Loader2, PartyPopper, FileText, Users, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingCompleteStepProps {
  onComplete: () => void;
  isLoading: boolean;
}

export function OnboardingCompleteStep({ onComplete, isLoading }: OnboardingCompleteStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
        <PartyPopper className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">You&apos;re all set!</h3>
        <p className="text-muted-foreground">
          Your account is ready. Here are some things you can do next:
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-left">
        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <FileText className="h-5 w-5 text-primary mb-2" />
          <h4 className="font-medium">Create your first quote</h4>
          <p className="text-sm text-muted-foreground">
            Build a professional quote with our visual editor
          </p>
        </div>

        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <Users className="h-5 w-5 text-primary mb-2" />
          <h4 className="font-medium">Add your clients</h4>
          <p className="text-sm text-muted-foreground">
            Import or create client profiles to get started
          </p>
        </div>

        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <Rocket className="h-5 w-5 text-primary mb-2" />
          <h4 className="font-medium">Explore the dashboard</h4>
          <p className="text-sm text-muted-foreground">
            Get insights into your quotes and invoices
          </p>
        </div>
      </div>

      <Button onClick={onComplete} size="lg" disabled={isLoading} className="mt-4">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="mr-2 h-4 w-4" />
        )}
        Go to Dashboard
      </Button>
    </div>
  );
}
