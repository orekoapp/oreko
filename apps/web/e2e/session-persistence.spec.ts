import { test, expect, BrowserContext } from '@playwright/test';

const TEST_USER = {
  email: process.env.E2E_TEST_USER_EMAIL || 'test@oreko.dev',
  password: process.env.E2E_TEST_USER_PASSWORD || 'TestPassword123!',
};

/**
 * Issue #6: User Session Not Persisted Across Browser Tabs
 *
 * Reproduction: Log in via one tab, open a new tab to a protected route.
 * Expected: User remains authenticated in the new tab.
 * Bug: User was redirected to login in the new tab because middleware
 *       couldn't decode the JWT session token (Prisma/Edge Runtime conflict).
 */
test.describe('Issue #6 - Session Persistence Across Tabs', () => {
  let authenticatedContext: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    // Step 1: Log in and capture the authenticated state
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // If already redirected to dashboard, we're already logged in
    if (!page.url().includes('/login')) {
      authenticatedContext = context;
      return;
    }

    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_USER.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for successful login (redirected away from login)
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // If on onboarding, complete it first
    if (page.url().includes('/onboarding')) {
      const skipButton = page.getByRole('button', { name: /skip|continue|next|get started/i });
      let attempts = 10;
      while (page.url().includes('/onboarding') && attempts > 0) {
        try {
          if (await skipButton.first().isVisible({ timeout: 1000 })) {
            await skipButton.first().click();
            await page.waitForLoadState('domcontentloaded');
          }
        } catch {
          // Continue
        }
        attempts--;
      }
    }

    authenticatedContext = context;
  });

  test.afterAll(async () => {
    await authenticatedContext?.close();
  });

  test('authenticated session is accessible in a new browser context (simulates new tab)', async ({ browser }) => {
    // Get cookies from the authenticated context
    const storageState = await authenticatedContext.storageState();

    // Create a NEW browser context with the same cookies (simulates opening a new tab)
    const newTabContext = await browser.newContext({ storageState });
    const newTabPage = await newTabContext.newPage();

    try {
      // Navigate directly to a protected route in the "new tab"
      await newTabPage.goto('/dashboard', { waitUntil: 'networkidle', timeout: 15000 });

      // The critical assertion: we should NOT be on the login page
      const currentUrl = newTabPage.url();
      expect(currentUrl).not.toContain('/login');

      // We should be on the dashboard (or onboarding if first-time user)
      expect(currentUrl.includes('/dashboard') || currentUrl.includes('/onboarding')).toBe(true);

      // Verify dashboard content is actually rendered (not a blank page)
      const hasContent = await newTabPage.locator('nav, [data-sidebar], main').first().isVisible({ timeout: 5000 });
      expect(hasContent).toBe(true);
    } finally {
      await newTabContext.close();
    }
  });

  test('session persists when navigating to quotes page in new context', async ({ browser }) => {
    const storageState = await authenticatedContext.storageState();
    const newTabContext = await browser.newContext({ storageState });
    const newTabPage = await newTabContext.newPage();

    try {
      await newTabPage.goto('/quotes', { waitUntil: 'networkidle', timeout: 15000 });

      const currentUrl = newTabPage.url();
      expect(currentUrl).not.toContain('/login');
      expect(currentUrl).toContain('/quotes');
    } finally {
      await newTabContext.close();
    }
  });

  test('session persists when navigating to invoices page in new context', async ({ browser }) => {
    const storageState = await authenticatedContext.storageState();
    const newTabContext = await browser.newContext({ storageState });
    const newTabPage = await newTabContext.newPage();

    try {
      await newTabPage.goto('/invoices', { waitUntil: 'networkidle', timeout: 15000 });

      const currentUrl = newTabPage.url();
      expect(currentUrl).not.toContain('/login');
      expect(currentUrl).toContain('/invoices');
    } finally {
      await newTabContext.close();
    }
  });

  test('session persists when navigating to settings page in new context', async ({ browser }) => {
    const storageState = await authenticatedContext.storageState();
    const newTabContext = await browser.newContext({ storageState });
    const newTabPage = await newTabContext.newPage();

    try {
      await newTabPage.goto('/settings', { waitUntil: 'networkidle', timeout: 15000 });

      const currentUrl = newTabPage.url();
      expect(currentUrl).not.toContain('/login');
      // Settings may redirect to a sub-page like /settings/account
      expect(currentUrl).toContain('/settings');
    } finally {
      await newTabContext.close();
    }
  });

  test('unauthenticated user is still redirected to login', async ({ browser }) => {
    // Create a fresh context with NO cookies
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();

    try {
      await freshPage.goto('/dashboard', { waitUntil: 'networkidle', timeout: 15000 });

      // Should be redirected to login
      const currentUrl = freshPage.url();
      expect(currentUrl).toContain('/login');
    } finally {
      await freshContext.close();
    }
  });
});
