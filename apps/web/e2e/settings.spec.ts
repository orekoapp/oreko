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
      await expect(page.getByText('Business Profile')).toBeVisible();
      await expect(page.getByText('Branding')).toBeVisible();
      await expect(page.getByText('Tax Rates')).toBeVisible();
      await expect(page.getByText('Quote Settings')).toBeVisible();
      await expect(page.getByText('Invoice Settings')).toBeVisible();
      await expect(page.getByText('Email Templates')).toBeVisible();
      await expect(page.getByText('Payment Settings')).toBeVisible();
    });

    test('should navigate to business profile', async ({ page }) => {
      await page.goto('/settings');

      await page.getByRole('link', { name: /business profile/i }).click();

      await expect(page).toHaveURL(/\/settings\/business/);
    });

    test('should navigate to branding', async ({ page }) => {
      await page.goto('/settings');

      await page.getByRole('link', { name: /branding/i }).click();

      await expect(page).toHaveURL(/\/settings\/branding/);
    });

    test('should navigate to tax rates', async ({ page }) => {
      await page.goto('/settings');

      await page.getByRole('link', { name: /tax rates/i }).click();

      await expect(page).toHaveURL(/\/settings\/tax-rates/);
    });

    test('should navigate to payment settings', async ({ page }) => {
      await page.goto('/settings');

      await page.getByRole('link', { name: /payment settings/i }).click();

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

      await expect(page.getByText(/stripe|payment/i)).toBeVisible();
    });
  });

  test.describe('Email Settings', () => {
    test('should display email settings', async ({ page }) => {
      await page.goto('/settings/emails');

      await expect(page.getByText(/email|templates/i)).toBeVisible();
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
