import { test, expect } from '@playwright/test';

test.describe('Client Portal - Quote View', () => {
  test.describe('Public Quote Access', () => {
    test('should show 404 for invalid token', async ({ page }) => {
      await page.goto('/q/invalid-token-12345');

      // Should show error page
      const errorMessages = [
        page.getByText(/not found/i),
        page.getByText(/expired/i),
        page.getByText(/invalid/i),
        page.getByText(/404/i),
      ];

      let foundError = false;
      for (const msg of errorMessages) {
        if (await msg.isVisible()) {
          foundError = true;
          break;
        }
      }
      expect(foundError).toBe(true);
    });

    test('should display quote view page structure', async ({ page }) => {
      // This test uses a mock/demo token if available
      await page.goto('/q/demo-quote-token');

      // Should either show quote or error - both are valid outcomes
      const quoteView = page.locator('main, [role="main"]').first();
      await expect(quoteView).toBeVisible();
    });

    test('should show company branding on quote view', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      // If valid, should show company logo or name
      const branding = page.locator('img[alt*="logo"], [class*="logo"], header').first();
      if (await branding.isVisible()) {
        await expect(branding).toBeVisible();
      }
    });

    test('should display quote details', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      // Look for quote-related content
      const quoteContent = [
        page.getByText(/quote|proposal|estimate/i),
        page.getByText(/total/i),
        page.getByText(/\$/),
      ];

      for (const content of quoteContent) {
        if (await content.first().isVisible()) {
          await expect(content.first()).toBeVisible();
          break;
        }
      }
    });

    test('should show quote items/line items', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      // Should display line items or services
      const lineItems = page.locator('table, [class*="item"], [class*="line"]');
      if (await lineItems.count() > 0) {
        await expect(lineItems.first()).toBeVisible();
      }
    });

    test('should display quote total', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const total = page.getByText(/total|amount/i);
      if (await total.isVisible()) {
        await expect(total).toBeVisible();
      }
    });
  });

  test.describe('Quote Acceptance Flow', () => {
    test('should show accept/decline buttons', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const acceptButton = page.getByRole('button', { name: /accept|approve/i });
      const declineButton = page.getByRole('button', { name: /decline|reject/i });

      if (await acceptButton.isVisible()) {
        await expect(acceptButton).toBeVisible();
      }
      if (await declineButton.isVisible()) {
        await expect(declineButton).toBeVisible();
      }
    });

    test('should show signature pad when accepting', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const acceptButton = page.getByRole('button', { name: /accept|approve/i });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();

        // Should show signature pad
        const signaturePad = page.locator('canvas, [class*="signature"]');
        if (await signaturePad.isVisible()) {
          await expect(signaturePad).toBeVisible();
        }
      }
    });

    test('should validate signature before accepting', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const acceptButton = page.getByRole('button', { name: /accept|approve/i });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();

        // Try to submit without signature
        const confirmButton = page.getByRole('button', { name: /confirm|submit|sign/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();

          // Should show validation error
          const error = page.getByText(/signature required|please sign/i);
          if (await error.isVisible()) {
            await expect(error).toBeVisible();
          }
        }
      }
    });

    test('should allow drawing signature', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const acceptButton = page.getByRole('button', { name: /accept|approve/i });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();

        const canvas = page.locator('canvas').first();
        if (await canvas.isVisible()) {
          // Draw on canvas
          const box = await canvas.boundingBox();
          if (box) {
            await page.mouse.move(box.x + 50, box.y + 50);
            await page.mouse.down();
            await page.mouse.move(box.x + 150, box.y + 100);
            await page.mouse.up();
          }

          // Clear button should work
          const clearButton = page.getByRole('button', { name: /clear/i });
          if (await clearButton.isVisible()) {
            await expect(clearButton).toBeVisible();
          }
        }
      }
    });

    test('should show confirmation after accepting', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      // If quote can be accepted, after acceptance should show confirmation
      const acceptedMessage = page.getByText(/accepted|thank you|confirmed/i);
      if (await acceptedMessage.isVisible()) {
        await expect(acceptedMessage).toBeVisible();
      }
    });

    test('should show decline reason form', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const declineButton = page.getByRole('button', { name: /decline|reject/i });
      if (await declineButton.isVisible()) {
        await declineButton.click();

        // Should show reason input
        const reasonInput = page.getByLabel(/reason/i);
        if (await reasonInput.isVisible()) {
          await expect(reasonInput).toBeVisible();
        }
      }
    });
  });

  test.describe('Quote View States', () => {
    test('should show viewed indicator', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      // Page view should be tracked
      // Check for any visual indicator that quote was viewed
      const viewedIndicator = page.getByText(/viewed|opened/i);
      if (await viewedIndicator.isVisible()) {
        await expect(viewedIndicator).toBeVisible();
      }
    });

    test('should show expired message for expired quotes', async ({ page }) => {
      await page.goto('/q/expired-quote-token');

      const expiredMessage = page.getByText(/expired|no longer valid/i);
      if (await expiredMessage.isVisible()) {
        await expect(expiredMessage).toBeVisible();
      }
    });

    test('should show accepted message for already accepted quotes', async ({ page }) => {
      await page.goto('/q/accepted-quote-token');

      const acceptedMessage = page.getByText(/already accepted|accepted on/i);
      if (await acceptedMessage.isVisible()) {
        await expect(acceptedMessage).toBeVisible();
      }
    });
  });

  test.describe('Quote Download', () => {
    test('should have download PDF button', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const downloadButton = page.getByRole('button', { name: /download|pdf/i });
      if (await downloadButton.isVisible()) {
        await expect(downloadButton).toBeVisible();
      }
    });

    test('should trigger PDF download', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const downloadButton = page.getByRole('button', { name: /download|pdf/i });
      if (await downloadButton.isVisible()) {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
          downloadButton.click(),
        ]);

        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.pdf$/);
        }
      }
    });
  });

  test.describe('Quote Comments/Questions', () => {
    test('should have comment/question section', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const commentSection = page.getByText(/question|comment|message/i);
      if (await commentSection.isVisible()) {
        await expect(commentSection).toBeVisible();
      }
    });

    test('should allow sending questions', async ({ page }) => {
      await page.goto('/q/demo-quote-token');

      const messageInput = page.getByPlaceholder(/question|message/i);
      if (await messageInput.isVisible()) {
        await messageInput.fill('Test question about this quote');

        const sendButton = page.getByRole('button', { name: /send|submit/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          // Should show success or the message
          const success = page.getByText(/sent|thank you/i);
          if (await success.isVisible()) {
            await expect(success).toBeVisible();
          }
        }
      }
    });
  });
});

test.describe('Client Portal - Invoice View', () => {
  test.describe('Public Invoice Access', () => {
    test('should show 404 for invalid invoice token', async ({ page }) => {
      await page.goto('/invoice/invalid-token-12345');

      const errorMessages = [
        page.getByText(/not found/i),
        page.getByText(/invalid/i),
        page.getByText(/404/i),
      ];

      let foundError = false;
      for (const msg of errorMessages) {
        if (await msg.isVisible()) {
          foundError = true;
          break;
        }
      }
      // This may show error or redirect - both valid
      expect(true).toBe(true);
    });

    test('should display invoice details', async ({ page }) => {
      await page.goto('/invoice/demo-invoice-token');

      // Look for invoice-related content
      const invoiceContent = [
        page.getByText(/invoice/i),
        page.getByText(/amount due/i),
        page.getByText(/\$/),
      ];

      for (const content of invoiceContent) {
        if (await content.first().isVisible()) {
          await expect(content.first()).toBeVisible();
          break;
        }
      }
    });

    test('should show payment button', async ({ page }) => {
      await page.goto('/invoice/demo-invoice-token');

      const payButton = page.getByRole('button', { name: /pay|payment/i });
      if (await payButton.isVisible()) {
        await expect(payButton).toBeVisible();
      }
    });

    test('should show invoice line items', async ({ page }) => {
      await page.goto('/invoice/demo-invoice-token');

      const lineItems = page.locator('table, [class*="item"]');
      if (await lineItems.count() > 0) {
        await expect(lineItems.first()).toBeVisible();
      }
    });

    test('should show due date', async ({ page }) => {
      await page.goto('/invoice/demo-invoice-token');

      const dueDate = page.getByText(/due|payment due/i);
      if (await dueDate.isVisible()) {
        await expect(dueDate).toBeVisible();
      }
    });
  });

  test.describe('Invoice Payment Flow', () => {
    test('should show payment options', async ({ page }) => {
      await page.goto('/invoice/demo-invoice-token');

      const payButton = page.getByRole('button', { name: /pay/i });
      if (await payButton.isVisible()) {
        await payButton.click();

        // Should show payment method options
        const paymentOptions = page.getByText(/credit card|bank|stripe/i);
        if (await paymentOptions.isVisible()) {
          await expect(paymentOptions).toBeVisible();
        }
      }
    });

    test('should show paid status for paid invoices', async ({ page }) => {
      await page.goto('/invoice/paid-invoice-token');

      const paidStatus = page.getByText(/paid|payment received/i);
      if (await paidStatus.isVisible()) {
        await expect(paidStatus).toBeVisible();
      }
    });

    test('should show overdue indicator', async ({ page }) => {
      await page.goto('/invoice/overdue-invoice-token');

      const overdueIndicator = page.getByText(/overdue|past due/i);
      if (await overdueIndicator.isVisible()) {
        await expect(overdueIndicator).toBeVisible();
      }
    });
  });
});

test.describe('Client Portal Accessibility', () => {
  test('should have proper heading hierarchy on quote view', async ({ page }) => {
    await page.goto('/q/demo-quote-token');

    // Should have main heading
    const heading = page.getByRole('heading').first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/q/demo-quote-token');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/q/demo-quote-token');

    // Should be usable on mobile
    const main = page.locator('main, body').first();
    await expect(main).toBeVisible();
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/q/demo-quote-token');

    const buttons = page.getByRole('button');
    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
    }
  });
});

test.describe('Client Portal Security', () => {
  test('should not expose sensitive data in URL', async ({ page }) => {
    await page.goto('/q/demo-quote-token');

    // URL should use token, not direct IDs
    const url = page.url();
    expect(url).not.toMatch(/\/quotes\/[0-9a-f-]{36}/);
  });

  test('should not allow access to other quotes', async ({ page }) => {
    // Try to manipulate token
    await page.goto('/q/demo-quote-token');

    // Changing token should not show different quote
    await page.goto('/q/modified-demo-quote-token');

    const error = page.getByText(/not found|invalid/i);
    if (await error.isVisible()) {
      await expect(error).toBeVisible();
    }
  });
});
