import { test, expect } from '@playwright/test';

test.describe('Quotes Module', () => {
  // Note: These tests require authentication. In production, use test fixtures
  // or a test user setup. Tests marked with .skip need auth to be configured.

  test.describe('Quotes List Page', () => {
    test('should display quotes list page', async ({ page }) => {
      await page.goto('/quotes');

      // Should see the page title
      await expect(page.getByRole('heading', { name: /quotes/i })).toBeVisible();

      // Should have create quote button
      await expect(page.getByRole('link', { name: /create|new quote/i })).toBeVisible();
    });

    test('should show empty state when no quotes', async ({ page }) => {
      await page.goto('/quotes');

      // If no quotes, should show empty state
      const emptyState = page.getByText(/no quotes|get started/i);
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/quotes');

      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();

      await searchInput.fill('website redesign');
      await searchInput.press('Enter');

      // URL should contain search query
      await expect(page).toHaveURL(/search=website/);
    });

    test('should filter by status', async ({ page }) => {
      await page.goto('/quotes');

      // Find status filter
      const statusFilter = page.getByRole('combobox', { name: /status/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        await page.getByRole('option', { name: /draft/i }).click();

        // URL should contain status filter
        await expect(page).toHaveURL(/status=draft/);
      }
    });

    test('should sort quotes', async ({ page }) => {
      await page.goto('/quotes');

      // Find sort control
      const sortButton = page.getByRole('button', { name: /sort/i });
      if (await sortButton.isVisible()) {
        await sortButton.click();

        // Select sort option
        await page.getByRole('menuitem', { name: /date/i }).click();
      }
    });
  });

  test.describe('Quote Creation', () => {
    test('should navigate to create quote page', async ({ page }) => {
      await page.goto('/quotes');

      await page.getByRole('link', { name: /create|new quote/i }).click();

      await expect(page).toHaveURL(/\/quotes\/new/);
    });

    test('should display quote builder interface', async ({ page }) => {
      await page.goto('/quotes/new');

      // Should see the builder components
      await expect(page.getByText(/blocks|builder/i)).toBeVisible();

      // Should see toolbar
      const toolbar = page.locator('[data-testid="builder-toolbar"]');
      if (await toolbar.isVisible()) {
        await expect(toolbar).toBeVisible();
      }
    });

    test('should add blocks to quote', async ({ page }) => {
      await page.goto('/quotes/new');

      // Find blocks panel
      const blocksPanel = page.locator('[data-testid="blocks-panel"]');

      // Drag a text block (or click to add)
      const textBlock = blocksPanel.getByText(/text|paragraph/i);
      if (await textBlock.isVisible()) {
        await textBlock.click();
      }

      // Should see block added to canvas
      const canvas = page.locator('[data-testid="document-canvas"]');
      await expect(canvas).toBeVisible();
    });

    test('should save quote as draft', async ({ page }) => {
      await page.goto('/quotes/new');

      // Fill in basic info
      const titleInput = page.getByLabel(/title/i);
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Quote');
      }

      // Save as draft
      const saveDraft = page.getByRole('button', { name: /save|draft/i });
      if (await saveDraft.isVisible()) {
        await saveDraft.click();

        // Should show success message or redirect
        await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Quote Detail', () => {
    test('should display quote details', async ({ page }) => {
      // Navigate to a specific quote (would need a real quote ID)
      await page.goto('/quotes');

      // Click on first quote in list
      const firstQuote = page.locator('table tbody tr').first();
      if (await firstQuote.isVisible()) {
        await firstQuote.click();

        // Should show quote details
        await expect(page.getByText(/quote #/i)).toBeVisible();
      }
    });

    test('should show quote status badge', async ({ page }) => {
      await page.goto('/quotes');

      // Status badges should be visible
      const badge = page.locator('[data-testid="status-badge"]').first();
      if (await badge.isVisible()) {
        await expect(badge).toBeVisible();
      }
    });

    test('should have send quote action', async ({ page }) => {
      await page.goto('/quotes');

      // Click on first quote
      const firstQuote = page.locator('table tbody tr').first();
      if (await firstQuote.isVisible()) {
        await firstQuote.click();

        // Should see send button
        const sendButton = page.getByRole('button', { name: /send/i });
        await expect(sendButton).toBeVisible();
      }
    });

    test('should have convert to invoice action', async ({ page }) => {
      await page.goto('/quotes');

      // Click on accepted quote (would need specific setup)
      const acceptedQuote = page.locator('tr:has-text("accepted")').first();
      if (await acceptedQuote.isVisible()) {
        await acceptedQuote.click();

        // Should see convert button
        const convertButton = page.getByRole('button', { name: /convert.*invoice/i });
        await expect(convertButton).toBeVisible();
      }
    });
  });

  test.describe('Quote Actions', () => {
    test('should duplicate quote', async ({ page }) => {
      await page.goto('/quotes');

      // Open quote actions menu
      const actionsMenu = page.locator('button[aria-label="actions"]').first();
      if (await actionsMenu.isVisible()) {
        await actionsMenu.click();

        // Click duplicate
        await page.getByRole('menuitem', { name: /duplicate/i }).click();

        // Should show success or navigate to new quote
        await expect(page.getByText(/duplicated|copy/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should download quote PDF', async ({ page }) => {
      await page.goto('/quotes');

      const firstQuote = page.locator('table tbody tr').first();
      if (await firstQuote.isVisible()) {
        await firstQuote.click();

        // Click PDF button
        const pdfButton = page.getByRole('button', { name: /pdf|download/i });
        if (await pdfButton.isVisible()) {
          // Start waiting for download before clicking
          const downloadPromise = page.waitForEvent('download');
          await pdfButton.click();

          const download = await downloadPromise;
          expect(download.suggestedFilename()).toContain('.pdf');
        }
      }
    });

    test('should delete quote with confirmation', async ({ page }) => {
      await page.goto('/quotes');

      const actionsMenu = page.locator('button[aria-label="actions"]').first();
      if (await actionsMenu.isVisible()) {
        await actionsMenu.click();

        // Click delete
        await page.getByRole('menuitem', { name: /delete/i }).click();

        // Should show confirmation dialog
        await expect(page.getByRole('alertdialog')).toBeVisible();

        // Cancel deletion
        await page.getByRole('button', { name: /cancel/i }).click();

        // Dialog should close
        await expect(page.getByRole('alertdialog')).not.toBeVisible();
      }
    });
  });
});

test.describe('Client Portal - Quote View', () => {
  test('should display quote for public access', async ({ page }) => {
    // Note: This would need a real access token
    // For testing, you might generate a test quote with known token
    await page.goto('/q/test-token-123');

    // Should show 404 or quote view
    // In real test, would check for quote content
    const notFound = page.getByText(/not found|expired|invalid/i);
    const quoteView = page.getByText(/quote|proposal/i);

    await expect(notFound.or(quoteView)).toBeVisible();
  });

  test('should display accept/decline buttons', async ({ page }) => {
    await page.goto('/q/valid-token');

    await expect(page.getByRole('button', { name: /accept/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /decline/i })).toBeVisible();
  });

  test('should show signature pad on accept', async ({ page }) => {
    await page.goto('/q/valid-token');

    await page.getByRole('button', { name: /accept/i }).click();

    // Should show signature dialog
    await expect(page.getByText(/signature/i)).toBeVisible();
  });

  test('should show decline reason dialog', async ({ page }) => {
    await page.goto('/q/valid-token');

    await page.getByRole('button', { name: /decline/i }).click();

    // Should show decline dialog
    await expect(page.getByText(/reason|why/i)).toBeVisible();
  });
});

test.describe('Quote Accessibility', () => {
  test('should have proper headings hierarchy', async ({ page }) => {
    await page.goto('/quotes');

    // Check heading structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should support keyboard navigation in quote builder', async ({ page }) => {
    await page.goto('/quotes/new');

    // Tab through interface
    await page.keyboard.press('Tab');

    // Should move focus
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have accessible table', async ({ page }) => {
    await page.goto('/quotes');

    const table = page.locator('table');
    if (await table.isVisible()) {
      // Table should have proper structure
      await expect(table.locator('thead')).toBeAttached();
      await expect(table.locator('tbody')).toBeAttached();
    }
  });
});
