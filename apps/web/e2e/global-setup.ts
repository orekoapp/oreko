import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Test user credentials - can be overridden with environment variables
const TEST_USER = {
  email: process.env.E2E_TEST_USER_EMAIL || 'test@quotecraft.dev',
  password: process.env.E2E_TEST_USER_PASSWORD || 'TestPassword123!',
  name: process.env.E2E_TEST_USER_NAME || 'Test User',
};

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

/**
 * Global setup for E2E tests
 * This runs once before all tests to:
 * 1. Ensure the application is running
 * 2. Create or login test user
 * 3. Save authentication state for reuse
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0]?.use || {};
  const appUrl = baseURL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  console.log(`\n🔧 Global Setup - Target: ${appUrl}`);
  console.log(`📧 Test user: ${TEST_USER.email}`);

  // Ensure auth directory exists
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Check if app is running
    console.log('🔍 Checking if application is running...');
    await page.goto(appUrl, { timeout: 30000 });

    const isAppRunning = await page.locator('body').isVisible();
    if (!isAppRunning) {
      throw new Error('Application is not running');
    }
    console.log('✓ Application is running');

    // Step 2: Navigate to login page
    await page.goto(`${appUrl}/login`);
    await page.waitForLoadState('networkidle');

    // Check if we're already logged in (redirected to dashboard)
    if (page.url().includes('/dashboard') || page.url().includes('/onboarding')) {
      console.log('✓ Already authenticated');
      await context.storageState({ path: AUTH_FILE });
      return;
    }

    // Step 3: Try to login
    console.log('🔐 Attempting login...');

    // Wait for login form - use role-based selectors for robustness
    await page.waitForSelector('input[type="email"], input#email, [name="email"]', { timeout: 10000 });

    // Fill login form using role-based selectors (more robust)
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_USER.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USER.password);

    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for navigation to dashboard/onboarding (with longer timeout for production)
    try {
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });
      console.log('✓ Login successful');
      await context.storageState({ path: AUTH_FILE });
      return;
    } catch {
      // Login redirect didn't happen, check current state
    }

    // Check if login succeeded (fallback check)
    const currentUrl = page.url();
    const isLoggedIn = currentUrl.includes('/dashboard') || currentUrl.includes('/onboarding');

    if (isLoggedIn) {
      console.log('✓ Login successful');
      await context.storageState({ path: AUTH_FILE });
      return;
    }

    // Check for error message indicating user doesn't exist
    const errorText = await page.locator('.text-destructive, [role="alert"]').textContent().catch(() => '');

    if (errorText?.toLowerCase().includes('invalid') || errorText?.toLowerCase().includes('incorrect')) {
      console.log('⚠ User does not exist, attempting registration...');

      // Navigate to register page
      await page.goto(`${appUrl}/register`);
      await page.waitForLoadState('networkidle');

      // Wait for register form
      await page.waitForSelector('input[type="text"], input#name, [name="name"]', { timeout: 10000 });

      // Fill registration form using role-based selectors
      await page.getByRole('textbox', { name: 'Full name' }).fill(TEST_USER.name);
      await page.getByRole('textbox', { name: 'Email' }).fill(TEST_USER.email);
      await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
      await page.getByLabel('Confirm password').fill(TEST_USER.password);

      // Submit registration
      await page.getByRole('button', { name: 'Create account' }).click();

      // Wait for navigation
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });

      console.log('✓ Registration successful');
      await context.storageState({ path: AUTH_FILE });
      return;
    }

    // If we get here, something went wrong
    console.warn('⚠ Could not authenticate test user');
    console.warn(`Current URL: ${page.url()}`);

    // Take screenshot for debugging
    await page.screenshot({ path: path.join(authDir, 'setup-failure.png') });

  } catch (error) {
    console.error('❌ Global setup failed:', error);

    // Take screenshot for debugging
    try {
      await page.screenshot({ path: path.join(authDir, 'setup-error.png') });
    } catch {
      // Ignore screenshot errors
    }

    // Don't throw - allow tests to run (they may handle auth themselves)
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
