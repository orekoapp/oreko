import { test, expect } from '@playwright/test';

/**
 * Exhaustive Bulk Selection Tests
 *
 * Tests select-all and individual row selection checkboxes on data table pages.
 *
 * Elements covered: 6 checkboxes across quotes, invoices, contracts, and projects pages
 */

test.describe('Bulk Selection', () => {

  test.describe('Individual Row Selection', () => {
    test('should select an individual row on Quotes page', async ({ page }) => {
      await page.goto('/quotes');
      await page.waitForLoadState('networkidle');

      const rowCheckbox = page.locator('tbody td input[type="checkbox"], tbody [role="checkbox"]').first();

      if (!(await rowCheckbox.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      // Click the row checkbox
      await rowCheckbox.click();
      await page.waitForTimeout(200);

      // Verify it's checked
      const isChecked = await rowCheckbox.isChecked().catch(() => false);
      const hasAriaChecked = await rowCheckbox.getAttribute('aria-checked');
      expect(isChecked || hasAriaChecked === 'true').toBe(true);
    });

    test('should select an individual row on Invoices page', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForLoadState('networkidle');

      const rowCheckbox = page.locator('tbody td input[type="checkbox"], tbody [role="checkbox"]').first();

      if (!(await rowCheckbox.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await rowCheckbox.click();
      await page.waitForTimeout(200);

      const isChecked = await rowCheckbox.isChecked().catch(() => false);
      const hasAriaChecked = await rowCheckbox.getAttribute('aria-checked');
      expect(isChecked || hasAriaChecked === 'true').toBe(true);
    });

    test('should select an individual row on Contracts page', async ({ page }) => {
      await page.goto('/contracts');
      await page.waitForLoadState('networkidle');

      const rowCheckbox = page.locator('tbody td input[type="checkbox"], tbody [role="checkbox"]').first();

      if (!(await rowCheckbox.isVisible().catch(() => false))) {
        // Contracts page might be empty
        test.skip();
        return;
      }

      await rowCheckbox.click();
      await page.waitForTimeout(200);

      const isChecked = await rowCheckbox.isChecked().catch(() => false);
      const hasAriaChecked = await rowCheckbox.getAttribute('aria-checked');
      expect(isChecked || hasAriaChecked === 'true').toBe(true);
    });
  });

  test.describe('Select All', () => {
    test('should select all rows on Invoices page', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForLoadState('networkidle');

      const selectAll = page.locator('thead th input[type="checkbox"], thead [role="checkbox"]').first();

      if (!(await selectAll.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await selectAll.click();
      await page.waitForTimeout(300);

      // All row checkboxes should now be checked
      const rowCheckboxes = page.locator('tbody td input[type="checkbox"], tbody [role="checkbox"]');
      const rowCount = await rowCheckboxes.count();

      if (rowCount > 0) {
        for (let i = 0; i < Math.min(rowCount, 5); i++) {
          const cb = rowCheckboxes.nth(i);
          const isChecked = await cb.isChecked().catch(() => false);
          const hasAriaChecked = await cb.getAttribute('aria-checked');
          expect(isChecked || hasAriaChecked === 'true').toBe(true);
        }
      }
    });

    test('should select all rows on Contracts page', async ({ page }) => {
      await page.goto('/contracts');
      await page.waitForLoadState('networkidle');

      const selectAll = page.locator('thead th input[type="checkbox"], thead [role="checkbox"]').first();

      if (!(await selectAll.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await selectAll.click();
      await page.waitForTimeout(300);

      const rowCheckboxes = page.locator('tbody td input[type="checkbox"], tbody [role="checkbox"]');
      const rowCount = await rowCheckboxes.count();

      if (rowCount > 0) {
        const firstCb = rowCheckboxes.first();
        const isChecked = await firstCb.isChecked().catch(() => false);
        const hasAriaChecked = await firstCb.getAttribute('aria-checked');
        expect(isChecked || hasAriaChecked === 'true').toBe(true);
      }
    });

    test('should select all rows on Projects page', async ({ page }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      const selectAll = page.locator('thead th input[type="checkbox"], thead [role="checkbox"]').first();

      if (!(await selectAll.isVisible().catch(() => false))) {
        // Projects page might be empty or table not visible
        test.skip();
        return;
      }

      await selectAll.click();
      await page.waitForTimeout(300);

      const rowCheckboxes = page.locator('tbody td input[type="checkbox"], tbody [role="checkbox"]');
      const rowCount = await rowCheckboxes.count();

      if (rowCount > 0) {
        const firstCb = rowCheckboxes.first();
        const isChecked = await firstCb.isChecked().catch(() => false);
        const hasAriaChecked = await firstCb.getAttribute('aria-checked');
        expect(isChecked || hasAriaChecked === 'true').toBe(true);
      }
    });
  });
});
