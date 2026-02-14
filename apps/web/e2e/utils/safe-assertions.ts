import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Safe Assertions Utility
 *
 * This module provides assertion helpers that avoid error-swallowing patterns
 * that were identified as a root cause for bugs escaping to production.
 *
 * ANTI-PATTERNS TO AVOID:
 * ❌ .isVisible().catch(() => false)  - Hides real failures
 * ❌ if (await x.count() > 0) { ... } - Passes silently when empty
 * ❌ .catch(() => {})                  - Swallows errors completely
 * ❌ try { ... } catch { }             - Ignores all failures
 *
 * CORRECT PATTERNS:
 * ✅ assertVisible(locator, message)   - Fails with clear message
 * ✅ assertMinCount(locator, min)      - Explicit count assertion
 * ✅ checkVisibility(locator)          - Returns result with skip reason
 * ✅ requireData(getter, description)  - Asserts data exists
 */

// ============================================================================
// VISIBILITY ASSERTIONS
// ============================================================================

/**
 * Assert that a locator is visible, failing with a clear message if not
 * Replaces: `.isVisible().catch(() => false)` patterns
 */
export async function assertVisible(
  locator: Locator,
  message: string,
  options?: { timeout?: number }
): Promise<void> {
  try {
    await expect(locator).toBeVisible({
      timeout: options?.timeout ?? 5000,
    });
  } catch (error) {
    throw new Error(
      `Visibility assertion failed: ${message}\n` +
      `Locator: ${locator.toString()}\n` +
      `Original error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Assert that a locator is NOT visible
 */
export async function assertNotVisible(
  locator: Locator,
  message: string,
  options?: { timeout?: number }
): Promise<void> {
  try {
    await expect(locator).not.toBeVisible({
      timeout: options?.timeout ?? 5000,
    });
  } catch (error) {
    throw new Error(
      `Not-visible assertion failed: ${message}\n` +
      `Locator: ${locator.toString()}\n` +
      `Element was visible when it should not be`
    );
  }
}

// ============================================================================
// VISIBILITY CHECKS (Non-failing, but with context)
// ============================================================================

export interface VisibilityCheckResult {
  visible: boolean;
  skipReason?: string;
  locatorDescription: string;
}

/**
 * Check visibility without failing, but return structured result
 * Use this for conditional test logic where absence is valid
 *
 * Replaces: `const visible = await el.isVisible().catch(() => false)`
 * With: `const result = await checkVisibility(el, 'Search input')`
 */
export async function checkVisibility(
  locator: Locator,
  description: string,
  options?: { timeout?: number }
): Promise<VisibilityCheckResult> {
  const result: VisibilityCheckResult = {
    visible: false,
    locatorDescription: description,
  };

  try {
    const count = await locator.count();

    if (count === 0) {
      result.skipReason = `Element "${description}" not found in DOM`;
      return result;
    }

    const isVisible = await locator.first().isVisible({
      timeout: options?.timeout ?? 1000,
    });

    if (!isVisible) {
      result.skipReason = `Element "${description}" exists but is not visible`;
      return result;
    }

    result.visible = true;
    return result;
  } catch (error) {
    result.skipReason = `Error checking "${description}": ${error instanceof Error ? error.message : String(error)}`;
    return result;
  }
}

// ============================================================================
// COUNT ASSERTIONS
// ============================================================================

/**
 * Assert a locator has at least N elements
 * Replaces: `if (await locator.count() > 0) { ... }` with no else branch
 */
export async function assertMinCount(
  locator: Locator,
  minCount: number,
  message: string
): Promise<void> {
  const count = await locator.count();

  if (count < minCount) {
    throw new Error(
      `Count assertion failed: ${message}\n` +
      `Expected at least ${minCount} elements, found ${count}\n` +
      `Locator: ${locator.toString()}`
    );
  }
}

/**
 * Assert a locator has exactly N elements
 */
export async function assertExactCount(
  locator: Locator,
  expectedCount: number,
  message: string
): Promise<void> {
  const count = await locator.count();

  if (count !== expectedCount) {
    throw new Error(
      `Exact count assertion failed: ${message}\n` +
      `Expected ${expectedCount} elements, found ${count}\n` +
      `Locator: ${locator.toString()}`
    );
  }
}

/**
 * Assert a locator has elements in a range
 */
export async function assertCountInRange(
  locator: Locator,
  min: number,
  max: number,
  message: string
): Promise<void> {
  const count = await locator.count();

  if (count < min || count > max) {
    throw new Error(
      `Count range assertion failed: ${message}\n` +
      `Expected ${min}-${max} elements, found ${count}\n` +
      `Locator: ${locator.toString()}`
    );
  }
}

// ============================================================================
// DATA ASSERTIONS
// ============================================================================

/**
 * Assert that data exists (not null/undefined)
 * Replaces patterns that silently skip when data is missing
 */
export function requireData<T>(
  data: T | null | undefined,
  description: string
): T {
  if (data === null || data === undefined) {
    throw new Error(
      `Required data missing: ${description}\n` +
      `Expected valid data but got ${data === null ? 'null' : 'undefined'}`
    );
  }
  return data;
}

/**
 * Assert that text content exists and is not empty
 */
export async function assertTextContent(
  locator: Locator,
  message: string,
  options?: { notEmpty?: boolean }
): Promise<string> {
  await assertVisible(locator, message);

  const text = await locator.textContent();

  if (text === null) {
    throw new Error(`Text content is null: ${message}`);
  }

  if (options?.notEmpty && text.trim() === '') {
    throw new Error(`Text content is empty: ${message}`);
  }

  return text;
}

// ============================================================================
// NAVIGATION ASSERTIONS
// ============================================================================

/**
 * Navigate and assert the page loads without errors
 * Replaces: goto() without status checking
 */
export async function navigateAndAssert(
  page: Page,
  url: string,
  options?: {
    timeout?: number;
    waitFor?: 'load' | 'domcontentloaded' | 'networkidle';
    expectedStatus?: number | number[];
  }
): Promise<void> {
  const response = await page.goto(url, {
    timeout: options?.timeout ?? 30000,
    waitUntil: options?.waitFor ?? 'networkidle',
  });

  // Check response status
  if (response) {
    const status = response.status();
    const expectedStatuses = options?.expectedStatus
      ? Array.isArray(options.expectedStatus)
        ? options.expectedStatus
        : [options.expectedStatus]
      : [200, 301, 302, 304]; // Common successful statuses

    if (!expectedStatuses.includes(status) && status >= 400) {
      throw new Error(
        `Navigation failed with status ${status}: ${url}\n` +
        `Expected one of: ${expectedStatuses.join(', ')}`
      );
    }
  }

  // Check for error indicators in page content
  const bodyText = await page.locator('body').textContent();
  const errorPatterns = [
    'Application error',
    'Server Error',
    'Internal Server Error',
  ];

  for (const pattern of errorPatterns) {
    if (bodyText?.includes(pattern)) {
      throw new Error(
        `Page error detected after navigation to ${url}: "${pattern}" found`
      );
    }
  }
}

// ============================================================================
// CONDITIONAL TEST HELPERS
// ============================================================================

export interface ConditionalTestResult {
  executed: boolean;
  skipReason?: string;
  result?: unknown;
}

/**
 * Execute a test block conditionally, but always report the outcome
 * Replaces: if-else chains that silently skip tests
 */
export async function conditionalTest(
  condition: () => Promise<boolean>,
  conditionDescription: string,
  testBlock: () => Promise<unknown>
): Promise<ConditionalTestResult> {
  let conditionMet: boolean;

  try {
    conditionMet = await condition();
  } catch (error) {
    return {
      executed: false,
      skipReason: `Condition check failed for "${conditionDescription}": ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  if (!conditionMet) {
    return {
      executed: false,
      skipReason: `Condition not met: ${conditionDescription}`,
    };
  }

  try {
    const result = await testBlock();
    return { executed: true, result };
  } catch (error) {
    // Re-throw test failures, they shouldn't be swallowed
    throw error;
  }
}

// ============================================================================
// EMPTY STATE ASSERTIONS
// ============================================================================

/**
 * Assert either data exists OR empty state is shown (not neither)
 * Fixes: Tests that pass silently when both data and empty state are missing
 */
export async function assertDataOrEmptyState(
  page: Page,
  config: {
    dataSelector: string;
    emptyStateSelector: string;
    context: string;
  }
): Promise<{ hasData: boolean; isEmpty: boolean }> {
  const dataLocator = page.locator(config.dataSelector);
  const emptyLocator = page.locator(config.emptyStateSelector);

  const dataCount = await dataLocator.count();
  const emptyVisible = await emptyLocator.isVisible().catch(() => false);

  if (dataCount === 0 && !emptyVisible) {
    throw new Error(
      `Neither data nor empty state found: ${config.context}\n` +
      `Data selector: ${config.dataSelector}\n` +
      `Empty state selector: ${config.emptyStateSelector}\n` +
      `This may indicate a page crash or missing UI elements`
    );
  }

  return {
    hasData: dataCount > 0,
    isEmpty: emptyVisible,
  };
}

// ============================================================================
// ERROR BOUNDARY ASSERTIONS
// ============================================================================

/**
 * Assert no error boundary has been triggered
 */
export async function assertNoErrorBoundary(
  page: Page,
  context?: string
): Promise<void> {
  const errorIndicators = [
    page.locator('[data-testid="error-boundary"]'),
    page.locator('.error-boundary'),
    page.getByText('Something went wrong'),
    page.getByText('Application error'),
  ];

  for (const indicator of errorIndicators) {
    const isVisible = await indicator.isVisible().catch(() => false);
    if (isVisible) {
      const errorText = await indicator.textContent();
      throw new Error(
        `Error boundary triggered${context ? ` (${context})` : ''}\n` +
        `Error text: ${errorText}`
      );
    }
  }
}

// ============================================================================
// FORM ASSERTIONS
// ============================================================================

/**
 * Assert form submission result (success or specific error)
 */
export async function assertFormResult(
  page: Page,
  config: {
    submitButton: Locator;
    successIndicator: string | Locator;
    errorIndicator?: string | Locator;
    timeout?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  // Click submit
  await config.submitButton.click();

  const successLocator =
    typeof config.successIndicator === 'string'
      ? page.locator(config.successIndicator)
      : config.successIndicator;

  const errorLocator = config.errorIndicator
    ? typeof config.errorIndicator === 'string'
      ? page.locator(config.errorIndicator)
      : config.errorIndicator
    : null;

  const timeout = config.timeout ?? 10000;

  // Wait for either success or error
  try {
    await Promise.race([
      successLocator.waitFor({ state: 'visible', timeout }),
      errorLocator?.waitFor({ state: 'visible', timeout }),
    ].filter(Boolean));

    const isSuccess = await successLocator.isVisible();

    if (isSuccess) {
      return { success: true };
    }

    if (errorLocator) {
      const errorText = await errorLocator.textContent();
      return { success: false, error: errorText || 'Unknown error' };
    }

    throw new Error('Neither success nor error indicator appeared');
  } catch (error) {
    throw new Error(
      `Form submission result unclear\n` +
      `Original error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
