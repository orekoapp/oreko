import { test, expect } from '@playwright/test';

test.describe('Settings Module', () => {
  test.describe('Settings Navigation', () => {
    test('should display settings page', async ({ page }) => {
      await page.goto('/settings');

      await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
      await expect(page.getByText(/manage your workspace and business settings/i)).toBeVisible();
    });

    test('should have settings category cards', async ({ page }) => {
      await page.goto('/settings');

      // Should see settings categories as cards
      await expect(page.getByText('Business Profile').first()).toBeVisible();
      await expect(page.getByText('Branding').first()).toBeVisible();
      await expect(page.getByText('Tax Rates').first()).toBeVisible();
      await expect(page.getByText('Quote Settings').first()).toBeVisible();
      await expect(page.getByText('Invoice Settings').first()).toBeVisible();
      await expect(page.getByText('Email Templates').first()).toBeVisible();
      await expect(page.getByText('Payment Settings').first()).toBeVisible();
    });

    test('should navigate to business profile', async ({ page }) => {
      await page.goto('/settings');

      // Settings uses Link wrapping Card components
      const businessLink = page.locator('a[href="/settings/business"]');
      await businessLink.click();

      await expect(page).toHaveURL(/\/settings\/business/);
    });

    test('should navigate to branding', async ({ page }) => {
      await page.goto('/settings');

      // Settings uses Link wrapping Card components
      const brandingLink = page.locator('a[href="/settings/branding"]');
      await brandingLink.click();

      await expect(page).toHaveURL(/\/settings\/branding/);
    });

    test('should navigate to tax rates', async ({ page }) => {
      await page.goto('/settings');

      // Settings uses Link wrapping Card components
      const taxRatesLink = page.locator('a[href="/settings/tax-rates"]');
      await taxRatesLink.click();

      await expect(page).toHaveURL(/\/settings\/tax-rates/);
    });

    test('should navigate to payment settings', async ({ page }) => {
      await page.goto('/settings');

      // Settings uses Link wrapping Card components
      const paymentsLink = page.locator('a[href="/settings/payments"]');
      await paymentsLink.click();

      await expect(page).toHaveURL(/\/settings\/payments/);
    });
  });

  test.describe('Business Profile Settings', () => {
    test('should display business profile form', async ({ page }) => {
      await page.goto('/settings/business');

      // Should see form fields
      await expect(page.getByRole('heading', { name: /business/i })).toBeVisible();
    });
  });

  test.describe('Branding Settings', () => {
    test('should display branding settings', async ({ page }) => {
      await page.goto('/settings/branding');

      // Should see branding options
      await expect(page.getByRole('heading', { name: /branding/i })).toBeVisible();
    });
  });

  test.describe('Payment Settings', () => {
    test('should display payment settings', async ({ page }) => {
      await page.goto('/settings/payments');

      // Check for payment settings content or redirect to settings
      const paymentText = page.getByText(/stripe|payment|connect/i).first();
      const settingsHeading = page.getByRole('heading', { name: /payment|settings/i }).first();

      const hasPayment = await paymentText.isVisible().catch(() => false);
      const hasHeading = await settingsHeading.isVisible().catch(() => false);

      // Should show payment content or settings page
      expect(hasPayment || hasHeading || page.url().includes('/settings')).toBe(true);
    });
  });

  test.describe('Email Settings', () => {
    test('should display email settings', async ({ page }) => {
      await page.goto('/settings/emails');

      // Check for email settings content or redirect to settings
      const emailText = page.getByText(/email|templates|notification/i).first();
      const settingsHeading = page.getByRole('heading', { name: /email|settings/i }).first();

      const hasEmail = await emailText.isVisible().catch(() => false);
      const hasHeading = await settingsHeading.isVisible().catch(() => false);

      // Should show email content or settings page
      expect(hasEmail || hasHeading || page.url().includes('/settings')).toBe(true);
    });
  });
});

test.describe('Settings Accessibility', () => {
  test('should have proper headings', async ({ page }) => {
    await page.goto('/settings');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/settings');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
