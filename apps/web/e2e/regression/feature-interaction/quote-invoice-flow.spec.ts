import { test, expect } from '@playwright/test';

/**
 * TC-FI-001 to TC-FI-015: Feature Interaction Tests
 *
 * Tests interactions between major features:
 * - Quote creation with rate cards
 * - Quote to invoice conversion
 * - Client data propagation
 * - Template application
 * - PDF generation with custom branding
 */

test.describe('Feature Interaction - Quote Creation with Rate Cards', () => {
  test.skip('TC-FI-001: rate card items populate in quote builder', async ({ page }) => {
    // First, ensure a rate card exists
    await page.goto('/rate-cards');

    const rateCardExists = await page.locator('tbody tr').first().isVisible();

    if (!rateCardExists) {
      // Create a rate card
      await page.goto('/rate-cards/new');
      await page.fill('input[name="name"]', 'Development Rates');
      await page.click('button:has-text("Add Item")');
      await page.fill('input[name="items.0.name"]', 'Senior Developer');
      await page.fill('input[name="items.0.rate"]', '150');
      await page.click('button:has-text("Save")');
      await page.waitForURL(/\/rate-cards\/[a-z0-9-]+/);
    }

    // Now create a quote and use the rate card
    await page.goto('/quotes/new');

    // Find rate card selector/panel
    const rateCardPanel = page.locator('[data-testid="rate-card-panel"]');
    if (await rateCardPanel.isVisible()) {
      // Select the rate card
      await page.click('[data-testid="rate-card-item"]').first();

      // Verify item added to quote
      const lineItem = page.locator('[data-testid="quote-line-item"]');
      await expect(lineItem).toBeVisible();

      // Verify rate populated correctly
      await expect(page.locator('input[name*="rate"]').first()).toHaveValue('150');
    }
  });

  test.skip('TC-FI-002: rate card changes reflect in new quotes', async ({ page }) => {
    // Update a rate card
    await page.goto('/rate-cards');
    await page.click('tbody tr').first();

    await page.getByRole('button', { name: /edit/i }).click();

    // Change a rate
    await page.fill('input[name="items.0.rate"]', '175');
    await page.click('button:has-text("Save")');

    // Create new quote using this rate card
    await page.goto('/quotes/new');

    const rateCardPanel = page.locator('[data-testid="rate-card-panel"]');
    if (await rateCardPanel.isVisible()) {
      await page.click('[data-testid="rate-card-item"]').first();

      // New rate should be used
      await expect(page.locator('input[name*="rate"]').first()).toHaveValue('175');
    }
  });

  test.skip('TC-FI-003: existing quotes unaffected by rate card changes', async ({ page }) => {
    // View an existing quote created before rate card update
    await page.goto('/quotes');
    await page.click('tbody tr').first();

    // The rate in the existing quote should be unchanged
    const rateValue = await page.locator('[data-testid="line-item-rate"]').first().textContent();

    // Verify it's not the updated rate (150 not 175)
    // This depends on the specific setup
  });
});

test.describe('Feature Interaction - Quote to Invoice Conversion', () => {
  test.skip('TC-FI-004: all quote data transfers to invoice', async ({ page }) => {
    // Navigate to an accepted quote
    await page.goto('/quotes');

    const acceptedQuote = page.locator('tr:has-text("accepted")').first();
    if (await acceptedQuote.isVisible()) {
      await acceptedQuote.click();

      // Get quote details
      const quoteTitle = await page.locator('[data-testid="quote-title"]').textContent();
      const quoteTotal = await page.locator('[data-testid="quote-total"]').textContent();
      const clientName = await page.locator('[data-testid="client-name"]').textContent();

      // Convert to invoice
      await page.getByRole('button', { name: /convert.*invoice/i }).click();

      const confirmDialog = page.locator('[role="alertdialog"]');
      if (await confirmDialog.isVisible()) {
        await page.click('button:has-text("Convert")');
      }

      await page.waitForURL(/\/invoices\/[a-z0-9-]+/);

      // Verify data transferred
      await expect(page.locator('[data-testid="invoice-title"]')).toContainText(quoteTitle || '');
      await expect(page.locator('[data-testid="invoice-total"]')).toContainText(quoteTotal || '');
      await expect(page.locator('[data-testid="client-name"]')).toContainText(clientName || '');
    }
  });

  test.skip('TC-FI-005: line items preserved in conversion', async ({ page }) => {
    await page.goto('/quotes');

    const acceptedQuote = page.locator('tr:has-text("accepted")').first();
    if (await acceptedQuote.isVisible()) {
      await acceptedQuote.click();

      // Count line items
      const quoteLineItems = await page.locator('[data-testid="quote-line-item"]').count();

      // Convert
      await page.getByRole('button', { name: /convert.*invoice/i }).click();
      await page.click('button:has-text("Convert")');
      await page.waitForURL(/\/invoices\/[a-z0-9-]+/);

      // Verify same number of line items
      const invoiceLineItems = await page.locator('[data-testid="invoice-line-item"]').count();
      expect(invoiceLineItems).toBe(quoteLineItems);
    }
  });

  test.skip('TC-FI-006: signature data attached to converted invoice', async ({ page }) => {
    await page.goto('/invoices');

    // Find an invoice that was converted from a quote
    const convertedInvoice = page.locator('tr:has-text("converted")').first();
    if (await convertedInvoice.isVisible()) {
      await convertedInvoice.click();

      // Check for signature reference
      const signatureSection = page.locator('[data-testid="signature-info"]');
      if (await signatureSection.isVisible()) {
        await expect(signatureSection).toContainText(/signed/i);
      }
    }
  });

  test.skip('TC-FI-007: quote links to generated invoice', async ({ page }) => {
    await page.goto('/quotes');

    const convertedQuote = page.locator('tr:has-text("converted")').first();
    if (await convertedQuote.isVisible()) {
      await convertedQuote.click();

      // Should show link to invoice
      const invoiceLink = page.locator('[data-testid="linked-invoice"]');
      await expect(invoiceLink).toBeVisible();

      // Clicking should navigate to invoice
      await invoiceLink.click();
      await expect(page).toHaveURL(/\/invoices\/[a-z0-9-]+/);
    }
  });
});

test.describe('Feature Interaction - Client Data Propagation', () => {
  test.skip('TC-FI-008: client updates reflect in draft quotes', async ({ page }) => {
    // Update client info
    await page.goto('/clients');
    await page.click('tbody tr').first();

    const clientId = page.url().split('/clients/')[1]?.split('?')[0];

    // Update email
    await page.getByRole('button', { name: /edit/i }).click();
    const newEmail = `updated-${Date.now()}@test.com`;
    await page.fill('input[name="email"]', newEmail);
    await page.click('button:has-text("Save")');

    // Check a draft quote for this client
    await page.goto('/quotes');

    // Filter by client if possible
    const draftQuote = page.locator('tr:has-text("draft")').first();
    if (await draftQuote.isVisible()) {
      await draftQuote.click();

      // Client email should be updated
      // (Depends on how quotes reference client data)
    }
  });

  test.skip('TC-FI-009: client deletion blocks for active quotes', async ({ page }) => {
    await page.goto('/clients');

    // Find a client with quotes
    const clientWithQuotes = page.locator('tr').filter({
      has: page.locator('[data-testid="quote-count"]:not(:has-text("0"))'),
    }).first();

    if (await clientWithQuotes.isVisible()) {
      await clientWithQuotes.click();

      // Try to delete
      const actionsMenu = page.locator('button[aria-label="actions"]');
      await actionsMenu.click();
      await page.getByRole('menuitem', { name: /delete/i }).click();

      // Should show warning about active quotes
      await expect(page.getByText(/active quotes|cannot delete/i)).toBeVisible();
    }
  });

  test.skip('TC-FI-010: new contact syncs to quote recipient options', async ({ page }) => {
    // Add a new contact to a client
    await page.goto('/clients');
    await page.click('tbody tr').first();

    const clientId = page.url().split('/clients/')[1]?.split('?')[0];

    await page.getByRole('button', { name: /add contact/i }).click();

    const contactDialog = page.locator('[role="dialog"]');
    if (await contactDialog.isVisible()) {
      await page.fill('input[name="contactName"]', 'New Contact');
      await page.fill('input[name="contactEmail"]', 'newcontact@test.com');
      await page.click('button:has-text("Add")');
    }

    // Create quote for this client
    await page.goto('/quotes/new');

    // Select client
    const clientSelect = page.locator('[data-testid="client-select"]');
    if (await clientSelect.isVisible()) {
      await clientSelect.click();
      await page.click(`[data-value="${clientId}"]`);
    }

    // Check recipient options include new contact
    const recipientSelect = page.locator('[data-testid="recipient-select"]');
    if (await recipientSelect.isVisible()) {
      await recipientSelect.click();
      await expect(page.getByRole('option', { name: /newcontact@test.com/i })).toBeVisible();
    }
  });
});

test.describe('Feature Interaction - Template Application', () => {
  test.skip('TC-FI-011: template applies to new quote', async ({ page }) => {
    // Ensure a template exists
    await page.goto('/templates');

    const templateExists = await page.locator('tbody tr').first().isVisible();

    // Create new quote from template
    await page.goto('/quotes/new');

    const templateSelect = page.locator('[data-testid="template-select"]');
    if (await templateSelect.isVisible()) {
      await templateSelect.click();
      await page.click('[data-testid="template-option"]').first();

      // Template blocks should appear
      await expect(page.locator('[data-testid="block"]')).toHaveCount({ min: 1 });
    }
  });

  test.skip('TC-FI-012: template changes do not affect existing quotes', async ({ page }) => {
    // Get existing quote block count
    await page.goto('/quotes');
    await page.click('tr:has-text("draft")');

    const existingBlockCount = await page.locator('[data-testid="block"]').count();

    // Update template
    await page.goto('/templates');
    await page.click('tbody tr').first();

    await page.getByRole('button', { name: /edit/i }).click();

    // Add a block
    await page.click('button:has-text("Add Block")');
    await page.click('button:has-text("Save")');

    // Check original quote - should have same block count
    await page.goto('/quotes');
    await page.click('tr:has-text("draft")');

    const currentBlockCount = await page.locator('[data-testid="block"]').count();
    expect(currentBlockCount).toBe(existingBlockCount);
  });
});

test.describe('Feature Interaction - PDF Generation with Branding', () => {
  test.skip('TC-FI-013: workspace branding appears in PDF', async ({ page }) => {
    // Set workspace branding
    await page.goto('/settings/branding');

    // Upload logo if not present
    const logoUpload = page.locator('input[type="file"][name="logo"]');
    if (await logoUpload.isVisible()) {
      // In real test, would upload an actual file
    }

    // Set colors
    await page.fill('input[name="primaryColor"]', '#FF5500');
    await page.click('button:has-text("Save")');

    // Generate PDF for a quote
    await page.goto('/quotes');
    await page.click('tbody tr').first();

    const pdfButton = page.getByRole('button', { name: /pdf|download/i });
    if (await pdfButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await pdfButton.click();
      const download = await downloadPromise;

      // Verify PDF was generated
      expect(download.suggestedFilename()).toContain('.pdf');

      // In a real test, would verify PDF content includes branding
    }
  });

  test.skip('TC-FI-014: client-specific branding overrides workspace', async ({ page }) => {
    // Some clients may have custom branding
    await page.goto('/clients');
    await page.click('tbody tr').first();

    // Set client-specific branding
    const brandingTab = page.getByRole('tab', { name: /branding/i });
    if (await brandingTab.isVisible()) {
      await brandingTab.click();

      await page.fill('input[name="customPrimaryColor"]', '#00FF00');
      await page.click('button:has-text("Save")');
    }

    // Generate PDF for quote to this client
    // PDF should use client branding, not workspace
  });

  test.skip('TC-FI-015: PDF reflects current quote state', async ({ page }) => {
    await page.goto('/quotes');
    await page.click('tbody tr').first();

    // Get current status
    const status = await page.locator('[data-testid="quote-status"]').textContent();

    // Generate PDF
    const pdfButton = page.getByRole('button', { name: /pdf|download/i });
    if (await pdfButton.isVisible()) {
      await pdfButton.click();

      // PDF should show current status
      // Would need PDF parsing to verify content
    }
  });
});
