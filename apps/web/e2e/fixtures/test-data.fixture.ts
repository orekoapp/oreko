import { test as base, expect } from '@playwright/test';

/**
 * Test data fixture for creating and cleaning up test entities
 */

// Sample test data
export const TEST_CLIENT = {
  name: 'E2E Test Client',
  email: 'e2e-client@test.com',
  phone: '+1234567890',
  company: 'Test Company Inc',
  type: 'company' as const,
};

export const TEST_QUOTE = {
  title: 'E2E Test Quote',
  clientName: TEST_CLIENT.name,
  blocks: [
    {
      type: 'header',
      content: { title: 'Project Proposal', subtitle: 'Web Development' },
    },
    {
      type: 'text',
      content: { html: '<p>Thank you for considering our services.</p>' },
    },
    {
      type: 'service-item',
      content: {
        name: 'Development Services',
        description: 'Full-stack development',
        quantity: 10,
        rate: 150,
        unit: 'hour',
      },
    },
  ],
};

export const TEST_INVOICE = {
  title: 'E2E Test Invoice',
  clientName: TEST_CLIENT.name,
  lineItems: [
    {
      name: 'Service A',
      description: 'Test service',
      quantity: 5,
      rate: 100,
    },
  ],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
};

export const TEST_RATE_CARD = {
  name: 'E2E Test Rate Card',
  description: 'Rate card for E2E testing',
  items: [
    { name: 'Junior Developer', rate: 75, unit: 'hour' },
    { name: 'Senior Developer', rate: 150, unit: 'hour' },
    { name: 'Project Manager', rate: 100, unit: 'hour' },
  ],
};

type TestDataFixtures = {
  testClient: { id: string; name: string };
  testQuote: { id: string; quoteNumber: string };
  testInvoice: { id: string; invoiceNumber: string };
  testRateCard: { id: string; name: string };
  cleanupTestData: () => Promise<void>;
};

/**
 * Extended test with test data fixtures
 */
export const test = base.extend<TestDataFixtures>({
  // Create a test client
  testClient: async ({ page }, use) => {
    // Navigate to clients page
    await page.goto('/clients/new');
    await page.waitForLoadState('networkidle');

    // Fill client form using id selectors
    const timestamp = Date.now();
    await page.fill('#name', TEST_CLIENT.name + ' ' + timestamp);
    await page.fill('#email', `e2e-${timestamp}@test.com`);

    const phoneInput = page.locator('#phone');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(TEST_CLIENT.phone);
    }

    const companyInput = page.locator('#company');
    if (await companyInput.isVisible()) {
      await companyInput.fill(TEST_CLIENT.company);
    }

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect and extract client ID from URL
    await page.waitForURL(/\/clients\/[a-z0-9-]+/);
    const url = page.url();
    const id = url.split('/clients/')[1]?.split('?')[0] || '';

    const clientData = {
      id,
      name: TEST_CLIENT.name,
    };

    await use(clientData);

    // Cleanup: delete the test client
    try {
      await page.goto(`/clients/${id}`);
      const deleteButton = page.getByRole('button', { name: /delete/i });
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        // Confirm deletion in dialog
        const confirmButton = page.getByRole('button', { name: /confirm|delete/i });
        await confirmButton.click();
      }
    } catch {
      // Ignore cleanup errors
    }
  },

  // Create a test quote
  testQuote: async ({ page, testClient }, use) => {
    await page.goto('/quotes/new');
    await page.waitForLoadState('networkidle');

    // Fill quote form using id selectors
    const titleInput = page.locator('#title');
    if (await titleInput.isVisible()) {
      await titleInput.fill(TEST_QUOTE.title + ' ' + Date.now());
    }

    // Select client using combobox pattern
    const clientTrigger = page.getByRole('combobox', { name: /client/i });
    if (await clientTrigger.isVisible()) {
      await clientTrigger.click();
      // Select from dropdown
      const clientOption = page.getByRole('option').filter({ hasText: new RegExp(testClient.name, 'i') });
      if (await clientOption.isVisible()) {
        await clientOption.click();
      }
    }

    // Save quote
    const saveButton = page.getByRole('button', { name: /save|create/i });
    await saveButton.click();

    // Wait for redirect
    await page.waitForURL(/\/quotes\/[a-z0-9-]+/);
    const url = page.url();
    const id = url.split('/quotes/')[1]?.split('?')[0] || '';

    // Get quote number from page
    const quoteNumberEl = page.locator('[data-testid="quote-number"]');
    const quoteNumber = await quoteNumberEl.isVisible()
      ? await quoteNumberEl.textContent() || 'QT-0001'
      : 'QT-0001';

    const quoteData = {
      id,
      quoteNumber,
    };

    await use(quoteData);

    // Cleanup
    try {
      await page.goto(`/quotes/${id}`);
      const deleteButton = page.getByRole('button', { name: /delete/i });
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        const confirmButton = page.getByRole('button', { name: /confirm|delete/i });
        await confirmButton.click();
      }
    } catch {
      // Ignore cleanup errors
    }
  },

  // Create a test invoice
  testInvoice: async ({ page, testClient }, use) => {
    await page.goto('/invoices/new');
    await page.waitForLoadState('networkidle');

    // Fill invoice form using id selectors
    const titleInput = page.locator('#title');
    if (await titleInput.isVisible()) {
      await titleInput.fill(TEST_INVOICE.title + ' ' + Date.now());
    }

    // Select client using combobox pattern
    const clientTrigger = page.getByRole('combobox', { name: /client/i });
    if (await clientTrigger.isVisible()) {
      await clientTrigger.click();
      const clientOption = page.getByRole('option').filter({ hasText: new RegExp(testClient.name, 'i') });
      if (await clientOption.isVisible()) {
        await clientOption.click();
      }
    }

    // Set due date
    const dueDateInput = page.locator('#dueDate, input[type="date"]');
    if (await dueDateInput.isVisible()) {
      await dueDateInput.fill(TEST_INVOICE.dueDate!);
    }

    // Add line item
    const addItemButton = page.getByRole('button', { name: /add.*item/i });
    if (await addItemButton.isVisible()) {
      await addItemButton.click();
      // Fill line item fields
      const itemNameInput = page.locator('input').filter({ has: page.locator('[placeholder*="item"], [placeholder*="description"]') }).first();
      if (await itemNameInput.isVisible()) {
        await itemNameInput.fill(TEST_INVOICE.lineItems[0]!.name);
      }
    }

    // Save invoice
    const saveButton = page.getByRole('button', { name: /save|create/i });
    await saveButton.click();

    await page.waitForURL(/\/invoices\/[a-z0-9-]+/);
    const url = page.url();
    const id = url.split('/invoices/')[1]?.split('?')[0] || '';

    const invoiceNumberEl = page.locator('[data-testid="invoice-number"]');
    const invoiceNumber = await invoiceNumberEl.isVisible()
      ? await invoiceNumberEl.textContent() || 'INV-0001'
      : 'INV-0001';

    const invoiceData = {
      id,
      invoiceNumber,
    };

    await use(invoiceData);

    // Cleanup
    try {
      await page.goto(`/invoices/${id}`);
      const deleteButton = page.getByRole('button', { name: /delete/i });
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        const confirmButton = page.getByRole('button', { name: /confirm|delete/i });
        await confirmButton.click();
      }
    } catch {
      // Ignore cleanup errors
    }
  },

  // Create a test rate card
  testRateCard: async ({ page }, use) => {
    await page.goto('/rate-cards/new');
    await page.waitForLoadState('networkidle');

    // Fill rate card form using id selectors
    const nameInput = page.locator('#name');
    if (await nameInput.isVisible()) {
      await nameInput.fill(TEST_RATE_CARD.name + ' ' + Date.now());
    }

    const descInput = page.locator('#description, textarea');
    if (await descInput.isVisible()) {
      await descInput.first().fill(TEST_RATE_CARD.description);
    }

    // Add items
    const addButton = page.getByRole('button', { name: /add.*item/i });
    for (const item of TEST_RATE_CARD.items) {
      if (await addButton.isVisible()) {
        await addButton.click();
      }
    }

    // Save
    const saveButton = page.getByRole('button', { name: /save|create/i });
    await saveButton.click();

    await page.waitForURL(/\/rate-cards\/[a-z0-9-]+/);
    const url = page.url();
    const id = url.split('/rate-cards/')[1]?.split('?')[0] || '';

    const rateCardData = {
      id,
      name: TEST_RATE_CARD.name,
    };

    await use(rateCardData);

    // Cleanup
    try {
      await page.goto(`/rate-cards/${id}`);
      const deleteButton = page.getByRole('button', { name: /delete/i });
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        const confirmButton = page.getByRole('button', { name: /confirm|delete/i });
        await confirmButton.click();
      }
    } catch {
      // Ignore cleanup errors
    }
  },

  // Cleanup helper
  cleanupTestData: async ({ page }, use) => {
    const cleanup = async () => {
      // This would clean up any test data created during the test
      // For now, individual fixtures handle their own cleanup
      console.log('Cleaning up test data...');
    };

    await use(cleanup);
  },
});

export { expect };
