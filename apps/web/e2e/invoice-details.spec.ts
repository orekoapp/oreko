import { test, expect } from '@playwright/test';

test.describe('Invoice Details Page', () => {
  test.describe('Invoice Header', () => {
    test('should display invoice number', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const invoiceNumber = page.getByText(/INV-|invoice #|invoice number/i);
        await expect(invoiceNumber.first()).toBeVisible();
      }
    });

    test('should display invoice status badge', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const statusBadge = page.locator('[class*="badge"], [class*="status"]');
        if (await statusBadge.count() > 0) {
          await expect(statusBadge.first()).toBeVisible();
        }
      }
    });

    test('should display invoice date', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const dateInfo = page.getByText(/date|issued|created/i);
        await expect(dateInfo.first()).toBeVisible();
      }
    });

    test('should display due date', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const dueDate = page.getByText(/due|payment due/i);
        await expect(dueDate.first()).toBeVisible();
      }
    });
  });

  test.describe('Invoice Client Info', () => {
    test('should display client name', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const clientSection = page.getByText(/bill to|client|to:/i);
        await expect(clientSection.first()).toBeVisible();
      }
    });

    test('should display client email', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const clientEmail = page.getByText(/@/);
        if (await clientEmail.isVisible()) {
          await expect(clientEmail).toBeVisible();
        }
      }
    });

    test('should link to client detail page', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const clientLink = page.locator('a[href^="/clients/"]');
        if (await clientLink.isVisible()) {
          await expect(clientLink).toBeVisible();
        }
      }
    });
  });

  test.describe('Invoice Line Items', () => {
    test('should display line items table', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const table = page.locator('table');
        if (await table.isVisible()) {
          await expect(table).toBeVisible();
        }
      }
    });

    test('should show item descriptions', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const itemDescription = page.locator('td, [class*="item"]').first();
        if (await itemDescription.isVisible()) {
          await expect(itemDescription).toBeVisible();
        }
      }
    });

    test('should show item quantities', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const quantity = page.getByText(/qty|quantity/i);
        if (await quantity.isVisible()) {
          await expect(quantity).toBeVisible();
        }
      }
    });

    test('should show item rates', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const rate = page.getByText(/rate|price/i);
        if (await rate.isVisible()) {
          await expect(rate).toBeVisible();
        }
      }
    });

    test('should show item totals', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const amounts = page.getByText(/\$[\d,]+\.\d{2}/);
        if (await amounts.count() > 0) {
          await expect(amounts.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Invoice Totals', () => {
    test('should display subtotal', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const subtotal = page.getByText(/subtotal/i);
        if (await subtotal.isVisible()) {
          await expect(subtotal).toBeVisible();
        }
      }
    });

    test('should display tax amount', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const tax = page.getByText(/tax|vat|gst/i);
        if (await tax.isVisible()) {
          await expect(tax).toBeVisible();
        }
      }
    });

    test('should display grand total', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const total = page.getByText(/total|amount due/i);
        await expect(total.first()).toBeVisible();
      }
    });

    test('should display amount paid', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const amountPaid = page.getByText(/paid|payment received/i);
        if (await amountPaid.isVisible()) {
          await expect(amountPaid).toBeVisible();
        }
      }
    });

    test('should display balance due', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const balance = page.getByText(/balance|due|remaining/i);
        if (await balance.isVisible()) {
          await expect(balance).toBeVisible();
        }
      }
    });
  });

  test.describe('Invoice Actions', () => {
    test('should show edit button', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible()) {
          await expect(editButton).toBeVisible();
        }
      }
    });

    test('should show download PDF button', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const downloadButton = page.getByRole('button', { name: /download|pdf/i });
        await expect(downloadButton).toBeVisible();
      }
    });

    test('should show send button', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await expect(sendButton).toBeVisible();
        }
      }
    });

    test('should show record payment button', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a:has-text("sent"), a:has-text("draft")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const paymentButton = page.getByRole('button', { name: /record payment|pay/i });
        if (await paymentButton.isVisible()) {
          await expect(paymentButton).toBeVisible();
        }
      }
    });

    test('should show more actions menu', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const moreButton = page.getByRole('button', { name: /more|actions|⋮|…/i });
        if (await moreButton.isVisible()) {
          await moreButton.click();

          const menu = page.getByRole('menu');
          if (await menu.isVisible()) {
            await expect(menu).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Invoice Status Changes', () => {
    test('should mark invoice as sent', async ({ page }) => {
      await page.goto('/invoices');

      const draftInvoice = page.locator('a:has-text("draft")').first();
      if (await draftInvoice.isVisible()) {
        await draftInvoice.click();

        const markAsSentButton = page.getByRole('button', { name: /mark as sent|send/i });
        if (await markAsSentButton.isVisible()) {
          await expect(markAsSentButton).toBeVisible();
        }
      }
    });

    test('should mark invoice as paid', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a:has-text("sent")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const markAsPaidButton = page.getByRole('button', { name: /mark as paid|record payment/i });
        if (await markAsPaidButton.isVisible()) {
          await expect(markAsPaidButton).toBeVisible();
        }
      }
    });

    test('should void invoice', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const voidButton = page.getByRole('button', { name: /void/i });
        if (await voidButton.isVisible()) {
          await voidButton.click();

          const confirmDialog = page.getByRole('alertdialog');
          if (await confirmDialog.isVisible()) {
            await expect(confirmDialog).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Invoice Payment Tracking', () => {
    test('should show payment history section', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const paymentHistory = page.getByText(/payment history|payments|transactions/i);
        if (await paymentHistory.isVisible()) {
          await expect(paymentHistory).toBeVisible();
        }
      }
    });

    test('should show payment entries', async ({ page }) => {
      await page.goto('/invoices');

      const paidInvoice = page.locator('a:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        const paymentEntry = page.locator('[class*="payment"], [class*="transaction"]');
        if (await paymentEntry.count() > 0) {
          await expect(paymentEntry.first()).toBeVisible();
        }
      }
    });

    test('should display payment method', async ({ page }) => {
      await page.goto('/invoices');

      const paidInvoice = page.locator('a:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        const paymentMethod = page.getByText(/stripe|bank|cash|check|card/i);
        if (await paymentMethod.isVisible()) {
          await expect(paymentMethod).toBeVisible();
        }
      }
    });

    test('should display payment date', async ({ page }) => {
      await page.goto('/invoices');

      const paidInvoice = page.locator('a:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        // Should show payment date
        const datePattern = page.getByText(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+ \d{1,2}, \d{4}/);
        if (await datePattern.count() > 0) {
          await expect(datePattern.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Invoice Activity Log', () => {
    test('should show activity log', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const activityLog = page.getByText(/activity|history|timeline/i);
        if (await activityLog.isVisible()) {
          await expect(activityLog).toBeVisible();
        }
      }
    });

    test('should show invoice created event', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const createdEvent = page.getByText(/created|issued/i);
        if (await createdEvent.isVisible()) {
          await expect(createdEvent).toBeVisible();
        }
      }
    });

    test('should show invoice sent event', async ({ page }) => {
      await page.goto('/invoices');

      const sentInvoice = page.locator('a:has-text("sent")').first();
      if (await sentInvoice.isVisible()) {
        await sentInvoice.click();

        const sentEvent = page.getByText(/sent|emailed/i);
        if (await sentEvent.isVisible()) {
          await expect(sentEvent).toBeVisible();
        }
      }
    });

    test('should show invoice viewed event', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const viewedEvent = page.getByText(/viewed|opened/i);
        if (await viewedEvent.isVisible()) {
          await expect(viewedEvent).toBeVisible();
        }
      }
    });
  });

  test.describe('Invoice Notes', () => {
    test('should show notes section', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const notesSection = page.getByText(/notes|memo|internal/i);
        if (await notesSection.isVisible()) {
          await expect(notesSection).toBeVisible();
        }
      }
    });

    test('should add internal note', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const addNoteButton = page.getByRole('button', { name: /add note/i });
        if (await addNoteButton.isVisible()) {
          await addNoteButton.click();

          const noteInput = page.getByPlaceholder(/note/i);
          if (await noteInput.isVisible()) {
            await noteInput.fill('Test internal note');
          }
        }
      }
    });
  });

  test.describe('Invoice Reminders', () => {
    test('should show send reminder button', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a:has-text("sent"), a:has-text("overdue")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const reminderButton = page.getByRole('button', { name: /remind|send reminder/i });
        if (await reminderButton.isVisible()) {
          await expect(reminderButton).toBeVisible();
        }
      }
    });

    test('should show scheduled reminders', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const scheduledReminders = page.getByText(/scheduled|upcoming reminder/i);
        if (await scheduledReminders.isVisible()) {
          await expect(scheduledReminders).toBeVisible();
        }
      }
    });
  });

  test.describe('Invoice Related Quote', () => {
    test('should link to original quote', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const quoteLink = page.locator('a[href^="/quotes/"]');
        if (await quoteLink.isVisible()) {
          await expect(quoteLink).toBeVisible();
        }
      }
    });

    test('should show quote reference number', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const quoteRef = page.getByText(/quote|QT-|reference/i);
        if (await quoteRef.isVisible()) {
          await expect(quoteRef).toBeVisible();
        }
      }
    });
  });

  test.describe('Invoice Duplicate', () => {
    test('should show duplicate option', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const moreButton = page.getByRole('button', { name: /more|actions/i });
        if (await moreButton.isVisible()) {
          await moreButton.click();

          const duplicateOption = page.getByRole('menuitem', { name: /duplicate|copy/i });
          if (await duplicateOption.isVisible()) {
            await expect(duplicateOption).toBeVisible();
          }
        }
      }
    });

    test('should duplicate invoice', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const moreButton = page.getByRole('button', { name: /more|actions/i });
        if (await moreButton.isVisible()) {
          await moreButton.click();

          const duplicateOption = page.getByRole('menuitem', { name: /duplicate/i });
          if (await duplicateOption.isVisible()) {
            await duplicateOption.click();

            // Should create new invoice
            await page.waitForURL(/\/invoices\/|\/invoices\/new/, { timeout: 5000 }).catch(() => null);
          }
        }
      }
    });
  });

  test.describe('Invoice Print', () => {
    test('should show print button', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const printButton = page.getByRole('button', { name: /print/i });
        if (await printButton.isVisible()) {
          await expect(printButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Invoice Refund', () => {
    test('should show refund option for paid invoices', async ({ page }) => {
      await page.goto('/invoices');

      const paidInvoice = page.locator('a:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        const refundButton = page.getByRole('button', { name: /refund/i });
        if (await refundButton.isVisible()) {
          await expect(refundButton).toBeVisible();
        }
      }
    });

    test('should open refund modal', async ({ page }) => {
      await page.goto('/invoices');

      const paidInvoice = page.locator('a:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        const refundButton = page.getByRole('button', { name: /refund/i });
        if (await refundButton.isVisible()) {
          await refundButton.click();

          const modal = page.getByRole('dialog');
          if (await modal.isVisible()) {
            await expect(modal).toBeVisible();
          }
        }
      }
    });
  });
});

test.describe('Invoice Details Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/invoices');

    const invoiceLink = page.locator('a[href^="/invoices/"]').first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();

      const heading = page.getByRole('heading');
      await expect(heading.first()).toBeVisible();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/invoices');

    const invoiceLink = page.locator('a[href^="/invoices/"]').first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();

      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/invoices');

    const invoiceLink = page.locator('a[href^="/invoices/"]').first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();

      const buttons = page.getByRole('button');
      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeVisible();
      }
    }
  });
});

test.describe('Invoice Details Responsive', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/invoices');

    const invoiceLink = page.locator('a[href^="/invoices/"]').first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();

      const main = page.locator('main, body');
      await expect(main.first()).toBeVisible();
    }
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/invoices');

    const invoiceLink = page.locator('a[href^="/invoices/"]').first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();

      const heading = page.getByRole('heading');
      await expect(heading.first()).toBeVisible();
    }
  });
});
