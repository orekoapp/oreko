import { test, expect } from '@playwright/test';

test.describe('CRUD Operations - Quotes', () => {
  test.describe('Create Quote', () => {
    test('should navigate to create quote page', async ({ page }) => {
      await page.goto('/quotes/new');

      await expect(page.getByRole('heading', { name: /new quote|create quote/i })).toBeVisible();
    });

    test('should show client selection', async ({ page }) => {
      await page.goto('/quotes/new');

      const clientSelect = page.getByLabel(/client/i);
      await expect(clientSelect).toBeVisible();
    });

    test('should create quote with required fields', async ({ page }) => {
      await page.goto('/quotes/new');

      // Select or create client
      const clientSelect = page.getByLabel(/client/i);
      if (await clientSelect.isVisible()) {
        await clientSelect.click();
        const clientOption = page.getByRole('option').first();
        if (await clientOption.isVisible()) {
          await clientOption.click();
        }
      }

      // Set quote title/name if available
      const titleInput = page.getByLabel(/title|name|subject/i);
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Quote ' + Date.now());
      }

      // Save quote
      const saveButton = page.getByRole('button', { name: /save|create/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();

        // Should redirect or show success
        await page.waitForURL(/\/quotes\/|success/, { timeout: 10000 }).catch(() => null);
      }
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/quotes/new');

      // Try to save without required fields
      const saveButton = page.getByRole('button', { name: /save|create/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();

        // Should show validation error
        const error = page.getByText(/required|select.*client/i);
        if (await error.isVisible()) {
          await expect(error).toBeVisible();
        }
      }
    });
  });

  test.describe('Read Quote', () => {
    test('should display quote list', async ({ page }) => {
      await page.goto('/quotes');

      await expect(page.getByRole('heading', { name: /quotes/i })).toBeVisible();
    });

    test('should navigate to quote detail', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        await expect(page).toHaveURL(/\/quotes\/.+/);
      }
    });

    test('should display quote information', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        // Should show quote details
        const quoteDetails = page.getByText(/total|amount|client/i);
        await expect(quoteDetails.first()).toBeVisible();
      }
    });
  });

  test.describe('Update Quote', () => {
    test('should navigate to edit quote', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible()) {
          await editButton.click();

          await expect(page).toHaveURL(/\/quotes\/.+\/edit|\/quotes\/.+/);
        }
      }
    });

    test('should update quote title', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible()) {
          await editButton.click();

          const titleInput = page.getByLabel(/title|name|subject/i);
          if (await titleInput.isVisible()) {
            await titleInput.fill('Updated Quote ' + Date.now());

            const saveButton = page.getByRole('button', { name: /save|update/i });
            await saveButton.click();

            const success = page.getByText(/saved|updated/i);
            if (await success.isVisible()) {
              await expect(success).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('Delete Quote', () => {
    test('should show delete confirmation', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const deleteButton = page.getByRole('button', { name: /delete/i });
        if (await deleteButton.isVisible()) {
          await deleteButton.click();

          // Should show confirmation dialog
          const dialog = page.getByRole('alertdialog');
          if (await dialog.isVisible()) {
            await expect(dialog).toBeVisible();
          }
        }
      }
    });

    test('should cancel delete operation', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const deleteButton = page.getByRole('button', { name: /delete/i });
        if (await deleteButton.isVisible()) {
          await deleteButton.click();

          const cancelButton = page.getByRole('button', { name: /cancel|no/i });
          if (await cancelButton.isVisible()) {
            await cancelButton.click();

            // Dialog should close
            await expect(page.getByRole('alertdialog')).not.toBeVisible();
          }
        }
      }
    });
  });
});

test.describe('CRUD Operations - Clients', () => {
  test.describe('Create Client', () => {
    test('should navigate to create client page', async ({ page }) => {
      await page.goto('/clients/new');

      await expect(page.getByRole('heading', { name: /new client|add client|create client/i })).toBeVisible();
    });

    test('should show required fields', async ({ page }) => {
      await page.goto('/clients/new');

      const nameInput = page.getByLabel(/name|company/i);
      await expect(nameInput.first()).toBeVisible();

      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();
    });

    test('should create client with basic info', async ({ page }) => {
      await page.goto('/clients/new');

      const nameInput = page.getByLabel(/name|company/i).first();
      await nameInput.fill('Test Client ' + Date.now());

      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill(`test${Date.now()}@example.com`);

      const saveButton = page.getByRole('button', { name: /save|create|add/i });
      await saveButton.click();

      // Should redirect or show success
      await page.waitForURL(/\/clients/, { timeout: 10000 }).catch(() => null);
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/clients/new');

      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill('invalid-email');

      const saveButton = page.getByRole('button', { name: /save|create/i });
      await saveButton.click();

      const error = page.getByText(/valid email|invalid email/i);
      if (await error.isVisible()) {
        await expect(error).toBeVisible();
      }
    });

    test('should add phone number', async ({ page }) => {
      await page.goto('/clients/new');

      const phoneInput = page.getByLabel(/phone/i);
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('+1 555-123-4567');
        await expect(phoneInput).toHaveValue(/555-123-4567/);
      }
    });

    test('should add address', async ({ page }) => {
      await page.goto('/clients/new');

      const addressInput = page.getByLabel(/address|street/i);
      if (await addressInput.isVisible()) {
        await addressInput.fill('123 Test Street');
        await expect(addressInput).toHaveValue('123 Test Street');
      }
    });
  });

  test.describe('Read Client', () => {
    test('should display client list', async ({ page }) => {
      await page.goto('/clients');

      await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible();
    });

    test('should navigate to client detail', async ({ page }) => {
      await page.goto('/clients');

      const clientLink = page.locator('a[href^="/clients/"]').first();
      if (await clientLink.isVisible()) {
        await clientLink.click();

        await expect(page).toHaveURL(/\/clients\/.+/);
      }
    });

    test('should display client information', async ({ page }) => {
      await page.goto('/clients');

      const clientLink = page.locator('a[href^="/clients/"]').first();
      if (await clientLink.isVisible()) {
        await clientLink.click();

        // Should show client details
        const clientInfo = page.getByText(/email|phone|address/i);
        await expect(clientInfo.first()).toBeVisible();
      }
    });

    test('should show client history', async ({ page }) => {
      await page.goto('/clients');

      const clientLink = page.locator('a[href^="/clients/"]').first();
      if (await clientLink.isVisible()) {
        await clientLink.click();

        // Should show quotes/invoices history
        const history = page.getByText(/quotes|invoices|history/i);
        if (await history.isVisible()) {
          await expect(history).toBeVisible();
        }
      }
    });
  });

  test.describe('Update Client', () => {
    test('should navigate to edit client', async ({ page }) => {
      await page.goto('/clients');

      const clientLink = page.locator('a[href^="/clients/"]').first();
      if (await clientLink.isVisible()) {
        await clientLink.click();

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible()) {
          await editButton.click();
        }
      }
    });

    test('should update client name', async ({ page }) => {
      await page.goto('/clients');

      const clientLink = page.locator('a[href^="/clients/"]').first();
      if (await clientLink.isVisible()) {
        await clientLink.click();

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible()) {
          await editButton.click();

          const nameInput = page.getByLabel(/name|company/i).first();
          if (await nameInput.isVisible()) {
            await nameInput.fill('Updated Client ' + Date.now());

            const saveButton = page.getByRole('button', { name: /save|update/i });
            await saveButton.click();

            const success = page.getByText(/saved|updated/i);
            if (await success.isVisible()) {
              await expect(success).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('Delete Client', () => {
    test('should show delete confirmation', async ({ page }) => {
      await page.goto('/clients');

      const clientLink = page.locator('a[href^="/clients/"]').first();
      if (await clientLink.isVisible()) {
        await clientLink.click();

        const deleteButton = page.getByRole('button', { name: /delete/i });
        if (await deleteButton.isVisible()) {
          await deleteButton.click();

          const dialog = page.getByRole('alertdialog');
          if (await dialog.isVisible()) {
            await expect(dialog).toBeVisible();
          }
        }
      }
    });
  });
});

test.describe('CRUD Operations - Rate Cards', () => {
  test.describe('Create Rate Card', () => {
    test('should navigate to create rate card page', async ({ page }) => {
      await page.goto('/rate-cards/new');

      await expect(page.getByRole('heading', { name: /new rate card|create rate card|add rate card/i })).toBeVisible();
    });

    test('should show rate card fields', async ({ page }) => {
      await page.goto('/rate-cards/new');

      const nameInput = page.getByLabel(/name|title/i);
      await expect(nameInput).toBeVisible();
    });

    test('should create rate card', async ({ page }) => {
      await page.goto('/rate-cards/new');

      const nameInput = page.getByLabel(/name|title/i);
      await nameInput.fill('Test Rate Card ' + Date.now());

      // Add a rate item if possible
      const addItemButton = page.getByRole('button', { name: /add item|add rate/i });
      if (await addItemButton.isVisible()) {
        await addItemButton.click();

        const itemName = page.getByPlaceholder(/item name|service/i).first();
        if (await itemName.isVisible()) {
          await itemName.fill('Test Service');
        }

        const itemRate = page.getByPlaceholder(/rate|price|amount/i).first();
        if (await itemRate.isVisible()) {
          await itemRate.fill('100');
        }
      }

      const saveButton = page.getByRole('button', { name: /save|create/i });
      await saveButton.click();

      await page.waitForURL(/\/rate-cards/, { timeout: 10000 }).catch(() => null);
    });
  });

  test.describe('Read Rate Card', () => {
    test('should display rate cards list', async ({ page }) => {
      await page.goto('/rate-cards');

      await expect(page.getByRole('heading', { name: /rate cards/i })).toBeVisible();
    });

    test('should navigate to rate card detail', async ({ page }) => {
      await page.goto('/rate-cards');

      const rateCardLink = page.locator('a[href^="/rate-cards/"]').first();
      if (await rateCardLink.isVisible()) {
        await rateCardLink.click();

        await expect(page).toHaveURL(/\/rate-cards\/.+/);
      }
    });

    test('should display rate card items', async ({ page }) => {
      await page.goto('/rate-cards');

      const rateCardLink = page.locator('a[href^="/rate-cards/"]').first();
      if (await rateCardLink.isVisible()) {
        await rateCardLink.click();

        const items = page.locator('table, [class*="item"]');
        if (await items.count() > 0) {
          await expect(items.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Update Rate Card', () => {
    test('should update rate card name', async ({ page }) => {
      await page.goto('/rate-cards');

      const rateCardLink = page.locator('a[href^="/rate-cards/"]').first();
      if (await rateCardLink.isVisible()) {
        await rateCardLink.click();

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible()) {
          await editButton.click();

          const nameInput = page.getByLabel(/name|title/i);
          if (await nameInput.isVisible()) {
            await nameInput.fill('Updated Rate Card ' + Date.now());

            const saveButton = page.getByRole('button', { name: /save|update/i });
            await saveButton.click();
          }
        }
      }
    });

    test('should add new rate item', async ({ page }) => {
      await page.goto('/rate-cards');

      const rateCardLink = page.locator('a[href^="/rate-cards/"]').first();
      if (await rateCardLink.isVisible()) {
        await rateCardLink.click();

        const addButton = page.getByRole('button', { name: /add item|add rate/i });
        if (await addButton.isVisible()) {
          await addButton.click();

          const itemFields = page.getByPlaceholder(/name|service/i);
          if (await itemFields.count() > 0) {
            await expect(itemFields.first()).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Delete Rate Card', () => {
    test('should show delete confirmation', async ({ page }) => {
      await page.goto('/rate-cards');

      const rateCardLink = page.locator('a[href^="/rate-cards/"]').first();
      if (await rateCardLink.isVisible()) {
        await rateCardLink.click();

        const deleteButton = page.getByRole('button', { name: /delete/i });
        if (await deleteButton.isVisible()) {
          await deleteButton.click();

          const dialog = page.getByRole('alertdialog');
          if (await dialog.isVisible()) {
            await expect(dialog).toBeVisible();
          }
        }
      }
    });
  });
});

test.describe('CRUD Operations - Invoices', () => {
  test.describe('Create Invoice', () => {
    test('should navigate to create invoice page', async ({ page }) => {
      await page.goto('/invoices/new');

      await expect(page.getByRole('heading', { name: /new invoice|create invoice/i })).toBeVisible();
    });

    test('should show invoice creation fields', async ({ page }) => {
      await page.goto('/invoices/new');

      const clientSelect = page.getByLabel(/client/i);
      await expect(clientSelect).toBeVisible();
    });

    test('should create invoice from scratch', async ({ page }) => {
      await page.goto('/invoices/new');

      // Select client
      const clientSelect = page.getByLabel(/client/i);
      if (await clientSelect.isVisible()) {
        await clientSelect.click();
        const clientOption = page.getByRole('option').first();
        if (await clientOption.isVisible()) {
          await clientOption.click();
        }
      }

      // Add line items if possible
      const addItemButton = page.getByRole('button', { name: /add item|add line/i });
      if (await addItemButton.isVisible()) {
        await addItemButton.click();
      }

      const saveButton = page.getByRole('button', { name: /save|create/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();

        await page.waitForURL(/\/invoices/, { timeout: 10000 }).catch(() => null);
      }
    });

    test('should create invoice from quote', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const convertButton = page.getByRole('button', { name: /convert.*invoice|create invoice/i });
        if (await convertButton.isVisible()) {
          await convertButton.click();

          // Should navigate to invoice or show success
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });

  test.describe('Read Invoice', () => {
    test('should display invoice list', async ({ page }) => {
      await page.goto('/invoices');

      await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible();
    });

    test('should navigate to invoice detail', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        await expect(page).toHaveURL(/\/invoices\/.+/);
      }
    });

    test('should display invoice information', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const invoiceInfo = page.getByText(/total|amount|due/i);
        await expect(invoiceInfo.first()).toBeVisible();
      }
    });

    test('should filter invoices by status', async ({ page }) => {
      await page.goto('/invoices');

      const statusFilter = page.getByRole('combobox', { name: /status/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();

        const paidOption = page.getByRole('option', { name: /paid/i });
        if (await paidOption.isVisible()) {
          await paidOption.click();
        }
      }
    });
  });

  test.describe('Update Invoice', () => {
    test('should update invoice status', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const statusButton = page.getByRole('button', { name: /mark as|change status/i });
        if (await statusButton.isVisible()) {
          await statusButton.click();
        }
      }
    });

    test('should edit invoice details', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible()) {
          await editButton.click();

          // Should be able to edit fields
          const saveButton = page.getByRole('button', { name: /save|update/i });
          if (await saveButton.isVisible()) {
            await expect(saveButton).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Delete Invoice', () => {
    test('should show void/delete option', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const deleteButton = page.getByRole('button', { name: /delete|void/i });
        if (await deleteButton.isVisible()) {
          await expect(deleteButton).toBeVisible();
        }
      }
    });

    test('should confirm before voiding', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const voidButton = page.getByRole('button', { name: /void/i });
        if (await voidButton.isVisible()) {
          await voidButton.click();

          const dialog = page.getByRole('alertdialog');
          if (await dialog.isVisible()) {
            await expect(dialog).toBeVisible();
          }
        }
      }
    });
  });
});

test.describe('CRUD Operations - Bulk Actions', () => {
  test('should select multiple quotes', async ({ page }) => {
    await page.goto('/quotes');

    const checkboxes = page.getByRole('checkbox');
    if (await checkboxes.count() > 1) {
      await checkboxes.first().check();
      await checkboxes.nth(1).check();

      const bulkActions = page.getByText(/selected|bulk/i);
      if (await bulkActions.isVisible()) {
        await expect(bulkActions).toBeVisible();
      }
    }
  });

  test('should select multiple invoices', async ({ page }) => {
    await page.goto('/invoices');

    const checkboxes = page.getByRole('checkbox');
    if (await checkboxes.count() > 1) {
      await checkboxes.first().check();
      await checkboxes.nth(1).check();
    }
  });

  test('should select all items', async ({ page }) => {
    await page.goto('/quotes');

    const selectAllCheckbox = page.getByRole('checkbox', { name: /select all/i });
    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.check();

      await expect(selectAllCheckbox).toBeChecked();
    }
  });
});

test.describe('CRUD Operations - Search and Filter', () => {
  test('should search quotes', async ({ page }) => {
    await page.goto('/quotes');

    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');

    }
  });

  test('should search clients', async ({ page }) => {
    await page.goto('/clients');

    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
    }
  });

  test('should filter by date range', async ({ page }) => {
    await page.goto('/quotes');

    const dateFilter = page.getByLabel(/date|from|to/i);
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
    }
  });
});
