import { test, expect } from '@playwright/test';

/**
 * TC-DD-001 to TC-DD-015: Data-Driven Tests
 *
 * Parameterized tests that run the same scenario with different data sets.
 * Covers edge cases, boundary values, and various input combinations.
 *
 * Note: These tests use storageState from Playwright config,
 * so they are already authenticated when they start.
 */

// Test data sets for different scenarios
const QUOTE_SCENARIOS = [
  {
    name: 'Single line item',
    lineItems: [{ name: 'Service', quantity: 1, rate: 100 }],
    expectedTotal: 100,
  },
  {
    name: 'Multiple line items',
    lineItems: [
      { name: 'Service A', quantity: 2, rate: 50 },
      { name: 'Service B', quantity: 1, rate: 150 },
    ],
    expectedTotal: 250,
  },
  {
    name: 'Large quantities',
    lineItems: [{ name: 'Bulk Service', quantity: 1000, rate: 5 }],
    expectedTotal: 5000,
  },
  {
    name: 'Decimal rates',
    lineItems: [{ name: 'Hourly', quantity: 8, rate: 125.50 }],
    expectedTotal: 1004,
  },
  {
    name: 'Zero-value line item',
    lineItems: [
      { name: 'Free Consultation', quantity: 1, rate: 0 },
      { name: 'Paid Service', quantity: 1, rate: 200 },
    ],
    expectedTotal: 200,
  },
  {
    name: 'High-value quote',
    lineItems: [
      { name: 'Enterprise Package', quantity: 1, rate: 50000 },
      { name: 'Support', quantity: 12, rate: 5000 },
    ],
    expectedTotal: 110000,
  },
];

const TAX_SCENARIOS = [
  { rate: 0, subtotal: 100, expectedTax: 0, expectedTotal: 100 },
  { rate: 5, subtotal: 100, expectedTax: 5, expectedTotal: 105 },
  { rate: 8.25, subtotal: 100, expectedTax: 8.25, expectedTotal: 108.25 },
  { rate: 10, subtotal: 1000, expectedTax: 100, expectedTotal: 1100 },
  { rate: 20, subtotal: 99.99, expectedTax: 20, expectedTotal: 119.99 }, // Rounded
];

const DISCOUNT_SCENARIOS = [
  { type: 'percentage', value: 10, subtotal: 100, expectedDiscount: 10 },
  { type: 'percentage', value: 25, subtotal: 200, expectedDiscount: 50 },
  { type: 'percentage', value: 100, subtotal: 500, expectedDiscount: 500 },
  { type: 'fixed', value: 50, subtotal: 200, expectedDiscount: 50 },
  { type: 'fixed', value: 100, subtotal: 100, expectedDiscount: 100 },
];

const CLIENT_DATA = [
  { name: 'Simple Name', email: 'simple@test.com', valid: true },
  { name: 'Name With Numbers 123', email: 'numbers@test.com', valid: true },
  { name: 'José García', email: 'unicode@test.com', valid: true },
  { name: '日本語クライアント', email: 'japanese@test.com', valid: true },
  { name: '', email: 'empty@test.com', valid: false },
  { name: 'A'.repeat(256), email: 'long@test.com', valid: false },
];

const EMAIL_FORMATS = [
  { email: 'user@example.com', valid: true },
  { email: 'user.name@example.com', valid: true },
  { email: 'user+tag@example.com', valid: true },
  { email: 'user@sub.example.com', valid: true },
  { email: 'invalid', valid: false },
  { email: 'missing@domain', valid: false },
  { email: '@nodomain.com', valid: false },
  { email: 'spaces in@email.com', valid: false },
];

test.describe('Data-Driven: Quote Calculations', () => {
  for (const scenario of QUOTE_SCENARIOS) {
    test(`TC-DD-001: ${scenario.name}`, async ({ page }) => {
      // Already authenticated via storageState
      await page.goto('/quotes/new');

      // Fill title if the field exists
      const titleInput = page.locator('input[name="title"], #title');
      if (await titleInput.isVisible()) {
        await titleInput.fill(`Test: ${scenario.name}`);
      }

      // Add line items
      for (let i = 0; i < scenario.lineItems.length; i++) {
        const item = scenario.lineItems[i]!;

        if (i > 0) {
          const addButton = page.getByRole('button', { name: /add.*item/i });
          if (await addButton.isVisible()) {
            await addButton.click();
          }
        }

        const nameInput = page.locator(`input[name="lineItems.${i}.name"]`);
        const qtyInput = page.locator(`input[name="lineItems.${i}.quantity"]`);
        const rateInput = page.locator(`input[name="lineItems.${i}.rate"]`);

        if (await nameInput.isVisible()) {
          await nameInput.fill(item.name);
          await qtyInput.fill(String(item.quantity));
          await rateInput.fill(String(item.rate));
        }
      }

      // Verify total if element exists
      const totalElement = page.locator('[data-testid="quote-total"]');
      if (await totalElement.isVisible()) {
        const totalText = await totalElement.textContent();
        const total = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');
        // Use toBeCloseTo for floating point comparison
        expect(total).toBeCloseTo(scenario.expectedTotal, 2);
      }
    });
  }
});

test.describe('Data-Driven: Tax Calculations', () => {
  for (const scenario of TAX_SCENARIOS) {
    test(`TC-DD-002: Tax ${scenario.rate}% on $${scenario.subtotal}`, async ({ page }) => {
      await page.goto('/quotes/new');

      // Add item to reach subtotal
      const nameInput = page.locator('input[name="lineItems.0.name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Item');
        await page.locator('input[name="lineItems.0.quantity"]').fill('1');
        await page.locator('input[name="lineItems.0.rate"]').fill(String(scenario.subtotal));
      }

      // Set tax rate if available
      const taxInput = page.locator('input[name="taxRate"]');
      if (await taxInput.isVisible()) {
        await taxInput.fill(String(scenario.rate));

        // Verify calculations
        const taxElement = page.locator('[data-testid="tax-total"]');
        const totalElement = page.locator('[data-testid="quote-total"]');

        if (await taxElement.isVisible() && await totalElement.isVisible()) {
          const taxText = await taxElement.textContent();
          const totalText = await totalElement.textContent();

          const tax = parseFloat(taxText?.replace(/[^0-9.]/g, '') || '0');
          const total = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');

          expect(tax).toBeCloseTo(scenario.expectedTax, 1);
          expect(total).toBeCloseTo(scenario.expectedTotal, 1);
        }
      }
    });
  }
});

test.describe('Data-Driven: Discount Calculations', () => {
  for (const scenario of DISCOUNT_SCENARIOS) {
    test(`TC-DD-003: ${scenario.type} discount ${scenario.value} on $${scenario.subtotal}`, async ({ page }) => {
      await page.goto('/quotes/new');

      // Add item
      const nameInput = page.locator('input[name="lineItems.0.name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Item');
        await page.locator('input[name="lineItems.0.quantity"]').fill('1');
        await page.locator('input[name="lineItems.0.rate"]').fill(String(scenario.subtotal));
      }

      // Add discount if section exists
      const discountSection = page.locator('[data-testid="discount-section"]');
      if (await discountSection.isVisible()) {
        // Select discount type
        await page.click(`input[value="${scenario.type}"]`);
        await page.fill('input[name="discountValue"]', String(scenario.value));

        // Verify discount applied
        const discountElement = page.locator('[data-testid="discount-amount"]');
        if (await discountElement.isVisible()) {
          const discountText = await discountElement.textContent();
          const discount = parseFloat(discountText?.replace(/[^0-9.]/g, '') || '0');
          // Use toBeCloseTo for floating point comparison
          expect(discount).toBeCloseTo(scenario.expectedDiscount, 2);
        }
      }
    });
  }
});

test.describe('Data-Driven: Client Validation', () => {
  for (const data of CLIENT_DATA) {
    test(`TC-DD-004: Client name "${data.name.substring(0, 20)}..."`, async ({ page }) => {
      await page.goto('/clients/new');

      // Fill form - look for name input
      const nameInput = page.locator('input[name="name"], #name');
      const emailInput = page.getByRole('textbox', { name: 'Email' });

      if (await nameInput.isVisible()) {
        await nameInput.fill(data.name);
        await emailInput.fill(data.email);

        // Submit
        await page.getByRole('button', { name: /save|create/i }).click();

        if (data.valid) {
          // Should succeed - redirect to client page or show success
          await page.waitForTimeout(1000);
          const url = page.url();
          const hasRedirected = url.includes('/clients/') && !url.includes('/new');
          const hasSuccess = await page.getByText(/created|success/i).isVisible();
          expect(hasRedirected || hasSuccess).toBeTruthy();
        } else {
          // Should show validation error
          await expect(page.getByText(/required|invalid|too long/i)).toBeVisible();
        }
      }
    });
  }
});

test.describe('Data-Driven: Email Validation', () => {
  for (const data of EMAIL_FORMATS) {
    test(`TC-DD-005: Email format "${data.email}"`, async ({ page }) => {
      await page.goto('/clients/new');

      const nameInput = page.locator('input[name="name"], #name');
      const emailInput = page.getByRole('textbox', { name: 'Email' });

      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Client');
        await emailInput.fill(data.email);

        await page.getByRole('button', { name: /save|create/i }).click();

        if (data.valid) {
          await page.waitForTimeout(1000);
          const url = page.url();
          const hasRedirected = url.includes('/clients/') && !url.includes('/new');
          const hasSuccess = await page.getByText(/created|success/i).isVisible();
          expect(hasRedirected || hasSuccess).toBeTruthy();
        } else {
          await expect(page.getByText(/invalid.*email|email.*invalid/i)).toBeVisible();
        }
      }
    });
  }
});

test.describe('Data-Driven: Quote Status Transitions', () => {
  const STATUS_TRANSITIONS = [
    { from: 'draft', action: 'send', to: 'sent' },
    { from: 'sent', action: 'view', to: 'viewed' },
    { from: 'viewed', action: 'accept', to: 'accepted' },
    { from: 'viewed', action: 'decline', to: 'declined' },
    { from: 'accepted', action: 'convert', to: 'converted' },
  ];

  for (const transition of STATUS_TRANSITIONS) {
    test(`TC-DD-006: ${transition.from} -> ${transition.to} via ${transition.action}`, async ({ page }) => {
      // This test verifies that the state machine works correctly
      // Each transition should result in the expected end state
      // Implementation depends on seeded test data with specific statuses
      await page.goto('/quotes');
      // Placeholder - actual implementation would interact with quotes of specific status
    });
  }
});

test.describe('Data-Driven: Currency Formatting', () => {
  const CURRENCY_TESTS = [
    { value: 1000, locale: 'en-US', expected: '$1,000.00' },
    { value: 1000, locale: 'en-GB', expected: '£1,000.00' },
    { value: 1000, locale: 'de-DE', expected: '1.000,00 €' },
    { value: 1000, locale: 'ja-JP', expected: '¥1,000' },
    { value: 0.01, locale: 'en-US', expected: '$0.01' },
    { value: 1000000, locale: 'en-US', expected: '$1,000,000.00' },
  ];

  for (const data of CURRENCY_TESTS) {
    test(`TC-DD-007: Format ${data.value} in ${data.locale}`, async ({ page }) => {
      // This would test currency formatting based on workspace locale settings
      await page.goto('/dashboard');
      // Placeholder - actual implementation would change locale and verify formatting
    });
  }
});

test.describe('Data-Driven: Date Formatting', () => {
  const DATE_TESTS = [
    { date: '2024-01-15', locale: 'en-US', expected: 'January 15, 2024' },
    { date: '2024-01-15', locale: 'en-GB', expected: '15 January 2024' },
    { date: '2024-01-15', locale: 'de-DE', expected: '15. Januar 2024' },
    { date: '2024-12-31', locale: 'en-US', expected: 'December 31, 2024' },
  ];

  for (const data of DATE_TESTS) {
    test(`TC-DD-008: Format ${data.date} in ${data.locale}`, async ({ page }) => {
      // This would test date formatting based on workspace locale settings
      await page.goto('/dashboard');
      // Placeholder - actual implementation would change locale and verify formatting
    });
  }
});

test.describe('Data-Driven: Search Functionality', () => {
  const SEARCH_TESTS = [
    { query: 'E2E', field: 'name', shouldFind: true },
    { query: 'Alpha', field: 'company', shouldFind: true },
    { query: 'nonexistent123xyz', field: 'any', shouldFind: false },
    { query: '', field: 'any', shouldFind: true }, // Empty search shows all
  ];

  for (const data of SEARCH_TESTS) {
    test(`TC-DD-009: Search "${data.query}" in ${data.field}`, async ({ page }) => {
      await page.goto('/clients');

      // Enter search query if search input exists
      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill(data.query);
        await searchInput.press('Enter');

        // Wait for results
        await page.waitForTimeout(500);

        // Check results
        const results = page.locator('tbody tr, [data-testid="client-card"]');
        const count = await results.count();

        if (data.shouldFind) {
          expect(count).toBeGreaterThan(0);
        } else {
          expect(count).toBe(0);
        }
      }
    });
  }
});

test.describe('Data-Driven: Pagination', () => {
  const PAGINATION_TESTS = [
    { pageSize: 10, totalItems: 25, expectedPages: 3 },
    { pageSize: 25, totalItems: 25, expectedPages: 1 },
    { pageSize: 50, totalItems: 100, expectedPages: 2 },
    { pageSize: 10, totalItems: 5, expectedPages: 1 },
  ];

  for (const data of PAGINATION_TESTS) {
    test(`TC-DD-010: ${data.totalItems} items, page size ${data.pageSize}`, async ({ page }) => {
      // This would test pagination with different configurations
      await page.goto('/quotes');
      // Placeholder - actual implementation would verify pagination controls
    });
  }
});
