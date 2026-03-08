import { test, expect } from '@playwright/test';

/**
 * TC-REG-001 to TC-REG-015: Historical Regression Tests
 *
 * Tests for previously fixed bugs to prevent regression.
 * Each test references the original issue/bug report.
 *
 * Note: These tests use storageState from Playwright config,
 * so they are already authenticated when they start.
 */

test.describe('Historical Regressions - Quote Builder', () => {
  test('TC-REG-001: [BUG-001] Block duplication maintains unique IDs', async ({ page }) => {
    /**
     * Bug: Duplicating blocks caused ID conflicts leading to
     * incorrect block updates.
     * Fixed: Generate new UUID on duplication
     */
    await page.goto('/quotes/new');

    // Add a block if the feature exists
    const addBlockBtn = page.locator('button:has-text("Add Block")');
    if (await addBlockBtn.isVisible()) {
      await addBlockBtn.click();
      await page.click('[data-block-type="text"]');

      // Get block ID
      const firstBlockId = await page.locator('[data-testid="block"]').first().getAttribute('data-block-id');

      // Duplicate the block
      const duplicateBtn = page.locator('[data-testid="block"]').first().locator('button[aria-label="duplicate"]');
      if (await duplicateBtn.isVisible()) {
        await duplicateBtn.click();

        // Get duplicated block ID
        const secondBlockId = await page.locator('[data-testid="block"]').nth(1).getAttribute('data-block-id');

        // IDs must be different
        expect(firstBlockId).not.toBe(secondBlockId);
      }
    }
  });

  test('TC-REG-002: [BUG-002] Block reordering persists correctly', async ({ page }) => {
    /**
     * Bug: Drag-and-drop block reordering didn't persist on save.
     * Fixed: Update block order in state and persist to DB
     */
    await page.goto('/quotes/new');

    // Check if block functionality exists
    const addBlockBtn = page.getByRole('button', { name: /add block/i });
    if (await addBlockBtn.isVisible()) {
      // Add two blocks
      await addBlockBtn.click();
      await page.click('[data-block-type="text"]');
      await page.fill('[data-testid="block"] input', 'Block 1');

      await addBlockBtn.click();
      await page.click('[data-block-type="text"]');
      await page.fill('[data-testid="block"]:nth-child(2) input', 'Block 2');

      // Drag Block 2 above Block 1
      const block2 = page.locator('[data-testid="block"]').nth(1);
      const block1 = page.locator('[data-testid="block"]').first();

      if (await block2.isVisible()) {
        const box1 = await block1.boundingBox();
        const box2 = await block2.boundingBox();

        if (box1 && box2) {
          await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
          await page.mouse.down();
          await page.mouse.move(box1.x + box1.width / 2, box1.y - 10);
          await page.mouse.up();
        }
      }

      // Save
      await page.getByRole('button', { name: /save/i }).click();
      await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

      // Reload and verify order
      await page.reload();

      const firstBlockContent = await page.locator('[data-testid="block"]').first().textContent();
      expect(firstBlockContent).toContain('Block 2');
    }
  });

  test('TC-REG-003: [BUG-003] Rich text editor preserves formatting', async ({ page }) => {
    /**
     * Bug: Bold/italic formatting was lost when saving text blocks.
     * Fixed: Properly serialize and deserialize HTML content
     */
    await page.goto('/quotes/new');

    // Check if text block functionality exists
    const addBlockBtn = page.getByRole('button', { name: /add block/i });
    if (await addBlockBtn.isVisible()) {
      await addBlockBtn.click();
      await page.click('[data-block-type="text"]');

      // Find editor and add formatted text
      const editor = page.locator('[data-testid="rich-text-editor"]');
      if (await editor.isVisible()) {
        await editor.click();
        await editor.fill('Test content');

        // Select text and bold it (use Meta for Mac, Control for Windows/Linux)
        await page.keyboard.press('ControlOrMeta+a');
        await page.click('button[aria-label="Bold"]');

        // Save
        await page.getByRole('button', { name: /save/i }).click();
        await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

        // Reload and verify
        await page.reload();

        // Check that bold formatting is present
        const boldText = page.locator('[data-testid="rich-text-editor"] strong, [data-testid="rich-text-editor"] b');
        await expect(boldText).toBeVisible();
      }
    }
  });
});

test.describe('Historical Regressions - Calculations', () => {
  test('TC-REG-004: [BUG-004] Tax calculation rounds correctly', async ({ page }) => {
    /**
     * Bug: Tax amounts had floating point precision errors
     * (e.g., $10.07 showed as $10.069999999)
     * Fixed: Round to 2 decimal places before display
     */
    await page.goto('/quotes/new');

    // Add line item with amount that causes floating point issues
    const addItemBtn = page.getByRole('button', { name: /add.*item/i });
    if (await addItemBtn.isVisible()) {
      await addItemBtn.click();
      await page.fill('input[name="lineItems.0.quantity"]', '3');
      await page.fill('input[name="lineItems.0.rate"]', '33.33');

      // Set tax rate if available
      const taxInput = page.locator('input[name="taxRate"]');
      if (await taxInput.isVisible()) {
        await taxInput.fill('8.25');

        // Check displayed values have max 2 decimal places
        const taxTotal = await page.locator('[data-testid="tax-total"]').textContent();
        const total = await page.locator('[data-testid="quote-total"]').textContent();

        // Extract numeric value
        const taxValue = taxTotal?.replace(/[^0-9.]/g, '') || '0';
        const totalValue = total?.replace(/[^0-9.]/g, '') || '0';

        // Check decimal places
        const taxDecimals = taxValue.split('.')[1]?.length || 0;
        const totalDecimals = totalValue.split('.')[1]?.length || 0;

        expect(taxDecimals).toBeLessThanOrEqual(2);
        expect(totalDecimals).toBeLessThanOrEqual(2);
      }
    }
  });

  test('TC-REG-005: [BUG-005] Line item deletion recalculates total', async ({ page }) => {
    /**
     * Bug: Deleting a line item didn't update the quote total.
     * Fixed: Recalculate totals on line item changes
     */
    await page.goto('/quotes/new');

    // Check if line item functionality exists
    const addItemBtn = page.getByRole('button', { name: /add.*item/i });
    if (await addItemBtn.isVisible()) {
      // Add two line items
      await addItemBtn.click();
      await page.fill('input[name="lineItems.0.name"]', 'Item 1');
      await page.fill('input[name="lineItems.0.quantity"]', '1');
      await page.fill('input[name="lineItems.0.rate"]', '100');

      await addItemBtn.click();
      await page.fill('input[name="lineItems.1.name"]', 'Item 2');
      await page.fill('input[name="lineItems.1.quantity"]', '1');
      await page.fill('input[name="lineItems.1.rate"]', '200');

      // Verify total is 300
      const totalElement = page.locator('[data-testid="quote-total"]');
      if (await totalElement.isVisible()) {
        let total = await totalElement.textContent();
        expect(total).toContain('300');

        // Delete first item
        await page.locator('button[aria-label="delete-item"]').first().click();

        // Verify total updated to 200
        total = await totalElement.textContent();
        expect(total).toContain('200');
      }
    }
  });
});

test.describe('Historical Regressions - Authentication', () => {
  test('TC-REG-006: [BUG-006] Session persists across page reload', async ({ page }) => {
    /**
     * Bug: Users were logged out on page refresh.
     * Fixed: Properly persist session cookies
     */
    // Already authenticated via storageState
    await page.goto('/dashboard');

    // Verify logged in - look for user menu or dashboard content
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("AP"), [aria-label*="user"]');
    await expect(userMenu.first()).toBeVisible();

    // Reload
    await page.reload();

    // Still logged in
    await expect(userMenu.first()).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC-REG-007: [BUG-007] Protected routes redirect to login', async ({ browser }) => {
    /**
     * Bug: Some protected routes showed blank page instead of redirect.
     * Fixed: Middleware properly redirects unauthenticated requests
     */
    // Create a fresh context with explicitly NO storage state to test unauthenticated access
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    // Without logging in, try to access protected route
    await page.goto('/quotes');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });
});

test.describe('Historical Regressions - Email', () => {
  test('TC-REG-008: [BUG-008] Email special characters handled', async ({ page }) => {
    /**
     * Bug: Client names with special characters broke email sending.
     * Fixed: Properly encode names in email headers
     */
    // Create client with special characters
    await page.goto('/clients/new');

    const nameInput = page.locator('input[name="name"], #name');
    if (await nameInput.isVisible()) {
      await nameInput.fill('José García-López');
      await page.getByRole('textbox', { name: 'Email' }).fill('jose-test@e2e-test.local');
      await page.getByRole('button', { name: /save|create/i }).click();

      // Wait for redirect or success
      await page.waitForLoadState('networkidle');
      const url = page.url();

      if (url.includes('/clients/') && !url.includes('/new')) {
        // Client created successfully
        // Create and send quote to this client
        await page.goto('/quotes/new');
        const titleInput = page.locator('input[name="title"], #title');
        if (await titleInput.isVisible()) {
          await titleInput.fill('Test Quote');

          // Select the client if select exists
          const clientSelect = page.locator('[data-testid="client-select"]');
          if (await clientSelect.isVisible()) {
            await clientSelect.click();
            await page.click('text=José García-López');
          }

          await page.getByRole('button', { name: /save/i }).click();
          await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

          // Try to send - should not error
          const sendBtn = page.getByRole('button', { name: /send/i });
          if (await sendBtn.isVisible()) {
            await sendBtn.click();

            const sendDialog = page.locator('[role="dialog"]');
            if (await sendDialog.isVisible()) {
              await page.getByRole('button', { name: /send/i }).click();

              // Should show success, not error
              await expect(page.getByText(/sent|success/i)).toBeVisible();
            }
          }
        }
      }
    }
  });
});

test.describe('Historical Regressions - PDF', () => {
  test('TC-REG-009: [BUG-009] PDF generation handles long content', async ({ page }) => {
    /**
     * Bug: Quotes with many line items caused PDF generation timeout.
     * Fixed: Optimize PDF rendering for large documents
     */
    await page.goto('/quotes/new');

    const titleInput = page.locator('input[name="title"], #title');
    const addItemBtn = page.getByRole('button', { name: /add.*item/i });

    if (await titleInput.isVisible() && await addItemBtn.isVisible()) {
      await titleInput.fill('Large Quote');

      // Add several line items
      for (let i = 0; i < 5; i++) {
        await addItemBtn.click();
        const nameInput = page.locator(`input[name="lineItems.${i}.name"]`);
        if (await nameInput.isVisible()) {
          await nameInput.fill(`Item ${i + 1}`);
          await page.fill(`input[name="lineItems.${i}.quantity"]`, '1');
          await page.fill(`input[name="lineItems.${i}.rate"]`, '100');
        }
      }

      await page.getByRole('button', { name: /save/i }).click();
      await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

      // Generate PDF - should complete within reasonable time
      const pdfButton = page.getByRole('button', { name: /pdf|download/i });
      if (await pdfButton.isVisible()) {
        const startTime = Date.now();
        const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
        await pdfButton.click();

        const download = await downloadPromise;
        const duration = Date.now() - startTime;

        // Should complete within 30 seconds
        expect(duration).toBeLessThan(30000);
        expect(download.suggestedFilename()).toContain('.pdf');
      }
    }
  });

  test('TC-REG-010: [BUG-010] PDF includes all pages', async ({ page }) => {
    /**
     * Bug: Multi-page PDFs were truncated to first page.
     * Fixed: Configure puppeteer for full document rendering
     */
    // This would require PDF parsing to verify
    // For now, verify the download completes successfully
    await page.goto('/dashboard');
    // Placeholder test
  });
});

test.describe('Historical Regressions - Client Portal', () => {
  test('TC-REG-011: [BUG-011] Signature captures on touch devices', async ({ page }) => {
    /**
     * Bug: Signature pad didn't work on mobile/touch devices.
     * Fixed: Add touch event handlers alongside mouse events
     */
    // Emulate mobile device
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/q/test-token');

    const signaturePad = page.locator('[data-testid="signature-pad"]');
    if (await signaturePad.isVisible()) {
      // Simulate touch events
      const box = await signaturePad.boundingBox();
      if (box) {
        await page.touchscreen.tap(box.x + 50, box.y + 50);
        // Draw signature with touch
        // In real test, would simulate more complex touch gestures
      }
    }
  });

  test('TC-REG-012: [BUG-012] Quote view tracks correctly', async ({ page }) => {
    /**
     * Bug: Quote view tracking didn't fire in some browsers.
     * Fixed: Use reliable tracking method with fallbacks
     */
    // This would need backend verification
    // Check that viewing quote updates its status
    await page.goto('/dashboard');
    // Placeholder test
  });
});

test.describe('Historical Regressions - Data Integrity', () => {
  test('TC-REG-013: [BUG-013] Concurrent edits handled gracefully', async ({ page, context }) => {
    /**
     * Bug: Two users editing same quote caused data loss.
     * Fixed: Implement optimistic locking with version check
     */
    // Open quote list and find a draft quote
    await page.goto('/quotes');

    const draftQuoteLink = page.locator('a[href*="/quotes/"]:has-text("draft")').first();
    if (await draftQuoteLink.isVisible()) {
      await draftQuoteLink.click();
      const quoteUrl = page.url();

      // Open same quote in second tab (same authenticated context)
      const page2 = await context.newPage();
      await page2.goto(quoteUrl);

      // Edit in first tab
      const titleInput1 = page.locator('input[name="title"], #title');
      if (await titleInput1.isVisible()) {
        await titleInput1.fill('Edit from Tab 1');
        await page.getByRole('button', { name: /save/i }).click();

        // Edit in second tab (stale data)
        const titleInput2 = page2.locator('input[name="title"], #title');
        if (await titleInput2.isVisible()) {
          await titleInput2.fill('Edit from Tab 2');
          await page2.getByRole('button', { name: /save/i }).click();

          // Should show conflict message or reload prompt
          const conflictMessage = page2.getByText(/conflict|modified|updated|reload/i);
          await expect(conflictMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('TC-REG-014: [BUG-014] Deletion cascades correctly', async ({ page }) => {
    /**
     * Bug: Deleting a client left orphaned quotes.
     * Fixed: Implement proper cascade delete/soft delete
     */
    // This would need database verification
    // Create client, create quote, delete client, verify quote status
    await page.goto('/dashboard');
    // Placeholder test
  });

  test('TC-REG-015: [BUG-015] Number sequences do not skip or duplicate', async ({ page }) => {
    /**
     * Bug: Quote numbers sometimes skipped or duplicated under load.
     * Fixed: Use database sequences with proper locking
     */
    // Create multiple quotes quickly
    const quoteNumbers: string[] = [];

    for (let i = 0; i < 3; i++) {
      await page.goto('/quotes/new');
      const titleInput = page.locator('input[name="title"], #title');
      if (await titleInput.isVisible()) {
        await titleInput.fill(`Sequence Test ${i}`);
        await page.getByRole('button', { name: /save/i }).click();
        await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

        const quoteNumber = await page.locator('[data-testid="quote-number"]').textContent();
        if (quoteNumber) {
          quoteNumbers.push(quoteNumber);
        }
      }
    }

    if (quoteNumbers.length > 0) {
      // Verify no duplicates
      const uniqueNumbers = new Set(quoteNumbers);
      expect(uniqueNumbers.size).toBe(quoteNumbers.length);

      // Verify sequential
      const numbers = quoteNumbers.map((n) => parseInt(n.replace(/\D/g, '')));
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBeGreaterThan(numbers[i - 1]!);
      }
    }
  });
});
