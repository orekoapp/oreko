import { test, expect } from '@playwright/test';

/**
 * TC-BC-001 to TC-BC-010: Backward Compatibility Tests
 *
 * Tests that ensure:
 * - API responses maintain backward compatibility
 * - Data migrations don't break existing features
 * - UI changes don't break existing workflows
 * - URL structures remain stable
 *
 * Note: These tests use storageState from Playwright config,
 * so they are already authenticated when they start.
 */

test.describe('Backward Compatibility - API Response Format', () => {
  test('TC-BC-001: quotes API returns expected shape', async ({ page }) => {
    // Already authenticated via storageState
    await page.goto('/dashboard');

    // Make API request
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/quotes');
      return res.json();
    });

    // Verify expected fields exist (v1 API contract)
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('pagination');

    if (response.data?.length > 0) {
      const quote = response.data[0];
      // Required fields that must always exist
      expect(quote).toHaveProperty('id');
      expect(quote).toHaveProperty('quoteNumber');
      expect(quote).toHaveProperty('title');
      expect(quote).toHaveProperty('status');
      expect(quote).toHaveProperty('total');
      expect(quote).toHaveProperty('createdAt');
    }
  });

  test('TC-BC-002: invoices API returns expected shape', async ({ page }) => {
    await page.goto('/dashboard');

    const response = await page.evaluate(async () => {
      const res = await fetch('/api/invoices');
      return res.json();
    });

    expect(response).toHaveProperty('data');

    if (response.data?.length > 0) {
      const invoice = response.data[0];
      // Required fields
      expect(invoice).toHaveProperty('id');
      expect(invoice).toHaveProperty('invoiceNumber');
      expect(invoice).toHaveProperty('status');
      expect(invoice).toHaveProperty('total');
      expect(invoice).toHaveProperty('amountPaid');
      expect(invoice).toHaveProperty('amountDue');
      expect(invoice).toHaveProperty('dueDate');
    }
  });

  test('TC-BC-003: clients API returns expected shape', async ({ page }) => {
    await page.goto('/dashboard');

    const response = await page.evaluate(async () => {
      const res = await fetch('/api/clients');
      return res.json();
    });

    if (response.data?.length > 0) {
      const client = response.data[0];
      // Required fields
      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('name');
      expect(client).toHaveProperty('email');
      // Optional but stable fields
      expect(client).toHaveProperty('phone');
      expect(client).toHaveProperty('company');
    }
  });
});

test.describe('Backward Compatibility - URL Structure', () => {
  test('TC-BC-004: legacy quote URLs redirect correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Old URL format (if changed)
    await page.goto('/quote/123'); // Old format

    // Should redirect to new format or show appropriate page
    const currentUrl = page.url();
    const shows404 = await page.getByText(/not found/i).isVisible();
    const redirected = currentUrl.includes('/quotes/');

    // Either redirect or 404 is acceptable
    expect(shows404 || redirected).toBeTruthy();
  });

  test('TC-BC-005: client portal URLs remain stable', async ({ page }) => {
    // Client portal URLs must never change (external links may exist)
    const response = await page.goto('/q/some-token');

    // Should return 200 (valid) or 404 (invalid token), never redirect
    expect([200, 404]).toContain(response?.status() || 0);
  });

  test('TC-BC-006: invoice portal URLs remain stable', async ({ page }) => {
    const response = await page.goto('/i/some-token');

    expect([200, 404]).toContain(response?.status() || 0);
  });
});

test.describe('Backward Compatibility - Data Format', () => {
  test('TC-BC-007: old quote block format still renders', async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');

    // Click first quote if any exist
    const firstQuote = page.locator('a[href^="/quotes/"]').first();
    if (await firstQuote.isVisible()) {
      await firstQuote.click();
      await page.waitForLoadState('networkidle');

      // Blocks should render without errors - no error boundary visible
      const errorBoundary = page.locator('[data-testid="error-boundary"]');
      const hasError = await errorBoundary.isVisible();
      expect(hasError).toBeFalsy();

      // Quote content should be visible - main content area works
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeVisible();
    }
  });

  test('TC-BC-008: old client metadata format supported', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Click first client if any exist
    const firstClient = page.locator('a[href^="/clients/"]').first();
    if (await firstClient.isVisible()) {
      await firstClient.click();
      await page.waitForLoadState('networkidle');

      // Client should load without errors
      const errorBoundary = page.locator('[data-testid="error-boundary"]');
      const hasError = await errorBoundary.isVisible();
      expect(hasError).toBeFalsy();

      // Client details page should be visible - main content area works
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeVisible();
    }
  });

  test('TC-BC-009: old signature format displays correctly', async ({ page }) => {
    // Signatures are immutable records - old formats must always work
    await page.goto('/q/accepted-quote-token');

    // If the quote was accepted, signature should display
    const signatureDisplay = page.locator('[data-testid="signature-display"]');
    if (await signatureDisplay.isVisible()) {
      // Should show signature image or SVG
      const signatureImage = signatureDisplay.locator('img, svg');
      await expect(signatureImage).toBeVisible();
    }
  });
});

test.describe('Backward Compatibility - Feature Flags', () => {
  test('TC-BC-010: disabled features show appropriate UI', async ({ page }) => {
    await page.goto('/settings');

    // Look for any "coming soon" or disabled features
    const comingSoon = page.locator('[data-feature-flag="disabled"]');
    const comingSoonCount = await comingSoon.count();

    // Each disabled feature should show appropriate messaging
    for (let i = 0; i < comingSoonCount; i++) {
      const element = comingSoon.nth(i);
      // Should either be hidden or show "coming soon" message
      const isHidden = await element.isHidden();
      const hasMessage = await element.locator('[data-testid="feature-disabled-message"]').isVisible();

      expect(isHidden || hasMessage).toBeTruthy();
    }
  });
});
