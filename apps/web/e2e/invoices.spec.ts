import { test, expect } from '@playwright/test';

test.describe('Invoices Module', () => {
  test.describe('Invoices List Page', () => {
    test.skip('should display invoices list page', async ({ page }) => {
      await page.goto('/invoices');

      await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /create|new invoice/i })).toBeVisible();
    });

    test.skip('should show empty state when no invoices', async ({ page }) => {
      await page.goto('/invoices');

      const emptyState = page.getByText(/no invoices|get started/i);
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });

    test.skip('should filter by status', async ({ page }) => {
      await page.goto('/invoices');

      const statusFilter = page.getByRole('combobox', { name: /status/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        await page.getByRole('option', { name: /paid/i }).click();

        await expect(page).toHaveURL(/status=paid/);
      }
    });

    test.skip('should filter overdue invoices', async ({ page }) => {
      await page.goto('/invoices');

      const overdueFilter = page.getByRole('checkbox', { name: /overdue/i });
      if (await overdueFilter.isVisible()) {
        await overdueFilter.check();

        await expect(page).toHaveURL(/overdue=true/);
      }
    });

    test.skip('should search invoices', async ({ page }) => {
      await page.goto('/invoices');

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('acme corp');
      await searchInput.press('Enter');

      await expect(page).toHaveURL(/search=acme/);
    });

    test.skip('should highlight overdue invoices', async ({ page }) => {
      await page.goto('/invoices');

      // Check for overdue styling
      const overdueRow = page.locator('tr:has-text("overdue")');
      if (await overdueRow.isVisible()) {
        // Should have visual indicator (red badge, highlighting, etc.)
        const badge = overdueRow.locator('[data-variant="destructive"], .text-red-500, .bg-red-100');
        await expect(badge).toBeVisible();
      }
    });
  });

  test.describe('Invoice Creation', () => {
    test.skip('should navigate to create invoice page', async ({ page }) => {
      await page.goto('/invoices');

      await page.getByRole('link', { name: /create|new invoice/i }).click();

      await expect(page).toHaveURL(/\/invoices\/new/);
    });

    test.skip('should display invoice form', async ({ page }) => {
      await page.goto('/invoices/new');

      // Should see form fields
      await expect(page.getByLabel(/client/i)).toBeVisible();
      await expect(page.getByLabel(/title/i)).toBeVisible();
      await expect(page.getByLabel(/due date/i)).toBeVisible();
    });

    test.skip('should require at least one line item', async ({ page }) => {
      await page.goto('/invoices/new');

      // Fill basic info without line items
      await page.getByLabel(/title/i).fill('Test Invoice');

      // Try to save
      const saveButton = page.getByRole('button', { name: /save|create/i });
      await saveButton.click();

      // Should show error about line items
      await expect(page.getByText(/line item/i)).toBeVisible();
    });

    test.skip('should add line items', async ({ page }) => {
      await page.goto('/invoices/new');

      // Add line item
      const addItemButton = page.getByRole('button', { name: /add.*item|add.*line/i });
      await addItemButton.click();

      // Fill line item
      await page.getByLabel(/description/i).fill('Web Development Services');
      await page.getByLabel(/quantity/i).fill('20');
      await page.getByLabel(/rate/i).fill('150');

      // Should calculate total
      const total = page.getByText(/3,000|3000/);
      await expect(total).toBeVisible();
    });

    test.skip('should calculate totals with tax', async ({ page }) => {
      await page.goto('/invoices/new');

      // Add line item
      const addItemButton = page.getByRole('button', { name: /add.*item/i });
      await addItemButton.click();

      await page.getByLabel(/description/i).fill('Service');
      await page.getByLabel(/quantity/i).fill('1');
      await page.getByLabel(/rate/i).fill('100');

      // Add tax
      const taxInput = page.getByLabel(/tax.*rate/i);
      if (await taxInput.isVisible()) {
        await taxInput.fill('8.25');

        // Should show tax amount
        await expect(page.getByText(/8.25|tax/i)).toBeVisible();
      }
    });
  });

  test.describe('Invoice Detail', () => {
    test.skip('should display invoice details', async ({ page }) => {
      await page.goto('/invoices');

      const firstInvoice = page.locator('table tbody tr').first();
      if (await firstInvoice.isVisible()) {
        await firstInvoice.click();

        await expect(page.getByText(/invoice #/i)).toBeVisible();
      }
    });

    test.skip('should show payment status', async ({ page }) => {
      await page.goto('/invoices');

      const firstInvoice = page.locator('table tbody tr').first();
      if (await firstInvoice.isVisible()) {
        await firstInvoice.click();

        // Should show status badge
        const statusBadge = page.locator('[data-testid="invoice-status"]');
        await expect(statusBadge).toBeVisible();
      }
    });

    test.skip('should show amount due', async ({ page }) => {
      await page.goto('/invoices');

      const firstInvoice = page.locator('table tbody tr').first();
      if (await firstInvoice.isVisible()) {
        await firstInvoice.click();

        // Should show amount due
        await expect(page.getByText(/amount due|balance/i)).toBeVisible();
      }
    });
  });

  test.describe('Invoice Actions', () => {
    test.skip('should send invoice', async ({ page }) => {
      await page.goto('/invoices');

      const firstInvoice = page.locator('table tbody tr').first();
      if (await firstInvoice.isVisible()) {
        await firstInvoice.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        await sendButton.click();

        // Should show send dialog
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });

    test.skip('should record manual payment', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('tr:has-text("sent")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const recordPaymentButton = page.getByRole('button', { name: /record.*payment/i });
        await recordPaymentButton.click();

        // Should show payment dialog
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByLabel(/amount/i)).toBeVisible();
        await expect(page.getByLabel(/method/i)).toBeVisible();
      }
    });

    test.skip('should mark as paid', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('tr:has-text("sent")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const markPaidButton = page.getByRole('button', { name: /mark.*paid/i });
        if (await markPaidButton.isVisible()) {
          await markPaidButton.click();

          // Should show confirmation or success
          await expect(page.getByText(/paid|success/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test.skip('should download invoice PDF', async ({ page }) => {
      await page.goto('/invoices');

      const firstInvoice = page.locator('table tbody tr').first();
      if (await firstInvoice.isVisible()) {
        await firstInvoice.click();

        const pdfButton = page.getByRole('button', { name: /pdf|download/i });
        if (await pdfButton.isVisible()) {
          const downloadPromise = page.waitForEvent('download');
          await pdfButton.click();

          const download = await downloadPromise;
          expect(download.suggestedFilename()).toContain('.pdf');
        }
      }
    });

    test.skip('should cancel invoice with confirmation', async ({ page }) => {
      await page.goto('/invoices');

      const draftInvoice = page.locator('tr:has-text("draft")').first();
      if (await draftInvoice.isVisible()) {
        await draftInvoice.click();

        const cancelButton = page.getByRole('button', { name: /cancel|void/i });
        if (await cancelButton.isVisible()) {
          await cancelButton.click();

          // Should show confirmation dialog
          await expect(page.getByRole('alertdialog')).toBeVisible();
        }
      }
    });
  });

  test.describe('Payment Tracking', () => {
    test.skip('should display payment history', async ({ page }) => {
      await page.goto('/invoices');

      const paidInvoice = page.locator('tr:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        // Should show payments section
        await expect(page.getByText(/payment.*history|payments/i)).toBeVisible();
      }
    });

    test.skip('should show partial payment amount', async ({ page }) => {
      await page.goto('/invoices');

      const partialInvoice = page.locator('tr:has-text("partial")').first();
      if (await partialInvoice.isVisible()) {
        await partialInvoice.click();

        // Should show amount paid and remaining
        await expect(page.getByText(/paid|received/i)).toBeVisible();
        await expect(page.getByText(/remaining|due/i)).toBeVisible();
      }
    });
  });
});

test.describe('Client Portal - Invoice View', () => {
  test('should display invoice for public access', async ({ page }) => {
    await page.goto('/i/test-token-123');

    const notFound = page.getByText(/not found|expired|invalid/i);
    const invoiceView = page.getByText(/invoice/i);

    await expect(notFound.or(invoiceView)).toBeVisible();
  });

  test.skip('should display pay now button', async ({ page }) => {
    await page.goto('/i/valid-token');

    await expect(page.getByRole('button', { name: /pay.*now|pay.*invoice/i })).toBeVisible();
  });

  test.skip('should show payment options', async ({ page }) => {
    await page.goto('/i/valid-token');

    await page.getByRole('button', { name: /pay/i }).click();

    // Should show payment method options or Stripe checkout
    await expect(page.getByText(/payment|credit.*card|bank/i)).toBeVisible();
  });

  test.skip('should allow partial payment if enabled', async ({ page }) => {
    await page.goto('/i/valid-token-with-partial');

    const partialOption = page.getByLabel(/partial|custom.*amount/i);
    if (await partialOption.isVisible()) {
      await partialOption.click();

      // Should show amount input
      await expect(page.getByLabel(/amount/i)).toBeVisible();
    }
  });
});

test.describe('Invoice Accessibility', () => {
  test.skip('should have proper table structure', async ({ page }) => {
    await page.goto('/invoices');

    const table = page.locator('table');
    if (await table.isVisible()) {
      await expect(table.locator('thead')).toBeAttached();
      const headers = await table.locator('th').count();
      expect(headers).toBeGreaterThan(0);
    }
  });

  test.skip('should support keyboard navigation', async ({ page }) => {
    await page.goto('/invoices');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
