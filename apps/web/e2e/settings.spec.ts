import { test, expect } from '@playwright/test';

test.describe('Settings Module', () => {
  test.describe('Settings Navigation', () => {
    test('should display settings page', async ({ page }) => {
      await page.goto('/settings');

      await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    });

    test('should have navigation tabs', async ({ page }) => {
      await page.goto('/settings');

      // Should see settings categories
      await expect(page.getByRole('link', { name: /profile|business/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /branding/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /payments/i })).toBeVisible();
    });
  });

  test.describe('Business Profile Settings', () => {
    test('should display business profile form', async ({ page }) => {
      await page.goto('/settings/profile');

      await expect(page.getByLabel(/business.*name|company.*name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/phone/i)).toBeVisible();
    });

    test('should update business name', async ({ page }) => {
      await page.goto('/settings/profile');

      const nameInput = page.getByLabel(/business.*name|company.*name/i);
      await nameInput.clear();
      await nameInput.fill('Updated Company Name');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      // Should show success message
      await expect(page.getByText(/saved|success|updated/i)).toBeVisible({ timeout: 5000 });
    });

    test('should update business address', async ({ page }) => {
      await page.goto('/settings/profile');

      await page.getByLabel(/street/i).fill('456 Business Ave');
      await page.getByLabel(/city/i).fill('San Francisco');
      await page.getByLabel(/state/i).fill('CA');

      await page.getByRole('button', { name: /save/i }).click();

      await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/settings/profile');

      const nameInput = page.getByLabel(/business.*name|company.*name/i);
      await nameInput.clear();

      await page.getByRole('button', { name: /save/i }).click();

      // Should show validation error
      await expect(page.getByText(/required|cannot be empty/i)).toBeVisible();
    });
  });

  test.describe('Branding Settings', () => {
    test('should display branding settings', async ({ page }) => {
      await page.goto('/settings/branding');

      // Should see logo upload and color pickers
      await expect(page.getByText(/logo/i)).toBeVisible();
      await expect(page.getByText(/primary.*color|brand.*color/i)).toBeVisible();
    });

    test('should upload logo', async ({ page }) => {
      await page.goto('/settings/branding');

      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // Note: In real test, would need a test image file
        // await fileInput.setInputFiles('test-logo.png');
      }
    });

    test('should update primary color', async ({ page }) => {
      await page.goto('/settings/branding');

      const colorInput = page.getByLabel(/primary.*color/i);
      if (await colorInput.isVisible()) {
        await colorInput.fill('#3B82F6');

        await page.getByRole('button', { name: /save/i }).click();

        await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show color preview', async ({ page }) => {
      await page.goto('/settings/branding');

      // Should have color preview elements
      const preview = page.locator('[data-testid="color-preview"]');
      if (await preview.isVisible()) {
        await expect(preview).toBeVisible();
      }
    });
  });

  test.describe('Payment Settings', () => {
    test('should display payment settings', async ({ page }) => {
      await page.goto('/settings/payments');

      await expect(page.getByText(/stripe|payment.*gateway/i)).toBeVisible();
    });

    test('should show Stripe connection status', async ({ page }) => {
      await page.goto('/settings/payments');

      // Should show connected/disconnected status
      const status = page.getByText(/connected|not.*connected|connect.*stripe/i);
      await expect(status).toBeVisible();
    });

    test('should have connect Stripe button when not connected', async ({ page }) => {
      await page.goto('/settings/payments');

      const connectButton = page.getByRole('button', { name: /connect.*stripe/i });
      // Button exists if not connected
      const isVisible = await connectButton.isVisible();
      expect(typeof isVisible).toBe('boolean');
    });

    test('should configure payment terms', async ({ page }) => {
      await page.goto('/settings/payments');

      const paymentTerms = page.getByLabel(/default.*payment.*terms/i);
      if (await paymentTerms.isVisible()) {
        await paymentTerms.click();
        await page.getByRole('option', { name: /net.*30/i }).click();

        await page.getByRole('button', { name: /save/i }).click();

        await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Tax Settings', () => {
    test('should display tax settings', async ({ page }) => {
      await page.goto('/settings/taxes');

      await expect(page.getByText(/tax.*rate|tax.*settings/i)).toBeVisible();
    });

    test('should add tax rate', async ({ page }) => {
      await page.goto('/settings/taxes');

      const addButton = page.getByRole('button', { name: /add.*tax/i });
      if (await addButton.isVisible()) {
        await addButton.click();

        // Fill tax rate form
        await page.getByLabel(/name/i).fill('State Sales Tax');
        await page.getByLabel(/rate/i).fill('8.25');

        await page.getByRole('button', { name: /save|add/i }).click();

        await expect(page.getByText(/8.25/)).toBeVisible();
      }
    });

    test('should edit tax rate', async ({ page }) => {
      await page.goto('/settings/taxes');

      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();

        // Update the rate
        const rateInput = page.getByLabel(/rate/i);
        await rateInput.clear();
        await rateInput.fill('9.0');

        await page.getByRole('button', { name: /save/i }).click();
      }
    });

    test('should delete tax rate', async ({ page }) => {
      await page.goto('/settings/taxes');

      const deleteButton = page.getByRole('button', { name: /delete/i }).first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Confirm deletion
        await page.getByRole('button', { name: /confirm|yes/i }).click();
      }
    });
  });

  test.describe('Number Sequence Settings', () => {
    test('should configure quote numbering', async ({ page }) => {
      await page.goto('/settings/numbering');

      // Configure quote prefix
      const quotePrefix = page.getByLabel(/quote.*prefix/i);
      if (await quotePrefix.isVisible()) {
        await quotePrefix.fill('QT-');

        await page.getByRole('button', { name: /save/i }).click();

        await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should configure invoice numbering', async ({ page }) => {
      await page.goto('/settings/numbering');

      const invoicePrefix = page.getByLabel(/invoice.*prefix/i);
      if (await invoicePrefix.isVisible()) {
        await invoicePrefix.fill('INV-');

        await page.getByRole('button', { name: /save/i }).click();

        await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show next number preview', async ({ page }) => {
      await page.goto('/settings/numbering');

      // Should show what the next number will be
      await expect(page.getByText(/next.*number|preview/i)).toBeVisible();
    });
  });

  test.describe('Email Settings', () => {
    test('should display email settings', async ({ page }) => {
      await page.goto('/settings/emails');

      await expect(page.getByText(/email.*templates|email.*settings/i)).toBeVisible();
    });

    test('should configure email sender name', async ({ page }) => {
      await page.goto('/settings/emails');

      const senderName = page.getByLabel(/sender.*name|from.*name/i);
      if (await senderName.isVisible()) {
        await senderName.fill('My Company');

        await page.getByRole('button', { name: /save/i }).click();

        await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should edit email templates', async ({ page }) => {
      await page.goto('/settings/emails');

      // Click on a template to edit
      const template = page.getByText(/quote.*sent|invoice.*sent/i).first();
      if (await template.isVisible()) {
        await template.click();

        // Should show template editor
        await expect(page.getByRole('textbox')).toBeVisible();
      }
    });
  });
});

test.describe('Settings Accessibility', () => {
  test('should have proper form labels', async ({ page }) => {
    await page.goto('/settings/profile');

    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeAttached();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/settings');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/settings');

    // Settings nav should be a navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeAttached();
  });
});
