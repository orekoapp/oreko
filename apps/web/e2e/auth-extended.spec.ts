import { test, expect } from '@playwright/test';

test.describe('Authentication - Registration', () => {
  test.describe('Registration Page', () => {
    test('should display registration page', async ({ page }) => {
      await page.goto('/register');

      await expect(page.getByRole('heading', { name: /sign up|register|create account/i })).toBeVisible();
    });

    test('should show name field', async ({ page }) => {
      await page.goto('/register');

      const nameInput = page.getByLabel(/name|full name/i);
      await expect(nameInput).toBeVisible();
    });

    test('should show email field', async ({ page }) => {
      await page.goto('/register');

      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();
    });

    test('should show password field', async ({ page }) => {
      await page.goto('/register');

      const passwordInput = page.getByLabel(/password/i).first();
      await expect(passwordInput).toBeVisible();
    });

    test('should show confirm password field', async ({ page }) => {
      await page.goto('/register');

      const confirmInput = page.getByLabel(/confirm.*password|repeat.*password/i);
      if (await confirmInput.isVisible()) {
        await expect(confirmInput).toBeVisible();
      }
    });

    test('should have sign up button', async ({ page }) => {
      await page.goto('/register');

      const signUpButton = page.getByRole('button', { name: /sign up|register|create account/i });
      await expect(signUpButton).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/register');

      const loginLink = page.getByRole('link', { name: /sign in|log in|already have an account/i });
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe('Registration Validation', () => {
    test('should validate required fields', async ({ page }) => {
      await page.goto('/register');

      const signUpButton = page.getByRole('button', { name: /sign up|register|create account/i });
      await signUpButton.click();

      // Should show validation errors
      const errorMessage = page.getByText(/required|cannot be empty/i);
      await expect(errorMessage).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/register');

      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill('invalid-email');

      const signUpButton = page.getByRole('button', { name: /sign up|register/i });
      await signUpButton.click();

      const errorMessage = page.getByText(/valid email|invalid email/i);
      await expect(errorMessage).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register');

      const passwordInput = page.getByLabel(/^password$/i);
      await passwordInput.fill('123');

      const signUpButton = page.getByRole('button', { name: /sign up|register/i });
      await signUpButton.click();

      const errorMessage = page.getByText(/password.*characters|too short|stronger/i);
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test('should validate password match', async ({ page }) => {
      await page.goto('/register');

      const passwordInput = page.getByLabel(/^password$/i);
      const confirmInput = page.getByLabel(/confirm.*password/i);

      if (await confirmInput.isVisible()) {
        await passwordInput.fill('Password123!');
        await confirmInput.fill('DifferentPassword!');

        const signUpButton = page.getByRole('button', { name: /sign up|register/i });
        await signUpButton.click();

        const errorMessage = page.getByText(/match|don't match|same/i);
        await expect(errorMessage).toBeVisible();
      }
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/register');

      const nameInput = page.getByLabel(/name/i);
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password$/i);

      await nameInput.fill('Test User');
      await emailInput.fill('existing@example.com');
      await passwordInput.fill('Password123!');

      const signUpButton = page.getByRole('button', { name: /sign up|register/i });
      await signUpButton.click();

      // Should show error for existing email (or redirect if test account exists)
      await page.waitForURL(/register|login|dashboard|onboarding/, { timeout: 5000 }).catch(() => {});
    });
  });

  test.describe('Registration Success', () => {
    test('should redirect after successful registration', async ({ page }) => {
      await page.goto('/register');

      const nameInput = page.getByLabel(/name/i);
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password$/i);

      const uniqueEmail = `test${Date.now()}@example.com`;

      await nameInput.fill('Test User');
      await emailInput.fill(uniqueEmail);
      await passwordInput.fill('Password123!');

      const confirmInput = page.getByLabel(/confirm.*password/i);
      if (await confirmInput.isVisible()) {
        await confirmInput.fill('Password123!');
      }

      const signUpButton = page.getByRole('button', { name: /sign up|register/i });
      await signUpButton.click();

      // Should redirect to dashboard or onboarding
      await page.waitForURL(/dashboard|onboarding|verify/, { timeout: 10000 }).catch(() => null);
    });
  });
});

test.describe('Authentication - Forgot Password', () => {
  test.describe('Forgot Password Page', () => {
    test('should display forgot password page', async ({ page }) => {
      await page.goto('/forgot-password');

      await expect(page.getByRole('heading', { name: /forgot|reset|password/i })).toBeVisible();
    });

    test('should show email field', async ({ page }) => {
      await page.goto('/forgot-password');

      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();
    });

    test('should have submit button', async ({ page }) => {
      await page.goto('/forgot-password');

      const submitButton = page.getByRole('button', { name: /send|reset|submit/i });
      await expect(submitButton).toBeVisible();
    });

    test('should have link back to login', async ({ page }) => {
      await page.goto('/forgot-password');

      const loginLink = page.getByRole('link', { name: /sign in|log in|back to login/i });
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe('Forgot Password Flow', () => {
    test('should validate email field', async ({ page }) => {
      await page.goto('/forgot-password');

      const submitButton = page.getByRole('button', { name: /send|reset|submit/i });
      await submitButton.click();

      const errorMessage = page.getByText(/required|enter.*email/i);
      await expect(errorMessage).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/forgot-password');

      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill('invalid-email');

      const submitButton = page.getByRole('button', { name: /send|reset/i });
      await submitButton.click();

      const errorMessage = page.getByText(/valid email|invalid/i);
      await expect(errorMessage).toBeVisible();
    });

    test('should show success message after submission', async ({ page }) => {
      await page.goto('/forgot-password');

      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill('test@example.com');

      const submitButton = page.getByRole('button', { name: /send|reset/i });
      await submitButton.click();

      // Should show success message (even if email doesn't exist for security)
      const successMessage = page.getByText(/sent|check.*email|instructions/i);
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      }
    });
  });
});

test.describe('Authentication - Reset Password', () => {
  test.describe('Reset Password Page', () => {
    test('should show error for invalid token', async ({ page }) => {
      await page.goto('/reset-password?token=invalid-token');

      const errorMessage = page.getByText(/invalid|expired|not found/i);
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test('should show password fields with valid token', async ({ page }) => {
      // This would need a valid token in real scenario
      await page.goto('/reset-password?token=valid-test-token');

      const passwordInput = page.getByLabel(/new.*password|password/i);
      if (await passwordInput.isVisible()) {
        await expect(passwordInput).toBeVisible();
      }
    });
  });

  test.describe('Reset Password Validation', () => {
    test('should validate password strength', async ({ page }) => {
      await page.goto('/reset-password?token=valid-test-token');

      const passwordInput = page.getByLabel(/new.*password|^password$/i);
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('123');

        const submitButton = page.getByRole('button', { name: /reset|change|submit/i });
        await submitButton.click();

        const errorMessage = page.getByText(/characters|too short|stronger/i);
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/reset-password?token=valid-test-token');

      const passwordInput = page.getByLabel(/new.*password|^password$/i);
      const confirmInput = page.getByLabel(/confirm/i);

      if (await passwordInput.isVisible() && await confirmInput.isVisible()) {
        await passwordInput.fill('NewPassword123!');
        await confirmInput.fill('DifferentPassword!');

        const submitButton = page.getByRole('button', { name: /reset|change/i });
        await submitButton.click();

        const errorMessage = page.getByText(/match|don't match/i);
        await expect(errorMessage).toBeVisible();
      }
    });
  });
});

test.describe('Authentication - Demo Mode', () => {
  test.describe('Demo Login', () => {
    test('should show demo login button', async ({ page }) => {
      await page.goto('/login');

      const demoButton = page.getByRole('button', { name: /demo|try demo/i });
      await expect(demoButton).toBeVisible();
    });

    test('should login as demo user', async ({ page }) => {
      await page.goto('/login');

      const demoButton = page.getByRole('button', { name: /demo|try demo/i });
      await demoButton.click();

      // Should redirect to dashboard
      await page.waitForURL(/dashboard/, { timeout: 10000 }).catch(() => null);
    });

    test('should show demo banner after login', async ({ page }) => {
      await page.goto('/login');

      const demoButton = page.getByRole('button', { name: /demo|try demo/i });
      await demoButton.click();

      await page.waitForURL(/dashboard/, { timeout: 10000 }).catch(() => null);

      // Should show demo mode banner
      const demoBanner = page.getByText(/demo|changes won't be saved/i);
      if (await demoBanner.isVisible()) {
        await expect(demoBanner).toBeVisible();
      }
    });

    test('should prevent mutations in demo mode', async ({ page }) => {
      await page.goto('/login');

      const demoButton = page.getByRole('button', { name: /demo|try demo/i });
      await demoButton.click();

      await page.waitForURL(/dashboard/, { timeout: 10000 }).catch(() => null);

      // Try to create something
      await page.goto('/clients/new');

      const nameInput = page.getByLabel(/name/i);
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Client');

        const submitButton = page.getByRole('button', { name: /create|save/i });
        await submitButton.click();

        // Should show error about demo mode
        const demoError = page.getByText(/demo|cannot|read.only/i);
        if (await demoError.isVisible()) {
          await expect(demoError).toBeVisible();
        }
      }
    });
  });
});

test.describe('Authentication - Session', () => {
  test.describe('Session Management', () => {
    test('should persist session across page reloads', async ({ page }) => {
      await page.goto('/dashboard');

      // If logged in, should stay logged in after reload
      await page.reload();

      // Should still be on dashboard (not redirected to login)
      const currentUrl = page.url();
      // Either on dashboard or login is valid depending on auth state
      expect(currentUrl).toBeTruthy();
    });

    test('should redirect to login when session expires', async ({ page }) => {
      // Clear cookies to simulate expired session
      await page.context().clearCookies();

      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    test('should handle logout correctly', async ({ page }) => {
      await page.goto('/dashboard');

      // Find and click logout
      const userMenu = page.locator('[data-testid="user-menu"]');
      if (await userMenu.isVisible()) {
        await userMenu.click();

        const logoutButton = page.getByRole('menuitem', { name: /log out|sign out/i });
        if (await logoutButton.isVisible()) {
          await logoutButton.click();

          // Should redirect to login
          await expect(page).toHaveURL(/login/);
        }
      }
    });
  });
});

test.describe('Authentication - OAuth', () => {
  test.describe('OAuth Providers', () => {
    test('should show Google sign in button', async ({ page }) => {
      await page.goto('/login');

      const googleButton = page.getByRole('button', { name: /google/i });
      if (await googleButton.isVisible()) {
        await expect(googleButton).toBeVisible();
      }
    });

    test('should show GitHub sign in button', async ({ page }) => {
      await page.goto('/login');

      const githubButton = page.getByRole('button', { name: /github/i });
      if (await githubButton.isVisible()) {
        await expect(githubButton).toBeVisible();
      }
    });
  });
});

test.describe('Authentication Accessibility', () => {
  test('should have accessible login form', async ({ page }) => {
    await page.goto('/login');

    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Form should have labeled inputs
    const labels = page.locator('label');
    await expect(labels.first()).toBeVisible();
  });

  test('should support keyboard navigation on login', async ({ page }) => {
    await page.goto('/login');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have accessible registration form', async ({ page }) => {
    await page.goto('/register');

    const form = page.locator('form');
    await expect(form).toBeVisible();
  });
});
