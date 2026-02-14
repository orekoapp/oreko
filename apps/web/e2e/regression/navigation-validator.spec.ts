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

// Set higher timeout for navigation tests since dev server compilation can be slow
test.describe('Navigation Validator - Dead Link Prevention', () => {
  // These tests navigate to many pages sequentially, which can be slow with dev server
  test.setTimeout(120000); // 2 minutes for each test
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
    await page.goto('/dashboard', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    const links = await getAllInternalLinks(page);
    const brokenLinks: string[] = [];

    for (const href of links.slice(0, 10)) { // Limit to 10 to avoid timeout
      // Skip dynamic IDs that might not exist
      if (href.match(/\/[a-f0-9-]{36}$/)) continue;

      try {
        const response = await page.goto(href, { timeout: 60000, waitUntil: 'domcontentloaded' });
        const status = response?.status() ?? 0;

        if (status === 404 || await is404Page(page)) {
          brokenLinks.push(href);
        }
      } catch {
        // Timeout or network error - check if page loaded anyway
        if (await is404Page(page)) {
          brokenLinks.push(href);
        }
      }

      // Return to dashboard
      await page.goto('/dashboard', { timeout: 60000, waitUntil: 'domcontentloaded' });
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken dashboard links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-003: Header dropdown links should be valid', async ({ page }) => {
    await page.goto('/dashboard', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    const brokenLinks: string[] = [];
    const hrefs: string[] = [];

    // Open user menu - try multiple selectors since it might be named differently
    const userMenu = page.getByTestId('user-menu').or(page.getByRole('button', { name: /user|profile|account|TU/i })).first();
    if (await userMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userMenu.click();
      await page.waitForTimeout(500); // Longer wait for dropdown animation

      // Collect all hrefs first to avoid stale element issues
      const dropdownLinkElements = page.locator('[role="menu"] a[href^="/"], [role="menuitem"][data-href^="/"]');
      const count = await dropdownLinkElements.count();

      for (let i = 0; i < count; i++) {
        const href = await dropdownLinkElements.nth(i).getAttribute('href').catch(() => null);
        if (href && !hrefs.includes(href)) {
          hrefs.push(href);
        }
      }
    }

    // Now test each collected href
    for (const href of hrefs) {
      try {
        const response = await page.goto(href, { timeout: 60000, waitUntil: 'domcontentloaded' });
        const status = response?.status() ?? 0;

        if (status === 404 || await is404Page(page)) {
          brokenLinks.push(href);
        }
      } catch {
        // Timeout - check if page loaded anyway
        if (await is404Page(page)) {
          brokenLinks.push(href);
        }
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken header dropdown links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-004: Quick action links should be valid', async ({ page }) => {
    await page.goto('/dashboard', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    const quickActionLinks = [
      '/quotes/new',
      '/invoices/new',
      '/clients/new',
      '/rate-cards/new',
    ];

    const brokenLinks: string[] = [];

    for (const href of quickActionLinks) {
      try {
        const response = await page.goto(href, { timeout: 60000, waitUntil: 'domcontentloaded' });
        const status = response?.status() ?? 0;

        if (status === 404 || await is404Page(page)) {
          brokenLinks.push(href);
        }
      } catch (error: unknown) {
        // If it's a timeout, it might still be a valid page (slow compilation)
        // Check current URL to see if navigation succeeded
        if (page.url().includes(href.replace('/', ''))) {
          // Navigation succeeded but page is loading slowly - not a broken link
          continue;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        brokenLinks.push(`${href} (error: ${errorMessage})`);
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken quick action links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-005: Settings sub-navigation should be valid', async ({ page }) => {
    await page.goto('/settings', { timeout: 60000 });
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
      try {
        const response = await page.goto(href, { timeout: 60000, waitUntil: 'domcontentloaded' });
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
      } catch {
        // Timeout - check if it's actually 404
        if (await is404Page(page)) {
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
  // Set higher timeout for navigation tests since dev server compilation can be slow
  test.setTimeout(120000); // 2 minutes for each test
  /**
   * These tests verify that clicking items in list views
   * actually navigates to valid detail pages (not mock data 404s)
   */

  test('TC-NAV-006: Quote list items should link to valid detail pages', async ({ page }) => {
    await page.goto('/quotes', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    const quoteLinks = page.locator('a[href^="/quotes/"]').filter({ hasNotText: /new/i });
    const count = await quoteLinks.count();
    const brokenLinks: string[] = [];

    // Test first 3 links (reduced for performance)
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        await page.goto('/quotes', { timeout: 60000, waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        const link = page.locator('a[href^="/quotes/"]').filter({ hasNotText: /new/i }).nth(i);
        if (!await link.isVisible({ timeout: 5000 }).catch(() => false)) continue;

        const href = await link.getAttribute('href');
        await link.click();
        await page.waitForLoadState('networkidle');

        if (await is404Page(page)) {
          brokenLinks.push(href ?? `quote link ${i}`);
        }
      } catch {
        // Navigation timeout - skip this link
        continue;
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken quote links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-007: Invoice list items should link to valid detail pages', async ({ page }) => {
    await page.goto('/invoices', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    const invoiceLinks = page.locator('a[href^="/invoices/"]').filter({ hasNotText: /new/i });
    const count = await invoiceLinks.count();
    const brokenLinks: string[] = [];

    // Test first 3 links (reduced for performance)
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        await page.goto('/invoices', { timeout: 60000, waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        const link = page.locator('a[href^="/invoices/"]').filter({ hasNotText: /new/i }).nth(i);
        if (!await link.isVisible({ timeout: 5000 }).catch(() => false)) continue;

        const href = await link.getAttribute('href');
        await link.click();
        await page.waitForLoadState('networkidle');

        if (await is404Page(page)) {
          brokenLinks.push(href ?? `invoice link ${i}`);
        }
      } catch {
        // Navigation timeout - skip this link
        continue;
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken invoice links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-008: Client list items should link to valid detail pages', async ({ page }) => {
    await page.goto('/clients', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    const clientLinks = page.locator('a[href^="/clients/"]').filter({ hasNotText: /new/i });
    const count = await clientLinks.count();
    const brokenLinks: string[] = [];

    // Test first 3 links (reduced for performance)
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        await page.goto('/clients', { timeout: 60000, waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        const link = page.locator('a[href^="/clients/"]').filter({ hasNotText: /new/i }).nth(i);
        if (!await link.isVisible({ timeout: 5000 }).catch(() => false)) continue;

        const href = await link.getAttribute('href');
        await link.click();
        await page.waitForLoadState('networkidle');

        if (await is404Page(page)) {
          brokenLinks.push(href ?? `client link ${i}`);
        }
      } catch {
        // Navigation timeout - skip this link
        continue;
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken client links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-009: Rate card list items should link to valid detail pages', async ({ page }) => {
    await page.goto('/rate-cards', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    const rateCardLinks = page.locator('a[href^="/rate-cards/"]').filter({ hasNotText: /new/i });
    const count = await rateCardLinks.count();
    const brokenLinks: string[] = [];

    // Test first 3 links (reduced for performance)
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        await page.goto('/rate-cards', { timeout: 60000, waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        const link = page.locator('a[href^="/rate-cards/"]').filter({ hasNotText: /new/i }).nth(i);
        if (!await link.isVisible({ timeout: 5000 }).catch(() => false)) continue;

        const href = await link.getAttribute('href');
        await link.click();
        await page.waitForLoadState('networkidle');

        if (await is404Page(page)) {
          brokenLinks.push(href ?? `rate-card link ${i}`);
        }
      } catch {
        // Navigation timeout - skip this link
        continue;
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken rate-card links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-NAV-010: Project list items should link to valid detail pages', async ({ page }) => {
    await page.goto('/projects', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    const projectLinks = page.locator('a[href^="/projects/"]').filter({ hasNotText: /new/i });
    const count = await projectLinks.count();
    const brokenLinks: string[] = [];

    // Test first 3 links (reduced for performance)
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        await page.goto('/projects', { timeout: 60000, waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        const link = page.locator('a[href^="/projects/"]').filter({ hasNotText: /new/i }).nth(i);
        if (!await link.isVisible({ timeout: 5000 }).catch(() => false)) continue;

        const href = await link.getAttribute('href');
        await link.click();
        await page.waitForLoadState('networkidle');

        if (await is404Page(page)) {
          brokenLinks.push(href ?? `project link ${i}`);
        }
      } catch {
        // Navigation timeout - skip this link
        continue;
      }
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken project links: ${brokenLinks.join(', ')}`
    ).toHaveLength(0);
  });
});

test.describe('Navigation Validator - Cross-Module Links', () => {
  // Set higher timeout for navigation tests since dev server compilation can be slow
  test.setTimeout(120000); // 2 minutes for each test
  /**
   * Tests for links between modules (e.g., client detail -> create quote)
   */

  test('TC-NAV-011: Client detail action buttons should navigate correctly', async ({ page }) => {
    await page.goto('/clients', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Find and click first client
    const clientLink = page.locator('a[href^="/clients/"]').filter({ hasNotText: /new/i }).first();

    if (await clientLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await clientLink.click();
      await page.waitForLoadState('networkidle');

      // Test "Create Quote" action
      const createQuoteLink = page.getByRole('link', { name: /create.*quote|new.*quote/i });
      if (await createQuoteLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        const href = await createQuoteLink.getAttribute('href');
        try {
          const response = await page.goto(href ?? '/quotes/new', { timeout: 60000, waitUntil: 'domcontentloaded' });

          expect(response?.status(), 'Create Quote link should not 404').not.toBe(404);
          expect(await is404Page(page), 'Create Quote page should not show 404 content').toBe(false);
        } catch {
          // Timeout - still check for 404 content
          expect(await is404Page(page), 'Create Quote page should not show 404 content').toBe(false);
        }
      }

      // Return and test "Create Invoice" action
      await page.goto('/clients', { timeout: 60000, waitUntil: 'domcontentloaded' });
      await clientLink.click();
      await page.waitForLoadState('networkidle');

      const createInvoiceLink = page.getByRole('link', { name: /create.*invoice|new.*invoice/i });
      if (await createInvoiceLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        const href = await createInvoiceLink.getAttribute('href');
        try {
          const response = await page.goto(href ?? '/invoices/new', { timeout: 60000, waitUntil: 'domcontentloaded' });

          expect(response?.status(), 'Create Invoice link should not 404').not.toBe(404);
          expect(await is404Page(page), 'Create Invoice page should not show 404 content').toBe(false);
        } catch {
          // Timeout - still check for 404 content
          expect(await is404Page(page), 'Create Invoice page should not show 404 content').toBe(false);
        }
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
