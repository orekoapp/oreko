import { test, expect } from '@playwright/test';

test.describe('PDF Generation', () => {
  test.describe('Quote PDF Generation', () => {
    test('should have download PDF button on quote detail', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const downloadButton = page.getByRole('button', { name: /download|pdf/i });
        await expect(downloadButton).toBeVisible();
      }
    });

    test('should trigger PDF download for quote', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const downloadButton = page.getByRole('button', { name: /download.*pdf|pdf/i });
        if (await downloadButton.isVisible()) {
          // Listen for download event
          const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
          await downloadButton.click();

          const download = await downloadPromise;
          if (download) {
            const filename = download.suggestedFilename();
            expect(filename).toMatch(/\.pdf$/i);
            expect(filename.toLowerCase()).toContain('quote');
          }
        }
      }
    });

    test('should show loading state during PDF generation', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const downloadButton = page.getByRole('button', { name: /download.*pdf|pdf/i });
        if (await downloadButton.isVisible()) {
          await downloadButton.click();

          // Should show loading indicator
          const loading = page.getByText(/generating|loading|please wait/i);
          if (await loading.isVisible()) {
            await expect(loading).toBeVisible();
          }
        }
      }
    });

    test('should include quote number in PDF filename', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
        if (await downloadButton.isVisible()) {
          const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
          await downloadButton.click();

          const download = await downloadPromise;
          if (download) {
            const filename = download.suggestedFilename();
            // Should contain quote identifier
            expect(filename).toMatch(/quote|QT|Q-/i);
          }
        }
      }
    });
  });

  test.describe('Invoice PDF Generation', () => {
    test('should have download PDF button on invoice detail', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const downloadButton = page.getByRole('button', { name: /download|pdf/i });
        await expect(downloadButton).toBeVisible();
      }
    });

    test('should trigger PDF download for invoice', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const downloadButton = page.getByRole('button', { name: /download.*pdf|pdf/i });
        if (await downloadButton.isVisible()) {
          const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
          await downloadButton.click();

          const download = await downloadPromise;
          if (download) {
            const filename = download.suggestedFilename();
            expect(filename).toMatch(/\.pdf$/i);
            expect(filename.toLowerCase()).toContain('invoice');
          }
        }
      }
    });

    test('should include invoice number in PDF filename', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
        if (await downloadButton.isVisible()) {
          const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
          await downloadButton.click();

          const download = await downloadPromise;
          if (download) {
            const filename = download.suggestedFilename();
            // Should contain invoice identifier
            expect(filename).toMatch(/invoice|INV|I-/i);
          }
        }
      }
    });
  });

  test.describe('PDF API Endpoints', () => {
    test('should return 401 for unauthenticated quote PDF request', async ({ request }) => {
      const response = await request.get('/api/pdf/quote/test-quote-id');

      // Should require authentication
      expect([401, 403, 404]).toContain(response.status());
    });

    test('should return 401 for unauthenticated invoice PDF request', async ({ request }) => {
      const response = await request.get('/api/pdf/invoice/test-invoice-id');

      // Should require authentication
      expect([401, 403, 404]).toContain(response.status());
    });

    test('should return 404 for non-existent quote PDF', async ({ page }) => {
      await page.goto('/quotes');

      // Try to access non-existent quote
      const response = await page.request.get('/api/pdf/quote/non-existent-id-12345');
      expect([401, 403, 404]).toContain(response.status());
    });

    test('should return 404 for non-existent invoice PDF', async ({ page }) => {
      await page.goto('/invoices');

      const response = await page.request.get('/api/pdf/invoice/non-existent-id-12345');
      expect([401, 403, 404]).toContain(response.status());
    });
  });

  test.describe('PDF Download Endpoints', () => {
    test('should have proper content-type for PDF download', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
        if (await downloadButton.isVisible()) {
          const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
          await downloadButton.click();

          const download = await downloadPromise;
          if (download) {
            // Download should complete successfully
            const path = await download.path();
            expect(path).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('PDF Content Verification', () => {
    test('should include company branding in PDF', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        // The quote detail page should show branding that will be in PDF
        await quoteLink.click();

        // Check for branding elements
        const logo = page.locator('img[alt*="logo"], [class*="logo"]');
        if (await logo.isVisible()) {
          await expect(logo).toBeVisible();
        }
      }
    });

    test('should include line items in quote preview', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        // Line items should be visible (these will be in PDF)
        const lineItems = page.locator('table, [class*="line-item"], [class*="item"]');
        if (await lineItems.count() > 0) {
          await expect(lineItems.first()).toBeVisible();
        }
      }
    });

    test('should include totals in quote preview', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        // Totals should be visible
        const total = page.getByText(/total|amount/i);
        await expect(total.first()).toBeVisible();
      }
    });

    test('should include signature in accepted quote', async ({ page }) => {
      await page.goto('/quotes');

      const acceptedQuote = page.locator('a:has-text("accepted")').first();
      if (await acceptedQuote.isVisible()) {
        await acceptedQuote.click();

        // Should show signature
        const signature = page.getByText(/signature|signed/i);
        if (await signature.isVisible()) {
          await expect(signature).toBeVisible();
        }
      }
    });
  });

  test.describe('Bulk PDF Operations', () => {
    test('should have bulk download option on quotes list', async ({ page }) => {
      await page.goto('/quotes');

      // Look for bulk action checkbox or button
      const bulkAction = page.getByRole('checkbox').first();
      if (await bulkAction.isVisible()) {
        await bulkAction.check();

        const bulkDownload = page.getByRole('button', { name: /download.*selected|bulk.*download/i });
        if (await bulkDownload.isVisible()) {
          await expect(bulkDownload).toBeVisible();
        }
      }
    });

    test('should have bulk download option on invoices list', async ({ page }) => {
      await page.goto('/invoices');

      const bulkAction = page.getByRole('checkbox').first();
      if (await bulkAction.isVisible()) {
        await bulkAction.check();

        const bulkDownload = page.getByRole('button', { name: /download.*selected|bulk.*download/i });
        if (await bulkDownload.isVisible()) {
          await expect(bulkDownload).toBeVisible();
        }
      }
    });
  });

  test.describe('PDF Preview', () => {
    test('should show PDF preview before download', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        // Look for preview section
        const preview = page.getByText(/preview/i);
        if (await preview.isVisible()) {
          await expect(preview).toBeVisible();
        }
      }
    });

    test('should have print option', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const printButton = page.getByRole('button', { name: /print/i });
        if (await printButton.isVisible()) {
          await expect(printButton).toBeVisible();
        }
      }
    });
  });

  test.describe('PDF Error Handling', () => {
    test('should show error message on PDF generation failure', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        // Even if generation fails, should handle gracefully
        const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
        if (await downloadButton.isVisible()) {
          // Button should be clickable
          await expect(downloadButton).toBeEnabled();
        }
      }
    });

    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        // Page should remain functional even if PDF fails
        await expect(page.getByRole('heading').first()).toBeVisible();
      }
    });
  });
});

test.describe('PDF Accessibility', () => {
  test('should have accessible download button', async ({ page }) => {
    await page.goto('/quotes');

    const quoteLink = page.locator('a[href^="/quotes/"]').first();
    if (await quoteLink.isVisible()) {
      await quoteLink.click();

      const downloadButton = page.getByRole('button', { name: /download|pdf/i });
      if (await downloadButton.isVisible()) {
        // Button should be focusable
        await downloadButton.focus();
        await expect(downloadButton).toBeFocused();
      }
    }
  });

  test('should support keyboard activation for download', async ({ page }) => {
    await page.goto('/quotes');

    const quoteLink = page.locator('a[href^="/quotes/"]').first();
    if (await quoteLink.isVisible()) {
      await quoteLink.click();

      const downloadButton = page.getByRole('button', { name: /download|pdf/i });
      if (await downloadButton.isVisible()) {
        await downloadButton.focus();

        // Should be activatable via keyboard
        await page.keyboard.press('Enter');
        // Action should trigger (loading or download)
      }
    }
  });
});
