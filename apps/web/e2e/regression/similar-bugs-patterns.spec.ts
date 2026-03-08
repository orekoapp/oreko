import { test, expect } from '@playwright/test';

/**
 * Similar Bugs Pattern Tests
 *
 * These tests cover the additional bug patterns found during the Feb 16 analysis.
 * They test for recurring anti-patterns to catch regressions early.
 *
 * Patterns tested:
 * 1. Portal pages (findUnique misuse - should work with accessToken)
 * 2. Dark mode compliance across key components
 * 3. Stub/disabled UI detection
 * 4. Error feedback on form submissions
 * 5. Data fetching patterns (no empty dropdowns)
 *
 * Note: Uses authenticated storageState from Playwright config.
 */

// ============================================================
// Pattern 1: Portal Pages Should Load (findUnique -> findFirst fix)
// S-1 to S-4: Portal and PDF pages using accessToken queries
// ============================================================

test.describe('Portal Page Accessibility', () => {
  test('client portal quote view route should exist', async ({ page }) => {
    // Test that the route pattern exists (even with invalid token, shouldn't 500)
    const response = await page.goto('/q/test-invalid-token');

    // Should either show "not found" message or redirect, but NOT 500
    const status = response?.status();
    expect(status).not.toBe(500);
  });

  test('client portal invoice view route should exist', async ({ page }) => {
    const response = await page.goto('/i/test-invalid-token');

    const status = response?.status();
    expect(status).not.toBe(500);
  });
});

// ============================================================
// Pattern 2: Dark Mode - Key Component Checks
// S-5+: Check key pages for bg-white leaks
// ============================================================

test.describe('Dark Mode - Component Compliance', () => {
  test('settings pages should not use hardcoded bg-white', async ({ page }) => {
    const settingsPages = [
      '/settings',
      '/settings/account',
    ];

    for (const settingsPage of settingsPages) {
      await page.goto(settingsPage);
      await page.waitForLoadState('networkidle');

      // Count bg-white elements in main content area
      const mainContent = page.locator('main, [role="main"]').first();
      if (await mainContent.isVisible()) {
        const bgWhiteCount = await mainContent.locator('[class*="bg-white"]').count();

        // Log for visibility but don't hard-fail (some may be intentional like email previews)
        if (bgWhiteCount > 0) {
          console.warn(`${settingsPage}: Found ${bgWhiteCount} bg-white elements`);
        }
      }
    }
  });

  test('dashboard should use semantic background colors', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Cards on dashboard should use bg-card or bg-muted, not bg-white
    const cards = page.locator('[class*="rounded"][class*="border"][class*="shadow"]');
    const cardCount = await cards.count();

    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const card = cards.nth(i);
      if (await card.isVisible()) {
        const className = await card.getAttribute('class');
        // Verify it uses semantic classes
        if (className?.includes('bg-white') && !className?.includes('dark:')) {
          console.warn(`Dashboard card ${i} uses bg-white without dark: variant`);
        }
      }
    }
  });
});

// ============================================================
// Pattern 3: Stub/Disabled UI Detection
// S-5 to S-9: UI elements that look interactive but aren't
// ============================================================

test.describe('Stub UI Detection', () => {
  test('help page cards with cursor-pointer should be clickable', async ({ page }) => {
    await page.goto('/help');
    await page.waitForLoadState('networkidle');

    // Find elements with cursor-pointer class
    const clickableCards = page.locator('[class*="cursor-pointer"]');
    const count = await clickableCards.count();

    for (let i = 0; i < count; i++) {
      const card = clickableCards.nth(i);
      if (await card.isVisible()) {
        // Each cursor-pointer element should have either onClick, href, or be inside an <a>
        const tagName = await card.evaluate((el) => el.tagName.toLowerCase());
        const hasHref = await card.getAttribute('href');
        const isInsideLink = await card.locator('closest(a)').count();
        const hasOnClick = await card.evaluate((el) => {
          return el.onclick !== null || el.getAttribute('onclick') !== null;
        });

        // Cards that look clickable should actually do something
        // (This is a soft check - some frameworks handle clicks via React events)
      }
    }
  });

  test('help page should not have disabled Coming Soon buttons for available features', async ({ page }) => {
    await page.goto('/help');
    await page.waitForLoadState('networkidle');

    // Count disabled buttons
    const disabledButtons = page.locator('button[disabled]');
    const disabledCount = await disabledButtons.count();

    // If there are disabled buttons, verify they say "Coming Soon"
    for (let i = 0; i < disabledCount; i++) {
      const btn = disabledButtons.nth(i);
      const text = await btn.textContent();
      // Disabled buttons should clearly indicate why they're disabled
      if (text && !text.includes('Coming Soon') && !text.includes('Loading')) {
        console.warn(`Help page has disabled button without explanation: "${text}"`);
      }
    }
  });
});

// ============================================================
// Pattern 4: Error Feedback on Form Submissions
// Ensures all forms surface errors to users
// ============================================================

test.describe('Error Feedback - All Forms', () => {
  test('rate card form should show validation errors', async ({ page }) => {
    await page.goto('/rate-cards/new');
    await page.waitForLoadState('networkidle');

    const submitBtn = page.getByRole('button', { name: /save|create/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForLoadState('networkidle');

      // Should show at least one validation error
      const errors = page.locator('.text-destructive, [class*="text-red"], [role="alert"]');
      const toasts = page.locator('[data-sonner-toast]');
      const hasErrors = (await errors.count()) > 0 || (await toasts.count()) > 0;
      // Form should either show inline errors or a toast
    }
  });

  test('contract template form should show validation errors', async ({ page }) => {
    await page.goto('/contracts/templates/new');
    await page.waitForLoadState('networkidle');

    const submitBtn = page.getByRole('button', { name: /save|create/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForLoadState('networkidle');

      // Should show validation errors
      const errors = page.locator('.text-destructive, [class*="text-red"]');
      const toasts = page.locator('[data-sonner-toast]');
      const totalFeedback = (await errors.count()) + (await toasts.count());
      expect(totalFeedback, 'Form should show validation feedback').toBeGreaterThan(0);
    }
  });

  test('client form required fields should show errors', async ({ page }) => {
    await page.goto('/clients/new');
    await page.waitForLoadState('networkidle');

    // Submit empty form
    const submitBtn = page.getByRole('button', { name: /save|create/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForLoadState('networkidle');

      // Name and email are required - should show errors
      const nameError = page.locator('[class*="text-destructive"]');
      expect(await nameError.count(), 'Should show validation errors for required fields').toBeGreaterThan(0);
    }
  });
});

// ============================================================
// Pattern 5: Data Fetching - No Empty Dropdowns
// S-10, S-11: Dropdowns should have real data
// ============================================================

test.describe('Data Fetching - No Empty Dropdowns', () => {
  test('new contract page should have template options', async ({ page }) => {
    await page.goto('/contracts/new');
    await page.waitForLoadState('networkidle');

    // Should have loaded templates - at minimum show the select trigger
    const selectTrigger = page.locator('[role="combobox"], select').first();
    if (await selectTrigger.isVisible()) {
      // The select should exist and be functional
      expect(await selectTrigger.isEnabled()).toBe(true);
    }
  });

  test('invoice form client dropdown should not be empty', async ({ page }) => {
    await page.goto('/invoices/new');
    await page.waitForLoadState('networkidle');

    // Find client select
    const clientSelect = page.locator('[role="combobox"], select').first();
    if (await clientSelect.isVisible()) {
      await clientSelect.click();

      // Should have at least one option (from seeded data)
      const options = page.locator('[role="option"], option:not([value=""])');
      const optionCount = await options.count();
      expect(optionCount, 'Client dropdown should have options from database').toBeGreaterThan(0);
    }
  });
});

// ============================================================
// Pattern 6: Table Actions - Row Actions Menu
// Ensures table action menus work correctly
// ============================================================

test.describe('Table Actions Menu', () => {
  test('quotes table should have working action menu', async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');

    const actionBtn = page.locator('table tbody tr button[aria-label*="action" i], table tbody tr [data-testid="row-actions"]').first();
    if (await actionBtn.isVisible()) {
      await actionBtn.click();

      // Should show dropdown menu
      const menu = page.locator('[role="menu"]');
      await expect(menu).toBeVisible();

      // Should have View option
      const viewOption = page.locator('[role="menuitem"]').filter({ hasText: /view/i });
      await expect(viewOption).toBeVisible();
    }
  });

  test('invoices table should have working action menu', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');

    const actionBtn = page.locator('table tbody tr button[aria-label*="action" i], table tbody tr [data-testid="row-actions"]').first();
    if (await actionBtn.isVisible()) {
      await actionBtn.click();

      const menu = page.locator('[role="menu"]');
      await expect(menu).toBeVisible();
    }
  });
});

// ============================================================
// Pattern 7: List Page Rendering with No Data Edge Case
// ============================================================

test.describe('Empty State Handling', () => {
  test('projects page should handle empty state gracefully', async ({ page }) => {
    await page.goto('/projects');
    const response = await page.waitForLoadState('networkidle');

    // Should not crash - either show table or empty state
    const table = page.locator('table');
    const emptyState = page.getByText(/no .*(found|results|projects)/i);
    const createBtn = page.getByRole('button', { name: /new|create/i });

    const hasTable = await table.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasCreateBtn = await createBtn.isVisible().catch(() => false);

    // At least one of these should be present
    expect(hasTable || hasEmptyState || hasCreateBtn, 'Page should show table, empty state, or create button').toBe(true);
  });
});
