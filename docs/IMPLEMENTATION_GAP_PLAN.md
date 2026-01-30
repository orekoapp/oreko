# QuoteCraft - Implementation Gap Bridging Plan

**Created:** January 30, 2026
**Based on:** Spec Verification Analysis
**Target Completion:** 100% Spec Compliance

---

## Executive Summary

This plan addresses all gaps identified between specifications and current implementation. Work is organized into 8 phases, prioritized by business criticality and dependency order.

### Current State
- **Database Schema:** 100% complete
- **Product Features:** ~40% complete
- **Technical Infrastructure:** ~60% complete
- **UI/UX Components:** ~55% complete

### Target State
- All specifications fully implemented
- Production-ready MVP
- Complete test coverage

---

## Phase 1: Core Infrastructure (Foundation)

**Priority:** P0 - Critical
**Dependencies:** None

### 1.1 Missing UI Components

| Task | Files to Create | Complexity |
|------|-----------------|------------|
| Table component | `components/ui/table.tsx` | Medium |
| Toast notification system | `components/ui/toast.tsx`, `components/ui/toaster.tsx`, `hooks/use-toast.ts` | Medium |
| Skeleton loaders | `components/ui/skeleton.tsx` | Low |
| Progress bar | `components/ui/progress.tsx` | Low |
| Alert/Banner component | `components/ui/alert.tsx` | Low |
| Breadcrumb component | `components/ui/breadcrumb.tsx` | Low |
| Pagination component | `components/ui/pagination.tsx` | Medium |
| Date picker | `components/ui/date-picker.tsx` | Medium |
| Color picker | `components/ui/color-picker.tsx` | Medium |
| File upload | `components/ui/file-upload.tsx` | High |

### 1.2 API Infrastructure

| Task | Files to Create | Complexity |
|------|-----------------|------------|
| API response helpers | `lib/api/response.ts` | Low |
| API error handling | `lib/api/errors.ts` | Low |
| Rate limiting middleware | `lib/api/rate-limit.ts` | Medium |
| Validation schemas (Zod) | `lib/validations/*.ts` | Medium |

### 1.3 External Service Setup

| Task | Files to Create | Complexity |
|------|-----------------|------------|
| Stripe client setup | `lib/stripe/client.ts` | Medium |
| Email service (Nodemailer/Resend) | `lib/email/client.ts` | Medium |
| PDF generation (Puppeteer) | `lib/pdf/generator.ts` | High |
| File storage (S3/Local) | `lib/storage/client.ts` | Medium |
| Background jobs (BullMQ) | `lib/jobs/queue.ts` | High |

---

## Phase 2: Clients Module (0% → 100%)

**Priority:** P0 - Critical
**Dependencies:** Phase 1.1 (Table, Toast)

### 2.1 Pages

| Page | Route | Features |
|------|-------|----------|
| Client List | `/clients` | Table with search, filter, sort, pagination |
| Client Detail | `/clients/[id]` | Profile, quotes, invoices, activity history |
| New Client | `/clients/new` | Creation form with validation |
| Edit Client | `/clients/[id]/edit` | Edit form with validation |

### 2.2 Components

```
components/clients/
├── client-list-table.tsx      # Sortable, filterable table
├── client-card.tsx            # Summary card for dashboard
├── client-form.tsx            # Create/edit form
├── client-search.tsx          # Search with autocomplete
├── client-filters.tsx         # Status, tag filters
├── client-activity.tsx        # Activity timeline
├── client-tags.tsx            # Tag management
└── index.ts
```

### 2.3 Server Actions

```typescript
// lib/clients/actions.ts
- createClient(data)
- updateClient(id, data)
- deleteClient(id)           // Soft delete
- getClient(id)
- getClients(filters)
- searchClients(query)
- addClientTag(clientId, tagId)
- removeClientTag(clientId, tagId)
```

### 2.4 API Endpoints (if needed)

```
POST   /api/clients
GET    /api/clients
GET    /api/clients/[id]
PATCH  /api/clients/[id]
DELETE /api/clients/[id]
GET    /api/clients/search?q=
```

---

## Phase 3: Rate Cards Module (0% → 100%)

**Priority:** P0 - Critical (Differentiator Feature)
**Dependencies:** Phase 1.1

### 3.1 Pages

| Page | Route | Features |
|------|-------|----------|
| Rate Card List | `/rate-cards` | Categories, items, search |
| Rate Card Detail | `/rate-cards/[id]` | Items list, edit inline |
| New Rate Card | `/rate-cards/new` | Category + items creation |

### 3.2 Components

```
components/rate-cards/
├── rate-card-list.tsx         # List with categories
├── rate-card-category.tsx     # Category accordion
├── rate-card-item.tsx         # Individual item row
├── rate-card-form.tsx         # Create/edit form
├── rate-card-item-form.tsx    # Item creation form
├── rate-card-picker.tsx       # Modal picker for quote builder
├── rate-card-import.tsx       # CSV import modal
├── rate-card-export.tsx       # CSV export
└── index.ts
```

### 3.3 Server Actions

```typescript
// lib/rate-cards/actions.ts
- createRateCardCategory(data)
- updateRateCardCategory(id, data)
- deleteRateCardCategory(id)
- createRateCard(data)
- updateRateCard(id, data)
- deleteRateCard(id)
- getRateCards(categoryId?)
- searchRateCards(query)
- importRateCardsFromCSV(file)
- exportRateCardsToCSV(categoryId?)
```

### 3.4 Quote Builder Integration

```
components/quotes/builder/
├── rate-card-picker-modal.tsx  # Modal to browse/select rate cards
└── (update) blocks-panel.tsx   # Add "From Rate Card" section
```

---

## Phase 4: Settings Module (10% → 100%)

**Priority:** P0 - Critical
**Dependencies:** Phase 1.1, 1.3 (File upload, Color picker)

### 4.1 Pages

| Page | Route | Features |
|------|-------|----------|
| Settings Layout | `/settings` | Sidebar navigation |
| Business Profile | `/settings/profile` | Company info, logo |
| Branding | `/settings/branding` | Colors, fonts, logo |
| Payment Settings | `/settings/payments` | Stripe Connect |
| Tax Settings | `/settings/taxes` | Tax rates CRUD |
| Email Templates | `/settings/emails` | Template customization |
| Team Members | `/settings/team` | Invite, manage members |
| Billing | `/settings/billing` | Subscription (future) |

### 4.2 Components

```
components/settings/
├── settings-nav.tsx           # Settings sidebar
├── profile-form.tsx           # Business profile form
├── branding-form.tsx          # Colors, logo upload
├── branding-preview.tsx       # Live preview
├── payment-settings.tsx       # Stripe Connect flow
├── tax-rate-list.tsx          # Tax rates table
├── tax-rate-form.tsx          # Add/edit tax rate
├── email-template-editor.tsx  # Template customization
├── email-template-preview.tsx # Email preview
├── team-members-list.tsx      # Team management
├── invite-member-form.tsx     # Invite modal
└── index.ts
```

### 4.3 Server Actions

```typescript
// lib/settings/actions.ts
- getBusinessProfile()
- updateBusinessProfile(data)
- uploadLogo(file)
- getBrandingSettings()
- updateBrandingSettings(data)
- getTaxRates()
- createTaxRate(data)
- updateTaxRate(id, data)
- deleteTaxRate(id)
- getEmailTemplates()
- updateEmailTemplate(id, data)
- previewEmailTemplate(id, sampleData)
- getTeamMembers()
- inviteTeamMember(email, role)
- removeTeamMember(id)
- updateMemberRole(id, role)
```

### 4.4 Stripe Connect Integration

```typescript
// lib/stripe/connect.ts
- createConnectAccount()
- getConnectAccountLink()
- handleConnectWebhook(event)
- getConnectAccountStatus()
```

---

## Phase 5: Dashboard & Analytics (20% → 100%)

**Priority:** P1 - Important
**Dependencies:** Phase 2, 3, 4

### 5.1 Dashboard Widgets

```
components/dashboard/
├── stats-cards.tsx            # Revenue, outstanding, etc.
├── revenue-chart.tsx          # Monthly revenue chart
├── quote-pipeline.tsx         # Quote funnel visualization
├── recent-activity.tsx        # Activity feed
├── upcoming-payments.tsx      # Payment calendar
├── overdue-invoices.tsx       # Overdue list
├── quick-actions.tsx          # Create quote/invoice buttons
├── cash-flow-chart.tsx        # Cash flow timeline
└── index.ts
```

### 5.2 Server Actions

```typescript
// lib/dashboard/actions.ts
- getDashboardStats()
- getRevenueByPeriod(startDate, endDate)
- getQuotePipeline()
- getRecentActivity(limit)
- getUpcomingPayments(days)
- getOverdueInvoices()
- getCashFlowForecast(months)
```

### 5.3 Charts Integration

```bash
# Already have recharts, just need to implement
- Line chart for revenue trends
- Bar chart for monthly comparison
- Pie chart for quote status distribution
- Area chart for cash flow
```

---

## Phase 6: Contract Templates (10% → 100%)

**Priority:** P1 - Important
**Dependencies:** Phase 1.3 (PDF generation)

### 6.1 Pages

| Page | Route | Features |
|------|-------|----------|
| Contract List | `/contracts` | Templates and instances |
| Contract Editor | `/contracts/[id]/edit` | Rich text with variables |
| Contract Preview | `/contracts/[id]/preview` | Rendered preview |
| Contract Sign | `/c/[token]` | Public signing page |

### 6.2 Components

```
components/contracts/
├── contract-list.tsx          # Templates list
├── contract-editor.tsx        # Tiptap rich text editor
├── variable-inserter.tsx      # Variable picker modal
├── contract-preview.tsx       # Rendered contract
├── contract-sign-form.tsx     # Signing flow
├── signature-capture.tsx      # Reuse from quotes
└── index.ts
```

### 6.3 Server Actions

```typescript
// lib/contracts/actions.ts
- createContractTemplate(data)
- updateContractTemplate(id, data)
- deleteContractTemplate(id)
- getContractTemplates()
- createContractInstance(templateId, clientId, variables)
- getContractInstance(id)
- getContractByToken(token)
- signContract(token, signature, signerInfo)
- generateContractPDF(instanceId)
```

### 6.4 Variable System

```typescript
// Supported merge variables
{{client.name}}
{{client.email}}
{{client.company}}
{{business.name}}
{{business.address}}
{{quote.total}}
{{quote.number}}
{{invoice.total}}
{{invoice.number}}
{{date.today}}
{{date.custom}}
```

---

## Phase 7: Email & Notifications (0% → 100%)

**Priority:** P1 - Important
**Dependencies:** Phase 1.3 (Email service), Phase 4 (Email templates)

### 7.1 Email Templates

```
emails/
├── quote-sent.tsx             # Quote sent to client
├── quote-accepted.tsx         # Quote accepted notification
├── quote-declined.tsx         # Quote declined notification
├── quote-expiring.tsx         # Quote expiring reminder
├── invoice-sent.tsx           # Invoice sent to client
├── invoice-viewed.tsx         # Invoice viewed notification
├── invoice-paid.tsx           # Payment received
├── invoice-overdue.tsx        # Overdue reminder
├── payment-receipt.tsx        # Payment receipt
├── contract-sent.tsx          # Contract sent for signing
├── contract-signed.tsx        # Contract signed notification
└── team-invite.tsx            # Team invitation
```

### 7.2 Email Service

```typescript
// lib/email/service.ts
- sendEmail(to, template, data)
- scheduleEmail(to, template, data, sendAt)
- cancelScheduledEmail(id)
- getEmailLogs(entityType, entityId)
```

### 7.3 Background Jobs

```typescript
// lib/jobs/email.ts
- processEmailQueue()
- sendScheduledEmails()
- processQuoteExpirationReminders()
- processInvoiceOverdueReminders()
```

---

## Phase 8: PDF Generation (0% → 100%)

**Priority:** P1 - Important
**Dependencies:** Phase 1.3 (Puppeteer setup)

### 8.1 PDF Templates

```
lib/pdf/templates/
├── quote-template.tsx         # Quote PDF layout
├── invoice-template.tsx       # Invoice PDF layout
├── contract-template.tsx      # Contract PDF layout
├── receipt-template.tsx       # Payment receipt
└── shared/
    ├── header.tsx             # Branded header
    ├── footer.tsx             # Page footer
    └── styles.ts              # PDF-specific styles
```

### 8.2 PDF Service

```typescript
// lib/pdf/service.ts
- generateQuotePDF(quoteId)
- generateInvoicePDF(invoiceId)
- generateContractPDF(contractId)
- generateReceiptPDF(paymentId)
- storePDF(buffer, entityType, entityId)
- getPDFUrl(entityType, entityId)
```

### 8.3 Download Endpoints

```
GET /api/quotes/[id]/pdf
GET /api/invoices/[id]/pdf
GET /api/contracts/[id]/pdf
GET /api/payments/[id]/receipt
```

---

## Phase 9: Payments & Stripe (30% → 100%)

**Priority:** P0 - Critical
**Dependencies:** Phase 4.4 (Stripe Connect)

### 9.1 Payment Flow

```
components/payments/
├── payment-form.tsx           # Card input (Stripe Elements)
├── payment-methods.tsx        # Saved methods list
├── payment-schedule.tsx       # Milestone payments
├── refund-dialog.tsx          # Process refund
└── index.ts
```

### 9.2 Stripe Integration

```typescript
// lib/stripe/payments.ts
- createPaymentIntent(invoiceId, amount)
- confirmPayment(paymentIntentId)
- createPaymentLink(invoiceId)
- processRefund(paymentId, amount, reason)
- getPaymentMethods(clientId)
- savePaymentMethod(clientId, paymentMethodId)
```

### 9.3 Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.refunded
- customer.subscription.* (future)
- account.updated (Connect)
```

---

## Phase 10: Onboarding Flow (20% → 100%)

**Priority:** P2 - Nice to Have
**Dependencies:** Phase 2, 3, 4

### 10.1 Onboarding Wizard

```
components/onboarding/
├── onboarding-wizard.tsx      # Multi-step wizard
├── step-welcome.tsx           # Welcome screen
├── step-business-profile.tsx  # Business info
├── step-branding.tsx          # Logo, colors
├── step-first-client.tsx      # Create first client
├── step-modules.tsx           # Enable/disable modules
├── step-complete.tsx          # Success + next steps
└── index.ts
```

### 10.2 Server Actions

```typescript
// lib/onboarding/actions.ts
- getOnboardingStatus()
- updateOnboardingStep(step, data)
- completeOnboarding()
- skipOnboarding()
```

---

## Phase 11: Accessibility & Polish

**Priority:** P1 - Important
**Dependencies:** All previous phases

### 11.1 Accessibility Fixes

| Task | Files | Notes |
|------|-------|-------|
| Add ARIA labels | All components | Screen reader support |
| Keyboard shortcuts | `hooks/use-keyboard-shortcuts.ts` | ?, n, i, /, Cmd+S |
| Skip links | `components/skip-link.tsx` | Skip to main content |
| Focus management | All modals/dialogs | Trap focus, restore on close |
| Motion preferences | `globals.css` | prefers-reduced-motion |
| Touch targets | All buttons | Minimum 44px |

### 11.2 Animations

| Animation | Location | Type |
|-----------|----------|------|
| Page transitions | Layout components | Fade in/out |
| Toast enter/exit | Toast component | Slide + fade |
| Modal open/close | Dialog component | Scale + fade |
| Skeleton pulse | Skeleton component | Pulse animation |
| Confetti celebration | First quote/invoice | Confetti particles |
| Drag feedback | Quote builder | Scale + shadow |

### 11.3 Mobile Responsiveness

| Component | Mobile Behavior |
|-----------|-----------------|
| Sidebar | Hamburger menu + drawer |
| Quote builder | Single panel mode |
| Tables | Horizontal scroll or cards |
| Forms | Single column |
| Dialogs | Full screen |

---

## Phase 12: Testing & Documentation

**Priority:** P1 - Important
**Dependencies:** All previous phases

### 12.1 Unit Tests

```
__tests__/
├── lib/
│   ├── quotes/actions.test.ts
│   ├── invoices/actions.test.ts
│   ├── clients/actions.test.ts
│   └── utils/*.test.ts
└── components/
    ├── ui/*.test.tsx
    └── quotes/*.test.tsx
```

### 12.2 E2E Tests (Playwright)

```
e2e/
├── auth.spec.ts               # Login, register, logout
├── quotes.spec.ts             # Quote CRUD, builder
├── invoices.spec.ts           # Invoice CRUD, payments
├── clients.spec.ts            # Client management
├── client-portal.spec.ts      # Public quote/invoice view
├── settings.spec.ts           # Settings pages
└── onboarding.spec.ts         # Onboarding flow
```

### 12.3 Documentation

```
docs/
├── README.md                  # Project overview
├── SETUP.md                   # Development setup
├── DEPLOYMENT.md              # Deployment guide
├── SELF_HOSTING.md            # Self-hosting guide
├── API.md                     # API documentation
├── CONTRIBUTING.md            # Contribution guide
└── CHANGELOG.md               # Version history
```

---

## Implementation Timeline

### Sprint 1 (Week 1-2): Foundation
- [ ] Phase 1: Core Infrastructure
- [ ] Phase 2: Clients Module

### Sprint 2 (Week 3-4): Revenue Features
- [ ] Phase 3: Rate Cards Module
- [ ] Phase 9: Payments & Stripe

### Sprint 3 (Week 5-6): Configuration
- [ ] Phase 4: Settings Module
- [ ] Phase 5: Dashboard & Analytics

### Sprint 4 (Week 7-8): Documents
- [ ] Phase 6: Contract Templates
- [ ] Phase 8: PDF Generation

### Sprint 5 (Week 9-10): Communications
- [ ] Phase 7: Email & Notifications
- [ ] Phase 10: Onboarding Flow

### Sprint 6 (Week 11-12): Polish
- [ ] Phase 11: Accessibility & Polish
- [ ] Phase 12: Testing & Documentation

---

## Success Criteria

### MVP Complete When:
1. All P0 features implemented and tested
2. Core user flows work end-to-end:
   - Create quote → Send → Client accepts → Convert to invoice → Client pays
3. Settings allow full customization
4. PDFs generate correctly
5. Emails send correctly
6. Mobile responsive

### Production Ready When:
1. All P1 features implemented
2. E2E tests pass
3. Performance targets met (LCP < 2.5s)
4. Security audit passed
5. Documentation complete

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Stripe integration complexity | Start early, use test mode extensively |
| PDF generation performance | Queue generation, cache results |
| Email deliverability | Use reputable provider (Resend/SendGrid) |
| Mobile responsiveness | Test continuously, not at end |
| Scope creep | Stick to spec, defer P2 items |

---

*This plan should be reviewed weekly and updated as implementation progresses.*
