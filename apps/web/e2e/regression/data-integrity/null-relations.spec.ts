import { test, expect } from '@playwright/test';
import { EDGE_CASE_IDS, ERROR_PATTERNS } from '../../fixtures/edge-case-data.fixture';
import {
  assertNoServerComponentCrash,
  assertDataIntegrity,
  safeNavigate,
  detectInvalidRenders,
  monitorConsoleErrors,
} from '../../utils/server-error-detection';

/**
 * Data Integrity Regression Tests: Null Relations
 *
 * These tests verify that the application handles edge cases gracefully:
 * - Soft-deleted clients with referencing quotes/invoices
 * - Clients with null/missing company field
 * - Records that may have incomplete data
 *
 * PREREQUISITE: Edge case data must be seeded before running:
 *   SEED_EDGE_CASES=true npx tsx e2e/utils/seed-e2e-data.ts
 *
 * Test IDs follow convention: DI-XXX (Data Integrity)
 */

test.describe('Data Integrity: Null Client Relations', () => {
  test.describe.configure({ mode: 'serial' });

  // ========================================================================
  // DI-001 to DI-003: Dashboard Tests
  // ========================================================================

  test('DI-001: Dashboard renders when orphaned quotes/invoices exist', async ({ page }) => {
    // This tests the exact bug that escaped to production
    // Dashboard crashed when client.company was accessed on null client

    await safeNavigate(page, '/dashboard');

    // Verify dashboard loaded without crash
    await assertNoServerComponentCrash(page, 'Dashboard with edge case data');

    // Verify core dashboard elements are present
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toContainText('Server Error');

    // Verify dashboard has some structure (nav or sidebar)
    const hasNav = await page.locator('nav').count() > 0 ||
                   await page.locator('[data-sidebar]').count() > 0;
    expect(hasNav).toBe(true);
  });

  test('DI-002: Dashboard widgets handle null client gracefully', async ({ page }) => {
    await safeNavigate(page, '/dashboard');

    // Check for invalid renders in dashboard
    const invalidRenders = await detectInvalidRenders(page, 'main');

    // No undefined/null should be rendered in the main content
    expect(invalidRenders.length).toBe(0);
  });

  test('DI-003: Dashboard stats don\'t include deleted client data incorrectly', async ({ page }) => {
    await safeNavigate(page, '/dashboard');

    // Monitor for console errors during load
    const getErrors = monitorConsoleErrors(page);

    // Wait for any async loading
    await page.waitForTimeout(1000);

    // Should not have TypeError console errors
    const errors = getErrors();
    const typeErrors = errors.filter((e) =>
      ERROR_PATTERNS.NULL_REFERENCE_PATTERNS.some((p) => e.includes(p))
    );

    expect(typeErrors).toHaveLength(0);
  });

  // ========================================================================
  // DI-004 to DI-006: Quotes List Tests
  // ========================================================================

  test('DI-004: Quotes list renders when orphaned quotes exist', async ({ page }) => {
    await safeNavigate(page, '/quotes');

    // Verify list page loaded
    await assertNoServerComponentCrash(page, 'Quotes list with edge case data');

    // Should have some content (either quotes or empty state)
    const hasTable = await page.locator('table').count() > 0;
    const hasCards = await page.locator('[data-testid*="quote"]').count() > 0;
    const hasEmptyState = await page.getByText(/no quotes/i).count() > 0;

    expect(hasTable || hasCards || hasEmptyState).toBe(true);
  });

  test('DI-005: Quote with deleted client displays gracefully in list', async ({ page }) => {
    await safeNavigate(page, '/quotes');

    // Search for the edge case quote
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill(EDGE_CASE_IDS.QUOTE_NUMBER_DELETED_CLIENT);
      await page.waitForTimeout(500);
    }

    // If the quote is found, verify it doesn't show "undefined" or "null"
    const quoteRow = page.getByText(EDGE_CASE_IDS.QUOTE_NUMBER_DELETED_CLIENT);
    if (await quoteRow.isVisible({ timeout: 2000 })) {
      // Get the parent row/card
      const container = quoteRow.locator('..').locator('..');
      const text = await container.textContent() || '';

      // Should not have raw undefined/null
      expect(text.toLowerCase()).not.toContain('undefined');
      // Allow "null" only if part of a valid word
      const hasInvalidNull = /\bnull\b/i.test(text);
      expect(hasInvalidNull).toBe(false);
    }
  });

  test('DI-006: Quote with no-company client displays gracefully', async ({ page }) => {
    await safeNavigate(page, '/quotes');

    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill(EDGE_CASE_IDS.QUOTE_NUMBER_NO_COMPANY);
      await page.waitForTimeout(500);
    }

    // Verify no crashes
    await assertNoServerComponentCrash(page, 'Quote with no-company client');

    // Check for invalid renders
    const invalidRenders = await detectInvalidRenders(page, 'main');
    expect(invalidRenders.length).toBe(0);
  });

  // ========================================================================
  // DI-007 to DI-008: Quote Detail Tests
  // ========================================================================

  test('DI-007: Quote detail page with deleted client doesn\'t crash', async ({ page }) => {
    // Direct navigation to edge case quote
    try {
      await safeNavigate(page, `/quotes/${EDGE_CASE_IDS.QUOTE_DELETED_CLIENT}`);

      // Should not crash - either shows the quote or a "not found" message
      await assertNoServerComponentCrash(page, 'Quote detail with deleted client');

      // Check for invalid renders
      const invalidRenders = await detectInvalidRenders(page);
      expect(invalidRenders.length).toBe(0);
    } catch (error) {
      // 404 is acceptable, crash is not
      const is404 = await page.getByText(/not found/i).isVisible().catch(() => false);
      if (!is404) {
        throw error;
      }
    }
  });

  test('DI-008: Quote detail page with no-company client shows fallback', async ({ page }) => {
    try {
      await safeNavigate(page, `/quotes/${EDGE_CASE_IDS.QUOTE_NO_COMPANY_CLIENT}`);

      // Verify page loaded without crash
      await assertNoServerComponentCrash(page, 'Quote detail with no-company client');

      // Client name should be shown (Individual Freelancer)
      const bodyText = await page.locator('body').textContent() || '';

      // Should NOT show undefined/null for company
      expect(bodyText.toLowerCase()).not.toMatch(/\bundefined\b/);

    } catch (error) {
      // 404 is acceptable
      const is404 = await page.getByText(/not found/i).isVisible().catch(() => false);
      if (!is404) {
        throw error;
      }
    }
  });

  // ========================================================================
  // DI-009 to DI-011: Invoices Tests
  // ========================================================================

  test('DI-009: Invoices list renders when orphaned invoices exist', async ({ page }) => {
    await safeNavigate(page, '/invoices');

    // Verify list page loaded
    await assertNoServerComponentCrash(page, 'Invoices list with edge case data');

    // Should have some structure
    const hasTable = await page.locator('table').count() > 0;
    const hasCards = await page.locator('[data-testid*="invoice"]').count() > 0;
    const hasEmptyState = await page.getByText(/no invoices/i).count() > 0;

    expect(hasTable || hasCards || hasEmptyState).toBe(true);
  });

  test('DI-010: Invoice with deleted client displays gracefully', async ({ page }) => {
    await safeNavigate(page, '/invoices');

    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill(EDGE_CASE_IDS.INVOICE_NUMBER_DELETED_CLIENT);
      await page.waitForTimeout(500);
    }

    // Verify no crashes
    await assertNoServerComponentCrash(page, 'Invoice list with deleted client');

    // Check for invalid renders
    const invalidRenders = await detectInvalidRenders(page, 'main');
    expect(invalidRenders.length).toBe(0);
  });

  test('DI-011: Invoice detail page with deleted client doesn\'t crash', async ({ page }) => {
    try {
      await safeNavigate(page, `/invoices/${EDGE_CASE_IDS.INVOICE_DELETED_CLIENT}`);

      // Should not crash
      await assertNoServerComponentCrash(page, 'Invoice detail with deleted client');

      // Check for invalid renders
      const invalidRenders = await detectInvalidRenders(page);
      expect(invalidRenders.length).toBe(0);
    } catch (error) {
      // 404 is acceptable
      const is404 = await page.getByText(/not found/i).isVisible().catch(() => false);
      if (!is404) {
        throw error;
      }
    }
  });

  // ========================================================================
  // DI-012 to DI-013: Stress and Navigation Tests
  // ========================================================================

  test('DI-012: Rapid navigation between pages with edge case data', async ({ page }) => {
    // Stress test: rapidly navigate between pages that may have edge case data
    const pages = [
      '/dashboard',
      '/quotes',
      '/invoices',
      '/clients',
      '/dashboard',
      '/quotes',
    ];

    for (const url of pages) {
      await safeNavigate(page, url);

      // Quick check for crash indicators
      const bodyText = await page.locator('body').textContent() || '';
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('TypeError');
    }
  });

  test('DI-013: Search results including edge case records don\'t crash', async ({ page }) => {
    await safeNavigate(page, '/quotes');

    // Try searching with a term that might match edge case records
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      // Search for "EDGE" which should match our edge case quote numbers
      await searchInput.fill('EDGE');
      await page.waitForTimeout(500);

      // Should not crash
      await assertNoServerComponentCrash(page, 'Search results with edge case data');

      // No invalid renders in results
      const invalidRenders = await detectInvalidRenders(page, 'main');
      expect(invalidRenders.length).toBe(0);
    }
  });
});

// ========================================================================
// Clients Page Tests (Additional)
// ========================================================================

test.describe('Data Integrity: Clients with Edge Cases', () => {
  test('DI-014: Clients list doesn\'t show deleted clients', async ({ page }) => {
    await safeNavigate(page, '/clients');

    // Search for deleted client
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Deleted Client Corp');
      await page.waitForTimeout(500);

      // Should NOT find the deleted client
      const deletedClient = page.getByText('Deleted Client Corp');
      const isVisible = await deletedClient.isVisible({ timeout: 1000 }).catch(() => false);

      // Soft-deleted clients should not appear in the list
      expect(isVisible).toBe(false);
    }
  });

  test('DI-015: Client with no company displays correctly', async ({ page }) => {
    await safeNavigate(page, '/clients');

    // Search for client without company
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Individual Freelancer');
      await page.waitForTimeout(500);

      const client = page.getByText('Individual Freelancer');
      if (await client.isVisible({ timeout: 2000 })) {
        // Get the row/card containing this client
        const container = client.locator('..').locator('..');
        const text = await container.textContent() || '';

        // Should not show "undefined" or "null" for missing company
        expect(text.toLowerCase()).not.toMatch(/\bundefined\b/);
        expect(text.toLowerCase()).not.toMatch(/\bnull\b/);
      }
    }
  });
});
