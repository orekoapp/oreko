import { test, expect, Page } from '@playwright/test';

/**
 * Navigation Validator Tests
 *
 * These tests dynamically discover and validate all navigation links
 * to prevent dead links (404s) from reaching production.
 *
 * Referenced in ROOT_CAUSE_ANALYSIS.md recommendations:
 * - "Automated test that all nav links return 200"
 * - "Feature branch can't merge with dead links"
 */

test.describe('Navigation Validator - Dead Link Prevention', () => {
  /**
   * Extracts all internal links from a page
   */
  async function getAllInternalLinks(page: Page): Promise<string[]> {
    const links = await page.locator('a[href^="/"]').all();
    const hrefs: string[] = [];

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('http') && !hrefs.includes(href)) {
        hrefs.push(href);
      }
    }

    return hrefs;
  }

  /**
   * Checks if a page shows 404 content
   */
  async function is404Page(page: Page): Promise<boolean> {
    const notFoundIndicators = [
      page.getByText(/page not found/i),
      page.getByText(/404/i),
      page.getByText(/this page (doesn't|does not) exist/i),
      page.locator('[data-testid="404-page"]'),
    ];

    for (const indicator of notFoundIndicators) {
      const visible = await indicator.isVisible().catch(() => false);
      if (visible) return true;
    }

    return false;
  }

  test('TC-NAV-001: All sidebar navigation links should be valid', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Get sidebar links
    const sidebarLinks = await page.locator('nav a[href^="/"], aside a[href^="/"]').all();
    const visitedLinks = new Set<string>();
    const brokenLinks: string[] = [];

    for (const link of sidebarLinks) {
      const href = await link.getAttribute('href');
      if (!href || visitedLinks.has(href)) continue;
      visitedLinks.add(href);

      // Skip external links and anchors
      if (href.startsWith('http') || href.startsWith('#')) continue;

      const response = await page.goto(href);
      const status = response?.status() ?? 0;

      if (status === 404 || await is404Page(page)) {
        brokenLinks.push(href);
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken sidebar links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-002: Dashboard page links should be valid', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const links = await getAllInternalLinks(page);
    const brokenLinks: string[] = [];

    for (const href of links.slice(0, 20)) { // Limit to avoid timeout
      // Skip dynamic IDs that might not exist
      if (href.match(/\/[a-f0-9-]{36}$/)) continue;

      const response = await page.goto(href);
      const status = response?.status() ?? 0;

      if (status === 404 || await is404Page(page)) {
        brokenLinks.push(href);
      }

      // Return to dashboard
      await page.goto('/dashboard');
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken dashboard links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-003: Header dropdown links should be valid', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const brokenLinks: string[] = [];

    // Open user menu
    const userMenu = page.getByTestId('user-menu');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.waitForTimeout(300);

      // Get dropdown links
      const dropdownLinks = await page.locator('[role="menu"] a[href^="/"]').all();

      for (const link of dropdownLinks) {
        const href = await link.getAttribute('href');
        if (!href) continue;

        const response = await page.goto(href);
        const status = response?.status() ?? 0;

        if (status === 404 || await is404Page(page)) {
          brokenLinks.push(href);
        }

        // Return to dashboard and reopen menu for next link
        await page.goto('/dashboard');
        await userMenu.click();
        await page.waitForTimeout(300);
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken header dropdown links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-004: Quick action links should be valid', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const quickActionLinks = [
      '/quotes/new',
      '/invoices/new',
      '/clients/new',
      '/rate-cards/new',
    ];

    const brokenLinks: string[] = [];

    for (const href of quickActionLinks) {
      const response = await page.goto(href);
      const status = response?.status() ?? 0;

      if (status === 404 || await is404Page(page)) {
        brokenLinks.push(href);
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken quick action links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-005: Settings sub-navigation should be valid', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Collect hrefs first to avoid stale element issues
    const hrefs: string[] = [];
    const settingsLinkElements = page.locator('a[href^="/settings"]');
    const count = await settingsLinkElements.count();

    for (let i = 0; i < count; i++) {
      const href = await settingsLinkElements.nth(i).getAttribute('href').catch(() => null);
      if (href && !hrefs.includes(href)) {
        hrefs.push(href);
      }
    }

    const brokenLinks: string[] = [];

    // Links that may redirect based on user role (not 404s)
    const roleRestrictedLinks = ['/settings/billing', '/settings/team'];

    for (const href of hrefs) {
      const response = await page.goto(href);
      const status = response?.status() ?? 0;

      // Check if this is a role-restricted link that redirects
      const isRoleRestricted = roleRestrictedLinks.some(r => href.includes(r));
      const redirectedToSettings = page.url().endsWith('/settings') || page.url().includes('/settings?');

      // Only count as broken if it's 404 AND not a role-based redirect
      if (status === 404) {
        brokenLinks.push(href);
      } else if (await is404Page(page)) {
        // Role-restricted pages redirect to /settings, not 404
        if (!(isRoleRestricted && redirectedToSettings)) {
          brokenLinks.push(href);
        }
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken settings links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });
});

test.describe('Navigation Validator - List to Detail Navigation', () => {
  /**
   * These tests verify that clicking items in list views
   * actually navigates to valid detail pages (not mock data 404s)
   */

  test('TC-NAV-006: Quote list items should link to valid detail pages', async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');

    const quoteLinks = page.locator('a[href^="/quotes/"]').filter({ hasNotText: /new/i });
    const count = await quoteLinks.count();
    const brokenLinks: string[] = [];

    // Test first 5 links
    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto('/quotes');
      await page.waitForLoadState('networkidle');

      const link = page.locator('a[href^="/quotes/"]').filter({ hasNotText: /new/i }).nth(i);
      if (!await link.isVisible()) continue;

      const href = await link.getAttribute('href');
      await link.click();
      await page.waitForLoadState('networkidle');

      if (await is404Page(page)) {
        brokenLinks.push(href ?? `quote link ${i}`);
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken quote links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-007: Invoice list items should link to valid detail pages', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');

    const invoiceLinks = page.locator('a[href^="/invoices/"]').filter({ hasNotText: /new/i });
    const count = await invoiceLinks.count();
    const brokenLinks: string[] = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto('/invoices');
      await page.waitForLoadState('networkidle');

      const link = page.locator('a[href^="/invoices/"]').filter({ hasNotText: /new/i }).nth(i);
      if (!await link.isVisible()) continue;

      const href = await link.getAttribute('href');
      await link.click();
      await page.waitForLoadState('networkidle');

      if (await is404Page(page)) {
        brokenLinks.push(href ?? `invoice link ${i}`);
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken invoice links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-008: Client list items should link to valid detail pages', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const clientLinks = page.locator('a[href^="/clients/"]').filter({ hasNotText: /new/i });
    const count = await clientLinks.count();
    const brokenLinks: string[] = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto('/clients');
      await page.waitForLoadState('networkidle');

      const link = page.locator('a[href^="/clients/"]').filter({ hasNotText: /new/i }).nth(i);
      if (!await link.isVisible()) continue;

      const href = await link.getAttribute('href');
      await link.click();
      await page.waitForLoadState('networkidle');

      if (await is404Page(page)) {
        brokenLinks.push(href ?? `client link ${i}`);
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken client links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-009: Rate card list items should link to valid detail pages', async ({ page }) => {
    await page.goto('/rate-cards');
    await page.waitForLoadState('networkidle');

    const rateCardLinks = page.locator('a[href^="/rate-cards/"]').filter({ hasNotText: /new/i });
    const count = await rateCardLinks.count();
    const brokenLinks: string[] = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto('/rate-cards');
      await page.waitForLoadState('networkidle');

      const link = page.locator('a[href^="/rate-cards/"]').filter({ hasNotText: /new/i }).nth(i);
      if (!await link.isVisible()) continue;

      const href = await link.getAttribute('href');
      await link.click();
      await page.waitForLoadState('networkidle');

      if (await is404Page(page)) {
        brokenLinks.push(href ?? `rate-card link ${i}`);
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken rate-card links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });
});

test.describe('Navigation Validator - Cross-Module Links', () => {
  /**
   * Tests for links between modules (e.g., client detail -> create quote)
   */

  test('TC-NAV-010: Client detail action buttons should navigate correctly', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Find and click first client
    const clientLink = page.locator('a[href^="/clients/"]').filter({ hasNotText: /new/i }).first();

    if (await clientLink.isVisible()) {
      await clientLink.click();
      await page.waitForLoadState('networkidle');

      // Test "Create Quote" action
      const createQuoteLink = page.getByRole('link', { name: /create.*quote|new.*quote/i });
      if (await createQuoteLink.isVisible()) {
        const href = await createQuoteLink.getAttribute('href');
        const response = await page.goto(href ?? '/quotes/new');

        expect(response?.status(), 'Create Quote link should not 404').not.toBe(404);
        expect(await is404Page(page), 'Create Quote page should not show 404 content').toBe(false);
      }

      // Return and test "Create Invoice" action
      await page.goto('/clients');
      await clientLink.click();
      await page.waitForLoadState('networkidle');

      const createInvoiceLink = page.getByRole('link', { name: /create.*invoice|new.*invoice/i });
      if (await createInvoiceLink.isVisible()) {
        const href = await createInvoiceLink.getAttribute('href');
        const response = await page.goto(href ?? '/invoices/new');

        expect(response?.status(), 'Create Invoice link should not 404').not.toBe(404);
        expect(await is404Page(page), 'Create Invoice page should not show 404 content').toBe(false);
      }
    }
  });
});

/**
 * Helper function to check if page is 404
 */
async function is404Page(page: Page): Promise<boolean> {
  const notFoundIndicators = [
    page.getByText(/page not found/i),
    page.getByText(/404/i),
    page.getByText(/this page (doesn't|does not) exist/i),
    page.locator('[data-testid="404-page"]'),
  ];

  for (const indicator of notFoundIndicators) {
    const visible = await indicator.isVisible().catch(() => false);
    if (visible) return true;
  }

  return false;
}
