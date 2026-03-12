'use server';

import { cache } from 'react';
import { prisma } from '@quotecraft/database';
import { revalidatePath } from 'next/cache';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type { OnboardingProgress, OnboardingStep } from './types';

/**
 * Get onboarding progress for current workspace
 */
export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const [workspace, businessProfile, brandingSettings, paymentSettings] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { settings: true },
    }),
    prisma.businessProfile.findUnique({
      where: { workspaceId },
    }),
    prisma.brandingSettings.findUnique({
      where: { workspaceId },
    }),
    prisma.paymentSettings.findUnique({
      where: { workspaceId },
    }),
  ]);

  const workspaceSettings = workspace?.settings as Record<string, unknown> ?? {};
  const onboardingCompleted = workspaceSettings.onboardingCompleted === true;

  // Determine completed steps
  const completedSteps: OnboardingStep[] = ['welcome'];

  const businessProfileComplete =
    !!businessProfile?.businessName && !!businessProfile?.email;
  if (businessProfileComplete) {
    completedSteps.push('business');
  }

  const brandingComplete =
    !!brandingSettings?.primaryColor || !!brandingSettings?.logoUrl;
  if (brandingComplete) {
    completedSteps.push('branding');
  }

  const paymentSetupSkipped =
    !paymentSettings?.stripeAccountId && onboardingCompleted;

  if (paymentSettings?.stripeOnboardingComplete || paymentSetupSkipped) {
    completedSteps.push('payment');
  }

  if (onboardingCompleted) {
    completedSteps.push('complete');
  }

  // Determine current step
  let currentStep: OnboardingStep = 'welcome';
  if (!completedSteps.includes('business')) {
    currentStep = 'business';
  } else if (!completedSteps.includes('branding')) {
    currentStep = 'branding';
  } else if (!completedSteps.includes('payment')) {
    currentStep = 'payment';
  } else if (!completedSteps.includes('complete')) {
    currentStep = 'complete';
  } else {
    currentStep = 'complete';
  }

  return {
    currentStep,
    completedSteps,
    isComplete: onboardingCompleted,
    businessProfileComplete,
    brandingComplete,
    paymentSetupSkipped: paymentSetupSkipped ?? false,
  };
}

/**
 * Mark onboarding as complete
 */
export async function completeOnboarding(): Promise<{ success: boolean }> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  });

  const currentSettings = (workspace?.settings as Record<string, unknown>) ?? {};

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...currentSettings,
        onboardingCompleted: true,
      },
    },
  });

  revalidatePath('/onboarding');
  revalidatePath('/');

  return { success: true };
}

/**
 * Skip a specific onboarding step
 */
export async function skipOnboardingStep(
  step: OnboardingStep
): Promise<{ success: boolean }> {
  // Steps like branding and payment can be skipped
  // Just mark progress in workspace metadata if needed
  return { success: true };
}

/**
 * Check if user needs onboarding
 * Bug #9: Only workspace owners run onboarding — team members joining
 * an already-configured workspace should skip it.
 */
export const needsOnboarding = cache(async (): Promise<boolean> => {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  // Bug #9: Non-owner team members skip onboarding (workspace is already set up)
  if (role !== 'owner') {
    return false;
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  });

  const workspaceSettings = (workspace?.settings as Record<string, unknown>) ?? {};
  return workspaceSettings.onboardingCompleted !== true;
});
