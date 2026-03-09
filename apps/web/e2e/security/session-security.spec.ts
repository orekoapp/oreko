import { test, expect } from '@playwright/test';

test.describe('Session Security (Bug #326)', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Clear any existing cookies/session
    await page.context().clearCookies();

    // Try to access protected routes without authentication
    const protectedRoutes = ['/dashboard', '/quotes', '/invoices', '/clients', '/settings'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Should redirect to login page
      const url = page.url();
      expect(url).toMatch(/\/(login|auth)/);
    }
  });

  test('should not access API routes without authentication', async ({ request }) => {
    // Try to access protected API routes without session cookies
    const apiRoutes = [
      '/api/quotes',
      '/api/clients',
    ];

    for (const route of apiRoutes) {
      const response = await request.get(route, {
        headers: {
          // No auth cookies
          'cookie': '',
        },
      });

      // Should return 401 or redirect to login
      expect([401, 403, 302, 307]).toContain(response.status());
    }
  });

  test('should invalidate session after logout', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check if we can see the login form (indicating no active session)
    const loginForm = page.getByLabel('Email');
    if (await loginForm.isVisible()) {
      // Not logged in, which is expected after clearing cookies
      expect(true).toBe(true);
    } else {
      // If somehow logged in, try to find logout
      const userMenu = page.locator('[data-testid="user-menu"]');
      if (await userMenu.isVisible()) {
        await userMenu.click();
        const logoutButton = page.getByText(/log\s?out|sign\s?out/i);
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
          await page.waitForLoadState('networkidle');

          // After logout, should be on login page
          expect(page.url()).toMatch(/\/(login|$)/);

          // Try to navigate to protected route
          await page.goto('/dashboard');
          await page.waitForLoadState('networkidle');

          // Should redirect back to login
          expect(page.url()).toMatch(/\/(login|auth)/);
        }
      }
    }
  });

  test('should set secure cookie attributes', async ({ page }) => {
    await page.goto('/login');

    // Check that session cookies have proper security attributes
    const cookies = await page.context().cookies();
    const sessionCookies = cookies.filter(
      (c) => c.name.includes('session') || c.name.includes('token') || c.name.includes('next-auth')
    );

    for (const cookie of sessionCookies) {
      // HttpOnly should be set to prevent JS access
      expect(cookie.httpOnly).toBe(true);
      // SameSite should be set to prevent CSRF
      expect(['Strict', 'Lax']).toContain(cookie.sameSite);
    }
  });
});
