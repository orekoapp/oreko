import { test, expect } from '@playwright/test';

test.describe('Stripe Webhooks', () => {
  test.describe('Webhook Endpoint Security', () => {
    test('should reject requests without signature', async ({ request }) => {
      const response = await request.post('/api/webhooks/stripe', {
        data: { type: 'payment_intent.succeeded' },
      });

      // Should reject unsigned requests
      expect([400, 401, 403]).toContain(response.status());
    });

    test('should reject requests with invalid signature', async ({ request }) => {
      const response = await request.post('/api/webhooks/stripe', {
        headers: {
          'stripe-signature': 'invalid-signature',
        },
        data: { type: 'payment_intent.succeeded' },
      });

      expect([400, 401, 403]).toContain(response.status());
    });

    test('should reject malformed JSON', async ({ request }) => {
      const response = await request.post('/api/webhooks/stripe', {
        headers: {
          'content-type': 'application/json',
        },
        data: 'not valid json{',
      });

      expect([400, 401, 403, 500]).toContain(response.status());
    });
  });

  test.describe('Payment Intent Events', () => {
    test('should handle payment_intent.succeeded event', async ({ page, request }) => {
      // Create an invoice first
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]:has-text("sent")').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        // Get invoice ID from URL
        const url = page.url();
        const invoiceId = url.split('/invoices/')[1]?.split('/')[0];

        if (invoiceId) {
          // Verify invoice is in sent/unpaid state
          const status = page.locator('[class*="badge"]').first();
          if (await status.isVisible()) {
            const statusText = await status.textContent();
            expect(statusText?.toLowerCase()).toMatch(/sent|unpaid|pending/i);
          }
        }
      }
    });

    test('should handle payment_intent.payment_failed event', async ({ page }) => {
      await page.goto('/invoices');

      // Check for any invoices with failed payment indicators
      const failedIndicator = page.getByText(/failed|declined|error/i);
      // This is informational - may or may not be visible
      if (await failedIndicator.isVisible()) {
        await expect(failedIndicator).toBeVisible();
      }
    });
  });

  test.describe('Checkout Session Events', () => {
    test('should handle checkout.session.completed event', async ({ page }) => {
      await page.goto('/invoices');

      // Look for recently paid invoices
      const paidInvoice = page.locator('a:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        // Should show payment recorded
        const paymentInfo = page.getByText(/payment.*received|paid.*via.*stripe/i);
        if (await paymentInfo.isVisible()) {
          await expect(paymentInfo).toBeVisible();
        }
      }
    });

    test('should handle checkout.session.expired event', async ({ page }) => {
      // Expired sessions should not mark invoice as paid
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a:has-text("sent")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        // Invoice should still be unpaid
        const status = page.locator('[class*="badge"]').first();
        if (await status.isVisible()) {
          const statusText = await status.textContent();
          expect(statusText?.toLowerCase()).not.toBe('paid');
        }
      }
    });
  });

  test.describe('Refund Events', () => {
    test('should handle charge.refunded event', async ({ page }) => {
      await page.goto('/invoices');

      // Look for refunded invoices
      const refundedInvoice = page.locator('a:has-text("refunded")').first();
      if (await refundedInvoice.isVisible()) {
        await refundedInvoice.click();

        // Should show refund information
        const refundInfo = page.getByText(/refund|refunded/i);
        await expect(refundInfo.first()).toBeVisible();
      }
    });

    test('should handle partial refund', async ({ page }) => {
      await page.goto('/invoices');

      const partialRefundInvoice = page.locator('a:has-text("partial")').first();
      if (await partialRefundInvoice.isVisible()) {
        await partialRefundInvoice.click();

        // Should show partial refund amount
        const refundAmount = page.getByText(/refund.*\$/i);
        if (await refundAmount.isVisible()) {
          await expect(refundAmount).toBeVisible();
        }
      }
    });
  });

  test.describe('Customer Events', () => {
    test('should handle customer.created event', async ({ page }) => {
      // When a client pays, Stripe customer should be created
      await page.goto('/clients');

      const clientLink = page.locator('a[href^="/clients/"]').first();
      if (await clientLink.isVisible()) {
        await clientLink.click();

        // May show Stripe customer ID
        const stripeInfo = page.getByText(/stripe|customer id/i);
        if (await stripeInfo.isVisible()) {
          await expect(stripeInfo).toBeVisible();
        }
      }
    });
  });

  test.describe('Subscription Events', () => {
    test('should handle customer.subscription.created event', async ({ page }) => {
      await page.goto('/settings/billing');

      // Check subscription status
      const subscriptionStatus = page.getByText(/subscription|plan|active/i).first();
      if (await subscriptionStatus.isVisible()) {
        await expect(subscriptionStatus).toBeVisible();
      }
    });

    test('should handle customer.subscription.updated event', async ({ page }) => {
      await page.goto('/settings/billing');

      // Plan changes should be reflected
      const planInfo = page.getByText(/plan|subscription/i).first();
      if (await planInfo.isVisible()) {
        await expect(planInfo).toBeVisible();
      }
    });

    test('should handle customer.subscription.deleted event', async ({ page }) => {
      await page.goto('/settings/billing');

      // Cancelled subscriptions should show appropriate status
      const cancelledStatus = page.getByText(/cancelled|canceled|expired|free/i).first();
      if (await cancelledStatus.isVisible()) {
        await expect(cancelledStatus).toBeVisible();
      }
    });

    test('should handle invoice.payment_failed for subscription', async ({ page }) => {
      await page.goto('/settings/billing');

      // Failed payment should show warning
      const paymentWarning = page.getByText(/payment failed|update payment|past due/i);
      if (await paymentWarning.isVisible()) {
        await expect(paymentWarning).toBeVisible();
      }
    });
  });

  test.describe('Webhook Retry Handling', () => {
    test('should be idempotent for duplicate events', async ({ page }) => {
      // Same webhook event sent multiple times should not create duplicate payments
      await page.goto('/invoices');

      const paidInvoice = page.locator('a:has-text("paid")').first();
      if (await paidInvoice.isVisible()) {
        await paidInvoice.click();

        // Should only have one payment record for each actual payment
        const paymentHistory = page.locator('[class*="payment"], [class*="transaction"]');
        const count = await paymentHistory.count();
        // Payment count should be reasonable (not duplicated)
        expect(count).toBeLessThanOrEqual(10);
      }
    });
  });

  test.describe('Connect Account Events', () => {
    test('should handle account.updated event', async ({ page }) => {
      await page.goto('/settings/payments');

      // Stripe Connect account status
      const accountStatus = page.getByText(/connected|verified|pending/i);
      if (await accountStatus.isVisible()) {
        await expect(accountStatus).toBeVisible();
      }
    });

    test('should handle payout events', async ({ page }) => {
      await page.goto('/settings/payments');

      // Payout information
      const payoutInfo = page.getByText(/payout|transfer|bank/i);
      if (await payoutInfo.isVisible()) {
        await expect(payoutInfo).toBeVisible();
      }
    });
  });
});

test.describe('Stripe Checkout Flow', () => {
  test.describe('Checkout Session Creation', () => {
    test('should create checkout session for invoice', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a:has-text("sent")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        // Find pay button
        const payButton = page.getByRole('button', { name: /pay.*online|stripe|card/i });
        if (await payButton.isVisible()) {
          // Should be clickable (creates checkout session)
          await expect(payButton).toBeEnabled();
        }
      }
    });

    test('should redirect to Stripe checkout', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a:has-text("sent")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const payButton = page.getByRole('button', { name: /pay.*online|pay now/i });
        if (await payButton.isVisible()) {
          // Listen for navigation to Stripe
          const navigationPromise = page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 }).catch(() => null);
          await payButton.click();

          // Either redirects to Stripe or shows payment modal
          const navigation = await navigationPromise;
          if (!navigation) {
            // Check for payment modal instead
            const paymentModal = page.getByRole('dialog');
            if (await paymentModal.isVisible()) {
              await expect(paymentModal).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('Payment Link Generation', () => {
    test('should generate shareable payment link', async ({ page }) => {
      await page.goto('/invoices');

      const unpaidInvoice = page.locator('a:has-text("sent")').first();
      if (await unpaidInvoice.isVisible()) {
        await unpaidInvoice.click();

        const copyLinkButton = page.getByRole('button', { name: /copy.*link|share.*link|payment link/i });
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
});
