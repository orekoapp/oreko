import { test, expect } from '@playwright/test';

/**
 * Helper to check if user needs onboarding
 * Returns true if on onboarding page, false if redirected (already completed)
 */
async function checkOnboardingNeeded(page: import('@playwright/test').Page): Promise<boolean> {
  await page.goto('/onboarding');
  await page.waitForLoadState('networkidle');
  // If redirected to dashboard, onboarding is already complete
  return page.url().includes('/onboarding');
}

test.describe('Onboarding Flow', () => {
  // Note: These tests require a fresh user account to be created
  // If user has already completed onboarding, tests will be skipped
  // In a real setup, you would seed a test database or use test fixtures

  test.describe('Onboarding Wizard Structure', () => {
    test('should display onboarding wizard for new users', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Should see the onboarding wizard title
      await expect(page.getByRole('heading', { name: /welcome to quotecraft/i })).toBeVisible();
    });

    test('should show progress indicator with steps', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Should have step titles visible
      await expect(page.getByText('Business')).toBeVisible();
      await expect(page.getByText('Branding')).toBeVisible();
      await expect(page.getByText('Payments')).toBeVisible();
      await expect(page.getByText('Complete')).toBeVisible();
    });

    test('should display business profile step first', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Business profile form fields
      await expect(page.getByText(/tell us about your business/i)).toBeVisible();
      await expect(page.getByLabel(/business name/i)).toBeVisible();
      await expect(page.getByLabel(/business email/i)).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields in business step', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Try to proceed without filling required fields
      const continueButton = page.getByRole('button', { name: /continue/i });
      await continueButton.click();

      // Should show validation errors
      await expect(page.getByText(/required|please enter/i)).toBeVisible();
    });

    test('should have required field indicators', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Required fields should have asterisk indicators
      await expect(page.getByText('Business Name *')).toBeVisible();
      await expect(page.getByText('Business Email *')).toBeVisible();
    });
  });

  test.describe('Step Navigation', () => {
    test('should navigate between steps', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Fill first step
      await page.getByLabel(/business name/i).fill('Test Company');
      await page.getByLabel(/business email/i).fill('test@company.com');

      // Go to next step
      await page.getByRole('button', { name: /continue/i }).click();

      // Should be on branding step
      await expect(page.getByText(/customize your branding/i)).toBeVisible();

      // Go back
      await page.getByRole('button', { name: /back/i }).click();

      // Should be back on business step with data preserved
      await expect(page.getByLabel(/business name/i)).toHaveValue('Test Company');
    });

    test('should allow skipping optional steps', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Fill required business info
      await page.getByLabel(/business name/i).fill('Test Company');
      await page.getByLabel(/business email/i).fill('test@company.com');

      // Click continue to go to branding
      await page.getByRole('button', { name: /continue/i }).click();

      // Should be able to skip branding step
      const skipButton = page.getByRole('button', { name: /skip for now/i });
      await expect(skipButton).toBeVisible();
    });
  });

  test.describe('Branding Step', () => {
    test('should show color pickers and preview', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Fill and proceed past business step
      await page.getByLabel(/business name/i).fill('Test Company');
      await page.getByLabel(/business email/i).fill('test@company.com');
      await page.getByRole('button', { name: /continue/i }).click();

      // Should have color inputs
      await expect(page.getByLabel(/primary color/i)).toBeVisible();
      await expect(page.getByLabel(/accent color/i)).toBeVisible();

      // Should have preview section
      await expect(page.getByText('Preview')).toBeVisible();
    });
  });

  test.describe('Completion', () => {
    test('should show completion step with next actions', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Complete all steps (simplified)
      // Step 1: Business
      await page.getByLabel(/business name/i).fill('Test Company');
      await page.getByLabel(/business email/i).fill('test@company.com');
      await page.getByRole('button', { name: /continue/i }).click();

      // Skip branding
      await page.getByRole('button', { name: /skip for now/i }).click();

      // Skip payment
      const skipPayment = page.getByRole('button', { name: /skip for now/i });
      if (await skipPayment.isVisible()) {
        await skipPayment.click();
      }

      // Should be on complete step
      await expect(page.getByText(/you're all set/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /go to dashboard/i })).toBeVisible();
    });

    test('should show suggested next actions on complete step', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Navigate to complete step
      await page.getByLabel(/business name/i).fill('Test Company');
      await page.getByLabel(/business email/i).fill('test@company.com');
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /skip for now/i }).click();

      const skipPayment = page.getByRole('button', { name: /skip for now/i });
      if (await skipPayment.isVisible()) {
        await skipPayment.click();
      }

      // Should show next actions
      await expect(page.getByText(/create your first quote/i)).toBeVisible();
      await expect(page.getByText(/add your clients/i)).toBeVisible();
    });
  });
});

test.describe('Onboarding Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    const needsOnboarding = await checkOnboardingNeeded(page);
    test.skip(!needsOnboarding, 'User has already completed onboarding');

    // Tab through the form
    await page.keyboard.press('Tab');

    // First input should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper form labels', async ({ page }) => {
    const needsOnboarding = await checkOnboardingNeeded(page);
    test.skip(!needsOnboarding, 'User has already completed onboarding');

    // All inputs should have associated labels
    const inputs = page.locator('input:not([type="hidden"]):not([type="color"])');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeAttached();
      }
    }
  });
});
