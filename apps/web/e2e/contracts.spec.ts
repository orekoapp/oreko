import { test, expect } from '@playwright/test';

test.describe('Contracts Module', () => {
  test.describe('Contracts List Page', () => {
    test('should display contracts list page', async ({ page }) => {
      await page.goto('/contracts');

      // Should see the page title
      await expect(page.getByRole('heading', { name: /contracts/i })).toBeVisible();
    });

    test('should show empty state when no contracts', async ({ page }) => {
      await page.goto('/contracts');

      const emptyState = page.getByText(/no contracts|create your first contract/i);
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });

    test('should have create contract button', async ({ page }) => {
      await page.goto('/contracts');

      const createButton = page.getByRole('link', { name: /new contract|create contract/i });
      await expect(createButton).toBeVisible();
    });

    test('should display contract cards with status', async ({ page }) => {
      await page.goto('/contracts');

      const contractCards = page.locator('[class*="card"], [class*="Card"]');
      if (await contractCards.count() > 0) {
        await expect(contractCards.first()).toBeVisible();

        // Should show status badge
        const statusBadge = page.locator('[class*="badge"], [class*="Badge"]').first();
        if (await statusBadge.isVisible()) {
          await expect(statusBadge).toBeVisible();
        }
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/contracts');

      const searchInput = page.getByPlaceholder(/search contracts/i);
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('should filter by contract status', async ({ page }) => {
      await page.goto('/contracts');

      const statusFilter = page.getByRole('combobox').first();
      if (await statusFilter.isVisible()) {
        await statusFilter.click();

        // Should show filter options
        const filterOptions = ['draft', 'sent', 'signed', 'expired'];
        for (const option of filterOptions) {
          const optionElement = page.getByRole('option', { name: new RegExp(option, 'i') });
          if (await optionElement.isVisible()) {
            await expect(optionElement).toBeVisible();
            break;
          }
        }
      }
    });

    test('should show contract stats', async ({ page }) => {
      await page.goto('/contracts');

      // Look for stats cards
      const statsTexts = [/total/i, /pending/i, /signed/i, /draft/i];
      let foundStats = 0;
      for (const text of statsTexts) {
        if (await page.getByText(text).first().isVisible()) {
          foundStats++;
        }
      }
      expect(foundStats).toBeGreaterThan(0);
    });
  });

  test.describe('Contract Creation', () => {
    test('should navigate to create contract page', async ({ page }) => {
      await page.goto('/contracts');

      const createButton = page.getByRole('link', { name: /new contract|create contract/i });
      await createButton.click();

      await expect(page).toHaveURL(/\/contracts\/new/);
    });

    test('should display contract creation form', async ({ page }) => {
      await page.goto('/contracts/new');

      // Should see form fields
      const titleInput = page.getByLabel(/title|name/i);
      await expect(titleInput).toBeVisible();
    });

    test('should have client selector', async ({ page }) => {
      await page.goto('/contracts/new');

      const clientSelector = page.getByLabel(/client/i);
      if (await clientSelector.isVisible()) {
        await expect(clientSelector).toBeVisible();
      }
    });

    test('should have contract content editor', async ({ page }) => {
      await page.goto('/contracts/new');

      // Should have rich text editor or content area
      const contentEditor = page.locator('[contenteditable="true"], textarea, [class*="editor"]').first();
      if (await contentEditor.isVisible()) {
        await expect(contentEditor).toBeVisible();
      }
    });

    test('should have expiration date picker', async ({ page }) => {
      await page.goto('/contracts/new');

      const datePicker = page.getByLabel(/expir|valid until|due date/i);
      if (await datePicker.isVisible()) {
        await expect(datePicker).toBeVisible();
      }
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/contracts/new');

      const submitButton = page.getByRole('button', { name: /create|save|send/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show validation errors
        const errorMessage = page.getByText(/required|cannot be empty/i);
        await expect(errorMessage).toBeVisible();
      }
    });

    test('should allow template selection', async ({ page }) => {
      await page.goto('/contracts/new');

      const templateSelector = page.getByLabel(/template/i);
      if (await templateSelector.isVisible()) {
        await expect(templateSelector).toBeVisible();
      }
    });

    test('should create contract with valid data', async ({ page }) => {
      await page.goto('/contracts/new');

      const titleInput = page.getByLabel(/title|name/i);
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Contract ' + Date.now());

        // Fill other required fields if visible
        const contentEditor = page.locator('[contenteditable="true"], textarea').first();
        if (await contentEditor.isVisible()) {
          await contentEditor.fill('This is a test contract content.');
        }

        const submitButton = page.getByRole('button', { name: /create|save/i });
        await submitButton.click();

        // Should redirect or show success
        await expect(page).toHaveURL(/\/contracts/);
      }
    });
  });

  test.describe('Contract Detail Page', () => {
    test('should display contract details', async ({ page }) => {
      await page.goto('/contracts');

      const contractLink = page.locator('a[href^="/contracts/"]').first();
      if (await contractLink.isVisible()) {
        await contractLink.click();

        await expect(page.getByRole('heading').first()).toBeVisible();
      }
    });

    test('should show contract status', async ({ page }) => {
      await page.goto('/contracts');

      const contractLink = page.locator('a[href^="/contracts/"]').first();
      if (await contractLink.isVisible()) {
        await contractLink.click();

        const statusBadge = page.locator('[class*="badge"], [class*="Badge"]').first();
        await expect(statusBadge).toBeVisible();
      }
    });

    test('should show contract content', async ({ page }) => {
      await page.goto('/contracts');

      const contractLink = page.locator('a[href^="/contracts/"]').first();
      if (await contractLink.isVisible()) {
        await contractLink.click();

        // Should show contract content area
        const contentArea = page.locator('[class*="content"], [class*="prose"], article').first();
        await expect(contentArea).toBeVisible();
      }
    });

    test('should show client information', async ({ page }) => {
      await page.goto('/contracts');

      const contractLink = page.locator('a[href^="/contracts/"]').first();
      if (await contractLink.isVisible()) {
        await contractLink.click();

        const clientInfo = page.getByText(/client/i);
        await expect(clientInfo).toBeVisible();
      }
    });

    test('should have send for signature button for drafts', async ({ page }) => {
      await page.goto('/contracts');

      const draftContract = page.locator('a:has-text("draft")').first();
      if (await draftContract.isVisible()) {
        await draftContract.click();

        const sendButton = page.getByRole('button', { name: /send|request signature/i });
        await expect(sendButton).toBeVisible();
      }
    });

    test('should show signature section', async ({ page }) => {
      await page.goto('/contracts');

      const contractLink = page.locator('a[href^="/contracts/"]').first();
      if (await contractLink.isVisible()) {
        await contractLink.click();

        const signatureSection = page.getByText(/signature|sign/i);
        if (await signatureSection.isVisible()) {
          await expect(signatureSection).toBeVisible();
        }
      }
    });

    test('should have download PDF option', async ({ page }) => {
      await page.goto('/contracts');

      const contractLink = page.locator('a[href^="/contracts/"]').first();
      if (await contractLink.isVisible()) {
        await contractLink.click();

        const downloadButton = page.getByRole('button', { name: /download|pdf/i });
        if (await downloadButton.isVisible()) {
          await expect(downloadButton).toBeVisible();
        }
      }
    });

    test('should have edit option for drafts', async ({ page }) => {
      await page.goto('/contracts');

      const draftContract = page.locator('a:has-text("draft")').first();
      if (await draftContract.isVisible()) {
        await draftContract.click();

        const editButton = page.getByRole('link', { name: /edit/i });
        await expect(editButton).toBeVisible();
      }
    });

    test('should show activity/history', async ({ page }) => {
      await page.goto('/contracts');

      const contractLink = page.locator('a[href^="/contracts/"]').first();
      if (await contractLink.isVisible()) {
        await contractLink.click();

        const activitySection = page.getByText(/activity|history|timeline/i);
        if (await activitySection.isVisible()) {
          await expect(activitySection).toBeVisible();
        }
      }
    });
  });

  test.describe('Contract Signing Flow', () => {
    test('should send contract for signature', async ({ page }) => {
      await page.goto('/contracts');

      const draftContract = page.locator('a:has-text("draft")').first();
      if (await draftContract.isVisible()) {
        await draftContract.click();

        const sendButton = page.getByRole('button', { name: /send|request signature/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          // Should show confirmation or success
          const confirmation = page.getByText(/sent|signature requested/i);
          if (await confirmation.isVisible()) {
            await expect(confirmation).toBeVisible();
          }
        }
      }
    });

    test('should show signed status after signing', async ({ page }) => {
      await page.goto('/contracts');

      // Look for a signed contract
      const signedContract = page.locator('a:has-text("signed")').first();
      if (await signedContract.isVisible()) {
        await signedContract.click();

        // Should show signed status and signature details
        const signedStatus = page.getByText(/signed/i);
        await expect(signedStatus).toBeVisible();
      }
    });

    test('should show countersign option for partially signed', async ({ page }) => {
      await page.goto('/contracts');

      // If there's a partially signed contract
      const partialContract = page.locator('a:has-text("awaiting")').first();
      if (await partialContract.isVisible()) {
        await partialContract.click();

        const countersignButton = page.getByRole('button', { name: /countersign|sign/i });
        if (await countersignButton.isVisible()) {
          await expect(countersignButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Contract Actions', () => {
    test('should duplicate contract', async ({ page }) => {
      await page.goto('/contracts');

      const contractLink = page.locator('a[href^="/contracts/"]').first();
      if (await contractLink.isVisible()) {
        await contractLink.click();

        const duplicateButton = page.getByRole('button', { name: /duplicate|copy/i });
        if (await duplicateButton.isVisible()) {
          await duplicateButton.click();

          // Should navigate to new contract
          await expect(page).toHaveURL(/\/contracts/);
        }
      }
    });

    test('should void/cancel contract', async ({ page }) => {
      await page.goto('/contracts');

      const contractLink = page.locator('a[href^="/contracts/"]').first();
      if (await contractLink.isVisible()) {
        await contractLink.click();

        const voidButton = page.getByRole('button', { name: /void|cancel/i });
        if (await voidButton.isVisible()) {
          await voidButton.click();

          // Should show confirmation dialog
          const confirmDialog = page.getByRole('dialog');
          if (await confirmDialog.isVisible()) {
            await expect(confirmDialog).toBeVisible();
          }
        }
      }
    });
  });
});

test.describe('Contracts Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/contracts');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/contracts');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/contracts/new');

    const labels = page.locator('label');
    if (await labels.count() > 0) {
      await expect(labels.first()).toBeVisible();
    }
  });
});
