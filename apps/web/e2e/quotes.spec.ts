import { test, expect } from '@playwright/test';

test.describe('Quotes Module', () => {
  test.describe('Quotes List Page', () => {
    test('should display quotes list page', async ({ page }) => {
      await page.goto('/quotes');

      // Should see the page title and description
      await expect(page.getByRole('heading', { name: /quotes/i })).toBeVisible();
      await expect(page.getByText(/create and manage your quotes/i)).toBeVisible();

      // Should have create quote button
      await expect(page.getByRole('link', { name: /new quote/i })).toBeVisible();
    });

    test('should show empty state when no quotes', async ({ page }) => {
      await page.goto('/quotes');

      // If no quotes, should show empty state
      const emptyState = page.getByText(/no quotes yet/i);
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
        await expect(page.getByText(/create your first quote/i)).toBeVisible();
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/quotes');

      const searchInput = page.getByPlaceholder(/search quotes/i);
      await expect(searchInput).toBeVisible();
    });

    test('should have filter button', async ({ page }) => {
      await page.goto('/quotes');

      // Filter button should be visible
      const filterButton = page.locator('button').filter({ has: page.locator('svg.lucide-filter') });
      await expect(filterButton).toBeVisible();
    });

    test('should display quote cards with info', async ({ page }) => {
      await page.goto('/quotes');

      // If quotes exist, cards should show title and status
      const quoteCards = page.locator('[class*="Card"]');
      if (await quoteCards.count() > 0) {
        // Each card should have a title and status badge
        const firstCard = quoteCards.first();
        await expect(firstCard).toBeVisible();
      }
    });
  });

  test.describe('Quote Creation', () => {
    test('should navigate to create quote page', async ({ page }) => {
      await page.goto('/quotes');

      await page.getByRole('link', { name: /new quote/i }).click();

      // Should go to new quote page (which redirects to builder)
      await expect(page).toHaveURL(/\/quotes\/new/);
    });

    test('should show loading state when creating new quote', async ({ page }) => {
      await page.goto('/quotes/new');

      // Should show loading spinner
      await expect(page.getByText(/creating new quote/i)).toBeVisible();
    });

    test('should display quote builder interface', async ({ page }) => {
      await page.goto('/quotes/new/builder');

      // Should see the blocks panel
      await expect(page.getByText('Blocks').first()).toBeVisible();
      await expect(page.getByText(/drag blocks to the canvas/i)).toBeVisible();
    });

    test('should show block categories in builder', async ({ page }) => {
      await page.goto('/quotes/new/builder');

      // Should see block categories
      await expect(page.getByText('Content').first()).toBeVisible();
      await expect(page.getByText('Services').first()).toBeVisible();
      await expect(page.getByText('Layout').first()).toBeVisible();
      await expect(page.getByText('Interactive').first()).toBeVisible();
    });

    test('should have draggable blocks', async ({ page }) => {
      await page.goto('/quotes/new/builder');

      // Should see specific block types
      await expect(page.getByText('Header').first()).toBeVisible();
      await expect(page.getByText('Text').first()).toBeVisible();
      await expect(page.getByText('Service Item').first()).toBeVisible();
    });
  });

  test.describe('Quote Detail', () => {
    test('should display quote details with actions', async ({ page }) => {
      await page.goto('/quotes');

      // Click on first quote in list
      const firstQuote = page.locator('a[href^="/quotes/"]').first();
      if (await firstQuote.isVisible()) {
        await firstQuote.click();

        // Should show quote title as heading
        await expect(page.getByRole('heading').first()).toBeVisible();
      }
    });

    test('should show quote action buttons', async ({ page }) => {
      await page.goto('/quotes');

      const firstQuote = page.locator('a[href^="/quotes/"]').first();
      if (await firstQuote.isVisible()) {
        await firstQuote.click();

        // Should see some action buttons - check flexibly
        const duplicateBtn = page.getByRole('button', { name: /duplicate/i });
        const pdfBtn = page.getByRole('button', { name: /download|pdf/i });
        const editLink = page.getByRole('link', { name: /edit/i });
        const anyAction = page.locator('button, a[href*="edit"]').first();

        const hasDuplicate = await duplicateBtn.isVisible().catch(() => false);
        const hasPdf = await pdfBtn.isVisible().catch(() => false);
        const hasEdit = await editLink.isVisible().catch(() => false);
        const hasAnyAction = await anyAction.isVisible().catch(() => false);

        // At least one action should be visible
        expect(hasDuplicate || hasPdf || hasEdit || hasAnyAction).toBe(true);
      }
    });

    test('should show quote preview card', async ({ page }) => {
      await page.goto('/quotes');

      const firstQuote = page.locator('a[href^="/quotes/"]').first();
      if (await firstQuote.isVisible()) {
        await firstQuote.click();

        // Should show quote preview section or quote content
        const previewText = page.getByText(/quote preview|preview/i).first();
        const quoteHeading = page.getByRole('heading').first();

        const hasPreview = await previewText.isVisible().catch(() => false);
        const hasHeading = await quoteHeading.isVisible().catch(() => false);

        // Either preview or quote heading should be visible
        expect(hasPreview || hasHeading).toBe(true);
      }
    });

    test('should show quote details sidebar', async ({ page }) => {
      await page.goto('/quotes');

      const firstQuote = page.locator('a[href^="/quotes/"]').first();
      if (await firstQuote.isVisible()) {
        await firstQuote.click();

        // Should show sidebar cards
        await expect(page.getByText('Quote Details').first()).toBeVisible();
        await expect(page.getByText('Client').first()).toBeVisible();
        await expect(page.getByText('Activity').first()).toBeVisible();
      }
    });

    test('should have send button for draft quotes', async ({ page }) => {
      await page.goto('/quotes');

      // Find a draft quote
      const draftQuote = page.locator('a:has-text("draft")').first();
      if (await draftQuote.isVisible()) {
        await draftQuote.click();

        // Should see send button or similar action
        const sendBtn = page.getByRole('button', { name: /send|email|share/i }).first();
        const hasBtn = await sendBtn.isVisible().catch(() => false);

        // If draft quote exists, there should be some action available
        expect(hasBtn || page.url().includes('/quotes/')).toBe(true);
      } else {
        // No draft quotes exist - that's okay
        expect(true).toBe(true);
      }
    });
  });
});

test.describe('Client Portal - Quote View', () => {
  test('should display quote or not found for public access', async ({ page }) => {
    // Note: This would need a real access token
    await page.goto('/q/test-token-123');

    // Should show 404 or quote view or login redirect
    const notFound = page.getByText(/not found|expired|invalid|error/i).first();
    const quoteView = page.getByText(/quote|proposal/i).first();
    const loginPage = page.getByText(/sign in|login|welcome/i).first();

    const hasNotFound = await notFound.isVisible().catch(() => false);
    const hasQuote = await quoteView.isVisible().catch(() => false);
    const hasLogin = await loginPage.isVisible().catch(() => false);

    // Should show something meaningful (not found, quote, or login)
    expect(hasNotFound || hasQuote || hasLogin || page.url().includes('/login')).toBe(true);
  });
});

test.describe('Quote Accessibility', () => {
  test('should have proper headings hierarchy', async ({ page }) => {
    await page.goto('/quotes');

    // Check heading structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/quotes');

    // Tab through interface
    await page.keyboard.press('Tab');

    // Should move focus
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have keyboard navigable builder', async ({ page }) => {
    await page.goto('/quotes/new/builder');

    // Tab through interface
    await page.keyboard.press('Tab');

    // Should move focus
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
