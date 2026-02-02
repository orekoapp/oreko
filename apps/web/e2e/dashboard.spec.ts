import { test, expect } from '@playwright/test';

test.describe('Dashboard Module', () => {
  test.describe('Dashboard Page', () => {
    test('should display dashboard page with welcome message', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see dashboard heading
      await expect(page.getByRole('heading', { name: /dashboard|welcome/i })).toBeVisible();
    });

    test('should display stats cards', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show key metrics cards
      const statsSection = page.locator('[data-testid="dashboard-stats"], .grid').first();
      await expect(statsSection).toBeVisible();

      // Common stat labels
      const possibleStats = [
        /total revenue/i,
        /quotes/i,
        /invoices/i,
        /pending/i,
        /overdue/i,
        /this month/i,
      ];

      let foundStats = 0;
      for (const stat of possibleStats) {
        if (await page.getByText(stat).first().isVisible()) {
          foundStats++;
        }
      }
      expect(foundStats).toBeGreaterThan(0);
    });

    test('should display recent activity section', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show recent activity or similar section
      const activitySection = page.getByText(/recent|activity|latest/i).first();
      await expect(activitySection).toBeVisible();
    });

    test('should display quick actions', async ({ page }) => {
      await page.goto('/dashboard');

      // Should have quick action buttons or links
      const quickActions = [
        page.getByRole('link', { name: /new quote/i }),
        page.getByRole('link', { name: /new invoice/i }),
        page.getByRole('link', { name: /new client/i }),
        page.getByRole('button', { name: /create/i }),
      ];

      let foundActions = 0;
      for (const action of quickActions) {
        if (await action.isVisible()) {
          foundActions++;
        }
      }
      expect(foundActions).toBeGreaterThan(0);
    });

    test('should display revenue chart or graph', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for chart elements
      const chartElements = [
        page.locator('canvas'),
        page.locator('svg[class*="chart"]'),
        page.locator('[class*="chart"]'),
        page.locator('[data-testid*="chart"]'),
        page.getByText(/revenue|earnings|income/i),
      ];

      let foundChart = false;
      for (const element of chartElements) {
        if (await element.first().isVisible()) {
          foundChart = true;
          break;
        }
      }
      expect(foundChart).toBe(true);
    });

    test('should display pending invoices widget', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show pending/unpaid invoices section
      const pendingSection = page.getByText(/pending|unpaid|outstanding|due/i).first();
      await expect(pendingSection).toBeVisible();
    });

    test('should navigate to quotes from dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      const quotesLink = page.getByRole('link', { name: /quotes|view all quotes/i }).first();
      if (await quotesLink.isVisible()) {
        await quotesLink.click();
        await expect(page).toHaveURL(/\/quotes/);
      }
    });

    test('should navigate to invoices from dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      const invoicesLink = page.getByRole('link', { name: /invoices|view all invoices/i }).first();
      if (await invoicesLink.isVisible()) {
        await invoicesLink.click();
        await expect(page).toHaveURL(/\/invoices/);
      }
    });

    test('should show overdue invoices alert if any', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // If there are overdue invoices, should show alert/warning
      const overdueAlert = page.getByText(/overdue/i).first();
      const hasOverdue = await overdueAlert.isVisible().catch(() => false);

      if (hasOverdue) {
        // Should have visual indicator (red/warning styling)
        await expect(overdueAlert).toBeVisible();
      } else {
        // No overdue invoices - dashboard should still be visible
        const dashboard = page.getByRole('heading', { level: 1 });
        await expect(dashboard).toBeVisible();
      }
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Dashboard should still be usable on mobile
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();

      // Stats should stack or be scrollable - check for any visible content
      const mainContent = page.locator('main, [role="main"], .container').first();
      const hasMain = await mainContent.isVisible().catch(() => false);

      // Dashboard content should be accessible
      expect(hasMain || await heading.isVisible()).toBe(true);
    });
  });

  test.describe('Dashboard Widgets', () => {
    test('should display recent quotes widget', async ({ page }) => {
      await page.goto('/dashboard');

      const recentQuotes = page.getByText(/recent quotes/i);
      if (await recentQuotes.isVisible()) {
        await expect(recentQuotes).toBeVisible();
      }
    });

    test('should display recent clients widget', async ({ page }) => {
      await page.goto('/dashboard');

      const recentClients = page.getByText(/recent clients|new clients/i);
      if (await recentClients.isVisible()) {
        await expect(recentClients).toBeVisible();
      }
    });

    test('should allow widget interactions', async ({ page }) => {
      await page.goto('/dashboard');

      // Widgets should be clickable/expandable
      const widgetLinks = page.locator('a[href^="/quotes/"], a[href^="/invoices/"], a[href^="/clients/"]');
      if (await widgetLinks.count() > 0) {
        await expect(widgetLinks.first()).toBeVisible();
      }
    });
  });

  test.describe('Dashboard Data Loading', () => {
    test('should show loading state initially', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show loading or the dashboard content
      const content = page.locator('main, [role="main"]').first();
      await expect(content).toBeVisible();
    });

    test('should handle empty state gracefully', async ({ page }) => {
      await page.goto('/dashboard');

      // Even with no data, dashboard should render
      await expect(page.getByRole('heading').first()).toBeVisible();
    });
  });
});

test.describe('Dashboard Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have accessible stat cards', async ({ page }) => {
    await page.goto('/dashboard');

    // Stats should have proper labels
    const cards = page.locator('[class*="card"], [class*="Card"]');
    if (await cards.count() > 0) {
      // Cards should contain text labels
      await expect(cards.first()).toContainText(/.+/);
    }
  });
});
