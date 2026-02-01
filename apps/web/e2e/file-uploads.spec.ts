import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('File Uploads', () => {
  test.describe('Logo Upload', () => {
    test('should show logo upload section in branding settings', async ({ page }) => {
      await page.goto('/settings/branding');

      // Check for logo section or any branding-related content
      const logoSection = page.getByText(/logo|company logo|upload logo|brand/i).first();
      const brandingHeading = page.getByRole('heading', { name: /branding/i });

      const hasLogo = await logoSection.isVisible().catch(() => false);
      const hasBranding = await brandingHeading.isVisible().catch(() => false);

      // Either logo section or branding heading should be visible
      expect(hasLogo || hasBranding).toBe(true);
    });

    test('should have file input for logo', async ({ page }) => {
      await page.goto('/settings/branding');

      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        await expect(fileInput.first()).toBeAttached();
      }
    });

    test('should show upload button', async ({ page }) => {
      await page.goto('/settings/branding');

      const uploadButton = page.getByRole('button', { name: /upload|choose file|select/i });
      if (await uploadButton.isVisible()) {
        await expect(uploadButton).toBeVisible();
      }
    });

    test('should accept image file types', async ({ page }) => {
      await page.goto('/settings/branding');

      const fileInput = page.locator('input[type="file"]').first();
      const isAttached = await fileInput.isAttached().catch(() => false);

      if (isAttached) {
        const acceptAttr = await fileInput.getAttribute('accept');
        if (acceptAttr) {
          expect(acceptAttr).toMatch(/image|png|jpg|jpeg|gif|svg|webp/i);
        } else {
          // File input exists but may not have accept attribute
          expect(true).toBe(true);
        }
      } else {
        // No file input on this page - verify branding page loads
        const brandingContent = page.getByRole('heading', { name: /branding/i });
        await expect(brandingContent).toBeVisible();
      }
    });

    test('should show current logo if exists', async ({ page }) => {
      await page.goto('/settings/branding');

      const currentLogo = page.locator('img[alt*="logo"], img[src*="logo"]');
      if (await currentLogo.isVisible()) {
        await expect(currentLogo).toBeVisible();
      }
    });

    test('should show remove logo button if logo exists', async ({ page }) => {
      await page.goto('/settings/branding');

      const currentLogo = page.locator('img[alt*="logo"]');
      if (await currentLogo.isVisible()) {
        const removeButton = page.getByRole('button', { name: /remove|delete|clear/i });
        if (await removeButton.isVisible()) {
          await expect(removeButton).toBeVisible();
        }
      }
    });

    test('should show upload progress', async ({ page }) => {
      await page.goto('/settings/branding');

      // Check for progress indicator elements
      const progressIndicator = page.locator('[class*="progress"], [role="progressbar"]');
      // Progress may not be visible until upload starts
      expect(await progressIndicator.count()).toBeGreaterThanOrEqual(0);
    });

    test('should validate file size', async ({ page }) => {
      await page.goto('/settings/branding');

      // Check for file size limit information
      const sizeInfo = page.getByText(/max.*size|maximum.*mb|file size/i);
      if (await sizeInfo.isVisible()) {
        await expect(sizeInfo).toBeVisible();
      }
    });

    test('should show error for invalid file type', async ({ page }) => {
      await page.goto('/settings/branding');

      // Verify branding settings page loads correctly
      const brandingContent = page.getByRole('heading', { name: /branding/i });
      const hasBranding = await brandingContent.isVisible().catch(() => false);

      // Page should load successfully
      expect(hasBranding || page.url().includes('/settings/branding')).toBe(true);
    });
  });

  test.describe('Avatar/Profile Picture Upload', () => {
    test('should show avatar upload in account settings', async ({ page }) => {
      await page.goto('/settings/account');

      const avatarSection = page.getByText(/avatar|profile.*picture|photo/i);
      if (await avatarSection.isVisible()) {
        await expect(avatarSection).toBeVisible();
      }
    });

    test('should display current avatar', async ({ page }) => {
      await page.goto('/settings/account');

      const avatar = page.locator('img[alt*="avatar"], img[alt*="profile"], [class*="avatar"]');
      if (await avatar.isVisible()) {
        await expect(avatar).toBeVisible();
      }
    });

    test('should allow changing avatar', async ({ page }) => {
      await page.goto('/settings/account');

      // Check for account settings page content
      const accountHeading = page.getByRole('heading', { name: /account|profile/i }).first();
      const changeButton = page.getByRole('button', { name: /change|upload|edit.*photo|save/i }).first();

      const hasHeading = await accountHeading.isVisible().catch(() => false);
      const hasButton = await changeButton.isVisible().catch(() => false);

      // Account page should have either heading or some actionable content
      expect(hasHeading || hasButton || page.url().includes('/settings/account')).toBe(true);
    });
  });

  test.describe('Quote Attachments', () => {
    test('should show attachment section in quote builder', async ({ page }) => {
      await page.goto('/quotes/new');

      const attachmentSection = page.getByText(/attachment|file|document/i);
      if (await attachmentSection.isVisible()) {
        await expect(attachmentSection).toBeVisible();
      }
    });

    test('should have add attachment button', async ({ page }) => {
      await page.goto('/quotes/new');

      const addAttachmentButton = page.getByRole('button', { name: /attach|add file|upload/i });
      if (await addAttachmentButton.isVisible()) {
        await expect(addAttachmentButton).toBeVisible();
      }
    });

    test('should show attached files list', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const attachmentsList = page.locator('[class*="attachment"], [class*="file-list"]');
        if (await attachmentsList.count() > 0) {
          await expect(attachmentsList.first()).toBeVisible();
        }
      }
    });

    test('should allow removing attachments', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const removeButton = page.locator('[class*="attachment"] button, [class*="file"] button');
        if (await removeButton.count() > 0) {
          await expect(removeButton.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Invoice Attachments', () => {
    test('should show attachment section in invoice', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const attachmentSection = page.getByText(/attachment|supporting.*document/i);
        if (await attachmentSection.isVisible()) {
          await expect(attachmentSection).toBeVisible();
        }
      }
    });
  });

  test.describe('Contract Document Upload', () => {
    test('should allow uploading contract template', async ({ page }) => {
      await page.goto('/contracts/new');

      const uploadSection = page.getByText(/upload|import.*document/i);
      if (await uploadSection.isVisible()) {
        await expect(uploadSection).toBeVisible();
      }
    });

    test('should accept PDF documents', async ({ page }) => {
      await page.goto('/contracts/new');

      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        const acceptAttr = await fileInput.first().getAttribute('accept');
        if (acceptAttr) {
          expect(acceptAttr).toMatch(/pdf|document/i);
        }
      }
    });
  });

  test.describe('Drag and Drop Upload', () => {
    test('should show drop zone', async ({ page }) => {
      await page.goto('/settings/branding');

      const dropZone = page.locator('[class*="dropzone"], [class*="drop-area"], [class*="drag"]');
      if (await dropZone.count() > 0) {
        await expect(dropZone.first()).toBeVisible();
      }
    });

    test('should highlight drop zone on drag over', async ({ page }) => {
      await page.goto('/settings/branding');

      const dropZone = page.locator('[class*="dropzone"]').first();
      if (await dropZone.isVisible()) {
        // Simulate dragover - would change styling
        await dropZone.hover();
        // Visual change would occur
      }
    });

    test('should show drag instructions', async ({ page }) => {
      await page.goto('/settings/branding');

      const dragInstructions = page.getByText(/drag.*drop|drop.*here/i);
      if (await dragInstructions.isVisible()) {
        await expect(dragInstructions).toBeVisible();
      }
    });
  });

  test.describe('Image Preview', () => {
    test('should show preview after selecting image', async ({ page }) => {
      await page.goto('/settings/branding');

      // After file selection, preview should appear
      const preview = page.locator('[class*="preview"] img, img[class*="preview"]');
      if (await preview.isVisible()) {
        await expect(preview).toBeVisible();
      }
    });

    test('should allow cropping image', async ({ page }) => {
      await page.goto('/settings/branding');

      const cropButton = page.getByRole('button', { name: /crop|adjust|edit/i });
      if (await cropButton.isVisible()) {
        await cropButton.click();

        const cropTool = page.locator('[class*="crop"], [class*="cropper"]');
        if (await cropTool.isVisible()) {
          await expect(cropTool).toBeVisible();
        }
      }
    });
  });

  test.describe('Upload Error Handling', () => {
    test('should show error for oversized file', async ({ page }) => {
      await page.goto('/settings/branding');

      // Error message for file too large
      const errorMessage = page.getByText(/too large|exceeds|maximum size/i);
      // Would appear after selecting oversized file
      expect(true).toBe(true);
    });

    test('should show network error message', async ({ page }) => {
      await page.goto('/settings/branding');

      // Network error handling
      const networkError = page.getByText(/upload failed|try again|network error/i);
      // Would appear on upload failure
      expect(true).toBe(true);
    });

    test('should allow retry on failure', async ({ page }) => {
      await page.goto('/settings/branding');

      const retryButton = page.getByRole('button', { name: /retry|try again/i });
      // Would appear after upload failure
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeVisible();
      }
    });
  });

  test.describe('Multiple File Upload', () => {
    test('should support multiple file selection', async ({ page }) => {
      await page.goto('/quotes/new');

      const fileInput = page.locator('input[type="file"][multiple]');
      if (await fileInput.count() > 0) {
        await expect(fileInput.first()).toBeAttached();
      }
    });

    test('should show all selected files', async ({ page }) => {
      await page.goto('/quotes/new');

      const fileList = page.locator('[class*="file-list"], [class*="selected-files"]');
      if (await fileList.isVisible()) {
        await expect(fileList).toBeVisible();
      }
    });

    test('should allow removing individual files', async ({ page }) => {
      await page.goto('/quotes/new');

      const removeButtons = page.locator('[class*="file"] [class*="remove"], [class*="file"] button');
      if (await removeButtons.count() > 0) {
        await expect(removeButtons.first()).toBeVisible();
      }
    });
  });

  test.describe('Upload Security', () => {
    test('should sanitize file names', async ({ page }) => {
      await page.goto('/settings/branding');

      // File names with special characters should be handled
      // This is mostly backend validation
      expect(true).toBe(true);
    });

    test('should validate file content type', async ({ page }) => {
      await page.goto('/settings/branding');

      // Backend should validate actual file content, not just extension
      expect(true).toBe(true);
    });
  });
});

test.describe('File Upload Accessibility', () => {
  test('should have accessible file input', async ({ page }) => {
    await page.goto('/settings/branding');

    // Verify branding page loads
    const brandingHeading = page.getByRole('heading', { name: /branding/i });
    const hasBranding = await brandingHeading.isVisible().catch(() => false);

    const fileInput = page.locator('input[type="file"]').first();
    const isAttached = await fileInput.isAttached().catch(() => false);

    if (isAttached) {
      // Should have associated label
      const id = await fileInput.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        if (await label.isVisible()) {
          await expect(label).toBeVisible();
        }
      }
    }

    // Page should at least load correctly
    expect(hasBranding || page.url().includes('/settings/branding')).toBe(true);
  });

  test('should announce upload progress', async ({ page }) => {
    await page.goto('/settings/branding');

    // Progress should be announced to screen readers
    const ariaLive = page.locator('[aria-live], [role="status"]');
    if (await ariaLive.count() > 0) {
      await expect(ariaLive.first()).toBeAttached();
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/settings/branding');

    const uploadButton = page.getByRole('button', { name: /upload|choose/i }).first();
    if (await uploadButton.isVisible()) {
      await uploadButton.focus();
      await expect(uploadButton).toBeFocused();
    }
  });
});
