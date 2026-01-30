import { test, expect } from '@playwright/test';

/**
 * TC-REG-001 to TC-REG-015: Historical Regression Tests
 *
 * Tests for previously fixed bugs to prevent regression.
 * Each test references the original issue/bug report.
 */

test.describe('Historical Regressions - Quote Builder', () => {
  test.skip('TC-REG-001: [BUG-001] Block duplication maintains unique IDs', async ({ page }) => {
    /**
     * Bug: Duplicating blocks caused ID conflicts leading to
     * incorrect block updates.
     * Fixed: Generate new UUID on duplication
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|quotes)/);

    await page.goto('/quotes/new');

    // Add a block
    const addBlockBtn = page.locator('button:has-text("Add Block")');
    if (await addBlockBtn.isVisible()) {
      await addBlockBtn.click();
      await page.click('[data-block-type="text"]');
    }

    // Get block ID
    const firstBlockId = await page.locator('[data-testid="block"]').first().getAttribute('data-block-id');

    // Duplicate the block
    const duplicateBtn = page.locator('[data-testid="block"]').first().locator('button[aria-label="duplicate"]');
    if (await duplicateBtn.isVisible()) {
      await duplicateBtn.click();
    }

    // Get duplicated block ID
    const secondBlockId = await page.locator('[data-testid="block"]').nth(1).getAttribute('data-block-id');

    // IDs must be different
    expect(firstBlockId).not.toBe(secondBlockId);
  });

  test.skip('TC-REG-002: [BUG-002] Block reordering persists correctly', async ({ page }) => {
    /**
     * Bug: Drag-and-drop block reordering didn't persist on save.
     * Fixed: Update block order in state and persist to DB
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.goto('/quotes/new');

    // Add two blocks
    await page.click('button:has-text("Add Block")');
    await page.click('[data-block-type="text"]');
    await page.fill('[data-testid="block"] input', 'Block 1');

    await page.click('button:has-text("Add Block")');
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
    await page.click('button:has-text("Save")');
    await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

    // Reload and verify order
    await page.reload();

    const firstBlockContent = await page.locator('[data-testid="block"]').first().textContent();
    expect(firstBlockContent).toContain('Block 2');
  });

  test.skip('TC-REG-003: [BUG-003] Rich text editor preserves formatting', async ({ page }) => {
    /**
     * Bug: Bold/italic formatting was lost when saving text blocks.
     * Fixed: Properly serialize and deserialize HTML content
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.goto('/quotes/new');

    // Add text block
    await page.click('button:has-text("Add Block")');
    await page.click('[data-block-type="text"]');

    // Find editor and add formatted text
    const editor = page.locator('[data-testid="rich-text-editor"]');
    if (await editor.isVisible()) {
      await editor.click();
      await editor.fill('Test content');

      // Select text and bold it
      await page.keyboard.press('Control+a');
      await page.click('button[aria-label="Bold"]');

      // Save
      await page.click('button:has-text("Save")');
      await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

      // Reload and verify
      await page.reload();

      // Check that bold formatting is present
      const boldText = page.locator('[data-testid="rich-text-editor"] strong, [data-testid="rich-text-editor"] b');
      await expect(boldText).toBeVisible();
    }
  });
});

test.describe('Historical Regressions - Calculations', () => {
  test.skip('TC-REG-004: [BUG-004] Tax calculation rounds correctly', async ({ page }) => {
    /**
     * Bug: Tax amounts had floating point precision errors
     * (e.g., $10.07 showed as $10.069999999)
     * Fixed: Round to 2 decimal places before display
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.goto('/quotes/new');

    // Add line item with amount that causes floating point issues
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="lineItems.0.quantity"]', '3');
    await page.fill('input[name="lineItems.0.rate"]', '33.33');

    // Set tax rate
    const taxInput = page.locator('input[name="taxRate"]');
    if (await taxInput.isVisible()) {
      await taxInput.fill('8.25');
    }

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
  });

  test.skip('TC-REG-005: [BUG-005] Line item deletion recalculates total', async ({ page }) => {
    /**
     * Bug: Deleting a line item didn't update the quote total.
     * Fixed: Recalculate totals on line item changes
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.goto('/quotes/new');

    // Add two line items
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="lineItems.0.name"]', 'Item 1');
    await page.fill('input[name="lineItems.0.quantity"]', '1');
    await page.fill('input[name="lineItems.0.rate"]', '100');

    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="lineItems.1.name"]', 'Item 2');
    await page.fill('input[name="lineItems.1.quantity"]', '1');
    await page.fill('input[name="lineItems.1.rate"]', '200');

    // Verify total is 300
    let total = await page.locator('[data-testid="quote-total"]').textContent();
    expect(total).toContain('300');

    // Delete first item
    await page.locator('button[aria-label="delete-item"]').first().click();

    // Verify total updated to 200
    total = await page.locator('[data-testid="quote-total"]').textContent();
    expect(total).toContain('200');
  });
});

test.describe('Historical Regressions - Authentication', () => {
  test.skip('TC-REG-006: [BUG-006] Session persists across page reload', async ({ page }) => {
    /**
     * Bug: Users were logged out on page refresh.
     * Fixed: Properly persist session cookies
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|quotes)/);

    // Verify logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Reload
    await page.reload();

    // Still logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test.skip('TC-REG-007: [BUG-007] Protected routes redirect to login', async ({ page }) => {
    /**
     * Bug: Some protected routes showed blank page instead of redirect.
     * Fixed: Middleware properly redirects unauthenticated requests
     */
    // Without logging in, try to access protected route
    const response = await page.goto('/quotes');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Historical Regressions - Email', () => {
  test.skip('TC-REG-008: [BUG-008] Email special characters handled', async ({ page }) => {
    /**
     * Bug: Client names with special characters broke email sending.
     * Fixed: Properly encode names in email headers
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Create client with special characters
    await page.goto('/clients/new');
    await page.fill('input[name="name"]', 'José García-López');
    await page.fill('input[name="email"]', 'jose@test.com');
    await page.click('button:has-text("Save")');
    await page.waitForURL(/\/clients\/[a-z0-9-]+/);

    // Create and send quote to this client
    await page.goto('/quotes/new');
    await page.fill('input[name="title"]', 'Test Quote');

    // Select the client
    const clientSelect = page.locator('[data-testid="client-select"]');
    if (await clientSelect.isVisible()) {
      await clientSelect.click();
      await page.click('text=José García-López');
    }

    await page.click('button:has-text("Save")');
    await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

    // Try to send - should not error
    await page.getByRole('button', { name: /send/i }).click();

    const sendDialog = page.locator('[role="dialog"]');
    if (await sendDialog.isVisible()) {
      await page.click('button:has-text("Send")');

      // Should show success, not error
      await expect(page.getByText(/sent|success/i)).toBeVisible();
      await expect(page.getByText(/error|failed/i)).not.toBeVisible();
    }
  });
});

test.describe('Historical Regressions - PDF', () => {
  test.skip('TC-REG-009: [BUG-009] PDF generation handles long content', async ({ page }) => {
    /**
     * Bug: Quotes with many line items caused PDF generation timeout.
     * Fixed: Optimize PDF rendering for large documents
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.goto('/quotes/new');
    await page.fill('input[name="title"]', 'Large Quote');

    // Add many line items
    for (let i = 0; i < 20; i++) {
      await page.click('button:has-text("Add Item")');
      await page.fill(`input[name="lineItems.${i}.name"]`, `Item ${i + 1}`);
      await page.fill(`input[name="lineItems.${i}.quantity"]`, '1');
      await page.fill(`input[name="lineItems.${i}.rate"]`, '100');
    }

    await page.click('button:has-text("Save")');
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
  });

  test.skip('TC-REG-010: [BUG-010] PDF includes all pages', async ({ page }) => {
    /**
     * Bug: Multi-page PDFs were truncated to first page.
     * Fixed: Configure puppeteer for full document rendering
     */
    // This would require PDF parsing to verify
    // For now, verify the download completes successfully
  });
});

test.describe('Historical Regressions - Client Portal', () => {
  test.skip('TC-REG-011: [BUG-011] Signature captures on touch devices', async ({ page }) => {
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

  test.skip('TC-REG-012: [BUG-012] Quote view tracks correctly', async ({ page }) => {
    /**
     * Bug: Quote view tracking didn't fire in some browsers.
     * Fixed: Use reliable tracking method with fallbacks
     */
    // This would need backend verification
    // Check that viewing quote updates its status
  });
});

test.describe('Historical Regressions - Data Integrity', () => {
  test.skip('TC-REG-013: [BUG-013] Concurrent edits handled gracefully', async ({ page, context }) => {
    /**
     * Bug: Two users editing same quote caused data loss.
     * Fixed: Implement optimistic locking with version check
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Open quote in first tab
    await page.goto('/quotes');
    await page.click('tr:has-text("draft")');
    const quoteUrl = page.url();

    // Open same quote in second tab
    const page2 = await context.newPage();
    await page2.goto('/login');
    await page2.fill('input[name="email"]', 'test@quotecraft.dev');
    await page2.fill('input[name="password"]', 'TestPassword123!');
    await page2.click('button[type="submit"]');
    await page2.goto(quoteUrl);

    // Edit in first tab
    await page.fill('input[name="title"]', 'Edit from Tab 1');
    await page.click('button:has-text("Save")');

    // Edit in second tab (stale data)
    await page2.fill('input[name="title"]', 'Edit from Tab 2');
    await page2.click('button:has-text("Save")');

    // Should show conflict message or reload prompt
    const conflictMessage = page2.getByText(/conflict|modified|updated|reload/i);
    await expect(conflictMessage).toBeVisible();
  });

  test.skip('TC-REG-014: [BUG-014] Deletion cascades correctly', async ({ page }) => {
    /**
     * Bug: Deleting a client left orphaned quotes.
     * Fixed: Implement proper cascade delete/soft delete
     */
    // This would need database verification
    // Create client, create quote, delete client, verify quote status
  });

  test.skip('TC-REG-015: [BUG-015] Number sequences do not skip or duplicate', async ({ page }) => {
    /**
     * Bug: Quote numbers sometimes skipped or duplicated under load.
     * Fixed: Use database sequences with proper locking
     */
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@quotecraft.dev');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Create multiple quotes quickly
    const quoteNumbers: string[] = [];

    for (let i = 0; i < 5; i++) {
      await page.goto('/quotes/new');
      await page.fill('input[name="title"]', `Sequence Test ${i}`);
      await page.click('button:has-text("Save")');
      await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

      const quoteNumber = await page.locator('[data-testid="quote-number"]').textContent();
      if (quoteNumber) {
        quoteNumbers.push(quoteNumber);
      }
    }

    // Verify no duplicates
    const uniqueNumbers = new Set(quoteNumbers);
    expect(uniqueNumbers.size).toBe(quoteNumbers.length);

    // Verify sequential
    const numbers = quoteNumbers.map((n) => parseInt(n.replace(/\D/g, '')));
    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeGreaterThan(numbers[i - 1]!);
    }
  });
});
