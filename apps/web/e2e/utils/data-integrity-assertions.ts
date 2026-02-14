import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Data Integrity Assertions Utility
 *
 * This module provides assertions specifically for verifying data integrity
 * in rendered content. It catches issues like:
 * - Undefined/null values rendered as text
 * - Missing required fields
 * - Invalid data formats
 * - Empty containers that should have data
 *
 * These assertions address the root cause of bugs where null client references
 * caused pages to crash or render "undefined" values.
 */

// ============================================================================
// INVALID DATA PATTERNS
// ============================================================================

/**
 * Patterns that indicate invalid data being rendered
 */
export const INVALID_DATA_PATTERNS = {
  // JavaScript null/undefined rendered as text
  NULL_VALUES: ['undefined', 'null', '[object Object]', 'NaN'],

  // Common error indicators
  ERROR_INDICATORS: [
    'Error:',
    'TypeError',
    'ReferenceError',
    'Cannot read',
    'is not defined',
  ],

  // Invalid date formats
  INVALID_DATES: ['Invalid Date', 'NaN-NaN-NaN'],

  // Invalid currency/number formats
  INVALID_NUMBERS: ['$NaN', 'NaN%', '$undefined', '$null'],
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface DataIntegrityViolation {
  type: 'null_value' | 'error_indicator' | 'invalid_date' | 'invalid_number' | 'empty_required';
  pattern: string;
  location: string;
  context: string;
}

export interface CardIntegrityConfig {
  selector: string;
  requiredFields: {
    name: string;
    selector?: string;
    allowEmpty?: boolean;
  }[];
}

export interface ListIntegrityConfig {
  listSelector: string;
  itemSelector: string;
  minItems?: number;
  maxItems?: number;
  perItemChecks?: (item: Locator, index: number) => Promise<void>;
}

// ============================================================================
// CORE ASSERTIONS
// ============================================================================

/**
 * Assert no null/undefined values are rendered in the specified element
 */
export async function assertNoNullRenders(
  locator: Locator,
  context: string
): Promise<void> {
  const text = await locator.textContent() || '';
  const violations: DataIntegrityViolation[] = [];

  for (const pattern of INVALID_DATA_PATTERNS.NULL_VALUES) {
    // Use word boundary to avoid false positives (e.g., "nullable" matching "null")
    const regex = new RegExp(`\\b${escapeRegex(pattern)}\\b`, 'gi');
    const matches = text.match(regex);

    if (matches && matches.length > 0) {
      // Filter out known allowed contexts
      const allowedContexts = [
        'nullable',
        'nullish',
        'not null',
        'non-null',
        'check for null',
        'undefined behavior',
      ];

      const textLower = text.toLowerCase();
      const isAllowed = allowedContexts.some((ctx) =>
        textLower.includes(ctx.toLowerCase())
      );

      if (!isAllowed) {
        violations.push({
          type: 'null_value',
          pattern,
          location: context,
          context: extractContext(text, pattern),
        });
      }
    }
  }

  if (violations.length > 0) {
    const details = violations
      .map((v) => `  - "${v.pattern}" found: ${v.context}`)
      .join('\n');

    throw new Error(
      `Data integrity violation: Null values rendered in ${context}\n` +
      `Violations:\n${details}`
    );
  }
}

/**
 * Assert a card/row has all required fields with valid data
 */
export async function assertCardDataIntegrity(
  page: Page,
  config: CardIntegrityConfig
): Promise<void> {
  const card = page.locator(config.selector);

  // First, verify the card exists
  await expect(card).toBeVisible({
    timeout: 5000,
  });

  // Check for null renders
  await assertNoNullRenders(card, `Card: ${config.selector}`);

  // Check each required field
  for (const field of config.requiredFields) {
    const fieldLocator = field.selector
      ? card.locator(field.selector)
      : card.getByText(new RegExp(field.name, 'i'));

    const fieldExists = await fieldLocator.count() > 0;

    if (!fieldExists && !field.allowEmpty) {
      throw new Error(
        `Required field missing: "${field.name}" not found in ${config.selector}`
      );
    }

    if (fieldExists && !field.allowEmpty) {
      const text = await fieldLocator.textContent();
      if (!text || text.trim() === '') {
        throw new Error(
          `Required field empty: "${field.name}" is empty in ${config.selector}`
        );
      }
    }
  }
}

/**
 * Assert a list has integrity (proper items, no null values)
 */
export async function assertListIntegrity(
  page: Page,
  config: ListIntegrityConfig
): Promise<void> {
  const list = page.locator(config.listSelector);

  // Verify list exists
  await expect(list).toBeVisible({
    timeout: 5000,
  });

  // Get items
  const items = list.locator(config.itemSelector);
  const count = await items.count();

  // Check min/max constraints
  if (config.minItems !== undefined && count < config.minItems) {
    // Log warning but don't fail - empty lists may be valid
    console.warn(
      `List has ${count} items, expected at least ${config.minItems}: ${config.listSelector}`
    );
  }

  if (config.maxItems !== undefined && count > config.maxItems) {
    throw new Error(
      `List has ${count} items, expected at most ${config.maxItems}: ${config.listSelector}`
    );
  }

  // Check each visible item
  const maxToCheck = Math.min(count, 10); // Don't check more than 10 items
  for (let i = 0; i < maxToCheck; i++) {
    const item = items.nth(i);

    // Check for null renders in item
    await assertNoNullRenders(item, `List item ${i + 1}`);

    // Run per-item checks if provided
    if (config.perItemChecks) {
      await config.perItemChecks(item, i);
    }
  }
}

// ============================================================================
// FIELD-SPECIFIC ASSERTIONS
// ============================================================================

/**
 * Assert a client name field is valid (not null, not empty)
 */
export async function assertValidClientName(
  locator: Locator,
  context: string
): Promise<void> {
  const text = await locator.textContent();

  if (!text) {
    throw new Error(`Client name is null: ${context}`);
  }

  const trimmed = text.trim();

  if (trimmed === '') {
    throw new Error(`Client name is empty: ${context}`);
  }

  // Check for common null-render patterns
  const invalidPatterns = ['undefined', 'null', '[object Object]'];
  for (const pattern of invalidPatterns) {
    if (trimmed.toLowerCase() === pattern.toLowerCase()) {
      throw new Error(
        `Client name contains invalid value "${pattern}": ${context}`
      );
    }
  }
}

/**
 * Assert a company name field is valid (can be empty, but not undefined/null)
 */
export async function assertValidCompanyName(
  locator: Locator,
  context: string,
  options?: { allowEmpty?: boolean }
): Promise<void> {
  const text = await locator.textContent();

  // Check for explicit null/undefined text
  if (text) {
    const trimmed = text.trim();
    const invalidPatterns = ['undefined', 'null', '[object Object]'];

    for (const pattern of invalidPatterns) {
      if (trimmed.toLowerCase() === pattern.toLowerCase()) {
        throw new Error(
          `Company name contains invalid value "${pattern}": ${context}`
        );
      }
    }

    // Empty is okay if allowed
    if (!options?.allowEmpty && trimmed === '') {
      throw new Error(`Company name is empty but required: ${context}`);
    }
  }
}

/**
 * Assert a currency amount is valid
 */
export async function assertValidCurrency(
  locator: Locator,
  context: string
): Promise<void> {
  const text = await locator.textContent();

  if (!text) {
    throw new Error(`Currency value is null: ${context}`);
  }

  const trimmed = text.trim();

  // Check for invalid patterns
  const invalidPatterns = ['NaN', 'undefined', 'null', '$NaN', '$undefined', '$null'];
  for (const pattern of invalidPatterns) {
    if (trimmed.includes(pattern)) {
      throw new Error(
        `Currency contains invalid value "${pattern}": ${context}\n` +
        `Full text: ${trimmed}`
      );
    }
  }

  // Verify it looks like a currency value
  const currencyRegex = /^[$€£¥]?[\d,]+(\.\d{2})?$|^[\d,]+(\.\d{2})?\s*[$€£¥]?$/;
  // Remove currency symbols for validation
  const normalized = trimmed.replace(/[$€£¥,\s]/g, '');

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    console.warn(
      `Currency value may be invalid: ${context}\n` +
      `Value: ${trimmed}`
    );
  }
}

/**
 * Assert a date is valid
 */
export async function assertValidDate(
  locator: Locator,
  context: string
): Promise<void> {
  const text = await locator.textContent();

  if (!text) {
    throw new Error(`Date value is null: ${context}`);
  }

  const trimmed = text.trim();

  // Check for invalid patterns
  const invalidPatterns = ['Invalid Date', 'NaN', 'undefined', 'null'];
  for (const pattern of invalidPatterns) {
    if (trimmed.includes(pattern)) {
      throw new Error(
        `Date contains invalid value "${pattern}": ${context}\n` +
        `Full text: ${trimmed}`
      );
    }
  }
}

// ============================================================================
// TABLE/GRID ASSERTIONS
// ============================================================================

/**
 * Assert a data table has integrity
 */
export async function assertTableIntegrity(
  page: Page,
  config: {
    tableSelector: string;
    headerSelector?: string;
    rowSelector: string;
    cellSelector: string;
    expectedColumns?: string[];
    minRows?: number;
  }
): Promise<void> {
  const table = page.locator(config.tableSelector);

  await expect(table).toBeVisible({
    timeout: 5000,
  });

  // Check header if specified
  if (config.expectedColumns && config.headerSelector) {
    const headers = table.locator(config.headerSelector);
    const headerText = await headers.allTextContents();

    for (const expected of config.expectedColumns) {
      const found = headerText.some((h) =>
        h.toLowerCase().includes(expected.toLowerCase())
      );
      if (!found) {
        console.warn(`Expected column "${expected}" not found in table headers`);
      }
    }
  }

  // Check rows
  const rows = table.locator(config.rowSelector);
  const rowCount = await rows.count();

  if (config.minRows !== undefined && rowCount < config.minRows) {
    // This might be okay (empty table), but log it
    console.warn(
      `Table has ${rowCount} rows, expected at least ${config.minRows}`
    );
  }

  // Check first few rows for data integrity
  const rowsToCheck = Math.min(rowCount, 5);
  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows.nth(i);
    const cells = row.locator(config.cellSelector);
    const cellCount = await cells.count();

    for (let j = 0; j < cellCount; j++) {
      const cell = cells.nth(j);
      const text = await cell.textContent() || '';

      // Check for null values in cell
      for (const pattern of INVALID_DATA_PATTERNS.NULL_VALUES) {
        const regex = new RegExp(`\\b${escapeRegex(pattern)}\\b`, 'gi');
        if (regex.test(text)) {
          throw new Error(
            `Data integrity violation in table row ${i + 1}, cell ${j + 1}\n` +
            `Found: "${pattern}"\n` +
            `Cell content: ${text}`
          );
        }
      }
    }
  }
}

// ============================================================================
// PAGE-LEVEL ASSERTIONS
// ============================================================================

/**
 * Assert an entire page has data integrity (no null renders anywhere)
 */
export async function assertPageDataIntegrity(
  page: Page,
  config?: {
    excludeSelectors?: string[];
    focusSelectors?: string[];
  }
): Promise<void> {
  // If focus selectors specified, only check those
  if (config?.focusSelectors && config.focusSelectors.length > 0) {
    for (const selector of config.focusSelectors) {
      const locator = page.locator(selector);
      if (await locator.count() > 0) {
        await assertNoNullRenders(locator, selector);
      }
    }
    return;
  }

  // Otherwise, check main content area
  const mainContent = page.locator('main, [role="main"], .content, #content');
  const useMain = await mainContent.count() > 0;

  const checkLocator = useMain ? mainContent : page.locator('body');

  // Get full text (excluding certain elements)
  let text = await checkLocator.textContent() || '';

  // Remove excluded areas
  if (config?.excludeSelectors) {
    for (const selector of config.excludeSelectors) {
      const excluded = page.locator(selector);
      if (await excluded.count() > 0) {
        const excludedText = await excluded.textContent() || '';
        text = text.replace(excludedText, '');
      }
    }
  }

  // Check for null values
  const violations: string[] = [];

  for (const pattern of INVALID_DATA_PATTERNS.NULL_VALUES) {
    const regex = new RegExp(`\\b${escapeRegex(pattern)}\\b`, 'gi');
    const matches = text.match(regex);

    if (matches && matches.length > 0) {
      violations.push(`"${pattern}" found ${matches.length} time(s)`);
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Page data integrity violations:\n` +
      violations.map((v) => `  - ${v}`).join('\n') +
      `\nURL: ${page.url()}`
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractContext(text: string, pattern: string, length = 50): string {
  const index = text.toLowerCase().indexOf(pattern.toLowerCase());
  if (index === -1) return '';

  const start = Math.max(0, index - length / 2);
  const end = Math.min(text.length, index + pattern.length + length / 2);

  let context = text.substring(start, end);
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';

  return context.replace(/\s+/g, ' ').trim();
}
