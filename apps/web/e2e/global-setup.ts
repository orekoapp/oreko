import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Test user credentials - can be overridden with environment variables
const TEST_USER = {
  email: process.env.E2E_TEST_USER_EMAIL || 'test@quotecraft.dev',
  password: process.env.E2E_TEST_USER_PASSWORD || 'TestPassword123!',
  name: process.env.E2E_TEST_USER_NAME || 'Test User',
};

// Onboarding test user - generate a unique email for each test run to ensure fresh user
const timestamp = Date.now();
const ONBOARDING_USER = {
  email: process.env.E2E_ONBOARDING_USER_EMAIL || `onboarding-${timestamp}@quotecraft.dev`,
  password: process.env.E2E_ONBOARDING_USER_PASSWORD || 'OnboardingTest123!',
  name: process.env.E2E_ONBOARDING_USER_NAME || 'Onboarding Test User',
};

const AUTH_FILE = path.join(__dirname, '.auth/user.json');
const ONBOARDING_AUTH_FILE = path.join(__dirname, '.auth/onboarding-user.json');
const ONBOARDING_CREDENTIALS_FILE = path.join(__dirname, '.auth/onboarding-credentials.json');

/**
 * Complete the onboarding flow if we're on the onboarding page
 */
async function completeOnboardingIfNeeded(page: import('@playwright/test').Page) {
  const currentUrl = page.url();
  if (!currentUrl.includes('/onboarding')) {
    return; // Not on onboarding, nothing to do
  }

  console.log('📝 Completing onboarding...');

  // Keep clicking through onboarding steps until we reach dashboard
  let maxAttempts = 15;
  while (page.url().includes('/onboarding') && maxAttempts > 0) {
    maxAttempts--;

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Try different button patterns - be more flexible with name matching
    const buttonPatterns = [
      { locator: page.getByRole('button', { name: /go to dashboard/i }), name: 'Go to Dashboard' },
      { locator: page.getByRole('button', { name: /complete.*setup/i }), name: 'Complete Setup' },
      { locator: page.getByRole('button', { name: /finish/i }), name: 'Finish' },
      { locator: page.getByRole('button', { name: /get started/i }), name: 'Get Started' },
      { locator: page.getByRole('button', { name: /skip.*now/i }), name: 'Skip for now' },
      { locator: page.getByRole('button', { name: /skip/i }), name: 'Skip' },
      { locator: page.getByRole('button', { name: /continue/i }), name: 'Continue' },
      { locator: page.getByRole('button', { name: /next/i }), name: 'Next' },
    ];

    let clickedButton = false;
    for (const { locator, name } of buttonPatterns) {
      try {
        if (await locator.first().isVisible({ timeout: 500 })) {
          console.log(`   Clicking: ${name}`);
          await locator.first().click();
          clickedButton = true;
          break;
        }
      } catch {
        // Button not found or not visible, try next
      }
    }

    if (!clickedButton) {
      // No known buttons found, wait and try again
      await page.waitForTimeout(1000);
    }

    // Wait for any navigation
    await page.waitForTimeout(500);
  }

  // Wait for dashboard
  if (!page.url().includes('/onboarding')) {
    console.log('✓ Onboarding completed');
  } else {
    console.log('⚠ Could not complete onboarding after max attempts');
    console.log(`   Current URL: ${page.url()}`);
    // Take a screenshot for debugging
    await page.screenshot({ path: path.join(__dirname, '.auth/onboarding-stuck.png') });
  }
}

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

      // Wait for page to fully stabilize (handles layout-level redirects)
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Extra buffer for client-side redirects

      console.log('✓ Login successful');
      console.log(`📍 Current URL: ${page.url()}`);

      // Wait for page to fully stabilize including server-side redirects
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');

      console.log(`📍 After stabilization: ${page.url()}`);

      // Check if we're on onboarding by looking at the page content
      const isOnOnboarding = page.url().includes('/onboarding') ||
        await page.getByText('Welcome to QuoteCraft').isVisible().catch(() => false) ||
        await page.getByText('set up your account').isVisible().catch(() => false);

      if (isOnOnboarding) {
        console.log('📝 On onboarding page, completing flow...');
        await completeOnboardingIfNeeded(page);
      }

      // Navigate to dashboard and verify we can access it properly
      console.log('🏠 Navigating to dashboard...');
      await page.goto(`${appUrl}/dashboard`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');

      // Check again if we got redirected to onboarding
      const stillOnOnboarding = page.url().includes('/onboarding') ||
        await page.getByText('Welcome to QuoteCraft').isVisible().catch(() => false);

      if (stillOnOnboarding) {
        console.log('📝 Still on onboarding after navigation, completing...');
        await completeOnboardingIfNeeded(page);

        // Try navigating to dashboard again
        await page.goto(`${appUrl}/dashboard`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Final check
        const finalCheck = page.url().includes('/onboarding') ||
          await page.getByText('Welcome to QuoteCraft').isVisible().catch(() => false);

        if (finalCheck) {
          console.log('⚠ Could not complete onboarding, taking screenshot...');
          await page.screenshot({ path: path.join(__dirname, '.auth/onboarding-final-stuck.png') });
        }
      }

      // Verify we're on dashboard by checking for sidebar or dashboard elements
      const onDashboard = await page.getByRole('navigation').isVisible().catch(() => false) ||
        await page.locator('[data-sidebar]').isVisible().catch(() => false) ||
        page.url().includes('/dashboard');

      if (onDashboard && !page.url().includes('/onboarding')) {
        console.log('✓ Verified on dashboard');
      } else {
        console.log(`⚠ May not be on dashboard. URL: ${page.url()}`);
      }

      console.log(`📍 Final URL: ${page.url()}`);

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

      // Wait for register form to be ready
      await page.getByLabel('Name').waitFor({ timeout: 10000 });

      // Fill registration form using role-based selectors
      await page.getByLabel('Name').fill(TEST_USER.name);
      await page.getByLabel('Email').fill(TEST_USER.email);
      await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
      await page.getByLabel('Confirm Password').fill(TEST_USER.password);

      // Submit registration
      await page.getByRole('button', { name: 'Create Account' }).click();

      // Wait for navigation
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });

      console.log('✓ Registration successful');

      // Complete onboarding if we're on the onboarding page
      await completeOnboardingIfNeeded(page);

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

/**
 * Setup onboarding test user - creates/logs in user but does NOT complete onboarding
 */
async function setupOnboardingUser(appUrl: string, authDir: string) {
  console.log(`\n🔧 Onboarding User Setup`);
  console.log(`📧 Onboarding test user: ${ONBOARDING_USER.email}`);

  // Save credentials early so tests can use them even if setup fails
  fs.writeFileSync(ONBOARDING_CREDENTIALS_FILE, JSON.stringify(ONBOARDING_USER, null, 2));

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${appUrl}/login`);
    await page.waitForLoadState('networkidle');

    // Check if already on dashboard or onboarding
    if (page.url().includes('/onboarding')) {
      console.log('✓ User on onboarding page (perfect for tests)');
      await context.storageState({ path: ONBOARDING_AUTH_FILE });
      return;
    }

    if (page.url().includes('/dashboard')) {
      console.log('⚠ User already completed onboarding - tests will verify this');
      await context.storageState({ path: ONBOARDING_AUTH_FILE });
      return;
    }

    // Try to login
    console.log('🔐 Attempting login for onboarding user...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    await page.getByRole('textbox', { name: 'Email' }).fill(ONBOARDING_USER.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(ONBOARDING_USER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    try {
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/onboarding')) {
        console.log('✓ Onboarding user logged in - on onboarding page');
        await context.storageState({ path: ONBOARDING_AUTH_FILE });
        return;
      }

      console.log('⚠ Onboarding user already completed onboarding');
      await context.storageState({ path: ONBOARDING_AUTH_FILE });
      return;
    } catch {
      // Login failed, need to register
    }

    // Register new user
    console.log('📝 Registering new onboarding test user...');
    await page.goto(`${appUrl}/register`);
    await page.waitForLoadState('networkidle');

    // Wait for form to be ready
    await page.getByLabel('Name').waitFor({ timeout: 10000 });

    await page.getByLabel('Name').fill(ONBOARDING_USER.name);
    await page.getByLabel('Email').fill(ONBOARDING_USER.email);
    await page.getByLabel('Password', { exact: true }).fill(ONBOARDING_USER.password);
    await page.getByLabel('Confirm Password').fill(ONBOARDING_USER.password);

    await page.getByRole('button', { name: 'Create Account' }).click();

    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    console.log(`📍 Current URL: ${page.url()}`);

    if (page.url().includes('/onboarding')) {
      console.log('✓ Onboarding user registered - on onboarding page (NOT completing it)');
    } else {
      console.log('✓ Onboarding user registered');
    }

    // Save auth state WITHOUT completing onboarding
    await context.storageState({ path: ONBOARDING_AUTH_FILE });

    // Save credentials for tests to use
    fs.writeFileSync(ONBOARDING_CREDENTIALS_FILE, JSON.stringify(ONBOARDING_USER, null, 2));
    console.log('📝 Saved onboarding credentials for tests');

  } catch (error) {
    console.error('❌ Onboarding user setup failed:', error);
    try {
      await page.screenshot({ path: path.join(authDir, 'onboarding-setup-error.png') });
    } catch {
      // Ignore screenshot errors
    }

    // Create an empty auth file so tests can still run (they will handle auth themselves)
    try {
      fs.writeFileSync(ONBOARDING_AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
      // Save credentials so tests can register user if needed
      fs.writeFileSync(ONBOARDING_CREDENTIALS_FILE, JSON.stringify(ONBOARDING_USER, null, 2));
      console.log('📝 Created empty onboarding auth file (tests will handle auth themselves)');
    } catch {
      // Ignore file write errors
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Main global setup - runs both regular and onboarding user setups
 */
async function mainGlobalSetup(config: FullConfig) {
  // Run the main user setup
  await globalSetup(config);

  // Also setup the onboarding user
  const { baseURL } = config.projects[0]?.use || {};
  const appUrl = baseURL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
  const authDir = path.dirname(AUTH_FILE);

  await setupOnboardingUser(appUrl, authDir);
}

export default mainGlobalSetup;
