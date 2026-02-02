import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// Authentication storage state paths
const authFile = path.join(__dirname, 'e2e/.auth/user.json');
const onboardingAuthFile = path.join(__dirname, 'e2e/.auth/onboarding-user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  // Global setup and teardown for authentication
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),

  // Default timeout for tests
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Default action timeout
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    // Unauthenticated tests (auth, navigation, public pages)
    {
      name: 'unauthenticated',
      testMatch: [
        '**/auth.spec.ts',
        '**/navigation.spec.ts',
        '**/accessibility.spec.ts',
        '**/rate-limiting.spec.ts',
        '**/error-boundaries.spec.ts',
      ],
      use: { ...devices['Desktop Chrome'] },
    },

    // Onboarding tests - use fresh user that hasn't completed onboarding
    // This project runs its own setup to create a non-onboarded user
    {
      name: 'onboarding',
      testMatch: '**/onboarding.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: onboardingAuthFile,
      },
    },

    // Authenticated tests - use stored auth state from global setup
    {
      name: 'authenticated',
      testMatch: [
        '**/clients.spec.ts',
        '**/quotes.spec.ts',
        '**/invoices.spec.ts',
        '**/rate-cards.spec.ts',
        '**/settings.spec.ts',
        '**/dashboard.spec.ts',
        '**/dashboard-accessibility.spec.ts',
        '**/analytics.spec.ts',
        '**/stripe-webhooks.spec.ts',
        '**/file-uploads.spec.ts',
        '**/email-delivery.spec.ts',
        '**/search-filtering.spec.ts',
        '**/multi-user-team.spec.ts',
        '**/notifications.spec.ts',
        '**/offline-network.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
    },

    // Regression tests - require authentication and seeded data
    {
      name: 'regression',
      testDir: './e2e/regression',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
    },

    // Cross-browser tests (run subset on other browsers)
    {
      name: 'firefox',
      testMatch: '**/auth.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: '**/auth.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile tests
    {
      name: 'mobile-chrome',
      testMatch: '**/accessibility.spec.ts',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      testMatch: '**/accessibility.spec.ts',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
