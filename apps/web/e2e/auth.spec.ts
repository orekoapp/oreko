import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page with proper structure', async ({ page }) => {
    await page.goto('/login');

    // Login page should have heading and form
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors on invalid input', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid email to trigger validation
    const emailInput = page.getByLabel('Email');
    await emailInput.fill('invalid-email');
    await emailInput.blur();

    // Click submit to trigger form validation
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation error for invalid email
    await expect(page.getByText(/valid email/i)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    // Click register link
    await page.getByRole('link', { name: /sign up/i }).click();

    // Should be on register page
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
  });

  test('should have accessible login form', async ({ page }) => {
    await page.goto('/login');

    // Check form labels are properly associated
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toHaveAttribute('type', 'email');

    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show OAuth providers', async ({ page }) => {
    await page.goto('/login');

    // Should have OAuth buttons
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
  });

  test('should show demo mode button', async ({ page }) => {
    await page.goto('/login');

    // Should have demo button
    await expect(page.getByRole('button', { name: /try demo/i })).toBeVisible();
  });

  test('should navigate back to login from register', async ({ page }) => {
    await page.goto('/register');

    // Click sign in link
    await page.getByRole('link', { name: /sign in/i }).click();

    // Should be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show register form fields', async ({ page }) => {
    await page.goto('/register');

    // Should have all form fields
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from quotes', async ({ page }) => {
    await page.goto('/quotes');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from clients', async ({ page }) => {
    await page.goto('/clients');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from invoices', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Public Routes', () => {
  test('should allow access to landing page', async ({ page }) => {
    await page.goto('/');

    // Should not redirect, should show landing page
    await expect(page).toHaveURL('/');

    // Wait for page to fully load and check for hero heading
    await page.waitForLoadState('domcontentloaded');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText(/beautiful invoices/i);
  });

  test('should allow access to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow access to register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });
});
