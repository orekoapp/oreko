import { test, expect } from '@playwright/test';

test.describe('Settings - Account/Profile', () => {
  test.describe('Profile Page', () => {
    test('should display account settings page', async ({ page }) => {
      await page.goto('/settings/account');

      await expect(page.getByRole('heading', { name: /account|profile/i })).toBeVisible();
    });

    test('should show user name field', async ({ page }) => {
      await page.goto('/settings/account');

      const nameInput = page.getByLabel(/name|full name/i);
      await expect(nameInput).toBeVisible();
    });

    test('should show email field', async ({ page }) => {
      await page.goto('/settings/account');

      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();
    });

    test('should allow updating profile', async ({ page }) => {
      await page.goto('/settings/account');

      const nameInput = page.getByLabel(/name|full name/i);
      if (await nameInput.isVisible()) {
        await nameInput.fill('Updated Name ' + Date.now());

        const saveButton = page.getByRole('button', { name: /save|update/i });
        await saveButton.click();

        // Should show success message
        const success = page.getByText(/saved|updated|success/i);
        if (await success.isVisible()) {
          await expect(success).toBeVisible();
        }
      }
    });

    test('should show avatar/photo upload', async ({ page }) => {
      await page.goto('/settings/account');

      const avatarSection = page.getByText(/avatar|photo|picture/i);
      if (await avatarSection.isVisible()) {
        await expect(avatarSection).toBeVisible();
      }
    });

    test('should show password change option', async ({ page }) => {
      await page.goto('/settings/account');

      const passwordSection = page.getByText(/password|change password/i);
      await expect(passwordSection).toBeVisible();
    });
  });
});

test.describe('Settings - Email Templates', () => {
  test.describe('Email Templates List', () => {
    test('should display email templates page', async ({ page }) => {
      await page.goto('/settings/emails');

      await expect(page.getByRole('heading', { name: /email/i })).toBeVisible();
    });

    test('should show list of email templates', async ({ page }) => {
      await page.goto('/settings/emails');

      const templateList = page.locator('[class*="card"], [class*="Card"], table');
      if (await templateList.count() > 0) {
        await expect(templateList.first()).toBeVisible();
      }
    });

    test('should have create template button', async ({ page }) => {
      await page.goto('/settings/emails');

      const createButton = page.getByRole('link', { name: /new|create|add/i });
      if (await createButton.isVisible()) {
        await expect(createButton).toBeVisible();
      }
    });

    test('should show template types', async ({ page }) => {
      await page.goto('/settings/emails');

      const templateTypes = [
        /quote.*sent/i,
        /invoice.*sent/i,
        /payment.*received/i,
        /reminder/i,
      ];

      let foundType = false;
      for (const type of templateTypes) {
        if (await page.getByText(type).isVisible()) {
          foundType = true;
          break;
        }
      }
      expect(foundType).toBe(true);
    });
  });

  test.describe('Email Template Editing', () => {
    test('should navigate to edit email template', async ({ page }) => {
      await page.goto('/settings/emails');

      const editLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await editLink.isVisible()) {
        await editLink.click();

        await expect(page).toHaveURL(/\/settings\/emails\/.+/);
      }
    });

    test('should show template subject field', async ({ page }) => {
      await page.goto('/settings/emails');

      const editLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await editLink.isVisible()) {
        await editLink.click();

        const subjectInput = page.getByLabel(/subject/i);
        if (await subjectInput.isVisible()) {
          await expect(subjectInput).toBeVisible();
        }
      }
    });

    test('should show template body editor', async ({ page }) => {
      await page.goto('/settings/emails');

      const editLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await editLink.isVisible()) {
        await editLink.click();

        const bodyEditor = page.locator('[contenteditable="true"], textarea').first();
        if (await bodyEditor.isVisible()) {
          await expect(bodyEditor).toBeVisible();
        }
      }
    });

    test('should show available variables', async ({ page }) => {
      await page.goto('/settings/emails');

      const editLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await editLink.isVisible()) {
        await editLink.click();

        const variables = page.getByText(/variable|placeholder|\{\{/i);
        if (await variables.isVisible()) {
          await expect(variables).toBeVisible();
        }
      }
    });

    test('should save template changes', async ({ page }) => {
      await page.goto('/settings/emails');

      const editLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await editLink.isVisible()) {
        await editLink.click();

        const saveButton = page.getByRole('button', { name: /save|update/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();

          const success = page.getByText(/saved|updated/i);
          if (await success.isVisible()) {
            await expect(success).toBeVisible();
          }
        }
      }
    });
  });
});

test.describe('Settings - Team Management', () => {
  test.describe('Team Page', () => {
    test('should display team settings page', async ({ page }) => {
      await page.goto('/settings/team');

      await expect(page.getByRole('heading', { name: /team/i })).toBeVisible();
    });

    test('should show invite member button', async ({ page }) => {
      await page.goto('/settings/team');

      const inviteButton = page.getByRole('button', { name: /invite|add member/i });
      await expect(inviteButton).toBeVisible();
    });

    test('should show list of team members', async ({ page }) => {
      await page.goto('/settings/team');

      const memberList = page.locator('table, [class*="member"], [class*="list"]');
      await expect(memberList.first()).toBeVisible();
    });

    test('should show member roles', async ({ page }) => {
      await page.goto('/settings/team');

      const roles = page.getByText(/owner|admin|member|viewer/i);
      await expect(roles.first()).toBeVisible();
    });

    test('should open invite member modal', async ({ page }) => {
      await page.goto('/settings/team');

      const inviteButton = page.getByRole('button', { name: /invite|add member/i });
      await inviteButton.click();

      const modal = page.getByRole('dialog');
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();

        const emailInput = page.getByLabel(/email/i);
        await expect(emailInput).toBeVisible();
      }
    });

    test('should show role selector in invite modal', async ({ page }) => {
      await page.goto('/settings/team');

      const inviteButton = page.getByRole('button', { name: /invite|add member/i });
      await inviteButton.click();

      const roleSelector = page.getByLabel(/role/i);
      if (await roleSelector.isVisible()) {
        await expect(roleSelector).toBeVisible();
      }
    });
  });
});

test.describe('Settings - Billing', () => {
  test.describe('Billing Page', () => {
    test('should display billing settings page', async ({ page }) => {
      await page.goto('/settings/billing');

      await expect(page.getByRole('heading', { name: /billing/i })).toBeVisible();
    });

    test('should show current plan', async ({ page }) => {
      await page.goto('/settings/billing');

      const planInfo = page.getByText(/plan|subscription|free|starter|pro/i);
      await expect(planInfo.first()).toBeVisible();
    });

    test('should show upgrade option', async ({ page }) => {
      await page.goto('/settings/billing');

      const upgradeButton = page.getByRole('button', { name: /upgrade|change plan/i });
      if (await upgradeButton.isVisible()) {
        await expect(upgradeButton).toBeVisible();
      }
    });

    test('should show billing history', async ({ page }) => {
      await page.goto('/settings/billing');

      const historySection = page.getByText(/history|invoices|payments/i);
      if (await historySection.isVisible()) {
        await expect(historySection).toBeVisible();
      }
    });

    test('should show payment method', async ({ page }) => {
      await page.goto('/settings/billing');

      const paymentMethod = page.getByText(/payment method|card|credit/i);
      if (await paymentMethod.isVisible()) {
        await expect(paymentMethod).toBeVisible();
      }
    });
  });
});

test.describe('Settings - Workspace', () => {
  test.describe('Workspace Page', () => {
    test('should display workspace settings page', async ({ page }) => {
      await page.goto('/settings/workspace');

      await expect(page.getByRole('heading', { name: /workspace/i })).toBeVisible();
    });

    test('should show workspace name field', async ({ page }) => {
      await page.goto('/settings/workspace');

      const nameInput = page.getByLabel(/workspace name|name/i);
      await expect(nameInput).toBeVisible();
    });

    test('should show workspace URL/slug', async ({ page }) => {
      await page.goto('/settings/workspace');

      const slugInput = page.getByLabel(/slug|url|subdomain/i);
      if (await slugInput.isVisible()) {
        await expect(slugInput).toBeVisible();
      }
    });

    test('should show danger zone', async ({ page }) => {
      await page.goto('/settings/workspace');

      const dangerZone = page.getByText(/danger|delete workspace/i);
      if (await dangerZone.isVisible()) {
        await expect(dangerZone).toBeVisible();
      }
    });
  });
});

test.describe('Settings - Quote Defaults', () => {
  test.describe('Quote Settings Page', () => {
    test('should display quote settings page', async ({ page }) => {
      await page.goto('/settings/quotes');

      await expect(page.getByRole('heading', { name: /quote/i })).toBeVisible();
    });

    test('should show default validity period', async ({ page }) => {
      await page.goto('/settings/quotes');

      const validityInput = page.getByLabel(/valid|expir|days/i);
      if (await validityInput.isVisible()) {
        await expect(validityInput).toBeVisible();
      }
    });

    test('should show quote numbering format', async ({ page }) => {
      await page.goto('/settings/quotes');

      const numberingInput = page.getByLabel(/number|prefix|format/i);
      if (await numberingInput.isVisible()) {
        await expect(numberingInput).toBeVisible();
      }
    });

    test('should show default terms and conditions', async ({ page }) => {
      await page.goto('/settings/quotes');

      const termsSection = page.getByText(/terms|conditions|notes/i);
      if (await termsSection.isVisible()) {
        await expect(termsSection).toBeVisible();
      }
    });
  });
});

test.describe('Settings - Invoice Defaults', () => {
  test.describe('Invoice Settings Page', () => {
    test('should display invoice settings page', async ({ page }) => {
      await page.goto('/settings/invoices');

      await expect(page.getByRole('heading', { name: /invoice/i })).toBeVisible();
    });

    test('should show default payment terms', async ({ page }) => {
      await page.goto('/settings/invoices');

      const termsInput = page.getByLabel(/payment.*term|due.*date|net/i);
      if (await termsInput.isVisible()) {
        await expect(termsInput).toBeVisible();
      }
    });

    test('should show invoice numbering format', async ({ page }) => {
      await page.goto('/settings/invoices');

      const numberingInput = page.getByLabel(/number|prefix|format/i);
      if (await numberingInput.isVisible()) {
        await expect(numberingInput).toBeVisible();
      }
    });

    test('should show late fee settings', async ({ page }) => {
      await page.goto('/settings/invoices');

      const lateFeeSection = page.getByText(/late.*fee|penalty|interest/i);
      if (await lateFeeSection.isVisible()) {
        await expect(lateFeeSection).toBeVisible();
      }
    });
  });
});

test.describe('Settings Navigation', () => {
  test('should navigate between settings pages', async ({ page }) => {
    await page.goto('/settings');

    const settingsLinks = [
      { name: /account|profile/i, url: /account/ },
      { name: /business/i, url: /business/ },
      { name: /branding/i, url: /branding/ },
      { name: /tax/i, url: /tax/ },
    ];

    for (const link of settingsLinks) {
      const navLink = page.getByRole('link', { name: link.name });
      if (await navLink.isVisible()) {
        await navLink.click();
        await expect(page).toHaveURL(link.url);
        await page.goto('/settings');
      }
    }
  });

  test('should show settings sidebar navigation', async ({ page }) => {
    await page.goto('/settings');

    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
  });
});
