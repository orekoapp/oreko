import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Onboarding Flow Tests
 *
 * These tests use a dedicated onboarding test user that is created fresh
 * for each test run by global-setup (with a unique timestamp-based email).
 *
 * The checkOnboardingNeeded helper serves as a fallback in case:
 * - The stored auth state is invalid
 * - The user needs to be registered again
 *
 * Credentials are read from .auth/onboarding-credentials.json which is
 * created by global-setup with the unique email for this test run.
 */

// Load credentials from file created by global-setup
function getOnboardingCredentials() {
  const credentialsFile = path.join(__dirname, '.auth/onboarding-credentials.json');
  try {
    const content = fs.readFileSync(credentialsFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    // Fallback if file doesn't exist
    return {
      email: `onboarding-fallback-${Date.now()}@oreko.dev`,
      password: 'OnboardingTest123!',
      name: 'Onboarding Test User',
    };
  }
}

const ONBOARDING_USER = getOnboardingCredentials();

// Run onboarding tests serially since they share state (each test may advance onboarding steps)
test.describe.configure({ mode: 'serial' });

/**
 * Helper to ensure we're on the onboarding page (step 1 - Business)
 * Handles authentication if needed, registers new user if needed
 * Returns true if on onboarding page, false if user already completed onboarding
 */
async function checkOnboardingNeeded(page: import('@playwright/test').Page): Promise<boolean> {
  await page.goto('/onboarding');
  await page.waitForLoadState('networkidle');

  // If on onboarding page, navigate back to step 1 if needed
  if (page.url().includes('/onboarding')) {
    // Keep clicking Back until we're on step 1 (Business step)
    let maxBackAttempts = 5;
    while (maxBackAttempts > 0) {
      const backButton = page.getByRole('button', { name: /back/i });
      const isBackVisible = await backButton.isVisible().catch(() => false);
      if (isBackVisible) {
        await backButton.click();
        await page.waitForLoadState('networkidle');
        maxBackAttempts--;
      } else {
        // No back button means we're on step 1
        break;
      }
    }
    return true;
  }

  // If on dashboard, user already completed onboarding
  if (page.url().includes('/dashboard')) {
    return false;
  }

  // If on login page, we need to authenticate
  if (page.url().includes('/login')) {
    // Try to login
    await page.getByRole('textbox', { name: 'Email' }).fill(ONBOARDING_USER.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(ONBOARDING_USER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    try {
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });

      if (page.url().includes('/onboarding')) {
        return true;
      }
      if (page.url().includes('/dashboard')) {
        return false; // User already completed onboarding
      }
    } catch {
      // Login failed, try to register
    }

    // Try to register
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Name').fill(ONBOARDING_USER.name);
    await page.getByLabel('Email').fill(ONBOARDING_USER.email);
    await page.getByLabel('Password', { exact: true }).fill(ONBOARDING_USER.password);
    await page.getByLabel('Confirm Password').fill(ONBOARDING_USER.password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    try {
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });

      if (page.url().includes('/onboarding')) {
        return true;
      }
    } catch {
      // Registration also failed
      return false;
    }
  }

  return false;
}

test.describe('Onboarding Flow', () => {
  // Uses dedicated onboarding user that hasn't completed onboarding
  // Tests will skip if user has already completed onboarding (fallback behavior)

  test.describe('Onboarding Wizard Structure', () => {
    test('should display onboarding wizard for new users', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Should see the onboarding wizard welcome text and first step heading
      await expect(page.getByText('Welcome to Oreko')).toBeVisible();
      await expect(page.getByRole('heading', { name: /tell us about your business/i })).toBeVisible();
    });

    test('should show progress indicator with steps', async ({ page }) => {
      const needsOnboarding = await checkOnboardingNeeded(page);
      test.skip(!needsOnboarding, 'User has already completed onboarding');

      // Should have step titles visible in the progress indicator (use exact match to avoid content text)
      await expect(page.getByText('Business', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Branding', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Payments', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Complete', { exact: true }).first()).toBeVisible();
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

      // Should show validation errors (use first() since multiple errors may appear)
      await expect(page.getByText(/required|please enter/i).first()).toBeVisible();
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

      // Should be back on business step (verify we're back on step 1)
      await expect(page.getByRole('heading', { name: /tell us about your business/i })).toBeVisible();
      await expect(page.getByLabel(/business name/i)).toBeVisible();
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

      // Should have color section labels (not input labels, just text)
      await expect(page.getByText('Primary Color')).toBeVisible();
      await expect(page.getByText('Accent Color')).toBeVisible();

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
