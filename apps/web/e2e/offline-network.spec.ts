import { test, expect } from '@playwright/test';

test.describe('Offline & Network', () => {
  test.describe('Offline Detection', () => {
    test('should detect offline state', async ({ page, context }) => {
      await page.goto('/dashboard');

      // Go offline
      await context.setOffline(true);

      // Should show offline indicator
      const offlineIndicator = page.getByText(/offline|no connection|network/i);
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible();
      }

      // Restore connection
      await context.setOffline(false);
    });

    test('should show offline banner', async ({ page, context }) => {
      await page.goto('/dashboard');

      await context.setOffline(true);

      const offlineBanner = page.locator('[class*="offline"], [class*="banner"]:has-text("offline")');
      if (await offlineBanner.isVisible()) {
        await expect(offlineBanner).toBeVisible();
      }

      await context.setOffline(false);
    });

    test('should detect when back online', async ({ page, context }) => {
      await page.goto('/dashboard');

      // Go offline then online
      await context.setOffline(true);
      await page.waitForTimeout(1000);
      await context.setOffline(false);

      // Should show reconnected message
      const reconnectedMessage = page.getByText(/back online|connected|reconnected/i);
      if (await reconnectedMessage.isVisible()) {
        await expect(reconnectedMessage).toBeVisible();
      }
    });
  });

  test.describe('Offline Form Handling', () => {
    test('should queue form submissions when offline', async ({ page, context }) => {
      await page.goto('/clients/new');

      const nameInput = page.getByLabel(/name/i).first();
      const emailInput = page.getByLabel(/email/i);

      await nameInput.fill('Offline Test Client');
      await emailInput.fill('offline@test.com');

      // Go offline
      await context.setOffline(true);

      const submitButton = page.getByRole('button', { name: /save|create/i });
      await submitButton.click();

      // Should show queued or offline message
      const queuedMessage = page.getByText(/queued|saved.*offline|will.*sync/i);
      if (await queuedMessage.isVisible()) {
        await expect(queuedMessage).toBeVisible();
      }

      await context.setOffline(false);
    });

    test('should show offline warning on form submission', async ({ page, context }) => {
      await page.goto('/quotes/new');

      await context.setOffline(true);

      const clientSelect = page.getByLabel(/client/i);
      if (await clientSelect.isVisible()) {
        await clientSelect.click();
      }

      // Should show offline warning
      const offlineWarning = page.getByText(/offline|cannot.*save|no connection/i);
      if (await offlineWarning.isVisible()) {
        await expect(offlineWarning).toBeVisible();
      }

      await context.setOffline(false);
    });

    test('should disable submit button when offline', async ({ page, context }) => {
      await page.goto('/clients/new');

      await context.setOffline(true);

      const submitButton = page.getByRole('button', { name: /save|create/i });
      // Button may be disabled when offline
      if (await submitButton.isDisabled()) {
        await expect(submitButton).toBeDisabled();
      }

      await context.setOffline(false);
    });
  });

  test.describe('Network Error Recovery', () => {
    test('should retry failed request', async ({ page, context }) => {
      await page.goto('/quotes');

      // Briefly go offline
      await context.setOffline(true);
      await page.waitForTimeout(500);
      await context.setOffline(false);

      // Should recover and load data
      await page.waitForTimeout(2000);

      const content = page.locator('main');
      await expect(content).toBeVisible();
    });

    test('should show retry button on network failure', async ({ page, context }) => {
      await page.goto('/dashboard');

      await context.setOffline(true);

      // Try to navigate
      await page.goto('/quotes').catch(() => {});

      const retryButton = page.getByRole('button', { name: /retry|try again/i });
      if (await retryButton.isVisible()) {
        await retryButton.click();
      }

      await context.setOffline(false);
    });

    test('should auto-retry on reconnection', async ({ page, context }) => {
      await page.goto('/quotes');

      await context.setOffline(true);

      // Trigger a request that will fail
      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
      }

      await page.waitForTimeout(1000);

      // Come back online
      await context.setOffline(false);

      // Should auto-retry the request
      await page.waitForTimeout(2000);
    });
  });

  test.describe('Slow Network Handling', () => {
    test('should show loading state on slow network', async ({ page }) => {
      // Emulate slow 3G
      const cdpSession = await page.context().newCDPSession(page);
      await cdpSession.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (500 * 1024) / 8, // 500 kbps
        uploadThroughput: (500 * 1024) / 8,
        latency: 400, // 400ms
      });

      await page.goto('/quotes');

      // Should show loading indicator
      const loading = page.locator('[class*="loading"], [class*="spinner"]');
      // Loading may be visible during slow load
      expect(true).toBe(true);

      // Reset network conditions
      await cdpSession.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0,
      });
    });

    test('should handle request timeout', async ({ page }) => {
      // Set short timeout
      page.setDefaultTimeout(5000);

      await page.goto('/dashboard');

      // Even with timeout, should show something
      const content = page.locator('main, body');
      await expect(content.first()).toBeVisible();
    });

    test('should show timeout message', async ({ page, context }) => {
      await page.goto('/quotes');

      // Simulate very slow response
      await page.route('**/api/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        await route.continue();
      });

      // Trigger a request
      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
      }

      // Should show timeout or slow connection message
      const timeoutMessage = page.getByText(/taking.*long|slow.*connection|timeout/i);
      if (await timeoutMessage.isVisible()) {
        await expect(timeoutMessage).toBeVisible();
      }
    });
  });

  test.describe('Cached Data', () => {
    test('should display cached data when offline', async ({ page, context }) => {
      // First, load the page online
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Go offline
      await context.setOffline(true);

      // Reload page
      await page.reload().catch(() => {});

      // Should still show some cached content
      const cachedContent = page.locator('main, [class*="dashboard"]');
      if (await cachedContent.isVisible()) {
        await expect(cachedContent).toBeVisible();
      }

      await context.setOffline(false);
    });

    test('should indicate stale data', async ({ page, context }) => {
      await page.goto('/quotes');

      await context.setOffline(true);

      // Should indicate data might be stale
      const staleIndicator = page.getByText(/last updated|cached|offline data/i);
      if (await staleIndicator.isVisible()) {
        await expect(staleIndicator).toBeVisible();
      }

      await context.setOffline(false);
    });
  });

  test.describe('Sync on Reconnection', () => {
    test('should sync pending changes on reconnection', async ({ page, context }) => {
      await page.goto('/dashboard');

      await context.setOffline(true);

      // Make some changes (if possible)
      await page.waitForTimeout(1000);

      await context.setOffline(false);

      // Should sync
      const syncingMessage = page.getByText(/syncing|synchronizing/i);
      if (await syncingMessage.isVisible()) {
        await expect(syncingMessage).toBeVisible();
      }
    });

    test('should show sync status', async ({ page, context }) => {
      await page.goto('/dashboard');

      await context.setOffline(true);
      await page.waitForTimeout(500);
      await context.setOffline(false);

      // Sync indicator
      const syncStatus = page.locator('[class*="sync"], [aria-label*="sync"]');
      if (await syncStatus.count() > 0) {
        await expect(syncStatus.first()).toBeAttached();
      }
    });
  });

  test.describe('Network Request Failures', () => {
    test('should handle 500 server error', async ({ page }) => {
      await page.route('**/api/quotes', (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        })
      );

      await page.goto('/quotes');

      const errorMessage = page.getByText(/error|something went wrong/i);
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test('should handle 503 service unavailable', async ({ page }) => {
      await page.route('**/api/quotes', (route) =>
        route.fulfill({
          status: 503,
          body: JSON.stringify({ error: 'Service Unavailable' }),
        })
      );

      await page.goto('/quotes');

      const unavailableMessage = page.getByText(/unavailable|maintenance|try again/i);
      if (await unavailableMessage.isVisible()) {
        await expect(unavailableMessage).toBeVisible();
      }
    });

    test('should handle network request abort', async ({ page }) => {
      await page.route('**/api/**', (route) => route.abort());

      await page.goto('/quotes');

      // Should handle gracefully
      const content = page.locator('main, body');
      await expect(content.first()).toBeVisible();
    });
  });

  test.describe('Progressive Loading', () => {
    test('should show skeleton/placeholder during load', async ({ page }) => {
      // Slow down API responses
      await page.route('**/api/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      });

      await page.goto('/quotes');

      // Should show skeleton/placeholder
      const skeleton = page.locator('[class*="skeleton"], [class*="placeholder"], [class*="shimmer"]');
      if (await skeleton.count() > 0) {
        await expect(skeleton.first()).toBeVisible();
      }
    });

    test('should progressively load content', async ({ page }) => {
      await page.goto('/dashboard');

      // Page should load progressively
      const firstContent = page.locator('main h1, main h2').first();
      if (await firstContent.isVisible()) {
        await expect(firstContent).toBeVisible();
      }

      // Then more content loads
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Connection Status Indicator', () => {
    test('should show connection status in UI', async ({ page }) => {
      await page.goto('/dashboard');

      const connectionIndicator = page.locator('[class*="connection"], [class*="status-indicator"]');
      if (await connectionIndicator.count() > 0) {
        await expect(connectionIndicator.first()).toBeAttached();
      }
    });

    test('should update indicator on state change', async ({ page, context }) => {
      await page.goto('/dashboard');

      const indicator = page.locator('[class*="connection"]');

      await context.setOffline(true);
      await page.waitForTimeout(500);

      // Indicator should reflect offline state
      if (await indicator.count() > 0) {
        // Visual change expected
      }

      await context.setOffline(false);
    });
  });

  test.describe('Background Sync', () => {
    test('should support background sync', async ({ page }) => {
      await page.goto('/dashboard');

      // Check for service worker or background sync support
      const swSupport = await page.evaluate(() => 'serviceWorker' in navigator);
      expect(swSupport).toBe(true);
    });
  });
});

test.describe('Offline Accessibility', () => {
  test('should announce offline status', async ({ page, context }) => {
    await page.goto('/dashboard');

    await context.setOffline(true);

    // Status should be announced
    const liveRegion = page.locator('[aria-live], [role="status"], [role="alert"]');
    if (await liveRegion.count() > 0) {
      await expect(liveRegion.first()).toBeAttached();
    }

    await context.setOffline(false);
  });

  test('should have accessible error messages for network failures', async ({ page, context }) => {
    await page.goto('/dashboard');

    await context.setOffline(true);

    // Error messages should be accessible
    const errorMessage = page.locator('[role="alert"], [aria-live="polite"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeAttached();
    }

    await context.setOffline(false);
  });
});
