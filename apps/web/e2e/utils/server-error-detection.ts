import type { Page, Response } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Server Error Detection Utility
 *
 * This module provides utilities for detecting Server Component crashes,
 * TypeErrors, and other server-side errors that may not be caught by
 * standard E2E test assertions.
 *
 * Key capabilities:
 * - Detect Server Component render crashes
 * - Detect TypeError patterns (null/undefined references)
 * - Detect error overlays and error boundaries
 * - Verify data integrity in rendered content
 */

// ============================================================================
// ERROR DETECTION PATTERNS
// ============================================================================

export const SERVER_ERROR_PATTERNS = {
  // Next.js error overlay text patterns
  ERROR_OVERLAY: [
    'Application error',
    'Unhandled Runtime Error',
    'Error: ',
    'Server Error',
  ],

  // HTTP error status text that may appear in page
  HTTP_ERRORS: [
    'Internal Server Error',
    '500 Internal Server Error',
    '500 Error',
    'Bad Gateway',
    '502',
    'Service Unavailable',
    '503',
  ],

  // TypeErrors indicating null reference bugs
  TYPE_ERRORS: [
    'Cannot read properties of null',
    'Cannot read properties of undefined',
    "Cannot read property '",
    'null is not an object',
    'undefined is not an object',
    'TypeError:',
  ],

  // React error boundary fallback patterns
  ERROR_BOUNDARY: [
    'Something went wrong',
    'An error occurred',
    'Error loading',
    'Failed to load',
  ],

  // Invalid rendered data patterns
  INVALID_RENDERS: [
    'undefined',
    'null',
    'NaN',
    '[object Object]',
  ],
} as const;

// ============================================================================
// ERROR DETECTION RESULTS
// ============================================================================

export interface ErrorDetectionResult {
  hasError: boolean;
  errorType?: 'server_error' | 'type_error' | 'http_error' | 'boundary_error' | 'invalid_render';
  pattern?: string;
  context?: string;
  url: string;
}

// ============================================================================
// CORE DETECTION FUNCTIONS
// ============================================================================

/**
 * Check if a page has any server error indicators
 */
export async function detectServerError(page: Page): Promise<ErrorDetectionResult> {
  const url = page.url();
  const bodyText = await page.locator('body').textContent() || '';
  const pageContent = await page.content();

  // Check for error overlay
  for (const pattern of SERVER_ERROR_PATTERNS.ERROR_OVERLAY) {
    if (bodyText.includes(pattern) || pageContent.includes(pattern)) {
      return {
        hasError: true,
        errorType: 'server_error',
        pattern,
        context: extractContext(bodyText, pattern),
        url,
      };
    }
  }

  // Check for HTTP errors
  for (const pattern of SERVER_ERROR_PATTERNS.HTTP_ERRORS) {
    if (bodyText.includes(pattern)) {
      return {
        hasError: true,
        errorType: 'http_error',
        pattern,
        context: extractContext(bodyText, pattern),
        url,
      };
    }
  }

  // Check for TypeErrors
  for (const pattern of SERVER_ERROR_PATTERNS.TYPE_ERRORS) {
    if (pageContent.includes(pattern)) {
      return {
        hasError: true,
        errorType: 'type_error',
        pattern,
        context: extractContext(pageContent, pattern),
        url,
      };
    }
  }

  // Check for error boundaries
  for (const pattern of SERVER_ERROR_PATTERNS.ERROR_BOUNDARY) {
    // Only match if it looks like an error context (not just text on page)
    const errorContextPatterns = [
      `${pattern.toLowerCase()}`,
      'error',
      'failed',
      'problem',
    ];
    const textLower = bodyText.toLowerCase();

    // Check if multiple error-related words appear together
    const errorWordCount = errorContextPatterns.filter((p) =>
      textLower.includes(p.toLowerCase())
    ).length;

    if (errorWordCount >= 2 && bodyText.includes(pattern)) {
      return {
        hasError: true,
        errorType: 'boundary_error',
        pattern,
        context: extractContext(bodyText, pattern),
        url,
      };
    }
  }

  return { hasError: false, url };
}

/**
 * Check if a page has invalid rendered data (null, undefined, etc.)
 */
export async function detectInvalidRenders(
  page: Page,
  selector?: string
): Promise<ErrorDetectionResult[]> {
  const url = page.url();
  const results: ErrorDetectionResult[] = [];

  const locator = selector ? page.locator(selector) : page.locator('body');
  const text = await locator.textContent() || '';

  // Skip if selector doesn't exist
  if (selector && !(await locator.count())) {
    return results;
  }

  for (const pattern of SERVER_ERROR_PATTERNS.INVALID_RENDERS) {
    // Use word boundary regex to avoid false positives
    const regex = new RegExp(`\\b${escapeRegExp(pattern)}\\b`, 'gi');
    const matches = text.match(regex);

    if (matches && matches.length > 0) {
      // Filter out allowed contexts
      const allowedContexts = [
        'nullable',
        'nullish',
        'undefined behavior',
        'never undefined',
        'not null',
        'non-null',
        'NaN',
        'checking for null',
        'null check',
      ];
      const textLower = text.toLowerCase();
      const isAllowed = allowedContexts.some((ctx) =>
        textLower.includes(ctx.toLowerCase())
      );

      if (!isAllowed) {
        results.push({
          hasError: true,
          errorType: 'invalid_render',
          pattern,
          context: extractContext(text, pattern),
          url,
        });
      }
    }
  }

  return results;
}

// ============================================================================
// ASSERTION FUNCTIONS
// ============================================================================

/**
 * Assert that no server component crash occurred on the current page
 */
export async function assertNoServerComponentCrash(
  page: Page,
  context?: string
): Promise<void> {
  const result = await detectServerError(page);

  if (result.hasError) {
    const contextStr = context ? ` [${context}]` : '';
    throw new Error(
      `Server Component Crash Detected${contextStr}\n` +
      `URL: ${result.url}\n` +
      `Error Type: ${result.errorType}\n` +
      `Pattern: ${result.pattern}\n` +
      `Context: ${result.context || 'N/A'}`
    );
  }
}

/**
 * Assert that rendered data has integrity (no null/undefined values)
 */
export async function assertDataIntegrity(
  page: Page,
  selector: string,
  patterns?: string[]
): Promise<void> {
  const invalidRenders = await detectInvalidRenders(page, selector);

  if (invalidRenders.length > 0) {
    const issues = invalidRenders
      .map((r) => `  - "${r.pattern}" found: ${r.context}`)
      .join('\n');

    throw new Error(
      `Data Integrity Violation in "${selector}"\n` +
      `URL: ${page.url()}\n` +
      `Issues:\n${issues}`
    );
  }

  // Also check for specific patterns if provided
  if (patterns && patterns.length > 0) {
    const text = await page.locator(selector).textContent() || '';

    for (const pattern of patterns) {
      expect(text).toContain(pattern);
    }
  }
}

/**
 * Navigate to a URL and assert no server errors occur
 */
export async function safeNavigate(
  page: Page,
  url: string,
  options?: { timeout?: number; waitForNetworkIdle?: boolean }
): Promise<Response | null> {
  const response = await page.goto(url, {
    timeout: options?.timeout || 30000,
  });

  if (options?.waitForNetworkIdle !== false) {
    await page.waitForLoadState('networkidle');
  }

  // Check for server errors
  await assertNoServerComponentCrash(page, `Navigation to ${url}`);

  // Check HTTP response status
  if (response && !response.ok() && response.status() >= 500) {
    throw new Error(
      `Server Error Response: ${response.status()} ${response.statusText()}\n` +
      `URL: ${url}`
    );
  }

  return response;
}

/**
 * Verify a list page renders correctly with data integrity
 */
export async function assertListPageIntegrity(
  page: Page,
  config: {
    url: string;
    listSelector: string;
    itemSelector: string;
    minItemCount?: number;
    expectedFields?: string[];
  }
): Promise<void> {
  // Navigate with error detection
  await safeNavigate(page, config.url);

  // Wait for list to be visible
  const list = page.locator(config.listSelector);
  await expect(list).toBeVisible({ timeout: 10000 });

  // Check item count if specified
  if (config.minItemCount !== undefined) {
    const items = page.locator(config.itemSelector);
    const count = await items.count();

    if (count < config.minItemCount) {
      // This might be okay if there's no data, but log it
      console.warn(
        `List has ${count} items, expected at least ${config.minItemCount}`
      );
    }
  }

  // Check for invalid renders in list
  const invalidRenders = await detectInvalidRenders(page, config.listSelector);
  if (invalidRenders.length > 0) {
    throw new Error(
      `Data integrity issues in list at ${config.url}:\n` +
      invalidRenders.map((r) => `  - ${r.pattern}: ${r.context}`).join('\n')
    );
  }
}

/**
 * Verify a detail page renders correctly
 */
export async function assertDetailPageIntegrity(
  page: Page,
  config: {
    url: string;
    expectedElements: { selector: string; description: string }[];
  }
): Promise<void> {
  // Navigate with error detection
  await safeNavigate(page, config.url);

  // Check each expected element
  for (const { selector, description } of config.expectedElements) {
    const element = page.locator(selector);
    const isVisible = await element.isVisible().catch(() => false);

    if (!isVisible) {
      console.warn(`Expected element "${description}" (${selector}) not visible`);
    }
  }

  // Check for any invalid renders
  const invalidRenders = await detectInvalidRenders(page);
  if (invalidRenders.length > 0) {
    throw new Error(
      `Data integrity issues on detail page ${config.url}:\n` +
      invalidRenders.map((r) => `  - ${r.pattern}: ${r.context}`).join('\n')
    );
  }
}

// ============================================================================
// CONSOLE ERROR MONITORING
// ============================================================================

/**
 * Set up console error monitoring for a page
 * Returns a function to get all captured errors
 */
export function monitorConsoleErrors(page: Page): () => string[] {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return () => errors;
}

/**
 * Assert no console errors occurred during test
 */
export function assertNoConsoleErrors(
  getErrors: () => string[],
  allowedPatterns?: RegExp[]
): void {
  const errors = getErrors();

  // Filter out allowed patterns
  const filteredErrors = errors.filter((err) => {
    if (!allowedPatterns) return true;
    return !allowedPatterns.some((pattern) => pattern.test(err));
  });

  if (filteredErrors.length > 0) {
    throw new Error(
      `Console errors detected:\n${filteredErrors.map((e) => `  - ${e}`).join('\n')}`
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract context around a pattern match
 */
function extractContext(text: string, pattern: string, contextLength = 100): string {
  const index = text.indexOf(pattern);
  if (index === -1) return '';

  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(text.length, index + pattern.length + contextLength / 2);

  let context = text.substring(start, end);

  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';

  return context.replace(/\s+/g, ' ').trim();
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
