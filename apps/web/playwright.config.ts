import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Support multiple environment variable names for flexibility
const baseURL = process.env.BASE_URL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// Skip local webServer when testing against external URLs (production/staging)
const isExternalUrl = !baseURL.includes('localhost');

// Authentication storage state paths
const authFile = path.join(__dirname, 'e2e/.auth/user.json');
const onboardingAuthFile = path.join(__dirname, 'e2e/.auth/onboarding-user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 3, // Limit parallel workers to reduce timeouts
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
    navigationTimeout: 30000, // Increased to handle dev server compilation delays
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
        // Phase 2 tests
        '**/projects.spec.ts',
        '**/sidebar-hierarchy.spec.ts',
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

    // Data integrity tests - specifically test edge cases with null relations
    // Requires edge case data to be seeded: SEED_EDGE_CASES=true npx tsx e2e/utils/seed-e2e-data.ts
    {
      name: 'data-integrity',
      testDir: './e2e/regression/data-integrity',
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

  // Only start local dev server when testing localhost
  ...(isExternalUrl ? {} : {
    webServer: {
      command: 'pnpm run dev',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  }),
});
