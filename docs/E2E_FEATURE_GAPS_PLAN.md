# E2E Feature Gaps Implementation Plan

## Overview

Analysis of 36 failing E2E tests reveals feature gaps that need to be addressed. This plan prioritizes fixes based on impact and dependencies.

**Current Status:** 107/143 tests passing (75%)
**Target:** 140+/143 tests passing (98%+)

---

## Quick Win: Onboarding Fix (DONE)

The test user's workspace had `onboardingCompleted: false`, causing redirect to onboarding instead of dashboard. Fixed by updating the workspace settings.

---

## Gap Analysis Summary

| Category | Failing Tests | Root Cause | Priority |
|----------|---------------|------------|----------|
| API Routes | 3 | No REST API endpoints | P0 |
| Rate Card Integration | 3 | No rate card panel in quote builder | P1 |
| Invoice Payments | 6 | UI wiring incomplete | P0 |
| Invoice States | 8 | UI missing for state transitions | P0 |
| PDF Branding | 3 | Branding not passed to PDF template | P2 |
| Team/Billing Settings | 8 | Pages not implemented | P2 |
| Auth Tests | 2 | Test-specific issues | P1 |

---

## Phase 1: Core API Routes (P0)

### 1.1 Create `/api/quotes/route.ts`

**Location:** `apps/web/app/api/quotes/route.ts`

```typescript
// Expected response shape from tests:
{
  data: Quote[],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}

// Required fields per quote:
{
  id: string,
  quoteNumber: string,
  title: string,
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'converted',
  total: number,
  createdAt: string
}
```

**Implementation:**
1. Create GET handler that calls existing `getQuotes()` action
2. Transform response to match expected shape
3. Add pagination support

### 1.2 Create `/api/invoices/route.ts`

**Location:** `apps/web/app/api/invoices/route.ts`

```typescript
// Expected response shape:
{
  data: Invoice[]
}

// Required fields per invoice:
{
  id: string,
  invoiceNumber: string,
  status: string,
  total: number,
  amountPaid: number,
  amountDue: number,
  dueDate: string
}
```

### 1.3 Create `/api/clients/route.ts`

**Location:** `apps/web/app/api/clients/route.ts`

```typescript
// Required fields:
{
  id: string,
  name: string,
  email: string,
  phone: string,
  company: string
}
```

---

## Phase 2: Invoice Payment UI (P0)

### 2.1 Wire RecordPaymentDialog

The `RecordPaymentDialog` component exists at `apps/web/components/invoices/record-payment-dialog.tsx`. Need to:

1. **Add to invoice detail page** (`apps/web/app/(dashboard)/invoices/[id]/page.tsx`):
   - Import RecordPaymentDialog
   - Add "Record Payment" button (visible when status is sent/partial/overdue)
   - Connect to `recordPayment` action

2. **Add data-testid attributes**:
   - `data-testid="invoice-status"` on status badge
   - `data-testid="amount-due"` on amount due display

### 2.2 Invoice State UI

**Files to modify:**
- `apps/web/components/invoices/invoice-detail.tsx`

**Add:**
- Void button (visible for non-paid invoices)
- Status badge with proper styling for all states
- Days overdue display when overdue

---

## Phase 3: Rate Card Panel (P1)

### 3.1 Create Rate Card Panel Component

**Location:** `apps/web/components/quotes/builder/rate-card-panel.tsx`

**Features:**
- List available rate cards from workspace
- Display rate card items with name/rate
- Click to add item as line item in quote
- Drag-and-drop support

### 3.2 Integrate into Quote Builder

**Modify:** `apps/web/components/quotes/builder/quote-builder.tsx`

- Add rate card panel to sidebar
- Handle item selection to create line items
- Copy rate value when adding (not reference)

**Required data-testid:**
- `data-testid="rate-card-panel"`
- `data-testid="rate-card-item"` on each selectable item
- `data-testid="quote-line-item"` on added line items

---

## Phase 4: PDF Branding (P2)

### 4.1 Pass Branding to PDF Template

**Modify:** `apps/web/lib/services/pdf.ts`

1. Fetch workspace branding settings
2. Pass to `createPdfTemplate()` function
3. Apply colors to template HTML

**Branding fields:**
```typescript
interface BrandingSettings {
  primaryColor: string;    // Default: #3B82F6
  accentColor: string;     // Default: #10B981
  logoUrl?: string;
}
```

### 4.2 Update PDF Template

**Template changes:**
- Use `primaryColor` for headers, buttons
- Use `accentColor` for highlights
- Include logo image if available

---

## Phase 5: Settings Pages (P2)

### 5.1 Create Team Settings Page

**Location:** `apps/web/app/(dashboard)/settings/team/page.tsx`

**Features:**
- List workspace members with roles
- Role selector (owner, admin, member, viewer)
- Invite button with email input
- Invite dialog
- Permission: Owner can change any role, Admin can't promote to owner

**Components needed:**
- `TeamMemberList`
- `InviteMemberDialog`
- `RoleSelector`

### 5.2 Create Billing Settings Page

**Location:** `apps/web/app/(dashboard)/settings/billing/page.tsx`

**Features:**
- Current subscription status
- Plan comparison
- Upgrade/downgrade buttons
- Billing history
- Payment method management

**Permission:** Owner only

### 5.3 Create Workspace Settings Page

**Location:** `apps/web/app/(dashboard)/settings/workspace/page.tsx`

**Features:**
- Workspace name/slug editing
- Danger zone with delete workspace button
- Transfer ownership option

---

## Phase 6: Auth Tests (P1)

### 6.1 Fix Session Persistence Test

**Test:** TC-REG-006 - Session persists across page reload

**Issue:** May need to adjust test or ensure session cookie persistence

### 6.2 Fix Protected Routes Test

**Test:** TC-REG-007 - Protected routes redirect to login

**Issue:** Test uses fresh browser context - verify middleware redirects work

---

## Implementation Order

```
Week 1:
├── Day 1-2: API Routes (Phase 1)
│   ├── /api/quotes
│   ├── /api/invoices
│   └── /api/clients
├── Day 3-4: Invoice Payment UI (Phase 2)
│   ├── Wire RecordPaymentDialog
│   └── Add status UI elements
└── Day 5: Rate Card Panel (Phase 3)

Week 2:
├── Day 1-2: PDF Branding (Phase 4)
├── Day 3-4: Team Settings (Phase 5.1)
└── Day 5: Auth Test Fixes (Phase 6)

Week 3 (if needed):
├── Billing Settings (Phase 5.2)
└── Workspace Settings (Phase 5.3)
```

---

## Verification

After each phase, run relevant E2E tests:

```bash
# API tests
npx playwright test e2e/regression/backward-compat/api-compatibility.spec.ts

# Invoice tests
npx playwright test e2e/regression/state-matrix/invoice-states.spec.ts

# Feature interaction tests
npx playwright test e2e/regression/feature-interaction/

# Permission tests
npx playwright test e2e/regression/permission-matrix/
```

---

## Files to Create

| File | Phase |
|------|-------|
| `apps/web/app/api/quotes/route.ts` | 1 |
| `apps/web/app/api/invoices/route.ts` | 1 |
| `apps/web/app/api/clients/route.ts` | 1 |
| `apps/web/components/quotes/builder/rate-card-panel.tsx` | 3 |
| `apps/web/app/(dashboard)/settings/team/page.tsx` | 5 |
| `apps/web/app/(dashboard)/settings/billing/page.tsx` | 5 |
| `apps/web/app/(dashboard)/settings/workspace/page.tsx` | 5 |

## Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `apps/web/app/(dashboard)/invoices/[id]/page.tsx` | 2 | Add payment button, status UI |
| `apps/web/components/invoices/invoice-detail.tsx` | 2 | Add void button, overdue display |
| `apps/web/components/quotes/builder/quote-builder.tsx` | 3 | Add rate card panel |
| `apps/web/lib/services/pdf.ts` | 4 | Add branding to template |
| `apps/web/app/(dashboard)/settings/layout.tsx` | 5 | Add team/billing nav items |

---

## Success Metrics

- Phase 1 complete: 3 more tests passing (API)
- Phase 2 complete: 6 more tests passing (Invoice states)
- Phase 3 complete: 3 more tests passing (Rate cards)
- Phase 4 complete: 3 more tests passing (PDF)
- Phase 5 complete: 8 more tests passing (Permissions)
- Phase 6 complete: 2 more tests passing (Auth)

**Total projected:** 25 additional tests passing → 132/143 (92%)

Remaining failures would be edge cases or tests needing adjustment.
