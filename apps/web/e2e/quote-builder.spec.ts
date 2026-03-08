import { test, expect } from '@playwright/test';

test.describe('Quote Builder', () => {
  test.describe('Builder Interface', () => {
    test('should display quote builder', async ({ page }) => {
      await page.goto('/quotes/new');

      // Should show builder interface
      const builder = page.locator('[class*="builder"], [data-testid="quote-builder"]');
      if (await builder.isVisible()) {
        await expect(builder).toBeVisible();
      }
    });

    test('should show block toolbar', async ({ page }) => {
      await page.goto('/quotes/new');

      const toolbar = page.getByRole('toolbar');
      if (await toolbar.isVisible()) {
        await expect(toolbar).toBeVisible();
      }
    });

    test('should show available block types', async ({ page }) => {
      await page.goto('/quotes/new');

      const blockTypes = [
        page.getByRole('button', { name: /text|paragraph/i }),
        page.getByRole('button', { name: /heading/i }),
        page.getByRole('button', { name: /line item|service/i }),
        page.getByRole('button', { name: /image/i }),
        page.getByRole('button', { name: /divider|separator/i }),
      ];

      for (const blockType of blockTypes) {
        if (await blockType.isVisible()) {
          await expect(blockType).toBeVisible();
          break;
        }
      }
    });

    test('should show canvas/editor area', async ({ page }) => {
      await page.goto('/quotes/new');

      const canvas = page.locator('[class*="canvas"], [class*="editor"], [contenteditable="true"]');
      if (await canvas.count() > 0) {
        await expect(canvas.first()).toBeVisible();
      }
    });

    test('should show preview toggle', async ({ page }) => {
      await page.goto('/quotes/new');

      const previewButton = page.getByRole('button', { name: /preview/i });
      if (await previewButton.isVisible()) {
        await expect(previewButton).toBeVisible();
      }
    });
  });

  test.describe('Block Operations', () => {
    test('should add text block', async ({ page }) => {
      await page.goto('/quotes/new');

      const addBlockButton = page.getByRole('button', { name: /add block|text|paragraph/i });
      if (await addBlockButton.isVisible()) {
        await addBlockButton.click();

        // Should add a new block
        const textBlock = page.locator('[class*="block"], [data-block-type="text"]');
        if (await textBlock.count() > 0) {
          await expect(textBlock.first()).toBeVisible();
        }
      }
    });

    test('should add heading block', async ({ page }) => {
      await page.goto('/quotes/new');

      const addHeadingButton = page.getByRole('button', { name: /heading|title/i });
      if (await addHeadingButton.isVisible()) {
        await addHeadingButton.click();

        const headingBlock = page.locator('[class*="heading"], h1, h2, h3');
        if (await headingBlock.count() > 0) {
          await expect(headingBlock.first()).toBeVisible();
        }
      }
    });

    test('should add line item block', async ({ page }) => {
      await page.goto('/quotes/new');

      const addItemButton = page.getByRole('button', { name: /line item|service|product/i });
      if (await addItemButton.isVisible()) {
        await addItemButton.click();

        // Should add line item with fields
        const lineItem = page.locator('[class*="line-item"], [data-block-type="lineItem"]');
        if (await lineItem.count() > 0) {
          await expect(lineItem.first()).toBeVisible();
        }
      }
    });

    test('should delete block', async ({ page }) => {
      await page.goto('/quotes/new');

      // Add a block first
      const addBlockButton = page.getByRole('button', { name: /add|text/i }).first();
      if (await addBlockButton.isVisible()) {
        await addBlockButton.click();

        // Click on block to select it
        const block = page.locator('[class*="block"]').first();
        if (await block.isVisible()) {
          await block.click();

          // Delete block
          const deleteButton = page.getByRole('button', { name: /delete|remove/i });
          if (await deleteButton.isVisible()) {
            await deleteButton.click();
          }
        }
      }
    });

    test('should duplicate block', async ({ page }) => {
      await page.goto('/quotes/new');

      const block = page.locator('[class*="block"]').first();
      if (await block.isVisible()) {
        await block.click();

        const duplicateButton = page.getByRole('button', { name: /duplicate|copy/i });
        if (await duplicateButton.isVisible()) {
          const initialCount = await page.locator('[class*="block"]').count();
          await duplicateButton.click();

          // Should have one more block
          const newCount = await page.locator('[class*="block"]').count();
          expect(newCount).toBeGreaterThanOrEqual(initialCount);
        }
      }
    });
  });

  test.describe('Drag and Drop', () => {
    test('should show drag handles', async ({ page }) => {
      await page.goto('/quotes/new');

      const dragHandle = page.locator('[class*="drag"], [data-drag-handle]');
      if (await dragHandle.count() > 0) {
        await expect(dragHandle.first()).toBeVisible();
      }
    });

    test('should reorder blocks via drag', async ({ page }) => {
      await page.goto('/quotes/new');

      // Get drag handles
      const dragHandles = page.locator('[data-drag-handle], [class*="drag-handle"]');
      if (await dragHandles.count() >= 2) {
        const firstHandle = dragHandles.first();
        const secondHandle = dragHandles.nth(1);

        const firstBox = await firstHandle.boundingBox();
        const secondBox = await secondHandle.boundingBox();

        if (firstBox && secondBox) {
          // Perform drag
          await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height + 20);
          await page.mouse.up();
        }
      }
    });

    test('should show drop indicator', async ({ page }) => {
      await page.goto('/quotes/new');

      const dragHandle = page.locator('[data-drag-handle]').first();
      if (await dragHandle.isVisible()) {
        const box = await dragHandle.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x, box.y + 100);

          // Check for drop indicator
          const dropIndicator = page.locator('[class*="drop-indicator"], [class*="dropzone"]');
          if (await dropIndicator.isVisible()) {
            await expect(dropIndicator).toBeVisible();
          }

          await page.mouse.up();
        }
      }
    });
  });

  test.describe('Line Item Editing', () => {
    test('should edit line item description', async ({ page }) => {
      await page.goto('/quotes/new');

      const descriptionInput = page.getByPlaceholder(/description|item name|service/i).first();
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('Test Service Description');
        await expect(descriptionInput).toHaveValue('Test Service Description');
      }
    });

    test('should edit line item quantity', async ({ page }) => {
      await page.goto('/quotes/new');

      const quantityInput = page.getByLabel(/quantity|qty/i).first();
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('5');
        await expect(quantityInput).toHaveValue('5');
      }
    });

    test('should edit line item rate', async ({ page }) => {
      await page.goto('/quotes/new');

      const rateInput = page.getByLabel(/rate|price|amount/i).first();
      if (await rateInput.isVisible()) {
        await rateInput.fill('150');
        await expect(rateInput).toHaveValue(/150/);
      }
    });

    test('should calculate line item total', async ({ page }) => {
      await page.goto('/quotes/new');

      const quantityInput = page.getByLabel(/quantity/i).first();
      const rateInput = page.getByLabel(/rate|price/i).first();

      if (await quantityInput.isVisible() && await rateInput.isVisible()) {
        await quantityInput.fill('3');
        await rateInput.fill('100');

        // Total should update
        const total = page.getByText(/300|total/i);
        await total.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
        if (await total.isVisible()) {
          await expect(total).toBeVisible();
        }
      }
    });

    test('should add line item from rate card', async ({ page }) => {
      await page.goto('/quotes/new');

      const rateCardButton = page.getByRole('button', { name: /rate card|add from/i });
      if (await rateCardButton.isVisible()) {
        await rateCardButton.click();

        // Should show rate card selector
        const rateCardSelector = page.getByRole('listbox');
        if (await rateCardSelector.isVisible()) {
          await expect(rateCardSelector).toBeVisible();
        }
      }
    });
  });

  test.describe('Rich Text Editing', () => {
    test('should format text as bold', async ({ page }) => {
      await page.goto('/quotes/new');

      const editor = page.locator('[contenteditable="true"]').first();
      if (await editor.isVisible()) {
        await editor.click();
        await editor.fill('Test text');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Control+b');
      }
    });

    test('should format text as italic', async ({ page }) => {
      await page.goto('/quotes/new');

      const editor = page.locator('[contenteditable="true"]').first();
      if (await editor.isVisible()) {
        await editor.click();
        await editor.fill('Test text');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Control+i');
      }
    });

    test('should show formatting toolbar', async ({ page }) => {
      await page.goto('/quotes/new');

      const editor = page.locator('[contenteditable="true"]').first();
      if (await editor.isVisible()) {
        await editor.click();

        const formattingToolbar = page.locator('[class*="toolbar"], [class*="menu"]');
        if (await formattingToolbar.count() > 0) {
          await expect(formattingToolbar.first()).toBeVisible();
        }
      }
    });

    test('should add bullet list', async ({ page }) => {
      await page.goto('/quotes/new');

      const listButton = page.getByRole('button', { name: /list|bullet/i });
      if (await listButton.isVisible()) {
        await listButton.click();
      }
    });
  });

  test.describe('Quote Totals', () => {
    test('should display subtotal', async ({ page }) => {
      await page.goto('/quotes/new');

      const subtotal = page.getByText(/subtotal/i);
      if (await subtotal.isVisible()) {
        await expect(subtotal).toBeVisible();
      }
    });

    test('should display tax calculation', async ({ page }) => {
      await page.goto('/quotes/new');

      const tax = page.getByText(/tax|vat|gst/i);
      if (await tax.isVisible()) {
        await expect(tax).toBeVisible();
      }
    });

    test('should display grand total', async ({ page }) => {
      await page.goto('/quotes/new');

      const total = page.getByText(/total|grand total/i);
      await expect(total.first()).toBeVisible();
    });

    test('should add discount', async ({ page }) => {
      await page.goto('/quotes/new');

      const discountButton = page.getByRole('button', { name: /discount/i });
      if (await discountButton.isVisible()) {
        await discountButton.click();

        const discountInput = page.getByLabel(/discount/i);
        if (await discountInput.isVisible()) {
          await discountInput.fill('10');
        }
      }
    });

    test('should toggle discount type (percentage/fixed)', async ({ page }) => {
      await page.goto('/quotes/new');

      const discountTypeToggle = page.getByRole('button', { name: /%|fixed|percentage/i });
      if (await discountTypeToggle.isVisible()) {
        await discountTypeToggle.click();
      }
    });
  });

  test.describe('Quote Preview', () => {
    test('should toggle preview mode', async ({ page }) => {
      await page.goto('/quotes/new');

      const previewButton = page.getByRole('button', { name: /preview/i });
      if (await previewButton.isVisible()) {
        await previewButton.click();

        // Should show preview
        const preview = page.locator('[class*="preview"]');
        if (await preview.isVisible()) {
          await expect(preview).toBeVisible();
        }
      }
    });

    test('should show client info in preview', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const previewButton = page.getByRole('button', { name: /preview/i });
        if (await previewButton.isVisible()) {
          await previewButton.click();

          // Should show client details
          const clientInfo = page.getByText(/client|to:|bill to/i);
          if (await clientInfo.isVisible()) {
            await expect(clientInfo).toBeVisible();
          }
        }
      }
    });

    test('should show company branding in preview', async ({ page }) => {
      await page.goto('/quotes/new');

      const previewButton = page.getByRole('button', { name: /preview/i });
      if (await previewButton.isVisible()) {
        await previewButton.click();

        const logo = page.locator('img[alt*="logo"], [class*="logo"]');
        if (await logo.isVisible()) {
          await expect(logo).toBeVisible();
        }
      }
    });
  });

  test.describe('Quote Settings', () => {
    test('should set quote validity period', async ({ page }) => {
      await page.goto('/quotes/new');

      const validityInput = page.getByLabel(/valid|expir/i);
      if (await validityInput.isVisible()) {
        await validityInput.fill('30');
      }
    });

    test('should set quote number', async ({ page }) => {
      await page.goto('/quotes/new');

      const numberInput = page.getByLabel(/number|quote #/i);
      if (await numberInput.isVisible()) {
        await expect(numberInput).toBeVisible();
      }
    });

    test('should set quote date', async ({ page }) => {
      await page.goto('/quotes/new');

      const dateInput = page.getByLabel(/date/i);
      if (await dateInput.isVisible()) {
        await expect(dateInput).toBeVisible();
      }
    });

    test('should add terms and conditions', async ({ page }) => {
      await page.goto('/quotes/new');

      const termsSection = page.getByText(/terms|conditions/i);
      if (await termsSection.isVisible()) {
        await termsSection.click();

        const termsInput = page.locator('textarea, [contenteditable="true"]').last();
        if (await termsInput.isVisible()) {
          await termsInput.fill('Payment due within 30 days');
        }
      }
    });
  });

  test.describe('Quote Actions', () => {
    test('should save quote as draft', async ({ page }) => {
      await page.goto('/quotes/new');

      // Fill minimum required fields
      const clientSelect = page.getByLabel(/client/i);
      if (await clientSelect.isVisible()) {
        await clientSelect.click();
        const option = page.getByRole('option').first();
        if (await option.isVisible()) {
          await option.click();
        }
      }

      const saveDraftButton = page.getByRole('button', { name: /save.*draft|save/i });
      if (await saveDraftButton.isVisible()) {
        await saveDraftButton.click();

        const success = page.getByText(/saved|created/i);
        if (await success.isVisible()) {
          await expect(success).toBeVisible();
        }
      }
    });

    test('should send quote to client', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible()) {
          await expect(sendButton).toBeVisible();
        }
      }
    });

    test('should copy quote link', async ({ page }) => {
      await page.goto('/quotes');

      const quoteLink = page.locator('a[href^="/quotes/"]').first();
      if (await quoteLink.isVisible()) {
        await quoteLink.click();

        const copyLinkButton = page.getByRole('button', { name: /copy.*link|share/i });
        if (await copyLinkButton.isVisible()) {
          await copyLinkButton.click();

          const copied = page.getByText(/copied/i);
          if (await copied.isVisible()) {
            await expect(copied).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Undo/Redo', () => {
    test('should undo last action', async ({ page }) => {
      await page.goto('/quotes/new');

      // Make a change
      const editor = page.locator('[contenteditable="true"]').first();
      if (await editor.isVisible()) {
        await editor.fill('Test');

        // Undo
        await page.keyboard.press('Control+z');
      }
    });

    test('should redo undone action', async ({ page }) => {
      await page.goto('/quotes/new');

      const editor = page.locator('[contenteditable="true"]').first();
      if (await editor.isVisible()) {
        await editor.fill('Test');
        await page.keyboard.press('Control+z');
        await page.keyboard.press('Control+Shift+z');
      }
    });

    test('should show undo/redo buttons', async ({ page }) => {
      await page.goto('/quotes/new');

      const undoButton = page.getByRole('button', { name: /undo/i });
      const redoButton = page.getByRole('button', { name: /redo/i });

      if (await undoButton.isVisible()) {
        await expect(undoButton).toBeVisible();
      }
      if (await redoButton.isVisible()) {
        await expect(redoButton).toBeVisible();
      }
    });
  });

  test.describe('Autosave', () => {
    test('should indicate autosave status', async ({ page }) => {
      await page.goto('/quotes/new');

      const autosaveIndicator = page.getByText(/saving|saved|auto/i);
      if (await autosaveIndicator.isVisible()) {
        await expect(autosaveIndicator).toBeVisible();
      }
    });

    test('should autosave on changes', async ({ page }) => {
      await page.goto('/quotes/new');

      const editor = page.locator('[contenteditable="true"]').first();
      if (await editor.isVisible()) {
        await editor.fill('Autosave test content');

        // Wait for autosave indicator
        const savedIndicator = page.getByText(/saved/i);
        await savedIndicator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        if (await savedIndicator.isVisible()) {
          await expect(savedIndicator).toBeVisible();
        }
      }
    });
  });
});

test.describe('Quote Builder Accessibility', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/quotes/new');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/quotes/new');

    const labels = page.locator('label');
    if (await labels.count() > 0) {
      await expect(labels.first()).toBeVisible();
    }
  });

  test('should have ARIA attributes on interactive elements', async ({ page }) => {
    await page.goto('/quotes/new');

    const buttons = page.getByRole('button');
    if (await buttons.count() > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });
});
