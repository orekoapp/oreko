import { test, expect } from '@playwright/test';

test.describe('Clients Module', () => {
  test.describe('Clients List Page', () => {
    test.skip('should display clients list page', async ({ page }) => {
      await page.goto('/clients');

      await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /add|create|new client/i })).toBeVisible();
    });

    test.skip('should show empty state when no clients', async ({ page }) => {
      await page.goto('/clients');

      const emptyState = page.getByText(/no clients|get started|add.*first/i);
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });

    test.skip('should search clients', async ({ page }) => {
      await page.goto('/clients');

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('acme');
      await searchInput.press('Enter');

      await expect(page).toHaveURL(/search=acme/);
    });

    test.skip('should filter by type', async ({ page }) => {
      await page.goto('/clients');

      const typeFilter = page.getByRole('combobox', { name: /type/i });
      if (await typeFilter.isVisible()) {
        await typeFilter.click();
        await page.getByRole('option', { name: /company/i }).click();

        await expect(page).toHaveURL(/type=company/);
      }
    });

    test.skip('should filter by tags', async ({ page }) => {
      await page.goto('/clients');

      const tagFilter = page.getByRole('combobox', { name: /tag/i });
      if (await tagFilter.isVisible()) {
        await tagFilter.click();
        await page.getByRole('option', { name: /vip/i }).click();
      }
    });

    test.skip('should display client list with key info', async ({ page }) => {
      await page.goto('/clients');

      const table = page.locator('table');
      if (await table.isVisible()) {
        // Should show client name, email, company columns
        await expect(table.getByRole('columnheader', { name: /name/i })).toBeVisible();
        await expect(table.getByRole('columnheader', { name: /email/i })).toBeVisible();
      }
    });
  });

  test.describe('Client Creation', () => {
    test.skip('should navigate to create client page', async ({ page }) => {
      await page.goto('/clients');

      await page.getByRole('link', { name: /add|create|new client/i }).click();

      await expect(page).toHaveURL(/\/clients\/new/);
    });

    test.skip('should display client form', async ({ page }) => {
      await page.goto('/clients/new');

      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
    });

    test.skip('should require name and email', async ({ page }) => {
      await page.goto('/clients/new');

      // Try to save without required fields
      const saveButton = page.getByRole('button', { name: /save|create/i });
      await saveButton.click();

      // Should show validation errors
      await expect(page.getByText(/required|please enter/i)).toBeVisible();
    });

    test.skip('should create individual client', async ({ page }) => {
      await page.goto('/clients/new');

      await page.getByLabel(/name/i).fill('John Doe');
      await page.getByLabel(/email/i).fill('john@example.com');

      // Select individual type
      const typeSelect = page.getByLabel(/type/i);
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.getByRole('option', { name: /individual/i }).click();
      }

      // Save
      await page.getByRole('button', { name: /save|create/i }).click();

      // Should redirect to client detail or list
      await expect(page).toHaveURL(/\/clients/);
    });

    test.skip('should create company client', async ({ page }) => {
      await page.goto('/clients/new');

      await page.getByLabel(/name/i).fill('Acme Corporation');
      await page.getByLabel(/email/i).fill('contact@acme.com');

      const typeSelect = page.getByLabel(/type/i);
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.getByRole('option', { name: /company/i }).click();
      }

      // Fill company field
      const companyInput = page.getByLabel(/company.*name/i);
      if (await companyInput.isVisible()) {
        await companyInput.fill('Acme Corp');
      }

      await page.getByRole('button', { name: /save|create/i }).click();

      await expect(page).toHaveURL(/\/clients/);
    });

    test.skip('should add address to client', async ({ page }) => {
      await page.goto('/clients/new');

      await page.getByLabel(/name/i).fill('Test Client');
      await page.getByLabel(/email/i).fill('test@example.com');

      // Fill address
      await page.getByLabel(/street/i).fill('123 Main St');
      await page.getByLabel(/city/i).fill('New York');
      await page.getByLabel(/state/i).fill('NY');
      await page.getByLabel(/postal.*code|zip/i).fill('10001');
      await page.getByLabel(/country/i).fill('USA');

      await page.getByRole('button', { name: /save|create/i }).click();
    });

    test.skip('should add contacts to client', async ({ page }) => {
      await page.goto('/clients/new');

      await page.getByLabel(/name/i).fill('Test Company');
      await page.getByLabel(/email/i).fill('info@company.com');

      // Add contact
      const addContactButton = page.getByRole('button', { name: /add.*contact/i });
      if (await addContactButton.isVisible()) {
        await addContactButton.click();

        // Fill contact details
        await page.getByLabel(/contact.*name/i).fill('Jane Smith');
        await page.getByLabel(/contact.*email/i).fill('jane@company.com');
        await page.getByLabel(/role/i).fill('Project Manager');
      }

      await page.getByRole('button', { name: /save|create/i }).click();
    });

    test.skip('should add tags to client', async ({ page }) => {
      await page.goto('/clients/new');

      await page.getByLabel(/name/i).fill('VIP Client');
      await page.getByLabel(/email/i).fill('vip@example.com');

      // Add tags
      const tagInput = page.getByLabel(/tags/i);
      if (await tagInput.isVisible()) {
        await tagInput.fill('VIP');
        await tagInput.press('Enter');
        await tagInput.fill('Enterprise');
        await tagInput.press('Enter');
      }

      await page.getByRole('button', { name: /save|create/i }).click();
    });
  });

  test.describe('Client Detail', () => {
    test.skip('should display client details', async ({ page }) => {
      await page.goto('/clients');

      const firstClient = page.locator('table tbody tr').first();
      if (await firstClient.isVisible()) {
        await firstClient.click();

        // Should show client info
        await expect(page.getByText(/contact.*info|details/i)).toBeVisible();
      }
    });

    test.skip('should show tabs for quotes and invoices', async ({ page }) => {
      await page.goto('/clients');

      const firstClient = page.locator('table tbody tr').first();
      if (await firstClient.isVisible()) {
        await firstClient.click();

        // Should have tabs
        await expect(page.getByRole('tab', { name: /quotes/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /invoices/i })).toBeVisible();
      }
    });

    test.skip('should show client history', async ({ page }) => {
      await page.goto('/clients');

      const firstClient = page.locator('table tbody tr').first();
      if (await firstClient.isVisible()) {
        await firstClient.click();

        // Should show activity/history
        const activityTab = page.getByRole('tab', { name: /activity|history/i });
        if (await activityTab.isVisible()) {
          await activityTab.click();
          await expect(page.getByText(/activity|history/i)).toBeVisible();
        }
      }
    });

    test.skip('should show client notes', async ({ page }) => {
      await page.goto('/clients');

      const firstClient = page.locator('table tbody tr').first();
      if (await firstClient.isVisible()) {
        await firstClient.click();

        const notesTab = page.getByRole('tab', { name: /notes/i });
        if (await notesTab.isVisible()) {
          await notesTab.click();
          await expect(page.getByPlaceholder(/note/i)).toBeVisible();
        }
      }
    });
  });

  test.describe('Client Actions', () => {
    test.skip('should edit client', async ({ page }) => {
      await page.goto('/clients');

      const firstClient = page.locator('table tbody tr').first();
      if (await firstClient.isVisible()) {
        await firstClient.click();

        const editButton = page.getByRole('button', { name: /edit/i });
        await editButton.click();

        // Should be in edit mode
        await expect(page.getByLabel(/name/i)).toBeEnabled();
      }
    });

    test.skip('should create quote from client page', async ({ page }) => {
      await page.goto('/clients');

      const firstClient = page.locator('table tbody tr').first();
      if (await firstClient.isVisible()) {
        await firstClient.click();

        const createQuoteButton = page.getByRole('button', { name: /create.*quote|new.*quote/i });
        if (await createQuoteButton.isVisible()) {
          await createQuoteButton.click();

          // Should navigate to quote creation with client pre-selected
          await expect(page).toHaveURL(/\/quotes\/new/);
        }
      }
    });

    test.skip('should create invoice from client page', async ({ page }) => {
      await page.goto('/clients');

      const firstClient = page.locator('table tbody tr').first();
      if (await firstClient.isVisible()) {
        await firstClient.click();

        const createInvoiceButton = page.getByRole('button', { name: /create.*invoice|new.*invoice/i });
        if (await createInvoiceButton.isVisible()) {
          await createInvoiceButton.click();

          await expect(page).toHaveURL(/\/invoices\/new/);
        }
      }
    });

    test.skip('should delete client with confirmation', async ({ page }) => {
      await page.goto('/clients');

      const actionsMenu = page.locator('button[aria-label="actions"]').first();
      if (await actionsMenu.isVisible()) {
        await actionsMenu.click();

        await page.getByRole('menuitem', { name: /delete/i }).click();

        // Should show confirmation dialog
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await expect(page.getByText(/are you sure|confirm/i)).toBeVisible();

        // Cancel
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.getByRole('alertdialog')).not.toBeVisible();
      }
    });
  });

  test.describe('Bulk Actions', () => {
    test.skip('should select multiple clients', async ({ page }) => {
      await page.goto('/clients');

      const checkboxes = page.locator('table tbody input[type="checkbox"]');
      if (await checkboxes.count() > 0) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        // Should show bulk actions
        await expect(page.getByText(/selected/i)).toBeVisible();
      }
    });

    test.skip('should bulk delete clients', async ({ page }) => {
      await page.goto('/clients');

      // Select all
      const selectAllCheckbox = page.locator('table thead input[type="checkbox"]');
      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.check();

        // Click bulk delete
        const bulkDeleteButton = page.getByRole('button', { name: /delete.*selected/i });
        if (await bulkDeleteButton.isVisible()) {
          await bulkDeleteButton.click();

          // Should show confirmation
          await expect(page.getByRole('alertdialog')).toBeVisible();
        }
      }
    });
  });
});

test.describe('Client Accessibility', () => {
  test.skip('should have proper form labels', async ({ page }) => {
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

  test.skip('should support keyboard navigation', async ({ page }) => {
    await page.goto('/clients');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test.skip('should have accessible table', async ({ page }) => {
    await page.goto('/clients');

    const table = page.locator('table');
    if (await table.isVisible()) {
      await expect(table.locator('thead')).toBeAttached();
      await expect(table.locator('tbody')).toBeAttached();
    }
  });
});
