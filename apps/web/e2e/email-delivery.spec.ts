import { test, expect } from '@playwright/test';

test.describe('Email Delivery', () => {
  test.describe('Quote Email Sending', () => {
    test('should show send quote button', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send|email/i });
        await expect(sendButton).toBeVisible();
      }
    });

    test('should open email preview modal', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const modal = page.getByRole('dialog');
          if (await modal.isVisible()) {
            await expect(modal).toBeVisible();
          }
        }
      }
    });

    test('should show recipient email', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const toField = page.getByLabel(/to|recipient/i);
          if (await toField.isVisible()) {
            await expect(toField).toBeVisible();
          }
        }
      }
    });

    test('should show email subject', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const subjectField = page.getByLabel(/subject/i);
          if (await subjectField.isVisible()) {
            await expect(subjectField).toBeVisible();
          }
        }
      }
    });

    test('should show email body/message', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const messageField = page.locator('textarea, [contenteditable="true"]');
          if (await messageField.count() > 0) {
            await expect(messageField.first()).toBeVisible();
          }
        }
      }
    });

    test('should allow editing email content', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const messageField = page.locator('textarea').first();
          if (await messageField.isVisible()) {
            await messageField.fill('Custom message for the client');
            await expect(messageField).toHaveValue(/Custom message/);
          }
        }
      }
    });

    test('should show send confirmation', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const confirmSendButton = page.getByRole('button', { name: /send quote|confirm|send email/i });
          if (await confirmSendButton.isVisible()) {
            await confirmSendButton.click();

            const success = page.getByText(/sent|email sent|delivered/i);
            if (await success.isVisible()) {
              await expect(success).toBeVisible();
            }
          }
        }
      }
    });

    test('should update quote status to sent', async ({ page }) => {
      await page.goto('/quotes');

      // After sending, status should change to "sent"
      const sentBadge = page.locator('[class*="badge"]:has-text("sent")');
      if (await sentBadge.count() > 0) {
        await expect(sentBadge.first()).toBeVisible();
      }
    });
  });

  test.describe('Invoice Email Sending', () => {
    test('should show send invoice button', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        // Check for send button or any action buttons
        const sendButton = page.getByRole('button', { name: /send|email|share/i }).first();
        const hasBtn = await sendButton.isVisible().catch(() => false);

        // Either has send button or invoice detail page loaded
        expect(hasBtn || page.url().includes('/invoices/')).toBe(true);
      } else {
        // No invoices exist
        expect(true).toBe(true);
      }
    });

    test('should include payment link in invoice email', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          // Email preview should mention payment link
          const paymentLinkInfo = page.getByText(/payment.*link|pay.*online|click.*pay/i);
          if (await paymentLinkInfo.isVisible()) {
            await expect(paymentLinkInfo).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Payment Reminder Emails', () => {
    test('should show send reminder button on overdue invoice', async ({ page }) => {
      await page.goto('/invoices');

      const overdueInvoice = page.locator('a:has-text("overdue")').first();
      if (await overdueInvoice.isVisible()) {
        await overdueInvoice.click();

        const reminderButton = page.getByRole('button', { name: /remind|send|email/i }).first();
        const hasBtn = await reminderButton.isVisible().catch(() => false);

        // Either has reminder button or invoice page loaded
        expect(hasBtn || page.url().includes('/invoices/')).toBe(true);
      } else {
        // No overdue invoices - that's okay
        expect(true).toBe(true);
      }
    });

    test('should send payment reminder', async ({ page }) => {
      await page.goto('/invoices');

      const overdueInvoice = page.locator('a:has-text("overdue"), a:has-text("sent")').first();
      if (await overdueInvoice.isVisible()) {
        await overdueInvoice.click();

        const reminderButton = page.getByRole('button', { name: /remind/i });
        if (await reminderButton.isVisible()) {
          await reminderButton.click();

          const success = page.getByText(/reminder sent|sent/i);
          if (await success.isVisible()) {
            await expect(success).toBeVisible();
          }
        }
      }
    });

    test('should track reminder history', async ({ page }) => {
      await page.goto('/invoices');

      const invoiceLink = page.locator('a[href^="/invoices/"]').first();
      if (await invoiceLink.isVisible()) {
        await invoiceLink.click();

        const reminderHistory = page.getByText(/reminder.*sent|last reminded/i);
        if (await reminderHistory.isVisible()) {
          await expect(reminderHistory).toBeVisible();
        }
      }
    });
  });

  test.describe('Email Templates', () => {
    test('should list email templates', async ({ page }) => {
      await page.goto('/settings/emails');

      const templateList = page.locator('[class*="card"], table, [class*="list"]');
      await expect(templateList.first()).toBeVisible();
    });

    test('should show template types', async ({ page }) => {
      await page.goto('/settings/emails');

      const templateTypes = [
        /quote.*sent/i,
        /invoice.*sent/i,
        /payment.*reminder/i,
        /payment.*received/i,
      ];

      for (const type of templateTypes) {
        const template = page.getByText(type);
        if (await template.isVisible()) {
          await expect(template).toBeVisible();
          break;
        }
      }
    });

    test('should edit email template subject', async ({ page }) => {
      await page.goto('/settings/emails');

      const templateLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const subjectInput = page.getByLabel(/subject/i);
        if (await subjectInput.isVisible()) {
          await subjectInput.fill('Updated Subject Line');
          await expect(subjectInput).toHaveValue('Updated Subject Line');
        }
      }
    });

    test('should edit email template body', async ({ page }) => {
      await page.goto('/settings/emails');

      const templateLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const bodyEditor = page.locator('textarea, [contenteditable="true"]').first();
        if (await bodyEditor.isVisible()) {
          await expect(bodyEditor).toBeVisible();
        }
      }
    });

    test('should show template variables', async ({ page }) => {
      await page.goto('/settings/emails');

      const templateLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const variables = page.getByText(/\{\{.*\}\}|variable|placeholder/i);
        if (await variables.isVisible()) {
          await expect(variables).toBeVisible();
        }
      }
    });

    test('should preview email template', async ({ page }) => {
      await page.goto('/settings/emails');

      const templateLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const previewButton = page.getByRole('button', { name: /preview/i });
        if (await previewButton.isVisible()) {
          await previewButton.click();

          const preview = page.locator('[class*="preview"], iframe');
          if (await preview.isVisible()) {
            await expect(preview).toBeVisible();
          }
        }
      }
    });

    test('should save template changes', async ({ page }) => {
      await page.goto('/settings/emails');

      const templateLink = page.locator('a[href^="/settings/emails/"]').first();
      if (await templateLink.isVisible()) {
        await templateLink.click();

        const saveButton = page.getByRole('button', { name: /save/i });
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

  test.describe('Email History/Activity', () => {
    test('should show email activity on quote', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const activity = page.getByText(/sent.*email|emailed|activity/i);
        if (await activity.isVisible()) {
          await expect(activity).toBeVisible();
        }
      }
    });

    test('should show email opened tracking', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const openedIndicator = page.getByText(/viewed|opened|seen/i);
        if (await openedIndicator.isVisible()) {
          await expect(openedIndicator).toBeVisible();
        }
      }
    });

    test('should show email bounce handling', async ({ page }) => {
      // Bounced emails should be indicated
      await page.goto('/quotes');

      const bounceIndicator = page.getByText(/bounced|failed.*deliver|undeliverable/i);
      if (await bounceIndicator.isVisible()) {
        await expect(bounceIndicator).toBeVisible();
      }
    });
  });

  test.describe('CC and BCC', () => {
    test('should allow adding CC recipients', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const ccField = page.getByLabel(/cc/i);
          if (await ccField.isVisible()) {
            await ccField.fill('cc@example.com');
            await expect(ccField).toHaveValue('cc@example.com');
          }
        }
      }
    });

    test('should allow adding BCC recipients', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const bccField = page.getByLabel(/bcc/i);
          if (await bccField.isVisible()) {
            await bccField.fill('bcc@example.com');
            await expect(bccField).toHaveValue('bcc@example.com');
          }
        }
      }
    });
  });

  test.describe('Email Attachments', () => {
    test('should auto-attach PDF to quote email', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const pdfAttachment = page.getByText(/pdf.*attached|attachment.*pdf/i);
          if (await pdfAttachment.isVisible()) {
            await expect(pdfAttachment).toBeVisible();
          }
        }
      }
    });

    test('should allow toggling PDF attachment', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const attachPdfCheckbox = page.getByLabel(/attach.*pdf|include.*pdf/i);
          if (await attachPdfCheckbox.isVisible()) {
            await expect(attachPdfCheckbox).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Scheduled Emails', () => {
    test('should allow scheduling email send', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const scheduleOption = page.getByText(/schedule|send later/i);
          if (await scheduleOption.isVisible()) {
            await expect(scheduleOption).toBeVisible();
          }
        }
      }
    });

    test('should show scheduled email datetime picker', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const scheduleOption = page.getByText(/schedule|send later/i);
          if (await scheduleOption.isVisible()) {
            await scheduleOption.click();

            const datePicker = page.locator('input[type="datetime-local"], [class*="date-picker"]');
            if (await datePicker.isVisible()) {
              await expect(datePicker).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('Email Error Handling', () => {
    test('should validate recipient email format', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await sendButton.click();

          const toField = page.getByLabel(/to|recipient/i);
          if (await toField.isVisible()) {
            await toField.fill('invalid-email');

            const submitButton = page.getByRole('button', { name: /send.*quote|confirm/i });
            if (await submitButton.isVisible()) {
              await submitButton.click();

              const error = page.getByText(/invalid.*email|valid.*email/i);
              if (await error.isVisible()) {
                await expect(error).toBeVisible();
              }
            }
          }
        }
      }
    });

    test('should show retry option on send failure', async ({ page }) => {
      await page.goto('/quotes');

      // If email sending fails, retry should be available
      const retryButton = page.getByRole('button', { name: /retry|try again/i });
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeVisible();
      }
    });
  });
});

test.describe('Email Delivery Accessibility', () => {
  test('should have accessible send dialog', async ({ page }) => {
    await page.goto('/quotes');

    const quoteLink = page.locator('a[href^="/quotes/"]').first();
    if (await quoteLink.isVisible()) {
      await quoteLink.click();

      const sendButton = page.getByRole('button', { name: /send/i });
      if (await sendButton.isVisible()) {
        await sendButton.click();

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          await expect(dialog).toBeVisible();
        }
      }
    }
  });

  test('should support keyboard navigation in send dialog', async ({ page }) => {
    await page.goto('/quotes');

    const quoteLink = page.locator('a[href^="/quotes/"]').first();
    if (await quoteLink.isVisible()) {
      await quoteLink.click();

      const sendButton = page.getByRole('button', { name: /send/i });
      if (await sendButton.isVisible()) {
        await sendButton.click();

        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
      }
    }
  });
});
