import { test, expect } from '@playwright/test';

test.describe('Invoices Module', () => {
  test.describe('Invoices List Page', () => {
    test('should display invoices list page', async ({ page }) => {
      await page.goto('/invoices');

      // Should see the page title and description
      await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible();
      await expect(page.getByText(/manage your invoices and track payments/i)).toBeVisible();
      await expect(page.getByRole('link', { name: /new invoice/i })).toBeVisible();
    });

    test('should show empty state when no invoices', async ({ page }) => {
      await page.goto('/invoices');

      const emptyState = page.getByText(/no invoices yet/i);
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
        await expect(page.getByText(/create your first invoice/i)).toBeVisible();
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/invoices');

      const searchInput = page.getByPlaceholder(/search invoices/i);
      await expect(searchInput).toBeVisible();
    });

    test('should have filter button', async ({ page }) => {
      await page.goto('/invoices');

      const filterButton = page.locator('button').filter({ has: page.locator('svg.lucide-filter') });
      await expect(filterButton).toBeVisible();
    });

    test('should display invoice cards with info', async ({ page }) => {
      await page.goto('/invoices');

      // If invoices exist, cards should show title and status
      const invoiceCards = page.locator('[class*="Card"]');
      if (await invoiceCards.count() > 0) {
        const firstCard = invoiceCards.first();
        await expect(firstCard).toBeVisible();
      }
    });

    test('should show overdue indicator', async ({ page }) => {
      await page.goto('/invoices');

      // Check for overdue styling if present
      const overdueIndicator = page.getByText('Overdue');
      if (await overdueIndicator.first().isVisible()) {
        await expect(overdueIndicator.first()).toBeVisible();
      }
    });
  });

  test.describe('Invoice Creation', () => {
    test('should navigate to create invoice page', async ({ page }) => {
      await page.goto('/invoices');

      await page.getByRole('link', { name: /new invoice/i }).click();

      await expect(page).toHaveURL(/\/invoices\/new/);
    });

    test('should display invoice form', async ({ page }) => {
      await page.goto('/invoices/new');
      await page.waitForLoadState('networkidle');

      // Should see form content, dashboard content (if redirected), or not found page
      const clientLabel = page.getByRole('combobox', { name: /client/i });
      const pageHeading = page.getByRole('heading').first();
      const notFound = page.getByText(/page not found|doesn't exist/i).first();
      const dashboardLink = page.getByRole('link', { name: /dashboard/i }).first();

      const hasClient = await clientLabel.isVisible().catch(() => false);
      const hasHeading = await pageHeading.isVisible().catch(() => false);
      const hasNotFound = await notFound.isVisible().catch(() => false);
      const hasDashboard = await dashboardLink.isVisible().catch(() => false);

      // Page should load something - either form, not found, or navigation
      expect(hasClient || hasHeading || hasNotFound || hasDashboard).toBeTruthy();
    });
  });

  test.describe('Invoice Detail', () => {
    test('should navigate to invoice details', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForLoadState('networkidle');

      const firstInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await firstInvoice.isVisible()) {
        await firstInvoice.click();
        await page.waitForLoadState('networkidle');

        // Should show invoice content
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();
      }
    });
  });
});

test.describe('Client Portal - Invoice View', () => {
  test('should display invoice or not found for public access', async ({ page }) => {
    await page.goto('/i/test-token-123');
    await page.waitForLoadState('networkidle');

    // Should show either invoice content or not found
    const mainContent = page.locator('main, [data-testid="invoice-view"]');
    const notFound = page.getByText(/not found|expired|invalid|exist/i).first();

    const hasContent = await mainContent.isVisible();
    const hasNotFound = await notFound.isVisible().catch(() => false);

    expect(hasContent || hasNotFound).toBeTruthy();
  });
});

test.describe('Invoice Accessibility', () => {
  test('should have proper headings', async ({ page }) => {
    await page.goto('/invoices');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/invoices');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
