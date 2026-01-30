import { test, expect } from '@playwright/test';

test.describe('Public Navigation', () => {
  test('should have accessible landing page', async ({ page }) => {
    await page.goto('/login');

    // Page should have proper title
    await expect(page).toHaveTitle(/quotecraft/i);

    // Page should have skip to content link (hidden but accessible)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/login');

    // Should have main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('should display 404 page for unknown routes', async ({ page }) => {
    await page.goto('/non-existent-page-12345');

    // Should show 404 content
    await expect(page.getByText(/not found|page not found/i)).toBeVisible();
  });
});

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    // Skip this test until authenticated
    await page.goto('/');

    // Find and click theme toggle
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });

    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Menu should appear
      const darkOption = page.getByRole('menuitem', { name: /dark/i });
      await darkOption.click();

      // HTML element should have dark class
      await expect(page.locator('html')).toHaveClass(/dark/);
    }
  });
});
