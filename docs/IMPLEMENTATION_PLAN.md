# QuoteCraft - Implementation Plan

**Created:** January 30, 2026
**Based on:** PROJECT_STATUS.md analysis
**Current Progress:** ~25% Complete (Foundation + Quote Builder)

---

## Executive Summary

This plan outlines the remaining implementation work for QuoteCraft MVP. The foundation and Quote Builder are complete. Focus is on completing P0 (Critical) features first, followed by P1 (Important) features.

---

## Phase Completion Status

| Phase | Feature | Status | Priority |
|-------|---------|--------|----------|
| 6.1-6.5 | Foundation | ✅ 100% | - |
| 6.6 | Quote Builder | ✅ 100% | - |
| 6.7 | Client Portal | ❌ 0% | P0 |
| 6.8 | Invoices Module | ❌ 0% | P0 |
| 6.9 | Payments & Stripe | ❌ 0% | P0 |
| 6.10 | Rate Card System | ❌ 0% | P1 |
| 6.11 | Clients Module | ❌ 0% | P1 |
| 6.12 | Contracts Module | ❌ 0% | P1 |
| 6.13 | Dashboard Widgets | ❌ 0% | P1 |
| 6.14 | Settings | ❌ 0% | P1 |
| 6.15 | Email System | ❌ 0% | P1 |
| 6.16 | Background Jobs | ❌ 0% | P2 |
| 6.17 | File Storage & PDFs | ❌ 0% | P1 |
| 6.18 | Onboarding Flow | ❌ 0% | P2 |

---

## Sprint 1: Client Portal & Quote Completion

**Goal:** Enable clients to view, accept, and sign quotes publicly.

### 1.1 Public Quote View Page
**Location:** `apps/web/app/q/[token]/page.tsx`

Tasks:
- [ ] Create public quote view route
- [ ] Fetch quote by access token
- [ ] Display quote content (read-only block rendering)
- [ ] Show quote metadata (client info, dates, totals)
- [ ] Handle expired quotes (show expiration message)
- [ ] Mobile-responsive layout

### 1.2 Quote Acceptance Flow
**Location:** `apps/web/components/client-portal/`

Tasks:
- [ ] Create acceptance confirmation dialog
- [ ] Add decline option with reason field
- [ ] Update quote status on accept/decline
- [ ] Send notification to quote owner
- [ ] Log acceptance event with timestamp, IP, user agent

### 1.3 E-Signature Capture
**Location:** `apps/web/components/client-portal/signature-pad.tsx`

Tasks:
- [ ] Install `react-signature-canvas` package
- [ ] Create signature pad component
- [ ] Add clear/redo functionality
- [ ] Store signature as data URL
- [ ] Create signature block for client portal
- [ ] Validate signature before acceptance

### 1.4 Client Comments/Questions
**Location:** `apps/web/components/client-portal/quote-comments.tsx`

Tasks:
- [ ] Create comment thread UI
- [ ] Add server action for posting comments
- [ ] Real-time comment updates (optional)
- [ ] Email notification on new comments

### 1.5 PDF Generation for Quotes
**Location:** `packages/pdf-templates/`

Tasks:
- [ ] Install `@react-pdf/renderer` and `puppeteer`
- [ ] Create quote PDF template
- [ ] Add download button to client portal
- [ ] Generate PDF on-demand
- [ ] Store generated PDFs (optional caching)

### Sprint 1 Dependencies to Install
```bash
pnpm add react-signature-canvas @types/react-signature-canvas
pnpm add @react-pdf/renderer
pnpm add puppeteer
```

---

## Sprint 2: Invoices Core

**Goal:** Full invoice lifecycle from creation to client view.

### 2.1 Invoice List Page
**Location:** `apps/web/app/(dashboard)/invoices/page.tsx`

Tasks:
- [ ] Create invoices route and page
- [ ] Add sidebar navigation link
- [ ] Fetch invoices from database
- [ ] Implement filters (status, date range, client)
- [ ] Add search functionality
- [ ] Display invoice cards with status badges

### 2.2 Invoice Builder
**Location:** `apps/web/components/invoices/`

Tasks:
- [ ] Reuse quote builder architecture
- [ ] Create invoice-specific blocks (payment terms, due date)
- [ ] Add invoice header with invoice number
- [ ] Implement invoice totals calculation
- [ ] Create invoice builder store (Zustand)
- [ ] Add auto-save functionality

### 2.3 Quote-to-Invoice Conversion
**Location:** `apps/web/lib/invoices/actions.ts`

Tasks:
- [ ] Create `convertQuoteToInvoice` server action
- [ ] Copy quote line items to invoice
- [ ] Link invoice to original quote
- [ ] Update quote status to "converted"
- [ ] Generate invoice number from sequence
- [ ] Add conversion button to quote detail page

### 2.4 Invoice Status Workflow
**Location:** `apps/web/lib/invoices/`

Tasks:
- [ ] Implement status transitions (draft → sent → viewed → paid)
- [ ] Create status update server actions
- [ ] Add status badges and indicators
- [ ] Log status change events
- [ ] Handle partial payment status

### 2.5 Invoice Detail Page
**Location:** `apps/web/app/(dashboard)/invoices/[id]/page.tsx`

Tasks:
- [ ] Create invoice detail route
- [ ] Display invoice information
- [ ] Show payment history
- [ ] Add edit/send/void actions
- [ ] Display timeline of events

### 2.6 Invoice Public View
**Location:** `apps/web/app/i/[token]/page.tsx`

Tasks:
- [ ] Create public invoice route
- [ ] Display invoice with payment button
- [ ] Show payment history
- [ ] Handle paid/overdue states
- [ ] Mobile-responsive design

### 2.7 Invoice PDF Generation

Tasks:
- [ ] Create invoice PDF template
- [ ] Include payment instructions
- [ ] Add company branding
- [ ] Generate unique filename

---

## Sprint 3: Payments & Stripe Integration

**Goal:** Accept payments via Stripe Connect.

### 3.1 Stripe Connect Setup
**Location:** `apps/web/lib/stripe/`

Tasks:
- [ ] Create Stripe utility functions
- [ ] Implement Stripe Connect onboarding flow
- [ ] Store Stripe account ID in workspace
- [ ] Create connect account dashboard link
- [ ] Handle account status (pending, active, restricted)

### 3.2 Payment Links Generation
**Location:** `apps/web/lib/payments/`

Tasks:
- [ ] Create payment intent for invoice
- [ ] Generate Stripe checkout session
- [ ] Add payment link to invoice
- [ ] Support multiple payment methods (card, ACH)

### 3.3 Deposit Collection Flow

Tasks:
- [ ] Add deposit percentage to quotes
- [ ] Calculate deposit amount
- [ ] Create deposit payment link
- [ ] Track deposit vs final payment

### 3.4 Milestone Payments

Tasks:
- [ ] Create payment schedule UI
- [ ] Define milestone amounts
- [ ] Generate separate payment links per milestone
- [ ] Track milestone completion

### 3.5 Webhook Handling
**Location:** `apps/web/app/api/webhooks/stripe/route.ts`

Tasks:
- [ ] Create Stripe webhook endpoint
- [ ] Verify webhook signature
- [ ] Handle `payment_intent.succeeded`
- [ ] Handle `payment_intent.failed`
- [ ] Update invoice status on payment
- [ ] Create payment records

### 3.6 Payment Confirmation

Tasks:
- [ ] Send payment confirmation email
- [ ] Update invoice page with payment info
- [ ] Generate receipt/confirmation number
- [ ] Notify workspace owner

### Sprint 3 Dependencies
```bash
pnpm add stripe @stripe/stripe-js
```

---

## Sprint 4: Supporting Features

### 4.1 Clients Module
**Location:** `apps/web/app/(dashboard)/clients/`

Tasks:
- [ ] Create clients list page
- [ ] Add client detail page
- [ ] Implement client CRUD server actions
- [ ] Add contact management (multiple contacts per client)
- [ ] Create client tagging system
- [ ] Display client activity history
- [ ] Add client notes feature
- [ ] Client search and filter

### 4.2 Rate Cards System
**Location:** `apps/web/app/(dashboard)/rate-cards/`

Tasks:
- [ ] Create rate cards list page
- [ ] Add rate card categories CRUD
- [ ] Implement rate card items CRUD
- [ ] Create rate card selector for quote builder
- [ ] Add bulk import/export (CSV)
- [ ] Version rate cards

### 4.3 Email System
**Location:** `packages/email-templates/`

Tasks:
- [ ] Install `@react-email/components` and `resend`
- [ ] Create email template components
- [ ] Quote sent notification template
- [ ] Invoice sent notification template
- [ ] Payment received template
- [ ] Implement email sending utility
- [ ] Add email preview feature
- [ ] Log sent emails

### 4.4 Dashboard Widgets
**Location:** `apps/web/components/dashboard/widgets/`

Tasks:
- [ ] Revenue overview card
- [ ] Outstanding invoices widget
- [ ] Recent quotes widget
- [ ] Payment pipeline chart (Recharts)
- [ ] Monthly comparison chart
- [ ] Quick actions panel
- [ ] Activity feed

### Sprint 4 Dependencies
```bash
pnpm add @react-email/components resend
```

---

## Sprint 5: Settings, Polish & Launch Prep

### 5.1 Settings Pages
**Location:** `apps/web/app/(dashboard)/settings/`

Tasks:
- [ ] Business profile settings
- [ ] Branding settings (logo, colors)
- [ ] Email template customization
- [ ] Invoice/quote number sequences
- [ ] Tax rate configuration
- [ ] Payment terms defaults
- [ ] User profile settings

### 5.2 Onboarding Flow
**Location:** `apps/web/app/(dashboard)/onboarding/`

Tasks:
- [ ] Welcome wizard
- [ ] Business profile setup step
- [ ] First client creation
- [ ] First quote walkthrough
- [ ] Template gallery

### 5.3 Testing
**Location:** `apps/web/__tests__/`

Tasks:
- [ ] Unit tests for utilities (Vitest)
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows (Playwright)
  - [ ] Quote creation flow
  - [ ] Invoice creation flow
  - [ ] Payment flow
  - [ ] Client portal acceptance
- [ ] Component tests

### 5.4 Documentation

Tasks:
- [ ] README with setup instructions
- [ ] Self-hosting guide
- [ ] Docker deployment guide
- [ ] API documentation (if exposing)
- [ ] Contributing guidelines

---

## Technical Debt & Improvements

### Immediate Fixes Needed

1. **Quote List Database Integration**
   - Current: Uses mock data
   - Fix: Connect to Prisma client, fetch real quotes

2. **Error Boundaries**
   - Add React error boundaries to major sections
   - Create fallback UI components

3. **Loading States**
   - Add skeleton loaders throughout
   - Implement Suspense boundaries

### Performance Optimizations

- [ ] Image optimization pipeline
- [ ] Database query optimization (indexes)
- [ ] Redis caching for frequently accessed data
- [ ] Bundle size analysis and optimization
- [ ] Lazy loading for heavy components (PDF viewer)

### Security Checklist

- [ ] CSRF protection verification
- [ ] Input sanitization review
- [ ] Rate limiting on sensitive endpoints
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention audit

---

## File Structure for New Features

```
apps/web/
├── app/
│   ├── (dashboard)/
│   │   ├── invoices/
│   │   │   ├── page.tsx              # Invoice list
│   │   │   ├── new/page.tsx          # New invoice
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Invoice detail
│   │   │       └── builder/page.tsx  # Invoice builder
│   │   ├── clients/
│   │   │   ├── page.tsx              # Client list
│   │   │   ├── new/page.tsx          # New client
│   │   │   └── [id]/page.tsx         # Client detail
│   │   ├── rate-cards/
│   │   │   ├── page.tsx              # Rate cards list
│   │   │   └── [id]/page.tsx         # Rate card detail
│   │   ├── settings/
│   │   │   ├── page.tsx              # Settings overview
│   │   │   ├── profile/page.tsx      # Business profile
│   │   │   ├── branding/page.tsx     # Branding settings
│   │   │   └── billing/page.tsx      # Stripe settings
│   │   └── onboarding/
│   │       └── page.tsx              # Onboarding wizard
│   ├── q/[token]/
│   │   └── page.tsx                  # Public quote view
│   ├── i/[token]/
│   │   └── page.tsx                  # Public invoice view
│   └── api/
│       ├── invoices/
│       │   └── route.ts              # Invoice API
│       ├── clients/
│       │   └── route.ts              # Client API
│       ├── payments/
│       │   └── route.ts              # Payment API
│       └── webhooks/
│           └── stripe/route.ts       # Stripe webhooks
├── components/
│   ├── client-portal/
│   │   ├── quote-view.tsx
│   │   ├── invoice-view.tsx
│   │   ├── signature-pad.tsx
│   │   └── payment-form.tsx
│   ├── invoices/
│   │   ├── invoice-card.tsx
│   │   ├── invoice-builder/
│   │   └── invoice-detail.tsx
│   ├── clients/
│   │   ├── client-card.tsx
│   │   ├── client-form.tsx
│   │   └── contact-list.tsx
│   └── dashboard/
│       └── widgets/
│           ├── revenue-card.tsx
│           ├── outstanding-invoices.tsx
│           └── activity-feed.tsx
└── lib/
    ├── invoices/
    │   ├── types.ts
    │   ├── actions.ts
    │   └── hooks.ts
    ├── clients/
    │   ├── types.ts
    │   ├── actions.ts
    │   └── hooks.ts
    ├── payments/
    │   ├── stripe.ts
    │   └── actions.ts
    └── stores/
        └── invoice-builder-store.ts
```

---

## Dependencies Summary

### To Install for MVP

```bash
# Signature capture
pnpm add react-signature-canvas @types/react-signature-canvas

# PDF generation
pnpm add @react-pdf/renderer puppeteer

# Email
pnpm add @react-email/components resend

# Background jobs (optional for MVP)
pnpm add bullmq ioredis

# File upload (optional for MVP)
pnpm add uploadthing @uploadthing/react
```

### Already Installed
- Stripe (`stripe`, `@stripe/stripe-js`)
- Recharts (charts)
- Tiptap (rich text)
- dnd-kit (drag and drop)
- Zod (validation)
- Zustand (state management)

---

## Success Criteria for MVP

1. **Quotes:** Create, edit, send, track acceptance ✅ (mostly done)
2. **Client Portal:** View, sign, accept quotes
3. **Invoices:** Create, convert from quote, send
4. **Payments:** Accept payment via Stripe
5. **Clients:** Basic CRUD and history
6. **Dashboard:** Key metrics visible

---

## Estimated Effort

| Sprint | Features | Estimated Effort |
|--------|----------|-----------------|
| Sprint 1 | Client Portal | Medium |
| Sprint 2 | Invoices Core | Medium-High |
| Sprint 3 | Payments | Medium |
| Sprint 4 | Supporting Features | Medium |
| Sprint 5 | Polish & Launch | Medium |

---

## Next Immediate Actions

1. **Fix quote list page** - Connect to database instead of mock data
2. **Create client portal route** - `/q/[token]/page.tsx`
3. **Install signature pad** - `react-signature-canvas`
4. **Create acceptance flow** - Server actions for quote acceptance

---

*This plan should be updated as features are completed.*
