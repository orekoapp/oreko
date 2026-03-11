import { test as base, expect } from '@playwright/test';

/**
 * Edge Case Data Fixture for Data Integrity Testing
 *
 * This fixture provides access to pre-seeded edge case data that tests
 * null/deleted client handling and other boundary conditions.
 *
 * IMPORTANT: This data must be seeded before running tests:
 *   SEED_EDGE_CASES=true npx tsx e2e/utils/seed-e2e-data.ts
 *
 * The fixture provides:
 * - Typed IDs for all edge case entities
 * - Verification utilities to ensure data exists
 * - Helpers for testing data integrity scenarios
 */

// ============================================================================
// EDGE CASE IDS - Pre-seeded data identifiers
// ============================================================================

export const EDGE_CASE_IDS = {
  // Clients
  DELETED_CLIENT: 'e2e-deleted-client',
  CLIENT_NO_COMPANY: 'e2e-client-no-company',

  // Quotes with edge case clients
  QUOTE_DELETED_CLIENT: 'e2e-quote-deleted-client',
  QUOTE_NO_COMPANY_CLIENT: 'e2e-quote-no-company',

  // Invoices with edge case clients
  INVOICE_DELETED_CLIENT: 'e2e-invoice-deleted-client',
  INVOICE_NO_COMPANY_CLIENT: 'e2e-invoice-no-company',

  // Quote numbers (for searching in lists)
  QUOTE_NUMBER_DELETED_CLIENT: 'Q-EDGE-001',
  QUOTE_NUMBER_NO_COMPANY: 'Q-EDGE-002',

  // Invoice numbers (for searching in lists)
  INVOICE_NUMBER_DELETED_CLIENT: 'INV-EDGE-001',
  INVOICE_NUMBER_NO_COMPANY: 'INV-EDGE-002',
} as const;

// ============================================================================
// EDGE CASE PATTERNS - What to look for in error states
// ============================================================================

export const ERROR_PATTERNS = {
  // Server Component crash indicators
  SERVER_ERROR_TEXT: [
    'Application error',
    'Server Error',
    'Internal Server Error',
    '500',
    'Something went wrong',
    'Error:',
  ],

  // TypeErrors that indicate null reference bugs
  NULL_REFERENCE_PATTERNS: [
    'Cannot read properties of null',
    'Cannot read properties of undefined',
    'null is not an object',
    'undefined is not an object',
    "Cannot read property 'name' of null",
    "Cannot read property 'company' of null",
  ],

  // Rendered null values that indicate missing graceful fallbacks
  RENDERED_NULL_PATTERNS: [
    'undefined',
    'null',
    '[object Object]',
  ],
} as const;

// ============================================================================
// FIXTURE TYPES
// ============================================================================

type EdgeCaseFixtures = {
  edgeCaseIds: typeof EDGE_CASE_IDS;
  verifyEdgeCaseDataExists: () => Promise<boolean>;
  assertNoServerError: (context?: string) => Promise<void>;
  assertNoRenderedNull: (selector?: string) => Promise<void>;
  assertDataIntegrity: (selector: string, expectedFields: string[]) => Promise<void>;
};

// ============================================================================
// EXTENDED TEST WITH EDGE CASE FIXTURES
// ============================================================================

export const test = base.extend<EdgeCaseFixtures>({
  // Expose edge case IDs for use in tests
  edgeCaseIds: async ({}, use) => {
    await use(EDGE_CASE_IDS);
  },

  // Verify that edge case data exists in the database
  verifyEdgeCaseDataExists: async ({ page, request }, use) => {
    const verify = async (): Promise<boolean> => {
      // Check if edge case quotes exist by navigating to the quotes page
      // and looking for our edge case quote numbers
      try {
        // Try to access the quotes API or page
        await page.goto('/quotes');
        await page.waitForLoadState('networkidle');

        // Search for our edge case quote
        const searchInput = page.getByPlaceholder(/search/i);
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill(EDGE_CASE_IDS.QUOTE_NUMBER_DELETED_CLIENT);
          await page.waitForLoadState('networkidle');

          // Check if the quote appears
          const quoteRow = page.getByText(EDGE_CASE_IDS.QUOTE_NUMBER_DELETED_CLIENT);
          if (await quoteRow.isVisible({ timeout: 2000 })) {
            return true;
          }
        }

        // If search didn't work, check the URL for direct access
        const response = await request.get(
          `/api/quotes?search=${EDGE_CASE_IDS.QUOTE_NUMBER_DELETED_CLIENT}`
        );

        if (response.ok()) {
          const data = await response.json();
          return data.quotes?.length > 0;
        }

        console.warn('Edge case data not found. Run: SEED_EDGE_CASES=true npx tsx e2e/utils/seed-e2e-data.ts');
        return false;
      } catch (error) {
        console.warn('Error verifying edge case data:', error);
        return false;
      }
    };

    await use(verify);
  },

  // Assert that no server error is displayed on the current page
  assertNoServerError: async ({ page }, use) => {
    const assertNoError = async (context?: string) => {
      const pageContent = await page.content();
      const bodyText = await page.locator('body').textContent() || '';

      // Check for server error patterns
      for (const pattern of ERROR_PATTERNS.SERVER_ERROR_TEXT) {
        if (bodyText.includes(pattern)) {
          // Allow certain expected occurrences (e.g., in page titles)
          const allowedPatterns = ['Error Boundaries', 'Error Handling'];
          const isAllowed = allowedPatterns.some((p) => bodyText.includes(p));

          if (!isAllowed) {
            throw new Error(
              `Server error detected${context ? ` (${context})` : ''}: "${pattern}" found on page.\n` +
              `URL: ${page.url()}\n` +
              `Body excerpt: ${bodyText.substring(0, 500)}`
            );
          }
        }
      }

      // Check for null reference TypeErrors in rendered content
      for (const pattern of ERROR_PATTERNS.NULL_REFERENCE_PATTERNS) {
        if (pageContent.includes(pattern)) {
          throw new Error(
            `Null reference error detected${context ? ` (${context})` : ''}: "${pattern}" found in page content.\n` +
            `URL: ${page.url()}`
          );
        }
      }
    };

    await use(assertNoError);
  },

  // Assert that no null/undefined values are rendered in visible text
  assertNoRenderedNull: async ({ page }, use) => {
    const assertNoNull = async (selector?: string) => {
      const locator = selector ? page.locator(selector) : page.locator('body');
      const text = await locator.textContent() || '';

      // Skip if selector doesn't exist
      if (selector && !(await locator.count())) {
        return;
      }

      // Check for rendered null patterns (but not in code blocks or specific contexts)
      for (const pattern of ERROR_PATTERNS.RENDERED_NULL_PATTERNS) {
        // Use regex to find standalone occurrences (not part of other words)
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const matches = text.match(regex);

        if (matches && matches.length > 0) {
          // Allow some false positives (e.g., "nullable", "undefined behavior" in docs)
          const allowedContexts = [
            'nullable',
            'nullish',
            'undefined behavior',
            'never undefined',
            'not null',
          ];
          const textLower = text.toLowerCase();
          const isAllowedContext = allowedContexts.some((ctx) =>
            textLower.includes(ctx)
          );

          if (!isAllowedContext) {
            throw new Error(
              `Rendered null value detected: "${pattern}" found in ${selector || 'body'}.\n` +
              `URL: ${page.url()}\n` +
              `Text excerpt: ${text.substring(0, 300)}`
            );
          }
        }
      }
    };

    await use(assertNoNull);
  },

  // Assert that a data card/row has expected fields with non-null values
  assertDataIntegrity: async ({ page }, use) => {
    const assertIntegrity = async (selector: string, expectedFields: string[]) => {
      const element = page.locator(selector);

      // Verify element exists
      await expect(element).toBeVisible({
        timeout: 5000,
      });

      const text = await element.textContent() || '';

      // Check for null patterns
      for (const pattern of ERROR_PATTERNS.RENDERED_NULL_PATTERNS) {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        if (regex.test(text)) {
          throw new Error(
            `Data integrity violation in ${selector}: Found "${pattern}" in rendered content.\n` +
            `Content: ${text.substring(0, 200)}`
          );
        }
      }

      // Verify expected fields are present (not empty)
      for (const field of expectedFields) {
        // Look for the field label or value
        const fieldExists =
          text.toLowerCase().includes(field.toLowerCase()) ||
          await element.locator(`text="${field}"`).count() > 0;

        // This is informational, not a hard failure
        if (!fieldExists) {
          console.warn(`Expected field "${field}" not found in ${selector}`);
        }
      }
    };

    await use(assertIntegrity);
  },
});

export { expect };

// ============================================================================
// UTILITY FUNCTIONS FOR USE OUTSIDE FIXTURES
// ============================================================================

/**
 * Check if a page has any server component errors
 */
export async function hasServerError(page: import('@playwright/test').Page): Promise<boolean> {
  const bodyText = await page.locator('body').textContent() || '';

  for (const pattern of ERROR_PATTERNS.SERVER_ERROR_TEXT) {
    if (bodyText.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Get all visible null/undefined renders on a page
 */
export async function findRenderedNulls(
  page: import('@playwright/test').Page
): Promise<string[]> {
  const bodyText = await page.locator('body').textContent() || '';
  const found: string[] = [];

  for (const pattern of ERROR_PATTERNS.RENDERED_NULL_PATTERNS) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    const matches = bodyText.match(regex);
    if (matches) {
      found.push(...matches);
    }
  }

  return found;
}

/**
 * Navigate to a page and verify no server errors
 */
export async function safeNavigate(
  page: import('@playwright/test').Page,
  url: string
): Promise<void> {
  await page.goto(url);
  await page.waitForLoadState('networkidle');

  // Check for server errors
  const hasError = await hasServerError(page);
  if (hasError) {
    throw new Error(`Server error on navigation to ${url}`);
  }
}
