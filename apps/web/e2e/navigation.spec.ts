import { test, expect } from '@playwright/test';

test.describe('Public Navigation', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/login');

    // Page should have proper title
    await expect(page).toHaveTitle(/oreko/i);
  });

  test('should have proper page structure on login', async ({ page }) => {
    await page.goto('/login');

    // Login page should have content container
    const container = page.locator('div').filter({ hasText: /welcome back/i }).first();
    await expect(container).toBeVisible();
  });

  test('should display 404 page for unknown routes', async ({ page }) => {
    await page.goto('/non-existent-page-12345');

    // Should show 404 content
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test('should have go back and home buttons on 404', async ({ page }) => {
    await page.goto('/non-existent-page-12345');

    // Should have navigation buttons
    await expect(page.getByRole('link', { name: /go back/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  });
});

test.describe('Landing Page Navigation', () => {
  test('should show landing page at root', async ({ page }) => {
    await page.goto('/');

    // Should show landing page content (use first() as there are multiple headings with this text)
    await expect(page.getByRole('heading', { name: /beautiful invoices/i }).first()).toBeVisible();
  });

  test('should have login CTA', async ({ page }) => {
    await page.goto('/');

    // Should have sign in link in header
    const signInLink = page.getByRole('link', { name: /sign in|login/i });
    await expect(signInLink.first()).toBeVisible();
  });

  test('should have get started CTA', async ({ page }) => {
    await page.goto('/');

    // Should have get started button
    const ctaButton = page.getByRole('link', { name: /get started|sign up/i });
    await expect(ctaButton.first()).toBeVisible();
  });
});
