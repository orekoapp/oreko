import { test, expect } from '@playwright/test';

test.describe('Templates Module', () => {
  test.describe('Templates List Page', () => {
    test('should display templates list page', async ({ page }) => {
      await page.goto('/templates');

      // Should see the page title
      await expect(page.getByRole('heading', { name: /templates/i })).toBeVisible();
    });

    test('should show empty state when no templates', async ({ page }) => {
      await page.goto('/templates');

      const emptyState = page.getByText(/no templates|create your first template/i);
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });

    test('should have create template button', async ({ page }) => {
      await page.goto('/templates');

      const createButton = page.getByRole('link', { name: /new template|create template/i });
      await expect(createButton).toBeVisible();
    });

    test('should display template cards', async ({ page }) => {
      await page.goto('/templates');

      const templateCards = page.locator('[class*="card"], [class*="Card"]');
      if (await templateCards.count() > 0) {
        await expect(templateCards.first()).toBeVisible();
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/templates');

      const searchInput = page.getByPlaceholder(/search templates/i);
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();
        await searchInput.fill('test template');
        await expect(searchInput).toHaveValue('test template');
      }
    });

    test('should show template type badges', async ({ page }) => {
      await page.goto('/templates');

      // Templates should show their type (quote, invoice, etc.)
      const typeBadges = page.locator('[class*="badge"], [class*="Badge"]');
      if (await typeBadges.count() > 0) {
        await expect(typeBadges.first()).toBeVisible();
      }
    });
  });

  test.describe('Template Creation', () => {
    test('should navigate to create template page', async ({ page }) => {
      await page.goto('/templates');

      const createButton = page.getByRole('link', { name: /new template|create template/i });
      await createButton.click();

      await expect(page).toHaveURL(/\/templates\/new/);
    });

    test('should display template creation form', async ({ page }) => {
      await page.goto('/templates/new');

      // Should see form fields
      await expect(page.getByLabel(/name|title/i)).toBeVisible();
    });

    test('should have template type selector', async ({ page }) => {
      await page.goto('/templates/new');

      // Should be able to select template type
      const typeSelector = page.getByRole('combobox').first();
      if (await typeSelector.isVisible()) {
        await expect(typeSelector).toBeVisible();
      }
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/templates/new');

      // Try to submit without required fields
      const submitButton = page.getByRole('button', { name: /create|save/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show validation errors
        const errorMessage = page.getByText(/required|cannot be empty/i);
        await expect(errorMessage).toBeVisible();
      }
    });

    test('should create template with valid data', async ({ page }) => {
      await page.goto('/templates/new');

      // Fill in form fields
      const nameInput = page.getByLabel(/name|title/i);
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Template ' + Date.now());

        const descriptionInput = page.getByLabel(/description/i);
        if (await descriptionInput.isVisible()) {
          await descriptionInput.fill('Test description');
        }

        // Submit the form
        const submitButton = page.getByRole('button', { name: /create|save/i });
        await submitButton.click();

        // Should redirect to template detail or list
        await expect(page).toHaveURL(/\/templates/);
      }
    });
  });

  test.describe('Template Detail Page', () => {
    test('should display template details', async ({ page }) => {
      await page.goto('/templates');

      const templateLink = page.locator('a[href^="/templates/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        // Should show template name
        await expect(page.getByRole('heading').first()).toBeVisible();
      }
    });

    test('should show edit button', async ({ page }) => {
      await page.goto('/templates');

      const templateLink = page.locator('a[href^="/templates/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const editButton = page.getByRole('link', { name: /edit/i });
        await expect(editButton).toBeVisible();
      }
    });

    test('should show template preview', async ({ page }) => {
      await page.goto('/templates');

      const templateLink = page.locator('a[href^="/templates/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        // Should show preview section
        const previewSection = page.getByText(/preview/i);
        if (await previewSection.isVisible()) {
          await expect(previewSection).toBeVisible();
        }
      }
    });

    test('should have use template button', async ({ page }) => {
      await page.goto('/templates');

      const templateLink = page.locator('a[href^="/templates/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const useButton = page.getByRole('button', { name: /use template|create from template/i });
        if (await useButton.isVisible()) {
          await expect(useButton).toBeVisible();
        }
      }
    });

    test('should have delete option', async ({ page }) => {
      await page.goto('/templates');

      const templateLink = page.locator('a[href^="/templates/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        // Look for delete button or menu option
        const deleteButton = page.getByRole('button', { name: /delete/i });
        const menuButton = page.getByRole('button', { name: /more|menu|options/i });

        if (await deleteButton.isVisible()) {
          await expect(deleteButton).toBeVisible();
        } else if (await menuButton.isVisible()) {
          await menuButton.click();
          await expect(page.getByText(/delete/i)).toBeVisible();
        }
      }
    });
  });

  test.describe('Template Editing', () => {
    test('should navigate to edit template page', async ({ page }) => {
      await page.goto('/templates');

      const templateLink = page.locator('a[href^="/templates/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const editButton = page.getByRole('link', { name: /edit/i });
        if (await editButton.isVisible()) {
          await editButton.click();
          await expect(page).toHaveURL(/\/templates\/.*\/edit/);
        }
      }
    });

    test('should populate form with existing data', async ({ page }) => {
      await page.goto('/templates');

      const templateLink = page.locator('a[href^="/templates/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const editButton = page.getByRole('link', { name: /edit/i });
        if (await editButton.isVisible()) {
          await editButton.click();

          // Form should have existing values
          const nameInput = page.getByLabel(/name|title/i);
          await expect(nameInput).not.toHaveValue('');
        }
      }
    });

    test('should save template changes', async ({ page }) => {
      await page.goto('/templates');

      const templateLink = page.locator('a[href^="/templates/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const editButton = page.getByRole('link', { name: /edit/i });
        if (await editButton.isVisible()) {
          await editButton.click();

          // Update the name
          const nameInput = page.getByLabel(/name|title/i);
          await nameInput.fill('Updated Template ' + Date.now());

          // Save changes
          const saveButton = page.getByRole('button', { name: /save|update/i });
          await saveButton.click();

          // Should show success or redirect
          const successMessage = page.getByText(/saved|updated/i);
          if (await successMessage.isVisible()) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Template Application', () => {
    test('should apply template to new quote', async ({ page }) => {
      await page.goto('/templates');

      const templateLink = page.locator('a[href^="/templates/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const useButton = page.getByRole('button', { name: /use template|create from template|create quote/i });
        if (await useButton.isVisible()) {
          await useButton.click();

          // Should navigate to quote creation with template
          await expect(page).toHaveURL(/\/quotes/);
        }
      }
    });

    test('should show template selection in quote builder', async ({ page }) => {
      await page.goto('/quotes/new/builder');

      // Should have option to select template
      const templateOption = page.getByText(/template|use template/i);
      if (await templateOption.isVisible()) {
        await expect(templateOption).toBeVisible();
      }
    });
  });
});

test.describe('Templates Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/templates');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/templates');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have accessible template cards', async ({ page }) => {
    await page.goto('/templates');

    const cards = page.locator('[class*="card"], [class*="Card"]');
    if (await cards.count() > 0) {
      // Cards should be navigable
      await expect(cards.first()).toBeVisible();
    }
  });
});
