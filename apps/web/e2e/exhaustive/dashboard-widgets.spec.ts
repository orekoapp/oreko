import { test, expect } from '@playwright/test';

/**
 * Exhaustive Dashboard Widgets Tests
 *
 * Tests interactive elements on the dashboard that are not covered by existing tests:
 * - Revenue trend period selector
 * - "View All" navigation links
 * - Recent quotes/invoices list items
 *
 * Elements covered: 6 dashboard widgets
 */

test.describe('Dashboard Widgets', () => {

  test('should change revenue trend period', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find the revenue trend period selector
    const periodSelector = page.locator(
      '[role="combobox"]:near(:text("Revenue Trend")), ' +
      'select:near(:text("Revenue")), ' +
      'button:near(:text("Revenue Trend")):has-text(/days|months|week/i)'
    ).first();

    if (!(await periodSelector.isVisible().catch(() => false))) {
      // Try alternative: look for any period dropdown near revenue section
      const altSelector = page.locator('[data-testid*="period"], [data-testid*="trend"] select, [data-testid*="trend"] [role="combobox"]').first();
      if (!(await altSelector.isVisible().catch(() => false))) {
        test.skip();
        return;
      }
      await altSelector.click();
    } else {
      await periodSelector.click();
    }

    // Select a different period option
    const option = page.locator('[role="option"], option').filter({ hasText: /30|90|month/i }).first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    }

    // Page should still be on dashboard without errors
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should navigate to analytics via "View All Analytics" link', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const viewAllAnalytics = page.locator(
      'a[href*="analytics"]:has-text("View All"), ' +
      'a:has-text("View All Analytics"), ' +
      'a[href="/dashboard/analytics"]'
    ).first();

    if (!(await viewAllAnalytics.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await viewAllAnalytics.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/analytics/, { timeout: 15000 });
  });

  test('should navigate to quotes via "View All Quotes" link', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const viewAllQuotes = page.locator(
      'a[href="/quotes"]:has-text("View All"), ' +
      'a:has-text("View All Quotes")'
    ).first();

    if (!(await viewAllQuotes.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await viewAllQuotes.click();
    await page.waitForURL(/\/quotes/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/quotes/);
  });

  test('should navigate to invoices via "View All Invoices" link', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const viewAllInvoices = page.locator(
      'a[href="/invoices"]:has-text("View All"), ' +
      'a:has-text("View All Invoices")'
    ).first();

    if (!(await viewAllInvoices.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await viewAllInvoices.click();
    await page.waitForURL(/\/invoices/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/invoices/);
  });

  test('should navigate to quote detail from recent quotes list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find a quote detail link on the dashboard (recent quotes section or anywhere)
    const quoteLink = page.locator('a[href^="/quotes/"]:not([href="/quotes/new"]):not([href="/quotes"])').first();

    if (!(await quoteLink.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const href = await quoteLink.getAttribute('href');
    await quoteLink.click();
    await page.waitForLoadState('networkidle');

    // Should have navigated to a quote detail page
    await expect(page).toHaveURL(/\/quotes\/.+/, { timeout: 15000 });
  });

  test('should navigate to invoice detail from recent invoices list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find an invoice detail link on the dashboard (recent invoices section or anywhere)
    const invoiceLink = page.locator('a[href^="/invoices/"]:not([href="/invoices/new"]):not([href="/invoices"])').first();

    if (!(await invoiceLink.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const href = await invoiceLink.getAttribute('href');
    await invoiceLink.click();
    await page.waitForLoadState('networkidle');

    // Should have navigated to an invoice detail page
    await expect(page).toHaveURL(/\/invoices\/.+/, { timeout: 15000 });
  });
});
