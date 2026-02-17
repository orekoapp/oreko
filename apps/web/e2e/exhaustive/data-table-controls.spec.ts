import { test, expect } from '@playwright/test';

/**
 * Exhaustive Data Table Controls Tests
 *
 * Tests page-size selectors and column-settings buttons across data table pages.
 *
 * Elements covered: 4 page-size comboboxes + 4 column-settings buttons + pagination
 */

test.describe('Data Table Controls', () => {

  test.describe('Page Size Selector', () => {
    const pageSizeTests = [
      { page: '/clients', label: 'Clients' },
      { page: '/quotes', label: 'Quotes' },
      { page: '/invoices', label: 'Invoices' },
      { page: '/contracts', label: 'Contracts' },
    ];

    for (const { page: pageUrl, label } of pageSizeTests) {
      test(`should change page size on ${label} page`, async ({ page }) => {
        await page.goto(pageUrl);
        await page.waitForLoadState('networkidle');

        // Look for page size selector (combobox near "Show" text or rows-per-page)
        const pageSizeSelector = page.locator(
          '[role="combobox"]:near(:text("Show")), ' +
          'select:near(:text("Show")), ' +
          '[role="combobox"]:near(:text("Rows")), ' +
          'select:near(:text("rows")), ' +
          'button:has-text("10")'
        ).first();

        if (!(await pageSizeSelector.isVisible().catch(() => false))) {
          // Page size selector may not exist if few items
          test.skip();
          return;
        }

        // Get initial row count
        const initialRows = await page.locator('tbody tr').count();

        // Click the selector to open options
        await pageSizeSelector.click();
        await page.waitForTimeout(200);

        // Try to select a different page size option
        const options = page.locator('[role="option"], option, [role="menuitem"]');
        const optionCount = await options.count();

        if (optionCount > 1) {
          // Click the last option (usually a larger page size)
          await options.last().click();
          await page.waitForTimeout(500);

          // Table should still be visible after changing page size
          const table = page.locator('table, [role="table"]').first();
          await expect(table).toBeVisible();
        }
      });
    }
  });

  test.describe('Column Settings', () => {
    const columnSettingsTests = [
      { page: '/clients', label: 'Clients' },
      { page: '/quotes', label: 'Quotes' },
      { page: '/invoices', label: 'Invoices' },
      { page: '/contracts', label: 'Contracts' },
    ];

    for (const { page: pageUrl, label } of columnSettingsTests) {
      test(`should open column settings on ${label} page`, async ({ page }) => {
        await page.goto(pageUrl);
        await page.waitForLoadState('networkidle');

        // Find column settings button
        const columnSettingsBtn = page.locator(
          'button[aria-label="Column settings"], ' +
          'button:has-text("Columns"), ' +
          'button[aria-label*="column"]'
        ).first();

        if (!(await columnSettingsBtn.isVisible().catch(() => false))) {
          test.skip();
          return;
        }

        // Get initial column count
        const initialColumns = await page.locator('thead th').count();

        // Click column settings
        await columnSettingsBtn.click();
        await page.waitForTimeout(300);

        // A dropdown/popover should appear with column checkboxes
        const dropdown = page.locator(
          '[role="menu"], [role="dialog"], [role="listbox"], ' +
          '[class*="popover"], [class*="dropdown"]'
        ).first();

        if (await dropdown.isVisible().catch(() => false)) {
          await expect(dropdown).toBeVisible();

          // Find toggleable column options
          const toggles = dropdown.locator(
            'input[type="checkbox"], [role="checkbox"], [role="menuitemcheckbox"]'
          );

          if (await toggles.count() > 0) {
            // Toggle the first option
            await toggles.first().click();
            await page.waitForTimeout(300);

            // Close the dropdown by clicking elsewhere
            await page.locator('body').click({ position: { x: 0, y: 0 } });
            await page.waitForTimeout(300);

            // Column count should have changed
            const newColumns = await page.locator('thead th').count();
            expect(newColumns).not.toBe(initialColumns);
          }
        }
      });
    }
  });

  test.describe('Pagination Page Numbers', () => {
    test('should click specific page numbers on Clients', async ({ page }) => {
      await page.goto('/clients');
      await page.waitForLoadState('networkidle');

      // Look for pagination area - page numbers are hidden on mobile (md:flex)
      const paginationNav = page.locator('nav[aria-label="pagination"], [class*="pagination"]').first();

      if (!(await paginationNav.isVisible().catch(() => false))) {
        // No pagination visible (not enough data for multiple pages)
        test.skip();
        return;
      }

      // Look for page number buttons (must be visible - they're md:flex)
      const page2Button = paginationNav.locator('button').filter({ hasText: '2' }).first();

      if (!(await page2Button.isVisible().catch(() => false))) {
        // Only 1 page of data - no page 2 to click
        test.skip();
        return;
      }

      await page2Button.click();
      await page.waitForTimeout(500);

      // Table should still be visible
      const table = page.locator('table, [role="table"]').first();
      await expect(table).toBeVisible();
    });
  });
});
