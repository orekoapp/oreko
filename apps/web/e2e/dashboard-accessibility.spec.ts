import { test, expect } from '@playwright/test';

/**
 * Dashboard Accessibility Tests
 * These tests require authentication and run in the 'authenticated' project
 */
test.describe('Dashboard Accessibility', () => {
  test.describe('Skip to Content', () => {
    test('should have skip to content link in dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Skip link should exist in dashboard layout
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeAttached();
    });

    test('skip link should be focusable in dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Tab to first focusable element (should be skip link)
      await page.keyboard.press('Tab');

      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeFocused();
    });

    test('skip link should navigate to main content', async ({ page }) => {
      await page.goto('/dashboard');

      // Focus and activate skip link
      const skipLink = page.locator('a[href="#main-content"]');
      await skipLink.focus();
      await skipLink.click();

      // Main content should be focused
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    });
  });

  test.describe('Landmarks', () => {
    test('should have main landmark in dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      const main = page.locator('main, [role="main"]');
      await expect(main).toBeAttached();
    });

    test('should have main element with id in dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      const main = page.locator('main#main-content');
      await expect(main).toBeAttached();
    });

    test('should have navigation landmark', async ({ page }) => {
      await page.goto('/dashboard');

      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav.first()).toBeAttached();
    });
  });

  test.describe('Dashboard Headings', () => {
    test('should have h1 heading on dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      const h1 = page.locator('h1');
      await expect(h1.first()).toBeVisible();
    });
  });

  test.describe('Dashboard Keyboard Navigation', () => {
    test('should be able to navigate sidebar with keyboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Tab through focusable elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }

      // Should have focused element
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    });
  });
});
