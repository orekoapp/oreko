import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  // Note: These tests require a fresh user account to be created
  // In a real setup, you would seed a test database or use test fixtures

  test.describe('Onboarding Wizard Structure', () => {
    test.skip('should display onboarding wizard for new users', async ({ page }) => {
      // This test would require authentication setup with a new user
      await page.goto('/onboarding');

      // Should see the onboarding wizard
      await expect(page.getByRole('heading', { name: /welcome|get started/i })).toBeVisible();
    });

    test.skip('should show progress indicator', async ({ page }) => {
      await page.goto('/onboarding');

      // Should have step indicators
      const steps = page.locator('[data-testid="step-indicator"]');
      await expect(steps).toHaveCount(4); // Business, Branding, Payment, Complete
    });

    test.skip('should display business profile step first', async ({ page }) => {
      await page.goto('/onboarding');

      // Business profile form fields
      await expect(page.getByLabel(/business name|company name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test.skip('should validate required fields in business step', async ({ page }) => {
      await page.goto('/onboarding');

      // Try to proceed without filling required fields
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      await nextButton.click();

      // Should show validation errors
      await expect(page.getByText(/required|please enter/i)).toBeVisible();
    });

    test.skip('should allow skipping optional steps', async ({ page }) => {
      await page.goto('/onboarding');

      // Fill required business info
      await page.getByLabel(/business name/i).fill('Test Company');
      await page.getByLabel(/email/i).fill('test@company.com');

      // Click next to go to branding
      await page.getByRole('button', { name: /next|continue/i }).click();

      // Should be able to skip branding step
      const skipButton = page.getByRole('button', { name: /skip/i });
      if (await skipButton.isVisible()) {
        await skipButton.click();
      }
    });
  });

  test.describe('Step Navigation', () => {
    test.skip('should navigate between steps', async ({ page }) => {
      await page.goto('/onboarding');

      // Fill first step
      await page.getByLabel(/business name/i).fill('Test Company');
      await page.getByLabel(/email/i).fill('test@company.com');

      // Go to next step
      await page.getByRole('button', { name: /next|continue/i }).click();

      // Should be on branding step
      await expect(page.getByText(/branding|customize/i)).toBeVisible();

      // Go back
      await page.getByRole('button', { name: /back|previous/i }).click();

      // Should be back on business step with data preserved
      await expect(page.getByLabel(/business name/i)).toHaveValue('Test Company');
    });
  });

  test.describe('Completion', () => {
    test.skip('should redirect to dashboard after completion', async ({ page }) => {
      await page.goto('/onboarding');

      // Complete all steps (simplified)
      // Step 1: Business
      await page.getByLabel(/business name/i).fill('Test Company');
      await page.getByLabel(/email/i).fill('test@company.com');
      await page.getByRole('button', { name: /next|continue/i }).click();

      // Skip remaining steps
      while (await page.getByRole('button', { name: /skip/i }).isVisible()) {
        await page.getByRole('button', { name: /skip/i }).click();
      }

      // Click finish
      const finishButton = page.getByRole('button', { name: /finish|complete|go to dashboard/i });
      if (await finishButton.isVisible()) {
        await finishButton.click();

        // Should redirect to dashboard
        await expect(page).toHaveURL(/\/(dashboard)?$/);
      }
    });
  });
});

test.describe('Onboarding Accessibility', () => {
  test.skip('should be keyboard navigable', async ({ page }) => {
    await page.goto('/onboarding');

    // Tab through the form
    await page.keyboard.press('Tab');

    // First input should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test.skip('should have proper form labels', async ({ page }) => {
    await page.goto('/onboarding');

    // All inputs should have associated labels
    const inputs = page.locator('input:not([type="hidden"])');
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
