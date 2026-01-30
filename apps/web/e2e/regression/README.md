# Regression Test Suite

This directory contains comprehensive regression-level E2E tests that go beyond basic functional tests. These tests are designed to catch regressions and ensure stability across releases.

## Directory Structure

```
regression/
├── state-matrix/          # State transition tests
│   ├── quote-states.spec.ts
│   └── invoice-states.spec.ts
├── permission-matrix/     # Role-based access control tests
│   └── role-permissions.spec.ts
├── feature-interaction/   # Cross-feature integration tests
│   └── quote-invoice-flow.spec.ts
├── backward-compat/       # API/data backward compatibility tests
│   └── api-compatibility.spec.ts
├── historical/            # Tests for previously fixed bugs
│   └── critical-bugs.spec.ts
└── data-driven/           # Parameterized test scenarios
    └── quote-scenarios.spec.ts
```

## Test Categories

### State Matrix Tests (TC-SM-*)

Tests all valid and invalid state transitions for quotes and invoices.

- **TC-SM-001 to TC-SM-014**: Quote state transitions (draft → sent → viewed → accepted/declined → converted)
- **TC-SM-015 to TC-SM-028**: Invoice state transitions (draft → sent → viewed → partial → paid/overdue/void)

### Permission Matrix Tests (TC-PM-*)

Tests role-based access control for different user roles.

- **TC-PM-001 to TC-PM-004**: Owner permissions
- **TC-PM-005 to TC-PM-009**: Admin permissions
- **TC-PM-010 to TC-PM-014**: Member permissions
- **TC-PM-015 to TC-PM-018**: Viewer permissions
- **TC-PM-019 to TC-PM-022**: Cross-workspace isolation

### Feature Interaction Tests (TC-FI-*)

Tests interactions between major features.

- **TC-FI-001 to TC-FI-003**: Rate card + quote builder integration
- **TC-FI-004 to TC-FI-007**: Quote to invoice conversion flow
- **TC-FI-008 to TC-FI-010**: Client data propagation
- **TC-FI-011 to TC-FI-015**: Template and branding integration

### Backward Compatibility Tests (TC-BC-*)

Ensures API and data format stability across versions.

- **TC-BC-001 to TC-BC-003**: API response format consistency
- **TC-BC-004 to TC-BC-006**: URL structure stability
- **TC-BC-007 to TC-BC-010**: Data format compatibility

### Historical Regression Tests (TC-REG-*)

Tests for previously fixed bugs to prevent re-introduction.

- **TC-REG-001 to TC-REG-003**: Quote builder regressions
- **TC-REG-004 to TC-REG-005**: Calculation regressions
- **TC-REG-006 to TC-REG-007**: Authentication regressions
- **TC-REG-008**: Email handling regressions
- **TC-REG-009 to TC-REG-010**: PDF generation regressions
- **TC-REG-011 to TC-REG-015**: Data integrity regressions

### Data-Driven Tests (TC-DD-*)

Parameterized tests with multiple data sets.

- **TC-DD-001**: Quote calculations with various line item configurations
- **TC-DD-002**: Tax calculations with different rates
- **TC-DD-003**: Discount calculations (percentage and fixed)
- **TC-DD-004**: Client name validation (unicode, length, etc.)
- **TC-DD-005**: Email format validation
- **TC-DD-006**: Status transition verification
- **TC-DD-007 to TC-DD-008**: Locale-based formatting
- **TC-DD-009**: Search functionality
- **TC-DD-010**: Pagination behavior

## Running Tests

```bash
# Run all regression tests
pnpm test:e2e regression/

# Run specific category
pnpm test:e2e regression/state-matrix/
pnpm test:e2e regression/permission-matrix/
pnpm test:e2e regression/feature-interaction/
pnpm test:e2e regression/backward-compat/
pnpm test:e2e regression/historical/
pnpm test:e2e regression/data-driven/

# Run specific test file
pnpm test:e2e regression/state-matrix/quote-states.spec.ts

# Run with headed browser (for debugging)
pnpm test:e2e regression/ --headed

# Run in CI mode
CI=true pnpm test:e2e regression/
```

## Test Prerequisites

1. **Test Users**: The following test users must exist in the database:
   - `test@quotecraft.dev` (standard user)
   - `owner@quotecraft.dev` (owner role)
   - `admin@quotecraft.dev` (admin role)
   - `member@quotecraft.dev` (member role)
   - `viewer@quotecraft.dev` (viewer role)

2. **Test Data**: Some tests require pre-existing data:
   - At least one client
   - Quotes in various states (draft, sent, accepted, etc.)
   - Invoices in various states
   - At least one rate card
   - At least one template

3. **Environment**: Tests expect the app to be running at `http://localhost:3000`

## Writing New Regression Tests

When adding new regression tests:

1. **Use descriptive test IDs**: Follow the pattern `TC-{CATEGORY}-{NUMBER}`
2. **Document the bug**: For historical regressions, include a reference to the original bug report
3. **Keep tests focused**: Each test should verify one specific behavior
4. **Use data-driven approach**: For tests with multiple scenarios, use parameterized tests
5. **Clean up test data**: Ensure tests don't leave data that affects other tests

## Test Maintenance

- **Before releases**: Run the full regression suite
- **After bug fixes**: Add a new test case to the historical regression suite
- **After API changes**: Update backward compatibility tests
- **After permission changes**: Update permission matrix tests

## Skipped Tests

Many tests are marked with `.skip` because they require:
- A running application
- Pre-seeded test data
- Valid authentication tokens

To enable these tests:
1. Set up the test environment
2. Seed the required test data
3. Remove the `.skip` modifier from the tests you want to run
