import { chromium, FullConfig } from '@playwright/test';
import { TEST_USER, setupAuthState } from './fixtures/auth.fixture';

/**
 * Global setup for E2E tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0]!.use;

  // Launch browser for setup
  const browser = await chromium.launch();

  try {
    // Create authenticated storage state
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the app
    await page.goto(baseURL || 'http://localhost:3000');

    // Check if app is running
    const isAppRunning = await page.locator('body').isVisible().catch(() => false);
    if (!isAppRunning) {
      throw new Error('Application is not running. Please start the dev server first.');
    }

    // Try to login or register test user
    await page.goto(`${baseURL}/login`);
    await page.waitForLoadState('networkidle');

    // Check if login page loaded
    const loginForm = await page.locator('input[name="email"]').isVisible().catch(() => false);

    if (loginForm) {
      // Try to login
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      // Wait a moment for response
      await page.waitForTimeout(2000);

      // Check if login succeeded
      const loginError = await page.locator('text=Invalid credentials').isVisible().catch(() => false);

      if (loginError) {
        console.log('Test user does not exist, attempting to register...');

        // Register new user
        await page.goto(`${baseURL}/register`);
        await page.waitForLoadState('networkidle');

        await page.fill('input[name="name"]', TEST_USER.name);
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        await page.waitForTimeout(2000);
      }

      // Verify we're logged in
      const isLoggedIn = await page.url().includes('/dashboard') ||
                          await page.url().includes('/onboarding') ||
                          await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);

      if (isLoggedIn) {
        // Save storage state for authenticated tests
        await context.storageState({ path: 'e2e/.auth/user.json' });
        console.log('✓ Authentication state saved');
      } else {
        console.warn('⚠ Could not authenticate test user');
      }
    }

    await context.close();
  } catch (error) {
    console.error('Global setup failed:', error);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
