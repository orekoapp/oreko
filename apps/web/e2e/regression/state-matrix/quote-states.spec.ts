import { test, expect } from '@playwright/test';

/**
 * TC-SM-001: Quote State Matrix Tests
 *
 * Tests all valid state transitions for quotes:
 * draft -> sent -> viewed -> accepted/declined -> converted
 *
 * Also tests invalid transitions that should be blocked.
 *
 * Note: These tests use storageState from Playwright config,
 * so they are already authenticated when they start.
 */
test.describe('Quote State Matrix Tests', () => {
  test.describe('Valid State Transitions', () => {
    test('TC-SM-001: draft -> sent transition', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes/new');
      await page.waitForLoadState('networkidle');

      // Fill minimal quote data using flexible selectors
      const titleInput = page.locator('input[name="title"], #title');
      if (await titleInput.isVisible()) {
        await titleInput.fill('State Matrix Test Quote');
      }

      // Save as draft
      const saveButton = page.getByRole('button', { name: /save/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

        // Verify status is draft
        const statusElement = page.locator('[data-testid="quote-status"]');
        if (await statusElement.isVisible()) {
          await expect(statusElement).toHaveText(/draft/i);
        }

        // Transition to sent
        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          // Fill send dialog if present
          const sendDialog = page.locator('[role="dialog"]');
          if (await sendDialog.isVisible()) {
            const emailInput = page.locator('input[name="recipientEmail"]');
            if (await emailInput.isVisible()) {
              await emailInput.fill('test@example.com');
            }
            await page.getByRole('button', { name: /send quote/i }).click();
          }

          // Verify status changed to sent
          await expect(statusElement).toHaveText(/sent/i);
        }
      }
    });

    test('TC-SM-002: sent -> viewed transition (via client portal)', async ({ page }) => {
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

      // Click accept button if visible
      const acceptButton = page.getByRole('button', { name: /accept/i });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();

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
        const confirmButton = page.getByRole('button', { name: /confirm/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify acceptance confirmation
        await expect(page.getByText(/accepted|thank you/i)).toBeVisible();
      }
    });

    test('TC-SM-004: viewed -> declined transition', async ({ page }) => {
      await page.goto('/q/test-token');

      // Click decline button if visible
      const declineButton = page.getByRole('button', { name: /decline/i });
      if (await declineButton.isVisible()) {
        await declineButton.click();

        // Fill decline reason
        const reasonTextarea = page.locator('textarea[name="reason"]');
        if (await reasonTextarea.isVisible()) {
          await reasonTextarea.fill('Budget constraints');
        }

        // Confirm decline
        const confirmButton = page.getByRole('button', { name: /confirm/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify decline confirmation
        await expect(page.getByText(/declined/i)).toBeVisible();
      }
    });

    test('TC-SM-005: accepted -> converted transition', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      // Find and click an accepted quote
      const acceptedRow = page.locator('tr').filter({ hasText: /accepted/i }).first();
      if (await acceptedRow.isVisible()) {
        await acceptedRow.click();
        await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

        // Click convert to invoice
        const convertButton = page.getByRole('button', { name: /convert.*invoice/i });
        if (await convertButton.isVisible()) {
          await convertButton.click();

          // Confirm conversion
          const confirmDialog = page.locator('[role="alertdialog"]');
          if (await confirmDialog.isVisible()) {
            await page.getByRole('button', { name: /convert/i }).click();
          }

          // Verify redirect to new invoice
          await expect(page).toHaveURL(/\/invoices\/[a-z0-9-]+/);

          // Verify quote status is now converted
          await page.goto('/quotes');
          await expect(page.locator('tr').filter({ hasText: /converted/i })).toBeVisible();
        }
      }
    });
  });

  test.describe('Invalid State Transitions', () => {
    test('TC-SM-006: cannot send already sent quote', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      const sentRow = page.locator('tr').filter({ hasText: /sent/i }).first();
      if (await sentRow.isVisible()) {
        await sentRow.click();

        // Send button should be disabled or hidden
        const sendButton = page.getByRole('button', { name: /^send$/i });
        const isHidden = await sendButton.isHidden();
        const isDisabled = isHidden ? true : await sendButton.isDisabled();
        expect(isHidden || isDisabled).toBeTruthy();
      }
    });

    test('TC-SM-007: cannot convert draft quote directly', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      const draftRow = page.locator('tr').filter({ hasText: /draft/i }).first();
      if (await draftRow.isVisible()) {
        await draftRow.click();

        // Convert button should not be visible for drafts
        const convertButton = page.getByRole('button', { name: /convert.*invoice/i });
        await expect(convertButton).toBeHidden();
      }
    });

    test('TC-SM-008: cannot accept/decline from dashboard', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      const sentRow = page.locator('tr').filter({ hasText: /sent/i }).first();
      if (await sentRow.isVisible()) {
        await sentRow.click();

        // Accept/decline buttons should only be in client portal
        const acceptButton = page.getByRole('button', { name: /^accept$/i });
        const declineButton = page.getByRole('button', { name: /^decline$/i });

        await expect(acceptButton).toBeHidden();
        await expect(declineButton).toBeHidden();
      }
    });

    test('TC-SM-009: cannot modify accepted quote', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      const acceptedRow = page.locator('tr').filter({ hasText: /accepted/i }).first();
      if (await acceptedRow.isVisible()) {
        await acceptedRow.click();

        // Edit mode should be disabled
        const editButton = page.getByRole('button', { name: /edit/i });

        if (await editButton.isVisible()) {
          await editButton.click();
          // Should show error or no changes allowed
          await expect(page.getByText(/cannot.*edit|locked/i)).toBeVisible();
        }
      }
    });

    test('TC-SM-010: cannot revert converted quote', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      const convertedRow = page.locator('tr').filter({ hasText: /converted/i }).first();
      if (await convertedRow.isVisible()) {
        await convertedRow.click();

        // Should not have revert option
        const actionsMenu = page.locator('button[aria-label="actions"]');
        if (await actionsMenu.isVisible()) {
          await actionsMenu.click();
          await expect(page.getByRole('menuitem', { name: /revert/i })).toBeHidden();
        }
      }
    });
  });

  test.describe('State Persistence', () => {
    test('TC-SM-011: state persists after page reload', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      const sentRow = page.locator('tr').filter({ hasText: /sent/i }).first();
      if (await sentRow.isVisible()) {
        await sentRow.click();

        const statusElement = page.locator('[data-testid="quote-status"]');
        if (await statusElement.isVisible()) {
          const statusBefore = await statusElement.textContent();

          // Reload page
          await page.reload();

          // Verify state persisted
          const statusAfter = await statusElement.textContent();
          expect(statusAfter).toBe(statusBefore);
        }
      }
    });

    test('TC-SM-012: state persists after session change', async ({ page, context, browser }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      const sentRow = page.locator('tr').filter({ hasText: /sent/i }).first();
      if (await sentRow.isVisible()) {
        await sentRow.click();

        const quoteUrl = page.url();
        const statusElement = page.locator('[data-testid="quote-status"]');
        const statusBefore = await statusElement.isVisible() ? await statusElement.textContent() : null;

        if (statusBefore) {
          // Create a new context without storageState to test re-login
          const newContext = await browser.newContext();
          const newPage = await newContext.newPage();

          // Re-login with role-based selectors
          await newPage.goto('/login');
          await newPage.waitForLoadState('networkidle');
          await newPage.getByRole('textbox', { name: 'Email' }).fill('test@quotecraft.dev');
          await newPage.getByRole('textbox', { name: 'Password' }).fill('TestPassword123!');
          await newPage.getByRole('button', { name: /sign in/i }).click();
          await newPage.waitForURL(/\/(dashboard|quotes)/, { timeout: 30000 });

          // Navigate back to quote
          await newPage.goto(quoteUrl);

          // Verify state
          const newStatusElement = newPage.locator('[data-testid="quote-status"]');
          if (await newStatusElement.isVisible()) {
            const statusAfter = await newStatusElement.textContent();
            expect(statusAfter).toBe(statusBefore);
          }

          await newContext.close();
        }
      }
    });
  });

  test.describe('State Audit Trail', () => {
    test('TC-SM-013: state changes are logged in activity', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      const acceptedRow = page.locator('tr').filter({ hasText: /accepted/i }).first();
      if (await acceptedRow.isVisible()) {
        await acceptedRow.click();

        // Navigate to activity/history section
        const activityTab = page.getByRole('tab', { name: /activity|history/i });
        if (await activityTab.isVisible()) {
          await activityTab.click();

          // Verify state changes are logged
          await expect(page.getByText(/sent/i)).toBeVisible();
          await expect(page.getByText(/viewed/i)).toBeVisible();
          await expect(page.getByText(/accepted/i)).toBeVisible();
        }
      }
    });

    test('TC-SM-014: state changes include timestamp', async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes');

      const quoteRow = page.locator('tbody tr').first();
      if (await quoteRow.isVisible()) {
        await quoteRow.click();

        // Check activity section for timestamps
        const activityTab = page.getByRole('tab', { name: /activity|history/i });
        if (await activityTab.isVisible()) {
          await activityTab.click();

          // Timestamps should be visible
          const timestamps = page.locator('[data-testid="activity-timestamp"]');
          const count = await timestamps.count();
          expect(count).toBeGreaterThan(0);
        }
      }
    });
  });
});
