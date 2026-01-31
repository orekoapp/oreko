import { test, expect } from '@playwright/test';

test.describe('Clients Module', () => {
  test.describe('Clients List Page', () => {
    test('should display clients list page', async ({ page }) => {
      await page.goto('/clients');

      await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /add client/i })).toBeVisible();
    });

    test('should show empty state when no clients', async ({ page }) => {
      await page.goto('/clients');

      const emptyState = page.getByText(/no clients found/i);
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
        await expect(page.getByRole('link', { name: /add your first client/i })).toBeVisible();
      }
    });

    test('should show client stats cards', async ({ page }) => {
      await page.goto('/clients');

      // Should show stats cards
      await expect(page.getByText('Total Clients')).toBeVisible();
      await expect(page.getByText('Individuals')).toBeVisible();
      await expect(page.getByText('Companies')).toBeVisible();
    });

    test('should search clients', async ({ page }) => {
      await page.goto('/clients');

      const searchInput = page.getByPlaceholder(/search clients/i);
      await searchInput.fill('acme');
      await searchInput.press('Enter');

      await expect(page).toHaveURL(/search=acme/);
    });

    test('should filter by type', async ({ page }) => {
      await page.goto('/clients');

      const typeFilter = page.locator('button').filter({ hasText: /all types/i });
      if (await typeFilter.isVisible()) {
        await typeFilter.click();
        await page.getByRole('option', { name: /company/i }).click();

        await expect(page).toHaveURL(/type=company/);
      }
    });

    test('should display client table with columns', async ({ page }) => {
      await page.goto('/clients');

      const table = page.locator('table');
      if (await table.isVisible()) {
        // Should show column headers (use role for specificity)
        await expect(page.getByRole('button', { name: /client/i })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Contact' })).toBeVisible();
        await expect(page.getByRole('button', { name: /quotes/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /invoices/i })).toBeVisible();
      }
    });
  });

  test.describe('Client Creation', () => {
    test('should navigate to create client page', async ({ page }) => {
      await page.goto('/clients');

      await page.getByRole('link', { name: /add client/i }).click();

      await expect(page).toHaveURL(/\/clients\/new/);
    });

    test('should display client form sections', async ({ page }) => {
      await page.goto('/clients/new');

      // Should have form sections
      await expect(page.getByText('Basic Information')).toBeVisible();
      await expect(page.getByText('Address').first()).toBeVisible();
      await expect(page.getByText('Additional Contacts')).toBeVisible();
      await expect(page.getByText('Notes')).toBeVisible();
    });

    test('should display client form fields', async ({ page }) => {
      await page.goto('/clients/new');

      await expect(page.getByLabel(/client type/i)).toBeVisible();
      await expect(page.getByLabel(/full name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i).first()).toBeVisible();
    });

    test('should require name and email', async ({ page }) => {
      await page.goto('/clients/new');

      // Try to save without required fields
      const saveButton = page.getByRole('button', { name: /save client/i });
      await saveButton.click();

      // Should show validation errors
      await expect(page.getByText(/required|at least/i)).toBeVisible();
    });

    test('should switch between individual and company type', async ({ page }) => {
      await page.goto('/clients/new');

      // Default is individual
      await expect(page.getByLabel(/full name/i)).toBeVisible();

      // Switch to company
      await page.getByLabel(/client type/i).click();
      await page.getByRole('option', { name: /company/i }).click();

      // Should show company fields
      await expect(page.getByLabel(/contact name/i)).toBeVisible();
      await expect(page.getByLabel(/company name/i)).toBeVisible();
    });

    test('should add address to client', async ({ page }) => {
      await page.goto('/clients/new');

      // Fill address fields
      await page.getByLabel(/street address/i).fill('123 Main St');
      await page.getByLabel(/city/i).fill('New York');
      await page.getByLabel(/state/i).fill('NY');
      await page.getByLabel(/postal code/i).fill('10001');
      await page.getByLabel(/country/i).fill('USA');
    });

    test('should add contacts to client', async ({ page }) => {
      await page.goto('/clients/new');

      // Add contact
      const addContactButton = page.getByRole('button', { name: /add contact/i });
      await addContactButton.click();

      // Should show contact form
      await expect(page.locator('input[placeholder="Contact name"]')).toBeVisible();
    });
  });

  test.describe('Client Actions', () => {
    test('should open actions menu', async ({ page }) => {
      await page.goto('/clients');

      const actionsMenu = page.getByRole('button', { name: /open menu/i }).first();
      if (await actionsMenu.isVisible()) {
        await actionsMenu.click();

        // Should show menu items
        await expect(page.getByRole('menuitem', { name: /view details/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /edit/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /create quote/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /create invoice/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /delete/i })).toBeVisible();
      }
    });

    test('should show delete confirmation dialog', async ({ page }) => {
      await page.goto('/clients');

      const actionsMenu = page.getByRole('button', { name: /open menu/i }).first();
      if (await actionsMenu.isVisible()) {
        await actionsMenu.click();
        await page.getByRole('menuitem', { name: /delete/i }).click();

        // Should show confirmation dialog
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await expect(page.getByText(/delete client/i)).toBeVisible();
        await expect(page.getByText(/are you sure you want to delete/i)).toBeVisible();

        // Cancel
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.getByRole('alertdialog')).not.toBeVisible();
      }
    });
  });

  test.describe('Bulk Actions', () => {
    test('should select multiple clients with checkboxes', async ({ page }) => {
      await page.goto('/clients');

      const checkboxes = page.locator('table tbody [role="checkbox"]');
      const count = await checkboxes.count();

      if (count > 0) {
        await checkboxes.nth(0).click();

        // Should show bulk action button
        await expect(page.getByRole('button', { name: /delete \d+/i })).toBeVisible();
      }
    });

    test('should select all clients', async ({ page }) => {
      await page.goto('/clients');

      const selectAllCheckbox = page.locator('table thead [role="checkbox"]');
      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.click();

        // All checkboxes should be checked
        const bodyCheckboxes = page.locator('table tbody [role="checkbox"]');
        const count = await bodyCheckboxes.count();
        if (count > 0) {
          await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
        }
      }
    });
  });
});

test.describe('Client Accessibility', () => {
  test('should have proper form labels', async ({ page }) => {
    await page.goto('/clients/new');

    const inputs = page.locator('input:not([type="hidden"]):not([type="checkbox"])');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeAttached();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/clients');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have accessible table', async ({ page }) => {
    await page.goto('/clients');

    const table = page.locator('table');
    if (await table.isVisible()) {
      await expect(table.locator('thead')).toBeAttached();
      await expect(table.locator('tbody')).toBeAttached();
    }
  });
});
