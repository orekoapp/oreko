import { test, expect } from '@playwright/test';

/**
 * TC-PM-001 to TC-PM-020: Permission Matrix Tests
 *
 * Tests role-based access control for different user roles:
 * - Owner: Full access to everything
 * - Admin: Full access except billing/subscription
 * - Member: Limited access (view quotes, clients)
 * - Viewer: Read-only access
 *
 * Also tests workspace-level permissions and data isolation.
 */

const TEST_USERS = {
  owner: { email: 'owner@quotecraft.dev', password: 'OwnerPass123!' },
  admin: { email: 'admin@quotecraft.dev', password: 'AdminPass123!' },
  member: { email: 'member@quotecraft.dev', password: 'MemberPass123!' },
  viewer: { email: 'viewer@quotecraft.dev', password: 'ViewerPass123!' },
};

async function loginAs(page: any, role: keyof typeof TEST_USERS) {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_USERS[role].email);
  await page.fill('input[name="password"]', TEST_USERS[role].password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|quotes|invoices)?$/);
}

test.describe('Permission Matrix - Owner Role', () => {
  test.skip('TC-PM-001: owner can access all menu items', async ({ page }) => {
    await loginAs(page, 'owner');

    // Check all navigation items are visible
    const navItems = ['Dashboard', 'Quotes', 'Invoices', 'Clients', 'Rate Cards', 'Templates', 'Settings'];

    for (const item of navItems) {
      const navLink = page.getByRole('link', { name: new RegExp(item, 'i') });
      await expect(navLink).toBeVisible();
    }
  });

  test.skip('TC-PM-002: owner can access billing settings', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.goto('/settings/billing');

    // Should not show access denied
    await expect(page.getByText(/access denied|unauthorized/i)).not.toBeVisible();

    // Should show billing content
    await expect(page.getByText(/subscription|billing|plan/i)).toBeVisible();
  });

  test.skip('TC-PM-003: owner can manage team members', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.goto('/settings/team');

    // Should see team management
    await expect(page.getByText(/team|members/i)).toBeVisible();

    // Should have invite button
    await expect(page.getByRole('button', { name: /invite/i })).toBeVisible();

    // Should be able to change roles
    const roleSelect = page.locator('[data-testid="role-select"]').first();
    await expect(roleSelect).toBeEnabled();
  });

  test.skip('TC-PM-004: owner can delete workspace', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.goto('/settings/workspace');

    // Danger zone should be visible
    const dangerZone = page.locator('[data-testid="danger-zone"]');
    await expect(dangerZone).toBeVisible();

    // Delete workspace button should be present
    await expect(page.getByRole('button', { name: /delete workspace/i })).toBeVisible();
  });
});

test.describe('Permission Matrix - Admin Role', () => {
  test.skip('TC-PM-005: admin can create quotes', async ({ page }) => {
    await loginAs(page, 'admin');

    await page.goto('/quotes/new');

    // Should not be redirected
    await expect(page).toHaveURL(/\/quotes\/new/);

    // Should see quote builder
    await expect(page.getByText(/new quote|create quote/i)).toBeVisible();
  });

  test.skip('TC-PM-006: admin can manage clients', async ({ page }) => {
    await loginAs(page, 'admin');

    // Can view clients
    await page.goto('/clients');
    await expect(page.getByText(/clients/i)).toBeVisible();

    // Can create client
    await page.goto('/clients/new');
    await expect(page).toHaveURL(/\/clients\/new/);
  });

  test.skip('TC-PM-007: admin cannot access billing', async ({ page }) => {
    await loginAs(page, 'admin');

    await page.goto('/settings/billing');

    // Should show access denied or redirect
    const denied = page.getByText(/access denied|unauthorized|permission/i);
    const redirect = page.url().includes('/settings/billing') === false;

    expect(await denied.isVisible() || redirect).toBeTruthy();
  });

  test.skip('TC-PM-008: admin cannot delete workspace', async ({ page }) => {
    await loginAs(page, 'admin');

    await page.goto('/settings/workspace');

    // Danger zone should not be visible or delete button disabled
    const deleteButton = page.getByRole('button', { name: /delete workspace/i });
    await expect(deleteButton).toBeHidden().or(expect(deleteButton).toBeDisabled());
  });

  test.skip('TC-PM-009: admin can invite members (not owners)', async ({ page }) => {
    await loginAs(page, 'admin');

    await page.goto('/settings/team');

    // Click invite
    await page.getByRole('button', { name: /invite/i }).click();

    const inviteDialog = page.locator('[role="dialog"]');
    if (await inviteDialog.isVisible()) {
      // Role selector should not have owner option
      await page.click('[data-testid="role-select"]');
      await expect(page.getByRole('option', { name: /owner/i })).toBeHidden();
    }
  });
});

test.describe('Permission Matrix - Member Role', () => {
  test.skip('TC-PM-010: member can view quotes', async ({ page }) => {
    await loginAs(page, 'member');

    await page.goto('/quotes');

    // Should see quotes list
    await expect(page.getByText(/quotes/i)).toBeVisible();
  });

  test.skip('TC-PM-011: member can create quotes', async ({ page }) => {
    await loginAs(page, 'member');

    await page.goto('/quotes/new');

    // Should be able to create quotes
    await expect(page).toHaveURL(/\/quotes\/new/);
  });

  test.skip('TC-PM-012: member cannot access settings', async ({ page }) => {
    await loginAs(page, 'member');

    await page.goto('/settings');

    // Should be denied or redirected
    const denied = page.getByText(/access denied|unauthorized/i);
    const redirect = page.url().includes('/settings') === false;

    expect(await denied.isVisible() || redirect).toBeTruthy();
  });

  test.skip('TC-PM-013: member cannot delete quotes created by others', async ({ page }) => {
    await loginAs(page, 'member');

    await page.goto('/quotes');

    // Find a quote not created by this user
    const quoteRow = page.locator('tr').first();
    await quoteRow.click();

    // Actions menu
    const actionsMenu = page.locator('button[aria-label="actions"]');
    if (await actionsMenu.isVisible()) {
      await actionsMenu.click();

      // Delete should be disabled or hidden
      const deleteOption = page.getByRole('menuitem', { name: /delete/i });
      await expect(deleteOption).toBeHidden().or(expect(deleteOption).toBeDisabled());
    }
  });

  test.skip('TC-PM-014: member can only see assigned clients', async ({ page }) => {
    await loginAs(page, 'member');

    await page.goto('/clients');

    // Should only see clients assigned to them
    // (This depends on business logic - adjust as needed)
    const clientRows = page.locator('tbody tr');
    const count = await clientRows.count();

    // Member should see a subset of all clients
    // In a real test, compare with owner view count
  });
});

test.describe('Permission Matrix - Viewer Role', () => {
  test.skip('TC-PM-015: viewer can only view quotes', async ({ page }) => {
    await loginAs(page, 'viewer');

    await page.goto('/quotes');

    // Should see quotes
    await expect(page.getByText(/quotes/i)).toBeVisible();

    // Create button should be hidden
    await expect(page.getByRole('link', { name: /create|new quote/i })).toBeHidden();
  });

  test.skip('TC-PM-016: viewer cannot edit quotes', async ({ page }) => {
    await loginAs(page, 'viewer');

    await page.goto('/quotes');

    // Click on a quote
    await page.click('tbody tr').first();

    // Edit button should be disabled or hidden
    const editButton = page.getByRole('button', { name: /edit/i });
    await expect(editButton).toBeHidden().or(expect(editButton).toBeDisabled());
  });

  test.skip('TC-PM-017: viewer cannot access invoices', async ({ page }) => {
    await loginAs(page, 'viewer');

    await page.goto('/invoices');

    // Should be denied
    const denied = page.getByText(/access denied|unauthorized/i);
    await expect(denied).toBeVisible();
  });

  test.skip('TC-PM-018: viewer cannot see financial data', async ({ page }) => {
    await loginAs(page, 'viewer');

    await page.goto('/quotes');
    await page.click('tbody tr').first();

    // Financial columns should be hidden or masked
    const amountCell = page.locator('[data-testid="quote-amount"]');

    // Either hidden or shows masked value
    const isHidden = await amountCell.isHidden();
    const isMasked = (await amountCell.textContent())?.includes('***');

    expect(isHidden || isMasked).toBeTruthy();
  });
});

test.describe('Permission Matrix - Cross-Workspace Isolation', () => {
  test.skip('TC-PM-019: cannot access other workspace data via URL', async ({ page }) => {
    await loginAs(page, 'owner');

    // Try to access a quote from another workspace
    await page.goto('/quotes/other-workspace-quote-id');

    // Should show not found or access denied
    await expect(page.getByText(/not found|access denied|unauthorized/i)).toBeVisible();
  });

  test.skip('TC-PM-020: API rejects cross-workspace requests', async ({ page }) => {
    await loginAs(page, 'owner');

    // Try to fetch data from another workspace via API
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/quotes/other-workspace-quote-id');
      return { status: res.status, ok: res.ok };
    });

    // Should return 403 or 404
    expect([403, 404]).toContain(response.status);
  });
});

test.describe('Permission Matrix - Session Security', () => {
  test.skip('TC-PM-021: permission changes take effect immediately', async ({ page, context }) => {
    await loginAs(page, 'admin');

    // Verify current permissions
    await page.goto('/settings/team');
    await expect(page).toHaveURL(/\/settings\/team/);

    // Simulate permission change (downgrade to member)
    // In real scenario, this would be done by owner in another session

    // After permission change, refreshing should reflect new permissions
    await page.reload();

    // Admin-only features should now be hidden
    // (This test requires coordinated permission changes)
  });

  test.skip('TC-PM-022: revoked access redirects to login', async ({ page }) => {
    await loginAs(page, 'member');

    // Navigate to a protected page
    await page.goto('/quotes');

    // Simulate access revocation (e.g., removed from workspace)
    // This would need API-level intervention or test hooks

    // Next navigation should redirect to login
    await page.goto('/invoices');
    // If removed, should be redirected
  });
});
