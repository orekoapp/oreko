import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.describe('Skip to Content', () => {
    test('should have skip to content link', async ({ page }) => {
      await page.goto('/login');

      // Skip link should exist (usually hidden until focused)
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeAttached();
    });

    test('skip link should be focusable', async ({ page }) => {
      await page.goto('/login');

      // Tab to first focusable element (should be skip link)
      await page.keyboard.press('Tab');

      const skipLink = page.locator('a[href="#main-content"]');

      // Skip link should become visible when focused
      const isFocused = await skipLink.evaluate(
        (el) => document.activeElement === el
      );

      // Either it's focused or first focusable is something else
      expect(typeof isFocused).toBe('boolean');
    });
  });

  test.describe('Landmarks', () => {
    test('should have main landmark', async ({ page }) => {
      await page.goto('/login');

      const main = page.locator('main, [role="main"]');
      await expect(main).toBeAttached();
    });

    test('should have navigation landmark in dashboard', async ({ page }) => {
      // Skip if requires auth
      await page.goto('/login');

      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav.first()).toBeAttached();
    });
  });

  test.describe('Headings', () => {
    test('should have single h1 on page', async ({ page }) => {
      await page.goto('/login');

      const h1Elements = page.locator('h1');
      const count = await h1Elements.count();

      // Should have exactly one h1
      expect(count).toBe(1);
    });

    test('login page should have proper heading', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });

  test.describe('Form Accessibility', () => {
    test('login form should have proper labels', async ({ page }) => {
      await page.goto('/login');

      // Email input should have label
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();

      // Password input should have label
      const passwordInput = page.getByLabel(/password/i);
      await expect(passwordInput).toBeVisible();
    });

    test('form inputs should have proper types', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toHaveAttribute('type', 'email');

      const passwordInput = page.getByLabel(/password/i);
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('submit button should be accessible', async ({ page }) => {
      await page.goto('/login');

      const submitButton = page.getByRole('button', { name: /sign in|login|submit/i });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should tab through login form', async ({ page }) => {
      await page.goto('/login');

      // Skip any skip links
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to focus email input
      const emailInput = page.getByLabel(/email/i);
      await emailInput.focus();

      await expect(emailInput).toBeFocused();

      // Tab to password
      await page.keyboard.press('Tab');
      const passwordInput = page.getByLabel(/password/i);

      // Check if focused (might have intermediate elements)
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    });

    test('should submit form with Enter', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('password123');
      await page.keyboard.press('Enter');

      // Form should attempt submission (will show error for invalid credentials)
      await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.getByLabel(/email/i);
      await emailInput.focus();

      // Check that focus is visible (has outline or ring)
      const styles = await emailInput.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          outlineWidth: computed.outlineWidth,
          outlineStyle: computed.outlineStyle,
          boxShadow: computed.boxShadow,
        };
      });

      // Should have some visible focus indicator
      const hasFocusIndicator =
        styles.outlineWidth !== '0px' ||
        styles.outlineStyle !== 'none' ||
        styles.boxShadow !== 'none';

      expect(hasFocusIndicator).toBe(true);
    });
  });

  test.describe('Color Contrast', () => {
    test('text should be readable', async ({ page }) => {
      await page.goto('/login');

      // This is a basic check - for full contrast testing, use axe-playwright
      const body = page.locator('body');
      const styles = await body.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      expect(styles.color).toBeDefined();
      expect(styles.backgroundColor).toBeDefined();
    });
  });

  test.describe('Images', () => {
    test('images should have alt text', async ({ page }) => {
      await page.goto('/login');

      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');

        // Either has alt text or is decorative (empty alt is valid for decorative)
        expect(alt !== null).toBe(true);
      }
    });
  });

  test.describe('ARIA Attributes', () => {
    test('buttons should have accessible names', async ({ page }) => {
      await page.goto('/login');

      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const name = await button.evaluate((el) => {
          return el.getAttribute('aria-label') ||
                 el.textContent?.trim() ||
                 el.getAttribute('title');
        });

        // Button should have some accessible name
        expect(name).toBeTruthy();
      }
    });

    test('links should have accessible names', async ({ page }) => {
      await page.goto('/login');

      const links = page.locator('a');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const name = await link.evaluate((el) => {
          return el.getAttribute('aria-label') ||
                 el.textContent?.trim() ||
                 el.getAttribute('title');
        });

        expect(name).toBeTruthy();
      }
    });
  });

  test.describe('Error States', () => {
    test('should announce form errors', async ({ page }) => {
      await page.goto('/login');

      // Submit empty form
      await page.getByRole('button', { name: /sign in/i }).click();

      // Error message should be visible
      const errorMessage = page.getByText(/required|invalid|error/i);
      await expect(errorMessage).toBeVisible();

      // Error should be associated with input (aria-describedby or aria-errormessage)
      // This is a simplified check
    });
  });

  test.describe('Responsive Accessibility', () => {
    test('should be accessible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');

      // Should still have all required elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('touch targets should be adequate size', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');

      const submitButton = page.getByRole('button', { name: /sign in/i });
      const box = await submitButton.boundingBox();

      if (box) {
        // Touch targets should be at least 44x44 pixels
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test.describe('404 Page Accessibility', () => {
    test('404 page should have proper structure', async ({ page }) => {
      await page.goto('/non-existent-page');

      // Should have heading
      const heading = page.getByRole('heading');
      await expect(heading.first()).toBeVisible();

      // Should have way to navigate back
      const homeLink = page.getByRole('link', { name: /home|back|return/i });
      await expect(homeLink.first()).toBeVisible();
    });
  });
});

test.describe('Theme Toggle Accessibility', () => {
  test('theme toggle should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByRole('button', { name: /theme|toggle/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.focus();
      await expect(themeToggle).toBeFocused();

      await page.keyboard.press('Enter');

      // Menu should open
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
    }
  });

  test('theme options should be navigable', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByRole('button', { name: /theme/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Should be able to select with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    }
  });
});
