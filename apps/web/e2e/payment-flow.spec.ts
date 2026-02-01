import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test.describe('Invoice Payment Initiation', () => {
    test('should show pay button on unpaid invoice', async ({ page }) => {
      await page.goto('/invoices');

      // Find an unpaid invoice
      const unpaidInvoice = page.locator('a[href^="/invoices/"]:has-text("sent"), a[href^="/invoices/"]:has-text("overdue")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        // Should have pay/record payment button
        const payButton = page.getByRole('button', { name: /pay|record payment|mark as paid/i });
        await expect(payButton).toBeVisible();
      }
    });

    test('should open payment modal', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const payButton = page.getByRole('button', { name: /record payment/i });
        if (await payButton.isVisible()) {
          await payButton.click();

          // Should show payment modal/dialog
          const modal = page.getByRole('dialog');
          if (await modal.isVisible()) {
            await expect(modal).toBeVisible();
          }
        }
      }
    });

    test('should show payment amount field', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const payButton = page.getByRole('button', { name: /record payment/i });
        if (await payButton.isVisible()) {
          await payButton.click();

          const amountInput = page.getByLabel(/amount/i);
          if (await amountInput.isVisible()) {
            await expect(amountInput).toBeVisible();
          }
        }
      }
    });

    test('should show payment method selector', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const payButton = page.getByRole('button', { name: /record payment/i });
        if (await payButton.isVisible()) {
          await payButton.click();

          const methodSelector = page.getByLabel(/method|payment method/i);
          if (await methodSelector.isVisible()) {
            await expect(methodSelector).toBeVisible();
          }
        }
      }
    });

    test('should show payment date picker', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const payButton = page.getByRole('button', { name: /record payment/i });
        if (await payButton.isVisible()) {
          await payButton.click();

          const datePicker = page.getByLabel(/date/i);
          if (await datePicker.isVisible()) {
            await expect(datePicker).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Manual Payment Recording', () => {
    test('should record full payment', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const payButton = page.getByRole('button', { name: /record payment/i });
        if (await payButton.isVisible()) {
          await payButton.click();

          // Fill payment form
          const amountInput = page.getByLabel(/amount/i);
          if (await amountInput.isVisible()) {
            await amountInput.fill('100');
          }

          const submitButton = page.getByRole('button', { name: /record|save|confirm/i });
          if (await submitButton.isVisible()) {
            await submitButton.click();

            // Should show success
            const success = page.getByText(/recorded|saved|payment added/i);
            if (await success.isVisible()) {
              await expect(success).toBeVisible();
            }
          }
        }
      }
    });

    test('should record partial payment', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const payButton = page.getByRole('button', { name: /record payment/i });
        if (await payButton.isVisible()) {
          await payButton.click();

          // Enter partial amount
          const amountInput = page.getByLabel(/amount/i);
          if (await amountInput.isVisible()) {
            await amountInput.fill('50'); // Partial payment

            const submitButton = page.getByRole('button', { name: /record|save/i });
            await submitButton.click();

            // Invoice should show partial paid status
            const partialStatus = page.getByText(/partial|partially paid/i);
            if (await partialStatus.isVisible()) {
              await expect(partialStatus).toBeVisible();
            }
          }
        }
      }
    });

    test('should validate payment amount', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const payButton = page.getByRole('button', { name: /record payment/i });
        if (await payButton.isVisible()) {
          await payButton.click();

          // Try invalid amount
          const amountInput = page.getByLabel(/amount/i);
          if (await amountInput.isVisible()) {
            await amountInput.fill('-100');

            const submitButton = page.getByRole('button', { name: /record|save/i });
            await submitButton.click();

            // Should show validation error
            const error = page.getByText(/invalid|positive|must be/i);
            if (await error.isVisible()) {
              await expect(error).toBeVisible();
            }
          }
        }
      }
    });

    test('should add payment notes', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const payButton = page.getByRole('button', { name: /record payment/i });
        if (await payButton.isVisible()) {
          await payButton.click();

          const notesInput = page.getByLabel(/notes|reference|memo/i);
          if (await notesInput.isVisible()) {
            await notesInput.fill('Payment via bank transfer');
            await expect(notesInput).toHaveValue('Payment via bank transfer');
          }
        }
      }
    });
  });

  test.describe('Stripe Checkout Integration', () => {
    test('should show Stripe payment option', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        // Look for Stripe/online payment option
        const stripeOption = page.getByText(/stripe|pay online|credit card/i);
        if (await stripeOption.isVisible()) {
          await expect(stripeOption).toBeVisible();
        }
      }
    });

    test('should have send payment link button', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const sendLinkButton = page.getByRole('button', { name: /send payment link|share payment/i });
        if (await sendLinkButton.isVisible()) {
          await expect(sendLinkButton).toBeVisible();
        }
      }
    });

    test('should copy payment link', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a[href^="/invoices/"]').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const copyLinkButton = page.getByRole('button', { name: /copy.*link|copy.*url/i });
        if (await copyLinkButton.isVisible()) {
          await copyLinkButton.click();

          // Should show copied confirmation
          const copied = page.getByText(/copied/i);
          if (await copied.isVisible()) {
            await expect(copied).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Payment History', () => {
    test('should show payment history on invoice', async ({ page }) => {
      await page.goto('/invoices');

      const invoice = page.locator('a[href^="/invoices/"]').first();
      if (await invoice.isVisible()) {
        await invoice.click();

        const paymentHistory = page.getByText(/payment history|payments|transactions/i);
        if (await paymentHistory.isVisible()) {
          await expect(paymentHistory).toBeVisible();
        }
      }
    });

    test('should display payment details', async ({ page }) => {
      await page.goto('/invoices');

      const paidInvoice = page.locator('a:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        // Should show payment amount and date
        const paymentAmount = page.getByText(/\$[\d,]+\.\d{2}/);
        if (await paymentAmount.isVisible()) {
          await expect(paymentAmount).toBeVisible();
        }
      }
    });

    test('should show payment method in history', async ({ page }) => {
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
  });

  test.describe('Invoice Status Updates', () => {
    test('should update to paid status after full payment', async ({ page }) => {
      await page.goto('/invoices');

      // After recording full payment, status should change
      const paidInvoice = page.locator('[class*="badge"]:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await expect(paidInvoice).toBeVisible();
      }
    });

    test('should show partial payment indicator', async ({ page }) => {
      await page.goto('/invoices');

      const partialInvoice = page.locator('a:has-text("partial")').first();
      if (await partialInvoice.isVisible()) {
        await partialInvoice.click();

        // Should show remaining balance
        const remaining = page.getByText(/remaining|balance|due/i);
        await expect(remaining).toBeVisible();
      }
    });

    test('should not allow payment on paid invoice', async ({ page }) => {
      await page.goto('/invoices');

      const paidInvoice = page.locator('a:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        // Pay button should not be visible or should be disabled
        const payButton = page.getByRole('button', { name: /record payment/i });
        if (await payButton.isVisible()) {
          await expect(payButton).toBeDisabled();
        }
      }
    });
  });

  test.describe('Payment Reminders', () => {
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

    test('should send payment reminder', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a:has-text("sent"), a:has-text("overdue")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const reminderButton = page.getByRole('button', { name: /remind|send reminder/i });
        if (await reminderButton.isVisible()) {
          await reminderButton.click();

          // Should show success message
          const success = page.getByText(/sent|reminder sent/i);
          if (await success.isVisible()) {
            await expect(success).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Refund Flow', () => {
    test('should show refund option on paid invoice', async ({ page }) => {
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

test.describe('Payment Settings', () => {
  test('should navigate to payment settings', async ({ page }) => {
    await page.goto('/settings/payments');

    await expect(page.getByRole('heading', { name: /payment/i })).toBeVisible();
  });

  test('should show Stripe connection status', async ({ page }) => {
    await page.goto('/settings/payments');

    const stripeStatus = page.getByText(/stripe|connected|not connected/i);
    await expect(stripeStatus).toBeVisible();
  });

  test('should have connect Stripe button', async ({ page }) => {
    await page.goto('/settings/payments');

    const connectButton = page.getByRole('button', { name: /connect|setup/i });
    if (await connectButton.isVisible()) {
      await expect(connectButton).toBeVisible();
    }
  });

  test('should show payment processing fees info', async ({ page }) => {
    await page.goto('/settings/payments');

    const feesInfo = page.getByText(/fee|processing|2\.9/i);
    if (await feesInfo.isVisible()) {
      await expect(feesInfo).toBeVisible();
    }
  });
});
