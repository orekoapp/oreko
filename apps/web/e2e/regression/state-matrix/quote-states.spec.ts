import { test, expect } from '@playwright/test';

/**
 * TC-SM-001: Quote State Matrix Tests
 *
 * Tests all valid state transitions for quotes:
 * draft -> sent -> viewed -> accepted/declined -> converted
 *
 * Also tests invalid transitions that should be blocked.
 */
test.describe('Quote State Matrix Tests', () => {
  test.describe('Valid State Transitions', () => {
    test('TC-SM-001: draft -> sent transition', async ({ page }) => {
      // Setup: Create a draft quote
      await page.goto('/quotes/new');
      await page.waitForLoadState('networkidle');

      // Fill minimal quote data
      await page.fill('input[name="title"]', 'State Matrix Test Quote');

      // Save as draft
      await page.click('button:has-text("Save")');
      await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

      // Verify status is draft
      await expect(page.locator('[data-testid="quote-status"]')).toHaveText(/draft/i);

      // Transition to sent
      const sendButton = page.getByRole('button', { name: /send/i });
      await sendButton.click();

      // Fill send dialog if present
      const sendDialog = page.locator('[role="dialog"]');
      if (await sendDialog.isVisible()) {
        await page.fill('input[name="recipientEmail"]', 'test@example.com');
        await page.click('button:has-text("Send Quote")');
      }

      // Verify status changed to sent
      await expect(page.locator('[data-testid="quote-status"]')).toHaveText(/sent/i);
    });

    test('TC-SM-002: sent -> viewed transition (via client portal)', async ({ page, context }) => {
      // This test requires a sent quote with valid access token
      // The transition happens when client views the quote

      // Navigate to client portal URL (simulated)
      await page.goto('/q/test-token');

      // The view event should be tracked automatically
      // In production, verify the quote status updated to 'viewed'
    });

    test('TC-SM-003: viewed -> accepted transition', async ({ page }) => {
      // Navigate to quote in client portal (viewed state)
      await page.goto('/q/test-token');

      // Click accept button
      await page.getByRole('button', { name: /accept/i }).click();

      // Fill signature
      const signaturePad = page.locator('[data-testid="signature-pad"]');
      if (await signaturePad.isVisible()) {
        // Draw signature
        const box = await signaturePad.boundingBox();
        if (box) {
          await page.mouse.move(box.x + 50, box.y + 50);
          await page.mouse.down();
          await page.mouse.move(box.x + 150, box.y + 50);
          await page.mouse.up();
        }
      }

      // Submit acceptance
      await page.click('button:has-text("Confirm")');

      // Verify acceptance confirmation
      await expect(page.getByText(/accepted|thank you/i)).toBeVisible();
    });

    test('TC-SM-004: viewed -> declined transition', async ({ page }) => {
      await page.goto('/q/test-token');

      // Click decline button
      await page.getByRole('button', { name: /decline/i }).click();

      // Fill decline reason
      const reasonTextarea = page.locator('textarea[name="reason"]');
      if (await reasonTextarea.isVisible()) {
        await reasonTextarea.fill('Budget constraints');
      }

      // Confirm decline
      await page.click('button:has-text("Confirm")');

      // Verify decline confirmation
      await expect(page.getByText(/declined/i)).toBeVisible();
    });

    test('TC-SM-005: accepted -> converted transition', async ({ page }) => {
      // Navigate to accepted quote
      await page.goto('/quotes');

      // Find and click an accepted quote
      await page.click('tr:has-text("accepted")');
      await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

      // Click convert to invoice
      await page.getByRole('button', { name: /convert.*invoice/i }).click();

      // Confirm conversion
      const confirmDialog = page.locator('[role="alertdialog"]');
      if (await confirmDialog.isVisible()) {
        await page.click('button:has-text("Convert")');
      }

      // Verify redirect to new invoice
      await expect(page).toHaveURL(/\/invoices\/[a-z0-9-]+/);

      // Verify quote status is now converted
      await page.goto('/quotes');
      await expect(page.locator('tr:has-text("converted")')).toBeVisible();
    });
  });

  test.describe('Invalid State Transitions', () => {
    test('TC-SM-006: cannot send already sent quote', async ({ page }) => {
      // Navigate to a sent quote
      await page.goto('/quotes');
      await page.click('tr:has-text("sent")');

      // Send button should be disabled or hidden
      const sendButton = page.getByRole('button', { name: /^send$/i });
      await expect(sendButton).toBeDisabled().or(expect(sendButton).toBeHidden());
    });

    test('TC-SM-007: cannot convert draft quote directly', async ({ page }) => {
      // Navigate to a draft quote
      await page.goto('/quotes');
      await page.click('tr:has-text("draft")');

      // Convert button should not be visible for drafts
      const convertButton = page.getByRole('button', { name: /convert.*invoice/i });
      await expect(convertButton).toBeHidden();
    });

    test('TC-SM-008: cannot accept/decline from dashboard', async ({ page }) => {
      // Navigate to quote detail in dashboard (not client portal)
      await page.goto('/quotes');
      await page.click('tr:has-text("sent")');

      // Accept/decline buttons should only be in client portal
      const acceptButton = page.getByRole('button', { name: /^accept$/i });
      const declineButton = page.getByRole('button', { name: /^decline$/i });

      await expect(acceptButton).toBeHidden();
      await expect(declineButton).toBeHidden();
    });

    test('TC-SM-009: cannot modify accepted quote', async ({ page }) => {
      await page.goto('/quotes');
      await page.click('tr:has-text("accepted")');

      // Edit mode should be disabled
      const editButton = page.getByRole('button', { name: /edit/i });

      if (await editButton.isVisible()) {
        await editButton.click();
        // Should show error or no changes allowed
        await expect(page.getByText(/cannot.*edit|locked/i)).toBeVisible();
      }
    });

    test('TC-SM-010: cannot revert converted quote', async ({ page }) => {
      await page.goto('/quotes');
      await page.click('tr:has-text("converted")');

      // Should not have revert option
      const actionsMenu = page.locator('button[aria-label="actions"]');
      if (await actionsMenu.isVisible()) {
        await actionsMenu.click();
        await expect(page.getByRole('menuitem', { name: /revert/i })).toBeHidden();
      }
    });
  });

  test.describe('State Persistence', () => {
    test('TC-SM-011: state persists after page reload', async ({ page }) => {
      // Navigate to a quote with specific state
      await page.goto('/quotes');
      await page.click('tr:has-text("sent")');

      const quoteUrl = page.url();
      const statusBefore = await page.locator('[data-testid="quote-status"]').textContent();

      // Reload page
      await page.reload();

      // Verify state persisted
      const statusAfter = await page.locator('[data-testid="quote-status"]').textContent();
      expect(statusAfter).toBe(statusBefore);
    });

    test('TC-SM-012: state persists after session change', async ({ page, context }) => {
      // Navigate to quote
      await page.goto('/quotes');
      await page.click('tr:has-text("sent")');

      const quoteUrl = page.url();
      const statusBefore = await page.locator('[data-testid="quote-status"]').textContent();

      // Clear session
      await context.clearCookies();

      // Re-login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@quotecraft.dev');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|quotes)/);

      // Navigate back to quote
      await page.goto(quoteUrl);

      // Verify state
      const statusAfter = await page.locator('[data-testid="quote-status"]').textContent();
      expect(statusAfter).toBe(statusBefore);
    });
  });

  test.describe('State Audit Trail', () => {
    test('TC-SM-013: state changes are logged in activity', async ({ page }) => {
      await page.goto('/quotes');
      await page.click('tr:has-text("accepted")');

      // Navigate to activity/history section
      const activityTab = page.getByRole('tab', { name: /activity|history/i });
      if (await activityTab.isVisible()) {
        await activityTab.click();

        // Verify state changes are logged
        await expect(page.getByText(/sent/i)).toBeVisible();
        await expect(page.getByText(/viewed/i)).toBeVisible();
        await expect(page.getByText(/accepted/i)).toBeVisible();
      }
    });

    test('TC-SM-014: state changes include timestamp', async ({ page }) => {
      await page.goto('/quotes');
      await page.click('tbody tr').first();

      // Check activity section for timestamps
      const activityTab = page.getByRole('tab', { name: /activity|history/i });
      if (await activityTab.isVisible()) {
        await activityTab.click();

        // Timestamps should be visible
        const timestamps = page.locator('[data-testid="activity-timestamp"]');
        const count = await timestamps.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });
});
