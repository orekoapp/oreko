import { test as base, expect } from '@playwright/test';

// Test user credentials for E2E tests
export const TEST_USER = {
  email: process.env.E2E_TEST_USER_EMAIL || 'e2e-test@quotecraft.dev',
  password: process.env.E2E_TEST_USER_PASSWORD || 'TestPassword123!',
  name: process.env.E2E_TEST_USER_NAME || 'E2E Test User',
};

// Admin user for elevated permissions tests
export const ADMIN_USER = {
  email: 'admin@quotecraft.dev',
  password: 'AdminPassword123!',
  name: 'Admin User',
};

// Fixture type definitions
type AuthFixtures = {
  authenticatedPage: typeof base;
  adminPage: typeof base;
};

/**
 * Custom fixture that provides an authenticated page context
 * Usage: test('my test', async ({ authenticatedPage }) => { ... })
 */
export const test = base.extend<AuthFixtures>({
  // Authenticated user fixture
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if we're already logged in (session exists)
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);

    if (!isLoggedIn) {
      // Fill in login form using id selectors
      await page.fill('#email', TEST_USER.email);
      await page.fill('#password', TEST_USER.password);

      // Submit login form
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard or onboarding
      await page.waitForURL(/\/(dashboard|onboarding|quotes|invoices|clients)?$/);
    }

    // Use the authenticated page
    await use(page as any);
  },

  // Admin user fixture
  adminPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);

    if (!isLoggedIn) {
      await page.fill('#email', ADMIN_USER.email);
      await page.fill('#password', ADMIN_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|onboarding|quotes|invoices|clients)?$/);
    }

    await use(page as any);
  },
});

export { expect };

/**
 * Helper function to set up authentication state via storage state
 * This can be used in globalSetup to authenticate once per test run
 */
export async function setupAuthState(browser: any): Promise<void> {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill login form using id selectors
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/\/(dashboard|onboarding|quotes|invoices|clients)?$/, { timeout: 10000 });

    // Save storage state
    await context.storageState({ path: 'e2e/.auth/user.json' });
  } finally {
    await context.close();
  }
}

/**
 * Helper to create a test user if it doesn't exist
 * Use this in a setup script before running E2E tests
 */
export async function ensureTestUserExists(page: any): Promise<void> {
  // Try to login first
  await page.goto('/login');

  await page.fill('#email', TEST_USER.email);
  await page.fill('#password', TEST_USER.password);
  await page.click('button[type="submit"]');

  // Wait for navigation or error
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Check if login succeeded
  const currentUrl = page.url();
  const isLoggedIn = currentUrl.includes('/dashboard') || currentUrl.includes('/onboarding');

  if (!isLoggedIn) {
    // Check for error - user may not exist
    const errorText = await page.locator('.text-destructive, [role="alert"]').textContent().catch(() => '');

    if (errorText?.toLowerCase().includes('invalid') || errorText?.toLowerCase().includes('incorrect')) {
      // Register new user
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      await page.fill('#name', TEST_USER.name);
      await page.fill('#email', TEST_USER.email);
      await page.fill('#password', TEST_USER.password);
      await page.fill('#confirmPassword', TEST_USER.password);
      await page.click('button[type="submit"]');

      // Wait for registration success
      await page.waitForURL(/\/(onboarding|dashboard)?$/);
    }
  }
}

/**
 * Helper to logout the current user
 */
export async function logout(page: any): Promise<void> {
  // Click user menu
  await page.click('[data-testid="user-menu"]');

  // Click logout
  await page.click('[data-testid="logout-button"]');

  // Wait for redirect to login
  await page.waitForURL(/\/login/);
}

/**
 * Helper to switch between test users
 */
export async function switchUser(page: any, user: typeof TEST_USER): Promise<void> {
  await logout(page);

  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(dashboard|onboarding|quotes|invoices|clients)?$/);
}
