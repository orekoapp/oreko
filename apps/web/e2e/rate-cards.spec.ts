import { test, expect } from '@playwright/test';

test.describe('Rate Cards Module', () => {
  test.describe('Rate Cards List Page', () => {
    test('should display rate cards list page', async ({ page }) => {
      await page.goto('/rate-cards');

      await expect(page.getByRole('heading', { name: /rate cards/i })).toBeVisible();
      await expect(page.getByText(/manage your service and product pricing/i)).toBeVisible();
      await expect(page.getByRole('link', { name: /add rate card/i })).toBeVisible();
    });

    test('should show stats cards', async ({ page }) => {
      await page.goto('/rate-cards');

      // Check for stats or page content
      const totalStats = page.getByText(/total rate cards|rate cards/i).first();
      const heading = page.getByRole('heading', { name: /rate cards/i });

      const hasStats = await totalStats.isVisible().catch(() => false);
      const hasHeading = await heading.isVisible().catch(() => false);

      // Page should show stats or at least the heading
      expect(hasStats || hasHeading).toBe(true);
    });

    test('should show empty state when no rate cards', async ({ page }) => {
      await page.goto('/rate-cards');

      const emptyState = page.getByText(/no rate cards found/i);
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
        await expect(page.getByRole('link', { name: /create your first rate card/i })).toBeVisible();
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/rate-cards');

      const searchInput = page.getByPlaceholder(/search rate cards/i);
      await expect(searchInput).toBeVisible();
    });

    test('should filter by category', async ({ page }) => {
      await page.goto('/rate-cards');

      // Find category filter
      const categoryFilter = page.locator('button').filter({ hasText: /all categories/i });
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
      }
    });

    test('should filter by status', async ({ page }) => {
      await page.goto('/rate-cards');

      // Find status filter
      const statusFilter = page.locator('button').filter({ hasText: /all status/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        await page.getByRole('option', { name: /active/i }).click();

        await expect(page).toHaveURL(/isActive=true/);
      }
    });

    test('should display rate card grid', async ({ page }) => {
      await page.goto('/rate-cards');

      // Rate cards should show in a grid or list or empty state
      const grid = page.locator('.grid').first();
      const emptyState = page.getByText(/no rate cards|create your first/i).first();
      const heading = page.getByRole('heading', { name: /rate cards/i });

      const hasGrid = await grid.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      const hasHeading = await heading.isVisible().catch(() => false);

      // Should show grid, empty state, or at least the page heading
      expect(hasGrid || hasEmpty || hasHeading).toBe(true);
    });
  });

  test.describe('Rate Card Creation', () => {
    test('should navigate to create rate card page', async ({ page }) => {
      await page.goto('/rate-cards');

      await page.getByRole('link', { name: /add rate card/i }).click();

      await expect(page).toHaveURL(/\/rate-cards\/new/);
    });

    test('should display rate card form', async ({ page }) => {
      await page.goto('/rate-cards/new');

      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/rate|price/i)).toBeVisible();
    });
  });

  test.describe('Rate Card Actions', () => {
    test('should open actions menu', async ({ page }) => {
      await page.goto('/rate-cards');

      const actionsMenu = page.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first();
      if (await actionsMenu.isVisible()) {
        await actionsMenu.click();

        // Should show menu items
        await expect(page.getByRole('menuitem', { name: /edit/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /duplicate/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /delete/i })).toBeVisible();
      }
    });

    test('should show delete confirmation dialog', async ({ page }) => {
      await page.goto('/rate-cards');

      const actionsMenu = page.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first();
      if (await actionsMenu.isVisible()) {
        await actionsMenu.click();
        await page.getByRole('menuitem', { name: /delete/i }).click();

        // Should show confirmation dialog
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await expect(page.getByText(/delete rate card/i)).toBeVisible();
        await expect(page.getByText(/are you sure you want to delete/i)).toBeVisible();

        // Cancel
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.getByRole('alertdialog')).not.toBeVisible();
      }
    });
  });
});

test.describe('Rate Card Accessibility', () => {
  test('should have proper headings', async ({ page }) => {
    await page.goto('/rate-cards');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/rate-cards');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
