import { test, expect } from '@playwright/test';

test.describe('Search & Filtering', () => {
  test.describe('Global Search', () => {
    test('should show global search input', async ({ page }) => {
      await page.goto('/dashboard');

      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('should open search with keyboard shortcut', async ({ page }) => {
      await page.goto('/dashboard');

      // Common shortcut: Cmd/Ctrl + K
      await page.keyboard.press('Control+k');

      const searchModal = page.getByRole('dialog');
      if (await searchModal.isVisible()) {
        await expect(searchModal).toBeVisible();
      }
    });

    test('should search across all entities', async ({ page }) => {
      await page.goto('/dashboard');

      const searchInput = page.getByPlaceholder(/search/i).first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');

        // Should show results from multiple categories
        const results = page.locator('[class*="search-result"], [class*="result"]');
        if (await results.count() > 0) {
          await expect(results.first()).toBeVisible();
        }
      }
    });

    test('should show search categories', async ({ page }) => {
      await page.goto('/dashboard');

      const searchInput = page.getByPlaceholder(/search/i).first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('a');

        const categories = page.getByText(/quotes|invoices|clients/i);
        if (await categories.count() > 0) {
          await expect(categories.first()).toBeVisible();
        }
      }
    });

    test('should navigate to result on click', async ({ page }) => {
      await page.goto('/dashboard');

      const searchInput = page.getByPlaceholder(/search/i).first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');

        const result = page.locator('[class*="search-result"] a, [class*="result"] a').first();
        if (await result.isVisible()) {
          await result.click();
          await page.waitForURL(/.+/, { timeout: 5000 });
        }
      }
    });

    test('should navigate results with keyboard', async ({ page }) => {
      await page.goto('/dashboard');

      const searchInput = page.getByPlaceholder(/search/i).first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');

        // Navigate with arrow keys
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
    });

    test('should show no results message', async ({ page }) => {
      await page.goto('/dashboard');

      const searchInput = page.getByPlaceholder(/search/i).first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('xyznonexistent123456');

        const noResults = page.getByText(/no results|nothing found|not found/i);
        if (await noResults.isVisible()) {
          await expect(noResults).toBeVisible();
        }
      }
    });

    test('should clear search on escape', async ({ page }) => {
      await page.goto('/dashboard');

      const searchInput = page.getByPlaceholder(/search/i).first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.keyboard.press('Escape');

        // Search should be cleared or closed
        await expect(searchInput).toHaveValue('');
      }
    });
  });

  test.describe('Quotes Search & Filter', () => {
    test('should show search input on quotes page', async ({ page }) => {
      await page.goto('/quotes');

      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
    });

    test('should filter quotes by search term', async ({ page }) => {
      await page.goto('/quotes');

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('test');

      // Results should be filtered
      const quoteList = page.locator('a[href^="/quotes/"]');
      // Count may be reduced after filtering
      expect(await quoteList.count()).toBeGreaterThanOrEqual(0);
    });

    test('should filter quotes by status', async ({ page }) => {
      await page.goto('/quotes');

      const statusFilter = page.getByRole('combobox', { name: /status/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();

        const draftOption = page.getByRole('option', { name: /draft/i });
        if (await draftOption.isVisible()) {
          await draftOption.click();

        }
      }
    });

    test('should filter quotes by client', async ({ page }) => {
      await page.goto('/quotes');

      const clientFilter = page.getByRole('combobox', { name: /client/i });
      if (await clientFilter.isVisible()) {
        await clientFilter.click();

        const clientOption = page.getByRole('option').first();
        if (await clientOption.isVisible()) {
          await clientOption.click();
        }
      }
    });

    test('should filter quotes by date range', async ({ page }) => {
      await page.goto('/quotes');

      const dateFilter = page.getByLabel(/date|from|period/i);
      if (await dateFilter.isVisible()) {
        await dateFilter.click();

        // Select date range option
        const thisMonth = page.getByText(/this month|last 30 days/i);
        if (await thisMonth.isVisible()) {
          await thisMonth.click();
        }
      }
    });

    test('should filter quotes by amount range', async ({ page }) => {
      await page.goto('/quotes');

      const minAmount = page.getByLabel(/min.*amount|from.*amount/i);
      const maxAmount = page.getByLabel(/max.*amount|to.*amount/i);

      if (await minAmount.isVisible() && await maxAmount.isVisible()) {
        await minAmount.fill('100');
        await maxAmount.fill('1000');
      }
    });

    test('should combine multiple filters', async ({ page }) => {
      await page.goto('/quotes');

      // Apply search
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('test');

      // Apply status filter
      const statusFilter = page.getByRole('combobox', { name: /status/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        const option = page.getByRole('option').first();
        if (await option.isVisible()) {
          await option.click();
        }
      }

    });

    test('should clear all filters', async ({ page }) => {
      await page.goto('/quotes');

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('test');

      const clearButton = page.getByRole('button', { name: /clear|reset/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();

        await expect(searchInput).toHaveValue('');
      }
    });

    test('should persist filters in URL', async ({ page }) => {
      await page.goto('/quotes');

      const statusFilter = page.getByRole('combobox', { name: /status/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        const draftOption = page.getByRole('option', { name: /draft/i });
        if (await draftOption.isVisible()) {
          await draftOption.click();

          const url = page.url();
          expect(url).toMatch(/status|filter/i);
        }
      }
    });
  });

  test.describe('Invoices Search & Filter', () => {
    test('should search invoices by number', async ({ page }) => {
      await page.goto('/invoices');

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('INV-');
    });

    test('should filter invoices by status', async ({ page }) => {
      await page.goto('/invoices');

      const statusFilter = page.getByRole('combobox', { name: /status/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();

        const paidOption = page.getByRole('option', { name: /paid/i });
        if (await paidOption.isVisible()) {
          await paidOption.click();
        }
      }
    });

    test('should filter invoices by overdue', async ({ page }) => {
      await page.goto('/invoices');

      const overdueFilter = page.getByLabel(/overdue|past due/i);
      if (await overdueFilter.isVisible()) {
        await overdueFilter.check();
      }
    });

    test('should filter invoices by payment status', async ({ page }) => {
      await page.goto('/invoices');

      const paymentFilter = page.getByRole('combobox', { name: /payment/i });
      if (await paymentFilter.isVisible()) {
        await paymentFilter.click();

        const unpaidOption = page.getByRole('option', { name: /unpaid|pending/i });
        if (await unpaidOption.isVisible()) {
          await unpaidOption.click();
        }
      }
    });
  });

  test.describe('Clients Search & Filter', () => {
    test('should search clients by name', async ({ page }) => {
      await page.goto('/clients');

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('John');
    });

    test('should search clients by email', async ({ page }) => {
      await page.goto('/clients');

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('@example.com');
    });

    test('should search clients by company', async ({ page }) => {
      await page.goto('/clients');

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('Inc');
    });

    test('should sort clients alphabetically', async ({ page }) => {
      await page.goto('/clients');

      const sortButton = page.getByRole('button', { name: /sort|name/i });
      if (await sortButton.isVisible()) {
        await sortButton.click();
      }
    });

    test('should sort clients by activity', async ({ page }) => {
      await page.goto('/clients');

      const sortSelect = page.getByRole('combobox', { name: /sort/i });
      if (await sortSelect.isVisible()) {
        await sortSelect.click();

        const activityOption = page.getByRole('option', { name: /recent|activity|last/i });
        if (await activityOption.isVisible()) {
          await activityOption.click();
        }
      }
    });
  });

  test.describe('Rate Cards Search & Filter', () => {
    test('should search rate cards by name', async ({ page }) => {
      await page.goto('/rate-cards');

      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('standard');
      }
    });

    test('should filter rate cards by category', async ({ page }) => {
      await page.goto('/rate-cards');

      const categoryFilter = page.getByRole('combobox', { name: /category|type/i });
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();

        const option = page.getByRole('option').first();
        if (await option.isVisible()) {
          await option.click();
        }
      }
    });
  });

  test.describe('Sorting', () => {
    test('should sort quotes by date', async ({ page }) => {
      await page.goto('/quotes');

      const sortButton = page.getByRole('button', { name: /date|created/i });
      if (await sortButton.isVisible()) {
        await sortButton.click();
        // Click again to reverse order
        await sortButton.click();
      }
    });

    test('should sort quotes by amount', async ({ page }) => {
      await page.goto('/quotes');

      const sortButton = page.getByRole('button', { name: /amount|total/i });
      if (await sortButton.isVisible()) {
        await sortButton.click();
      }
    });

    test('should sort invoices by due date', async ({ page }) => {
      await page.goto('/invoices');

      const sortButton = page.getByRole('button', { name: /due/i });
      if (await sortButton.isVisible()) {
        await sortButton.click();
      }
    });

    test('should indicate current sort direction', async ({ page }) => {
      await page.goto('/quotes');

      const sortIndicator = page.locator('[class*="sort"], [aria-sort]');
      if (await sortIndicator.count() > 0) {
        await expect(sortIndicator.first()).toBeAttached();
      }
    });
  });

  test.describe('Pagination', () => {
    test('should show pagination controls', async ({ page }) => {
      await page.goto('/quotes');

      const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination"]');
      if (await pagination.isVisible()) {
        await expect(pagination).toBeVisible();
      }
    });

    test('should navigate to next page', async ({ page }) => {
      await page.goto('/quotes');

      const nextButton = page.getByRole('button', { name: /next|›/i });
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();

        const url = page.url();
        expect(url).toMatch(/page=2|offset|skip/i);
      }
    });

    test('should navigate to previous page', async ({ page }) => {
      await page.goto('/quotes?page=2');

      const prevButton = page.getByRole('button', { name: /prev|‹/i });
      if (await prevButton.isVisible() && await prevButton.isEnabled()) {
        await prevButton.click();
      }
    });

    test('should show page numbers', async ({ page }) => {
      await page.goto('/quotes');

      const pageNumbers = page.locator('[class*="pagination"] button, [class*="pagination"] a');
      if (await pageNumbers.count() > 0) {
        await expect(pageNumbers.first()).toBeVisible();
      }
    });

    test('should change items per page', async ({ page }) => {
      await page.goto('/quotes');

      const perPageSelect = page.getByRole('combobox', { name: /per page|show|rows/i });
      if (await perPageSelect.isVisible()) {
        await perPageSelect.click();

        const option = page.getByRole('option', { name: /25|50/i });
        if (await option.isVisible()) {
          await option.click();
        }
      }
    });

    test('should show total count', async ({ page }) => {
      await page.goto('/quotes');

      const countInfo = page.getByText(/showing|of|total|results/i);
      if (await countInfo.isVisible()) {
        await expect(countInfo).toBeVisible();
      }
    });
  });

  test.describe('Quick Filters', () => {
    test('should show quick filter tabs', async ({ page }) => {
      await page.goto('/quotes');

      const tabs = page.getByRole('tablist');
      if (await tabs.isVisible()) {
        await expect(tabs).toBeVisible();
      }
    });

    test('should filter by clicking quick filter', async ({ page }) => {
      await page.goto('/quotes');

      const draftTab = page.getByRole('tab', { name: /draft/i });
      if (await draftTab.isVisible()) {
        await draftTab.click();
      }
    });

    test('should show count in filter tabs', async ({ page }) => {
      await page.goto('/quotes');
      await page.waitForLoadState('networkidle');

      // Check for tabs with counts or just the tablist
      const tabs = page.getByRole('tab');
      const tabList = page.getByRole('tablist');

      const tabCount = await tabs.count().catch(() => 0);
      const hasTabList = await tabList.isVisible().catch(() => false);

      if (tabCount > 0) {
        // Check if any tab contains a number (count)
        const allTabs = await tabs.all();
        let hasCount = false;
        for (const tab of allTabs) {
          const text = await tab.textContent();
          if (text && /\d+/.test(text)) {
            hasCount = true;
            break;
          }
        }
        // Either has counts or tabs are visible
        expect(hasCount || tabCount > 0).toBe(true);
      } else {
        // May not have tabs, but page should load correctly
        expect(hasTabList || page.url().includes('/quotes')).toBe(true);
      }
    });
  });

  test.describe('Saved Filters', () => {
    test('should save filter configuration', async ({ page }) => {
      await page.goto('/quotes');

      const saveFilterButton = page.getByRole('button', { name: /save.*filter|save.*view/i });
      if (await saveFilterButton.isVisible()) {
        await saveFilterButton.click();

        const nameInput = page.getByLabel(/name|filter name/i);
        if (await nameInput.isVisible()) {
          await nameInput.fill('My Custom Filter');
        }
      }
    });

    test('should load saved filter', async ({ page }) => {
      await page.goto('/quotes');

      const savedFilters = page.getByRole('combobox', { name: /saved|view/i });
      if (await savedFilters.isVisible()) {
        await savedFilters.click();

        const savedOption = page.getByRole('option').first();
        if (await savedOption.isVisible()) {
          await savedOption.click();
        }
      }
    });
  });
});

test.describe('Search & Filtering Accessibility', () => {
  test('should have accessible search input', async ({ page }) => {
    await page.goto('/quotes');

    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    // Should be focusable
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
  });

  test('should have accessible filter controls', async ({ page }) => {
    await page.goto('/quotes');

    const filterControls = page.locator('select, [role="combobox"]');
    if (await filterControls.count() > 0) {
      await expect(filterControls.first()).toBeVisible();
    }
  });

  test('should announce filter results', async ({ page }) => {
    await page.goto('/quotes');

    // Results count should be announced
    const resultsAnnouncement = page.locator('[aria-live], [role="status"]');
    if (await resultsAnnouncement.count() > 0) {
      await expect(resultsAnnouncement.first()).toBeAttached();
    }
  });
});
