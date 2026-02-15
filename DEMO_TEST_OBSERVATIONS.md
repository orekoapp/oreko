# QuoteCraft Demo Testing Observations

**Date:** February 15, 2026
**Tested By:** Claude Code
**Environments:** Production (https://quote-software-gamma.vercel.app) & Dev (http://localhost:3000)

---

## Executive Summary

Testing of the demo functionality revealed **2 critical bugs** that affect both production and development environments. The core navigation and data display features work, but the Quote Editor (main feature) is completely broken.

### Critical Issues (P0)
| Issue | Severity | Affects |
|-------|----------|---------|
| Quote Editor crashes on load | **CRITICAL** | Both Prod & Dev |
| Search functionality not working | **HIGH** | Both Prod & Dev |

---

## Detailed Test Results

### 1. Try Demo Button - PASS
- **Location:** `/login` page
- **Status:** Working correctly
- **Details:** "Try Demo (No Sign-up Required)" button successfully logs in as Demo User (demo@quotecraft.demo) with "My Business" workspace

### 2. Search Functionality - FAIL (CRITICAL)
- **Location:** Header (top-right)
- **Status:** BROKEN on both Prod & Dev
- **Details:**
  - Clicking the Search button does nothing
  - Keyboard shortcut (Cmd+K / Ctrl+K) does nothing
  - No search dialog/modal appears
- **Impact:** Users cannot search for quotes, invoices, or clients

### 3. Dashboard - PARTIAL PASS
- **Location:** `/dashboard`
- **Status:** Page loads, charts display
- **Issues Found:**
  - Stats cards work: $45.00 revenue, 5 quotes, 4 invoices, 5 clients, 25% conversion
  - Revenue Trend chart displays correctly
  - "Recent Activity" section shows "No recent activity" (may be expected for demo)

### 4. Quotes - FAIL (CRITICAL)
- **Location:** `/quotes` and `/quotes/new`
- **Listing Page:** Works - shows 5 demo quotes
- **Detail Page Issues:**
  - Shows "Line Items: 0" even when quote has items
  - Shows "No activity yet"
  - Breadcrumb shows UUID instead of quote number
- **Quote Editor:** COMPLETELY BROKEN

#### Quote Editor Error (CRITICAL BUG)
```
Something went wrong
We encountered an unexpected error. Please try again.

A <Select.Item /> must have a value prop that is not an empty string.
This is because the Select value can be set to an empty string to
clear the selection and show the placeholder.
```

**Root Cause:** A `<Select>` component (likely Radix UI) has an item with an empty string value.

**Reproduction Steps:**
1. Go to `/quotes/new`
2. Select any client (or skip)
3. Click "Continue to Editor"
4. Error page appears immediately

### 5. Invoices - PASS (with issues)
- **Location:** `/invoices`
- **Listing Page:** Works - shows 4 demo invoices with correct statuses (draft, overdue, sent, paid)
- **Detail Page Issues:**
  - Breadcrumb shows UUID instead of invoice number (INV-xxxx)
  - Client shows "Client ID: demo-client-X" instead of actual name
  - Activity shows "No activity yet"
- **Line items display correctly on detail page**

### 6. Clients - PASS (with issues)
- **Location:** `/clients`
- **Listing Page:** Works - shows 5 demo clients
- **Detail Page Issues:**
  - Breadcrumb shows "Demo-client-X" instead of client name
  - Activity section DOES work on client detail page
  - Stats cards don't show quote/invoice counts
- **Client search in quote creation:** Works correctly

### 7. Rate Cards - PASS (with issues)
- **Location:** `/rate-cards`
- **Status:** Works - shows 4 rate cards
- **Issues:**
  - Stats cards (Total, Active, Inactive) don't show counts

### 8. Settings - PASS
- **Location:** `/settings`
- **Status:** All settings pages load correctly
- **Tested:**
  - Settings index (11 categories)
  - Account settings (profile/password forms)

### 9. Analytics - PASS
- **Location:** `/analytics`
- **Status:** Works with demo data displayed

### 10. Templates - PASS
- **Location:** `/templates`
- **Status:** Shows empty state with "Create Template" button

---

## Bugs to Fix (Priority Order)

### P0 - Critical (Must Fix Immediately)

#### 1. Quote Editor Crash
- **File:** Likely in `apps/web/app/(dashboard)/quotes/new/editor/` or quote editor components
- **Error:** `<Select.Item />` with empty string value
- **Fix:** Find the Select component and ensure all items have non-empty values, or add a placeholder item with a non-empty sentinel value

#### 2. Search Not Working
- **File:** Likely `apps/web/components/shared/command-palette.tsx` or similar
- **Symptoms:** Button click and Cmd+K do nothing
- **Fix:** Check if command palette is properly wired up to the search button's onClick and keyboard shortcut

### P1 - High (Should Fix Soon)

#### 3. Breadcrumb Shows IDs Instead of Names
- **Affected Pages:** Quote detail, Invoice detail, Client detail
- **Issue:** Breadcrumbs show UUIDs/slugs instead of human-readable names
- **Fix:** Update breadcrumb components to fetch/pass display names

#### 4. Missing Stats Counts
- **Affected Pages:** Clients list, Rate Cards, Quote/Invoice details
- **Issue:** Stats cards show labels but no numbers
- **Fix:** Ensure count queries are included in page data fetching

#### 5. Invoice Detail Shows Client ID Instead of Name
- **Location:** Invoice detail page sidebar
- **Issue:** Shows "Client ID: demo-client-X"
- **Fix:** Include client relation in invoice query

### P2 - Medium (Nice to Fix)

#### 6. Activity Not Showing on Quote/Invoice Detail
- **Issue:** Shows "No activity yet" even though events should exist
- **Fix:** Check if QuoteEvent/InvoiceEvent records are being created during demo seed

---

## Environment Comparison

| Issue | Production | Dev |
|-------|------------|-----|
| Quote Editor Crash | YES | YES |
| Search Not Working | YES | YES |
| Breadcrumb IDs | YES | YES |
| Missing Stats | YES | YES |

**Conclusion:** All issues are CODE bugs, not environment-specific problems.

---

## Recommended Immediate Actions

1. **Fix Quote Editor** - This is the main feature of the app and it's completely broken
2. **Fix Search** - Core navigation feature
3. **Add error boundaries** - Prevent full page crashes
4. **Review Select components** - Audit all `<Select>` usage for empty values

---

## Test Coverage Gaps

The following were NOT tested in this session:
- Creating a new client
- Editing an existing quote (editor still broken)
- Invoice creation flow
- Email sending functionality
- PDF download
- Payment/Stripe integration
- Contract functionality
- Template creation

---

## Screenshots

Screenshots captured during testing:
- Quote Editor crash (production): Shows error dialog
- Quote Editor crash (dev): Shows same error + "11 Issues" badge

---

*Report generated by automated testing via Claude Code*
