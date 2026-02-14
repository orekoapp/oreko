# E2E Testing Guidelines

This document provides comprehensive guidelines for writing effective E2E tests that catch bugs before they reach production.

## Table of Contents

1. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
2. [Correct Patterns](#correct-patterns)
3. [Utility Functions](#utility-functions)
4. [Test Coverage Requirements](#test-coverage-requirements)
5. [Running Tests](#running-tests)
6. [Directory Structure](#directory-structure)

---

## Anti-Patterns to Avoid

These patterns were identified as root causes for bugs escaping to production. **Never use these patterns in tests.**

### 1. Error-Swallowing with `.catch(() => false)`

```typescript
// ❌ BAD: Hides real failures
const isVisible = await element.isVisible().catch(() => false);
if (isVisible) {
  // test passes even if element doesn't exist
}

// ✅ GOOD: Use assertVisible with clear error message
import { assertVisible } from './utils/safe-assertions';
await assertVisible(element, 'Expected dashboard card to be visible');
```

### 2. Silent Conditional Tests

```typescript
// ❌ BAD: Test passes silently when data is missing
const cards = await page.locator('.client-card').count();
if (cards > 0) {
  await expect(page.locator('.client-card').first()).toBeVisible();
}
// If cards === 0, test passes without checking anything!

// ✅ GOOD: Explicit assertion on count
import { assertMinCount } from './utils/safe-assertions';
await assertMinCount(
  page.locator('.client-card'),
  1,
  'Expected at least one client card on dashboard'
);
```

### 3. Empty Catch Blocks

```typescript
// ❌ BAD: Swallows all errors
try {
  await page.click('#submit-button');
} catch {
  // Silent failure - test continues as if nothing happened
}

// ✅ GOOD: Let errors propagate or handle explicitly
await page.click('#submit-button');
// If button doesn't exist, test fails with clear error
```

### 4. Happy Path Only Testing

```typescript
// ❌ BAD: Only tests with perfect data
test('should display quote', async () => {
  // Uses pre-seeded quote that always has a valid client
  await page.goto('/quotes/e2e-valid-quote');
  await expect(page.getByText('Client Name')).toBeVisible();
});

// ✅ GOOD: Also test edge cases
test('should handle quote with deleted client', async () => {
  await page.goto('/quotes/e2e-quote-deleted-client');
  // Verify page doesn't crash and shows graceful fallback
  await assertNoServerComponentCrash(page, 'Quote with deleted client');
});
```

### 5. Missing Data Integrity Checks

```typescript
// ❌ BAD: Only checks existence, not content
await expect(page.locator('.client-name')).toBeVisible();
// Passes even if it shows "undefined" or "null"

// ✅ GOOD: Verify actual content is valid
import { assertNoNullRenders, assertValidClientName } from './utils/data-integrity-assertions';
const clientName = page.locator('.client-name');
await expect(clientName).toBeVisible();
await assertNoNullRenders(clientName, 'Client name field');
```

### 6. No Server Error Detection

```typescript
// ❌ BAD: Doesn't detect Server Component crashes
await page.goto('/dashboard');
await expect(page.locator('h1')).toHaveText('Dashboard');
// Page might show error overlay but test passes if h1 exists

// ✅ GOOD: Detect server errors and invalid renders
import { assertNoServerComponentCrash } from './utils/server-error-detection';
await page.goto('/dashboard');
await assertNoServerComponentCrash(page, 'Dashboard page');
await expect(page.locator('h1')).toHaveText('Dashboard');
```

---

## Correct Patterns

### Pattern 1: Safe Navigation

```typescript
import { safeNavigate } from './utils/server-error-detection';

test('should load dashboard', async ({ page }) => {
  // safeNavigate checks for server errors after navigation
  await safeNavigate(page, '/dashboard');

  // Now safe to make assertions
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

### Pattern 2: Data Integrity Verification

```typescript
import { assertPageDataIntegrity, assertCardDataIntegrity } from './utils/data-integrity-assertions';

test('should display quote list with valid data', async ({ page }) => {
  await page.goto('/quotes');

  // Check entire page for null/undefined renders
  await assertPageDataIntegrity(page, {
    focusSelectors: ['[data-testid="quotes-table"]', '.quote-card'],
  });

  // Check specific card structure
  await assertCardDataIntegrity(page, {
    selector: '[data-testid="quote-card"]',
    requiredFields: [
      { name: 'Client', selector: '.client-name' },
      { name: 'Amount', selector: '.total-amount' },
      { name: 'Status', selector: '.status-badge' },
    ],
  });
});
```

### Pattern 3: Explicit Empty State Handling

```typescript
import { assertDataOrEmptyState } from './utils/safe-assertions';

test('should show quotes or empty state', async ({ page }) => {
  await page.goto('/quotes');

  // Explicitly check for either data or empty state
  const result = await assertDataOrEmptyState(page, {
    dataSelector: '[data-testid="quote-row"]',
    emptyStateSelector: '[data-testid="empty-state"]',
    context: 'Quotes list',
  });

  if (result.hasData) {
    // Test data-specific assertions
    await assertNoNullRenders(page.locator('[data-testid="quote-row"]').first(), 'Quote row');
  } else {
    // Test empty state content
    await expect(page.getByText('No quotes yet')).toBeVisible();
  }
});
```

### Pattern 4: Conditional Tests with Visibility Check

```typescript
import { checkVisibility, conditionalTest } from './utils/safe-assertions';

test('should handle optional search feature', async ({ page }) => {
  await page.goto('/quotes');

  const result = await conditionalTest(
    async () => {
      const visibility = await checkVisibility(
        page.locator('[data-testid="search-input"]'),
        'Search input'
      );
      return visibility.visible;
    },
    'Search feature is available',
    async () => {
      // Test search functionality
      await page.fill('[data-testid="search-input"]', 'test query');
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    }
  );

  // Log skip reason if feature not available
  if (!result.executed && result.skipReason) {
    console.log(`Skipped: ${result.skipReason}`);
  }
});
```

### Pattern 5: Edge Case Testing with Fixtures

```typescript
import { EDGE_CASE_IDS, verifyEdgeCaseDataExists } from '../fixtures/edge-case-data.fixture';
import { assertNoServerComponentCrash } from '../utils/server-error-detection';

test.describe('Edge case handling', () => {
  test.beforeAll(async () => {
    // Ensure edge case data is seeded
    // Run: pnpm e2e:seed:edge-cases
  });

  test('DI-003: Quote with deleted client renders gracefully', async ({ page }) => {
    await page.goto(`/quotes/${EDGE_CASE_IDS.QUOTE_DELETED_CLIENT}`);

    // Page should not crash
    await assertNoServerComponentCrash(page, 'Quote with deleted client');

    // Should show fallback text instead of crash
    const clientField = page.locator('[data-testid="client-name"]');
    await expect(clientField).toBeVisible();
    // Should show "Unknown Client" or similar, not "undefined"
  });
});
```

---

## Utility Functions

### Safe Assertions (`/utils/safe-assertions.ts`)

| Function | Purpose | Replaces |
|----------|---------|----------|
| `assertVisible(locator, message)` | Assert element is visible with clear error | `.isVisible().catch(() => false)` |
| `assertMinCount(locator, min, message)` | Assert at least N elements exist | `if (count > 0) { ... }` |
| `checkVisibility(locator, description)` | Non-failing visibility check with context | `.isVisible().catch(() => false)` |
| `navigateAndAssert(page, url)` | Navigate with status and error checking | Plain `page.goto()` |
| `requireData(data, description)` | Assert data is not null/undefined | Silent null checks |
| `assertDataOrEmptyState(page, config)` | Verify either data or empty state exists | Partial checks |
| `assertNoErrorBoundary(page)` | Check no error boundary triggered | No check |

### Server Error Detection (`/utils/server-error-detection.ts`)

| Function | Purpose |
|----------|---------|
| `detectServerError(page)` | Detect error overlays, HTTP errors, TypeErrors |
| `detectInvalidRenders(page, selector)` | Find "undefined", "null", "[object Object]" in content |
| `assertNoServerComponentCrash(page, context)` | Full crash detection with context |
| `safeNavigate(page, url, options)` | Navigate with automatic crash detection |
| `monitorConsoleErrors(page)` | Attach listener for console errors |

### Data Integrity Assertions (`/utils/data-integrity-assertions.ts`)

| Function | Purpose |
|----------|---------|
| `assertNoNullRenders(locator, context)` | Check for rendered null/undefined values |
| `assertCardDataIntegrity(page, config)` | Verify card has required fields with valid data |
| `assertListIntegrity(page, config)` | Verify list items have valid data |
| `assertValidClientName(locator, context)` | Validate client name field |
| `assertValidCurrency(locator, context)` | Validate currency amount |
| `assertTableIntegrity(page, config)` | Verify table data integrity |
| `assertPageDataIntegrity(page, config)` | Check entire page for null renders |

### Edge Case Fixtures (`/fixtures/edge-case-data.fixture.ts`)

| Export | Purpose |
|--------|---------|
| `EDGE_CASE_IDS` | Constants for edge case record IDs |
| `ERROR_PATTERNS` | Regex patterns for error detection |
| `verifyEdgeCaseDataExists()` | Check if edge case data is seeded |
| `assertNoServerError()` | Fixture-based server error check |
| `assertDataIntegrity()` | Fixture-based data integrity check |

---

## Test Coverage Requirements

### For New Features

Every new feature must include:

1. **Happy Path Tests** - Normal user flow with valid data
2. **Edge Case Tests** - At minimum:
   - Empty state (no data)
   - Maximum data (pagination, large inputs)
   - Invalid/missing relations (soft-deleted references)
   - Missing optional fields (null company name, etc.)
3. **Error Handling Tests** - Invalid inputs, network errors
4. **Data Integrity Checks** - No null/undefined renders

### Test Case Checklist

```markdown
- [ ] Happy path with valid data
- [ ] Empty state displays correctly
- [ ] Handles deleted/missing relations
- [ ] Handles null optional fields
- [ ] No "undefined" or "null" rendered as text
- [ ] Server errors are detected and fail the test
- [ ] Error boundaries don't trigger unexpectedly
```

### Regression Tests

For any bug fix:

1. Add a regression test that reproduces the bug
2. Verify the test fails before the fix
3. Verify the test passes after the fix
4. Add to `regression/` directory with appropriate naming

---

## Running Tests

### Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run with specific project
pnpm test:e2e --project=authenticated
pnpm test:e2e --project=unauthenticated

# Run data integrity tests (requires edge case data)
pnpm e2e:seed:edge-cases  # Seed edge case data first
pnpm e2e:data-integrity    # Run data integrity tests

# Run regression tests
pnpm e2e:regression

# Full test suite with seeding
pnpm e2e:full

# Run specific test file
pnpm test:e2e e2e/dashboard.spec.ts

# Run with headed browser (debugging)
pnpm test:e2e --headed

# Run with UI mode
pnpm test:e2e --ui
```

### Test Data Setup

```bash
# Standard test data
pnpm e2e:seed

# Edge case test data (required for data-integrity tests)
pnpm e2e:seed:edge-cases

# Cleanup test data
pnpm e2e:cleanup
```

### CI/CD

```bash
# CI mode (no retry, strict)
CI=true pnpm test:e2e

# With specific reporter
pnpm test:e2e --reporter=github
```

---

## Directory Structure

```
e2e/
├── README.md                    # This file
├── global-setup.ts              # Authentication setup
├── global-teardown.ts           # Cleanup
├── playwright.config.ts         # Test configuration
│
├── fixtures/                    # Test fixtures
│   └── edge-case-data.fixture.ts  # Edge case IDs and utilities
│
├── utils/                       # Test utilities
│   ├── safe-assertions.ts       # Error-safe assertion helpers
│   ├── server-error-detection.ts # Server crash detection
│   ├── data-integrity-assertions.ts # Data validation
│   └── seed-e2e-data.ts         # Test data seeding
│
├── regression/                  # Regression test suites
│   ├── README.md                # Regression test documentation
│   ├── data-integrity/          # Null relation tests
│   │   └── null-relations.spec.ts
│   ├── state-matrix/            # State transition tests
│   ├── permission-matrix/       # Role-based access tests
│   ├── feature-interaction/     # Cross-feature tests
│   ├── backward-compat/         # API compatibility tests
│   ├── historical/              # Fixed bug tests
│   └── data-driven/             # Parameterized tests
│
├── .auth/                       # Auth state storage
│   ├── user.json
│   └── onboarding-user.json
│
└── [feature].spec.ts            # Feature-specific tests
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    ├── quotes.spec.ts
    ├── invoices.spec.ts
    ├── clients.spec.ts
    └── ...
```

---

## Quick Reference

### When Writing a New Test

1. Use `safeNavigate()` instead of `page.goto()`
2. Use `assertVisible()` instead of `.isVisible().catch()`
3. Add `assertNoServerComponentCrash()` after navigation
4. Add `assertNoNullRenders()` for data display areas
5. Use `assertDataOrEmptyState()` for lists
6. Include edge case tests with `EDGE_CASE_IDS`

### When a Test Fails

1. Check if it's detecting a real bug or a flaky test
2. Never add `.catch(() => false)` to make it pass
3. Never add empty try/catch blocks
4. Fix the root cause, don't silence the symptom

### When Fixing a Bug

1. Write a failing regression test first
2. Fix the bug
3. Verify the test passes
4. Add to `regression/` directory

---

## Verification

To verify the E2E test infrastructure is working:

```bash
# 1. Remove optional chaining from a server action (simulate bug)
# Edit: lib/dashboard/actions.ts
# Change: client?.name → client.name

# 2. Run data integrity tests
pnpm e2e:seed:edge-cases
pnpm e2e:data-integrity

# 3. Tests should FAIL with clear error messages
# If tests pass, the test infrastructure has a gap

# 4. Revert changes
```
