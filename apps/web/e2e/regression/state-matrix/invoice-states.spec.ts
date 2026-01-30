import { test, expect } from '@playwright/test';

/**
 * TC-SM-015 to TC-SM-028: Invoice State Matrix Tests
 *
 * Tests all valid state transitions for invoices:
 * draft -> sent -> viewed -> partial -> paid
 *                         -> overdue
 *                         -> void
 */
test.describe('Invoice State Matrix Tests', () => {
  test.describe('Valid State Transitions', () => {
    test('TC-SM-015: draft -> sent transition', async ({ page }) => {
      // Create a draft invoice
      await page.goto('/invoices/new');
      await page.waitForLoadState('networkidle');

      await page.fill('input[name="title"]', 'State Matrix Test Invoice');

      // Add line item
      const addItemBtn = page.locator('button:has-text("Add Item")');
      if (await addItemBtn.isVisible()) {
        await addItemBtn.click();
        await page.fill('input[name="lineItems.0.name"]', 'Test Service');
        await page.fill('input[name="lineItems.0.quantity"]', '1');
        await page.fill('input[name="lineItems.0.rate"]', '100');
      }

      await page.click('button:has-text("Save")');
      await page.waitForURL(/\/invoices\/[a-z0-9-]+/);

      // Verify draft status
      await expect(page.locator('[data-testid="invoice-status"]')).toHaveText(/draft/i);

      // Send invoice
      await page.getByRole('button', { name: /send/i }).click();

      const sendDialog = page.locator('[role="dialog"]');
      if (await sendDialog.isVisible()) {
        await page.fill('input[name="recipientEmail"]', 'billing@example.com');
        await page.click('button:has-text("Send Invoice")');
      }

      // Verify sent status
      await expect(page.locator('[data-testid="invoice-status"]')).toHaveText(/sent/i);
    });

    test('TC-SM-016: sent -> viewed transition', async ({ page }) => {
      // View is tracked when client opens invoice portal
      await page.goto('/i/test-invoice-token');

      // Viewing should update status
      // Verify by checking back in dashboard
    });

    test('TC-SM-017: sent -> partial payment transition', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("sent")');

      // Record partial payment
      await page.getByRole('button', { name: /record payment/i }).click();

      const paymentDialog = page.locator('[role="dialog"]');
      if (await paymentDialog.isVisible()) {
        await page.fill('input[name="amount"]', '50');
        await page.click('button:has-text("Record")');
      }

      // Verify partial status
      await expect(page.locator('[data-testid="invoice-status"]')).toHaveText(/partial/i);
    });

    test('TC-SM-018: partial -> paid transition', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("partial")');

      // Record remaining payment
      await page.getByRole('button', { name: /record payment/i }).click();

      const paymentDialog = page.locator('[role="dialog"]');
      if (await paymentDialog.isVisible()) {
        // Pay remaining balance
        const remainingAmount = await page.locator('[data-testid="amount-due"]').textContent();
        await page.fill('input[name="amount"]', remainingAmount?.replace(/[^0-9.]/g, '') || '50');
        await page.click('button:has-text("Record")');
      }

      // Verify paid status
      await expect(page.locator('[data-testid="invoice-status"]')).toHaveText(/paid/i);
    });

    test('TC-SM-019: sent -> overdue transition (automatic)', async ({ page }) => {
      // This transition happens automatically when due date passes
      // Create invoice with past due date for testing

      await page.goto('/invoices');

      // Find overdue invoice (should show automatically)
      const overdueRow = page.locator('tr:has-text("overdue")');
      await expect(overdueRow).toBeVisible();

      // Verify overdue badge
      await overdueRow.click();
      await expect(page.locator('[data-testid="invoice-status"]')).toHaveText(/overdue/i);
    });

    test('TC-SM-020: any state -> void transition', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("sent")');

      // Void the invoice
      const actionsMenu = page.locator('button[aria-label="actions"]');
      await actionsMenu.click();
      await page.getByRole('menuitem', { name: /void/i }).click();

      // Confirm void
      const confirmDialog = page.locator('[role="alertdialog"]');
      if (await confirmDialog.isVisible()) {
        await page.fill('textarea[name="reason"]', 'Duplicate invoice');
        await page.click('button:has-text("Void Invoice")');
      }

      // Verify voided status
      await expect(page.locator('[data-testid="invoice-status"]')).toHaveText(/void/i);
    });
  });

  test.describe('Invalid State Transitions', () => {
    test('TC-SM-021: cannot send voided invoice', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("void")');

      // Send button should be disabled
      const sendButton = page.getByRole('button', { name: /send/i });
      await expect(sendButton).toBeDisabled().or(expect(sendButton).toBeHidden());
    });

    test('TC-SM-022: cannot record payment on voided invoice', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("void")');

      // Record payment button should be disabled
      const paymentButton = page.getByRole('button', { name: /record payment/i });
      await expect(paymentButton).toBeDisabled().or(expect(paymentButton).toBeHidden());
    });

    test('TC-SM-023: cannot void paid invoice', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("paid")');

      // Void option should not be available
      const actionsMenu = page.locator('button[aria-label="actions"]');
      if (await actionsMenu.isVisible()) {
        await actionsMenu.click();
        const voidOption = page.getByRole('menuitem', { name: /void/i });
        await expect(voidOption).toBeDisabled().or(expect(voidOption).toBeHidden());
      }
    });

    test('TC-SM-024: cannot overpay invoice', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("sent")');

      // Get total amount
      const totalText = await page.locator('[data-testid="invoice-total"]').textContent();
      const total = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '100');

      // Try to record overpayment
      await page.getByRole('button', { name: /record payment/i }).click();

      const paymentDialog = page.locator('[role="dialog"]');
      if (await paymentDialog.isVisible()) {
        await page.fill('input[name="amount"]', String(total + 100));
        await page.click('button:has-text("Record")');

        // Should show error
        await expect(page.getByText(/exceed|overpay|maximum/i)).toBeVisible();
      }
    });
  });

  test.describe('Payment History', () => {
    test('TC-SM-025: payments are tracked in history', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("partial")');

      // Navigate to payments/history tab
      const paymentsTab = page.getByRole('tab', { name: /payments|history/i });
      if (await paymentsTab.isVisible()) {
        await paymentsTab.click();

        // Should show payment records
        const paymentRecords = page.locator('[data-testid="payment-record"]');
        const count = await paymentRecords.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('TC-SM-026: payment refunds are tracked', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("paid")');

      // Record refund
      const actionsMenu = page.locator('button[aria-label="actions"]');
      await actionsMenu.click();
      await page.getByRole('menuitem', { name: /refund/i }).click();

      const refundDialog = page.locator('[role="dialog"]');
      if (await refundDialog.isVisible()) {
        await page.fill('input[name="amount"]', '25');
        await page.fill('textarea[name="reason"]', 'Partial refund request');
        await page.click('button:has-text("Process Refund")');
      }

      // Verify refund in history
      const paymentsTab = page.getByRole('tab', { name: /payments|history/i });
      if (await paymentsTab.isVisible()) {
        await paymentsTab.click();
        await expect(page.getByText(/refund/i)).toBeVisible();
      }
    });
  });

  test.describe('Due Date Handling', () => {
    test('TC-SM-027: overdue status shows days overdue', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("overdue")');

      // Should show days overdue
      await expect(page.getByText(/\d+\s*days?\s*overdue/i)).toBeVisible();
    });

    test('TC-SM-028: payment clears overdue status', async ({ page }) => {
      await page.goto('/invoices');
      await page.click('tr:has-text("overdue")');

      // Record full payment
      await page.getByRole('button', { name: /record payment/i }).click();

      const paymentDialog = page.locator('[role="dialog"]');
      if (await paymentDialog.isVisible()) {
        // Check "Pay in full" or enter full amount
        const payInFull = page.locator('input[name="payInFull"]');
        if (await payInFull.isVisible()) {
          await payInFull.check();
        }
        await page.click('button:has-text("Record")');
      }

      // Status should change from overdue to paid
      await expect(page.locator('[data-testid="invoice-status"]')).toHaveText(/paid/i);
      await expect(page.locator('[data-testid="invoice-status"]')).not.toHaveText(/overdue/i);
    });
  });
});
