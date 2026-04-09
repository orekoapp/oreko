# Oreko Implementation Specification

## 1. Implementation Phases

### Phase 1: Foundation (Week 1-2)

| Task | Priority | Dependencies | Owner |
|------|----------|--------------|-------|
| Monorepo setup with Turborepo | P0 | None | Lead |
| Prisma schema implementation | P0 | Monorepo | Lead |
| Docker development environment | P0 | Prisma | DevOps |
| Shadcn UI + Tailwind setup | P0 | Monorepo | Frontend |
| NextAuth configuration | P0 | Prisma | Full-stack |
| Base layout components | P0 | Shadcn | Frontend |
| CI/CD pipeline | P0 | Monorepo | DevOps |

**Deliverables:**
- Running development environment
- Database with initial migrations
- Basic authentication working
- Dashboard layout rendering

### Phase 2: Core Entities (Week 3-4)

| Task | Priority | Dependencies | Owner |
|------|----------|--------------|-------|
| Client CRUD operations | P0 | Auth | Full-stack 1 |
| Client list/detail pages | P0 | Client CRUD | Full-stack 1 |
| Rate card CRUD operations | P0 | Auth | Full-stack 2 |
| Rate card list/editor pages | P0 | Rate card CRUD | Full-stack 2 |
| Category management | P0 | Rate card CRUD | Full-stack 2 |

**Deliverables:**
- Fully functional client management
- Rate card system with categories
- Search and filtering working

### Phase 3: Quote System (Week 5-8)

| Task | Priority | Dependencies | Owner |
|------|----------|--------------|-------|
| Quote data model operations | P0 | Clients, Rate cards | Lead |
| Visual quote builder layout | P0 | Quote model | Frontend |
| Block-based editor | P0 | Builder layout | Frontend |
| Line items block | P0 | Editor | Frontend |
| Rate card integration | P0 | Line items | Frontend |
| Quote calculations | P0 | Line items | Frontend |
| Properties panel | P0 | Editor | Frontend |
| Template system | P0 | Builder | Frontend |
| Auto-save functionality | P0 | Builder | Full-stack |
| Quote list/management | P0 | Quote model | Full-stack |
| Send quote flow | P0 | Quote, Email | Full-stack |

**Deliverables:**
- Visual quote builder (core differentiator)
- Quote management interface
- Quote sending via email

### Phase 4: Client Portal (Week 9-10)

| Task | Priority | Dependencies | Owner |
|------|----------|--------------|-------|
| Public quote view page | P0 | Quotes | Full-stack |
| View tracking | P0 | Public page | Full-stack |
| Signature capture component | P0 | Public page | Frontend |
| Quote acceptance flow | P0 | Signature | Full-stack |
| Stripe Connect setup | P0 | None | Full-stack 2 |
| Deposit payment flow | P0 | Stripe, Accept | Full-stack 2 |
| Confirmation page | P0 | Payment | Frontend |

**Deliverables:**
- Client-facing quote accept page
- E-signature capture
- Deposit payment processing

### Phase 5: Invoice System (Week 11-12)

| Task | Priority | Dependencies | Owner |
|------|----------|--------------|-------|
| Quote-to-invoice conversion | P0 | Quotes | Full-stack |
| Invoice editor | P0 | Conversion | Frontend |
| Payment schedule builder | P0 | Invoice | Frontend |
| Invoice list/management | P0 | Invoice model | Full-stack |
| Public invoice pay page | P0 | Invoices | Full-stack |
| Payment processing | P0 | Stripe | Full-stack |
| Payment history | P0 | Payments | Full-stack |
| Manual payment recording | P0 | Payments | Full-stack |

**Deliverables:**
- Invoice management system
- Client payment portal
- Payment tracking

### Phase 6: Supporting Features (Week 13-14)

| Task | Priority | Dependencies | Owner |
|------|----------|--------------|-------|
| PDF generation service | P0 | Quotes, Invoices | Backend |
| Email service + templates | P0 | Infrastructure | Backend |
| Dashboard implementation | P0 | All entities | Full-stack |
| Settings pages | P0 | Auth | Full-stack |
| Onboarding flow | P0 | Settings | Frontend |
| Payment reminders | P0 | Invoices, Email | Backend |

**Deliverables:**
- PDF generation working
- Email notifications
- Dashboard with metrics
- User settings

### Phase 7: Polish & Launch (Week 15)

| Task | Priority | Dependencies | Owner |
|------|----------|--------------|-------|
| E2E testing | P0 | All features | QA |
| Performance optimization | P0 | All features | Lead |
| Security audit | P0 | All features | Lead |
| Documentation | P0 | All features | All |
| Landing page | P0 | None | Frontend |
| Production deployment | P0 | All | DevOps |

**Deliverables:**
- Production-ready application
- Documentation complete
- Landing page live

---

## 2. User Flows (Phase 5.6a)

### 2.1 Quote Creation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    QUOTE CREATION USER FLOW                       │
└──────────────────────────────────────────────────────────────────┘

Step 1: Initiate Quote
├── Click "New Quote" from:
│   ├── Dashboard quick action
│   ├── Quotes list page
│   └── Client profile page (pre-fills client)
└── Navigate to /quotes/new

Step 2: Select Client
├── Search existing clients
├── OR Create new client (inline modal)
└── Client selection populates:
    ├── Client name
    ├── Company name
    └── Email address

Step 3: Build Quote Content
├── Add blocks from sidebar
│   ├── Text blocks (descriptions, terms)
│   ├── Line items (core content)
│   └── Images (portfolio, diagrams)
├── OR Drag rate cards to canvas
│   └── Rate card → Line item (pre-filled)
├── Edit line items
│   ├── Name, description
│   ├── Quantity, rate
│   └── Drag to reorder
└── Auto-save triggers on changes

Step 4: Configure Settings
├── Set expiration date
├── Configure deposit
│   ├── Enable/disable
│   ├── Percentage or fixed
│   └── Amount
├── Select template/style
└── Attach contract (optional)

Step 5: Preview
├── Click "Preview" button
├── See client view
├── Check PDF generation
└── Make adjustments

Step 6: Send
├── Click "Send" button
├── Confirm recipient
├── Customize message (optional)
├── Click "Send Quote"
└── Success confirmation
    ├── Quote status → "Sent"
    ├── Email dispatched
    └── Redirect to quote detail
```

### 2.2 Quote Acceptance Flow (Client)

```
┌──────────────────────────────────────────────────────────────────┐
│                  QUOTE ACCEPTANCE USER FLOW (CLIENT)              │
└──────────────────────────────────────────────────────────────────┘

Step 1: Access Quote
├── Receive email with quote link
├── Click "View Quote"
└── Navigate to /q/[accessToken]
    └── No login required

Step 2: Review Quote
├── See company branding
├── View quote details
│   ├── Project scope
│   ├── Line items with pricing
│   ├── Subtotal, tax, total
│   └── Payment schedule (if any)
├── Download PDF (optional)
└── Check expiration date

Step 3: Review Contract (if attached)
├── Click "View Terms & Conditions"
├── Modal or inline contract display
├── Scroll through contract
└── Close contract view

Step 4: Sign Quote
├── Check "I agree to terms" checkbox
├── Provide signature
│   ├── Draw with mouse/finger
│   └── OR Type name (cursive render)
├── Signature recorded with:
│   ├── Timestamp
│   ├── IP address
│   └── User agent
└── Click "Accept Quote"

Step 5: Pay Deposit (if required)
├── Display deposit amount
├── Select payment method
│   ├── Credit Card
│   └── ACH (if available)
├── Enter payment details
│   └── Stripe Elements form
├── Click "Pay Deposit"
├── Processing state
└── Stripe confirms payment

Step 6: Confirmation
├── Success page
│   ├── Thank you message
│   ├── What happens next
│   └── Contact information
├── Signed PDF available
└── Confirmation email sent
```

### 2.3 Invoice Payment Flow (Client)

```
┌──────────────────────────────────────────────────────────────────┐
│                  INVOICE PAYMENT USER FLOW (CLIENT)               │
└──────────────────────────────────────────────────────────────────┘

Step 1: Access Invoice
├── Receive email with invoice link
├── Click "Pay Invoice"
└── Navigate to /i/[accessToken]

Step 2: Review Invoice
├── View invoice details
│   ├── Invoice number and date
│   ├── Line items
│   ├── Amount due
│   └── Due date
├── See payment status
│   ├── Amount already paid
│   └── Remaining balance
└── Download PDF (optional)

Step 3: Select Payment
├── Full amount (default)
├── OR Partial amount
│   ├── Enter custom amount
│   └── Minimum enforced
├── Select method
│   ├── Credit Card (+ fee display)
│   └── ACH (recommended - no fee)
└── See total with fees

Step 4: Enter Payment Details
├── Card: Stripe Card Element
│   ├── Card number
│   ├── Expiry
│   └── CVV
├── OR ACH: Bank details
│   ├── Account number
│   └── Routing number
└── Optional: Save for future

Step 5: Process Payment
├── Click "Pay $X,XXX"
├── Processing indicator
├── Handle 3D Secure (if needed)
└── Webhook confirms payment

Step 6: Confirmation
├── Success page
│   ├── Receipt summary
│   └── Download receipt
├── Invoice updated
│   ├── Status: Paid (if full)
│   └── Status: Partial (if partial)
└── Receipt email sent
```

### 2.4 Onboarding Flow (New User)

```
┌──────────────────────────────────────────────────────────────────┐
│                      ONBOARDING USER FLOW                         │
└──────────────────────────────────────────────────────────────────┘

Step 1: Signup
├── Enter email address
├── Create password
├── Click "Create Account"
├── Verification email sent
└── Redirect to verification page

Step 2: Email Verification
├── Check email
├── Click verification link
└── Redirect to onboarding

Step 3: Business Basics (Required)
├── Business name
├── Contact email
├── Industry (dropdown)
└── Click "Continue"

Step 4: Module Selection (Required)
├── Explain each module:
│   ├── Quotes (always on)
│   ├── Invoices
│   ├── Contracts
│   └── Rate Cards
├── Select modules needed
├── Preview workspace
└── Click "Continue"

Step 5: Branding (Optional - Skip)
├── Upload logo
├── Select primary color
├── Preview on sample quote
└── "Continue" or "Skip for now"

Step 6: Payment Setup (Optional - Skip)
├── Click "Connect Stripe"
├── Redirect to Stripe OAuth
├── Complete Stripe onboarding
├── Return to app
└── "Continue" or "Skip for now"

Step 7: Template Selection (Required)
├── Browse 3+ quote templates
├── Preview each template
├── Select default template
└── Click "Complete Setup"

Step 8: Welcome to Dashboard
├── First-time tour hints
├── "Create First Quote" CTA
├── Checklist of next steps
└── Help resources
```

---

## 3. Test Cases (Phase 5.7)

### 3.1 Authentication Tests

```typescript
describe('Authentication', () => {
  describe('Registration', () => {
    it('should register a new user with valid email and password');
    it('should reject registration with existing email');
    it('should reject weak passwords');
    it('should send verification email');
    it('should not allow login before email verification');
  });

  describe('Login', () => {
    it('should login with correct credentials');
    it('should reject incorrect password');
    it('should reject non-existent user');
    it('should handle session expiry');
    it('should support Google OAuth');
  });

  describe('Password Reset', () => {
    it('should send reset email for valid user');
    it('should not reveal user existence');
    it('should allow password reset with valid token');
    it('should reject expired reset tokens');
  });
});
```

### 3.2 Quote Tests

```typescript
describe('Quotes', () => {
  describe('Creation', () => {
    it('should create a draft quote with valid data');
    it('should auto-generate quote number');
    it('should require client selection');
    it('should calculate totals correctly');
    it('should handle tax calculations');
    it('should save as draft on auto-save');
  });

  describe('Line Items', () => {
    it('should add line item');
    it('should remove line item');
    it('should reorder line items via drag-drop');
    it('should add from rate card');
    it('should update totals on change');
    it('should handle decimal quantities');
  });

  describe('Sending', () => {
    it('should validate quote before send');
    it('should reject sending empty quote');
    it('should update status to sent');
    it('should generate PDF');
    it('should queue email');
    it('should record sent event');
  });

  describe('Client Portal', () => {
    it('should load quote by access token');
    it('should reject invalid tokens');
    it('should track view event');
    it('should display quote correctly');
    it('should handle expired quotes');
  });

  describe('Acceptance', () => {
    it('should capture drawn signature');
    it('should capture typed signature');
    it('should record signature metadata');
    it('should update status to accepted');
    it('should create invoice if enabled');
    it('should send confirmation email');
  });

  describe('Deposit Payment', () => {
    it('should create payment intent');
    it('should process card payment');
    it('should handle payment failure');
    it('should record payment on webhook');
    it('should update quote status');
  });
});
```

### 3.3 Invoice Tests

```typescript
describe('Invoices', () => {
  describe('Creation', () => {
    it('should create invoice from quote');
    it('should create invoice manually');
    it('should copy line items from quote');
    it('should calculate due date');
  });

  describe('Payment', () => {
    it('should accept full payment');
    it('should accept partial payment');
    it('should enforce minimum partial amount');
    it('should handle card payment');
    it('should handle ACH payment');
    it('should update amount due');
    it('should mark as paid when full');
    it('should send receipt email');
  });

  describe('Reminders', () => {
    it('should schedule reminders');
    it('should send reminder before due');
    it('should send reminder on due date');
    it('should send overdue reminder');
    it('should stop reminders when paid');
  });

  describe('Refunds', () => {
    it('should process full refund');
    it('should process partial refund');
    it('should update invoice status');
    it('should record refund event');
  });
});
```

### 3.4 Client Tests

```typescript
describe('Clients', () => {
  describe('CRUD', () => {
    it('should create client with valid data');
    it('should require email');
    it('should update client');
    it('should soft delete client');
    it('should search by name');
    it('should search by company');
    it('should filter by status');
  });

  describe('History', () => {
    it('should show quotes for client');
    it('should show invoices for client');
    it('should calculate lifetime value');
    it('should show recent activity');
  });
});
```

### 3.5 Rate Card Tests

```typescript
describe('Rate Cards', () => {
  describe('Categories', () => {
    it('should create category');
    it('should reorder categories');
    it('should delete empty category');
    it('should prevent deleting category with items');
  });

  describe('Items', () => {
    it('should create rate card item');
    it('should support multiple pricing tiers');
    it('should update rate card');
    it('should archive rate card');
  });

  describe('Integration', () => {
    it('should add to quote from picker');
    it('should pre-fill line item from rate card');
    it('should allow price override');
  });
});
```

### 3.6 E2E Test Scenarios

```typescript
// e2e/quote-to-payment.spec.ts
describe('Quote to Payment Flow', () => {
  it('should complete full quote-to-payment cycle', async () => {
    // 1. Login as business owner
    await loginAs('business@example.com');

    // 2. Create new quote
    await page.click('[data-testid="new-quote"]');
    await selectClient('Acme Corp');
    await addLineItem('Web Design', 2500);
    await setDeposit(30);

    // 3. Send quote
    await page.click('[data-testid="send-quote"]');
    await expect(page).toHaveText('Quote sent');

    // 4. Access client portal
    const quoteLink = await getQuoteLink();
    await page.goto(quoteLink);

    // 5. Accept quote
    await page.check('[data-testid="agree-terms"]');
    await signQuote();
    await page.click('[data-testid="accept-quote"]');

    // 6. Pay deposit
    await fillCardDetails(testCard);
    await page.click('[data-testid="pay-deposit"]');

    // 7. Verify success
    await expect(page).toHaveText('Thank you');

    // 8. Login and verify invoice created
    await loginAs('business@example.com');
    await page.goto('/invoices');
    await expect(page).toHaveText('Acme Corp');
  });
});
```

---

## 4. Dependencies Map (Phase 5.8)

### 4.1 Package Dependencies

```json
{
  "dependencies": {
    "@auth/prisma-adapter": "^1.0.0",
    "@hookform/resolvers": "^3.3.0",
    "@prisma/client": "^5.7.0",
    "@radix-ui/react-*": "latest",
    "@stripe/react-stripe-js": "^2.4.0",
    "@stripe/stripe-js": "^2.2.0",
    "@tanstack/react-table": "^8.10.0",
    "@tiptap/react": "^2.1.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "bullmq": "^4.14.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "ioredis": "^5.3.0",
    "lucide-react": "^0.294.0",
    "next": "14.0.4",
    "next-auth": "5.0.0-beta.4",
    "pino": "^8.17.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.0",
    "sharp": "^0.33.0",
    "stripe": "^14.9.0",
    "tailwind-merge": "^2.1.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/react": "^14.1.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-next": "14.0.4",
    "postcss": "^8.4.32",
    "prettier": "^3.1.0",
    "prisma": "^5.7.0",
    "tailwindcss": "^3.3.6",
    "turbo": "^1.11.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

### 4.2 Feature Dependencies Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEATURE DEPENDENCIES                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Foundation
    │
    ├── Database (Prisma)
    │       │
    │       ├── Users
    │       ├── Workspaces
    │       └── All Entities
    │
    ├── Authentication (NextAuth)
    │       │
    │       ├── Protected Routes
    │       └── API Authorization
    │
    └── UI Components (Shadcn)
            │
            └── All Feature UIs

Clients
    │
    └── Dependent: Quotes, Invoices

Rate Cards
    │
    └── Dependent: Quote Builder (Line Items)

Quotes
    │
    ├── Depends: Clients, Rate Cards
    │
    ├── PDF Generation
    │       │
    │       └── Depends: Quote Data
    │
    ├── Email Service
    │       │
    │       └── Depends: Quote Data
    │
    └── Client Portal
            │
            ├── Signature Capture
            └── Stripe (Deposit)

Invoices
    │
    ├── Depends: Quotes (conversion)
    │
    ├── Payment Portal
    │       │
    │       └── Stripe (Payment)
    │
    └── Reminders
            │
            └── Depends: Email, Queue

Dashboard
    │
    └── Depends: Quotes, Invoices, Payments

Settings
    │
    ├── Business Profile (standalone)
    ├── Branding (standalone)
    ├── Payment Settings → Stripe
    └── Email Templates → Email Service
```

### 4.3 External Service Dependencies

| Service | Purpose | Required For | Fallback |
|---------|---------|--------------|----------|
| PostgreSQL | Data storage | All features | None (required) |
| Redis | Queue, cache | Background jobs | In-memory (dev only) |
| Stripe | Payments | Deposits, invoices | Manual payments |
| Email (SMTP/SendGrid) | Notifications | Quote/invoice send | Display link only |
| Storage (S3/Local) | File uploads | Attachments, logos | Local filesystem |
| Puppeteer | PDF generation | PDF downloads | HTML view only |

---

## 5. Cross-Analysis Consistency (Phase 5.5)

### 5.1 Data Model Consistency

| Entity | Product Spec | Technical Spec | Database Schema | Status |
|--------|--------------|----------------|-----------------|--------|
| User | Defined | Defined | Implemented | ✅ |
| Workspace | Defined | Defined | Implemented | ✅ |
| Client | Defined | Defined | Implemented | ✅ |
| Rate Card | Defined | Defined | Implemented | ✅ |
| Quote | Defined | Defined | Implemented | ✅ |
| Invoice | Defined | Defined | Implemented | ✅ |
| Payment | Defined | Defined | Implemented | ✅ |
| Contract | Defined (P1) | Defined (P1) | Implemented | ✅ |

### 5.2 Feature Consistency

| Feature | Product Spec | UI/UX Spec | Technical Spec | Gap |
|---------|--------------|------------|----------------|-----|
| Quote Builder | Visual, block-based | Wireframes provided | Server actions defined | None |
| E-Signature | Draw + Type | Component specs | Storage defined | None |
| Stripe Connect | OAuth flow | Settings UI | Service layer | None |
| PDF Generation | Puppeteer | Template designs | Queue job | None |
| Email Templates | 4 core templates | Merge fields | React Email | None |
| Dashboard Metrics | 6 key metrics | Card layouts | Query patterns | None |

### 5.3 API Consistency

All API endpoints defined in Technical Spec align with:
- Data models in Database Schema
- UI components in UI/UX Spec
- User stories in Product Spec

### 5.4 Identified Gaps (Resolved)

1. **Gap:** Email template merge fields not fully documented
   **Resolution:** Added complete variable list in CLARIFICATIONS.md

2. **Gap:** Stripe Connect account type not specified
   **Resolution:** Decided on Express accounts (documented)

3. **Gap:** PDF vs HTML preview approach
   **Resolution:** Puppeteer for PDF, React for preview

---

## 6. Requirement Traceability (Phase 5.6)

### 6.1 P0 Requirements Coverage

| ID | Requirement | Implementation | Test Case |
|----|-------------|----------------|-----------|
| QT-001 | Navigate to quotes | /quotes route | Navigation test |
| QT-002 | Toggle tabs | Tab component | UI test |
| QT-003 | Search quotes | Search input + query | Search test |
| QT-010 | Create quote < 10 min | Streamlined builder | E2E timing |
| QT-011 | Add branding | Template + settings | Settings test |
| QT-012 | Detailed line items | Line item block | Builder test |
| QT-013 | Drag-and-drop | dnd-kit integration | DnD test |
| QT-014 | Real-time preview | Instant update | Preview test |
| QT-020 | View without login | Public route | Portal test |
| QT-021 | E-signature | Signature component | Sign test |
| QT-022 | Pay deposit | Stripe integration | Payment test |
| IN-001 | View invoice list | /invoices route | List test |
| IN-010 | Convert from quote | convertToInvoice() | Conversion test |
| IN-020 | View and pay | Public portal | Portal test |
| IN-021 | Payment methods | Stripe Elements | Payment test |
| PM-001 | Auto record payments | Webhook handler | Webhook test |
| PM-004 | Automated reminders | Queue + scheduler | Reminder test |

### 6.2 Non-Functional Requirements

| Requirement | Target | Implementation | Verification |
|-------------|--------|----------------|--------------|
| Page Load | < 3s | RSC, code splitting | Lighthouse |
| API Response | < 500ms | Prisma queries | Load testing |
| PDF Generation | < 5s | Puppeteer + queue | Timer logs |
| Accessibility | WCAG AA | Shadcn + ARIA | axe-core |
| Mobile Support | Responsive | Tailwind breakpoints | Device testing |
| Browser Support | Last 2 versions | Modern build | BrowserStack |

---

## 7. Rollout Plan

### 7.1 Development Milestones

| Milestone | Target Date | Criteria |
|-----------|-------------|----------|
| M1: Foundation | Week 2 | Auth working, DB seeded |
| M2: Core Entities | Week 4 | Clients + Rate Cards complete |
| M3: Quote Builder | Week 8 | Quote creation to send |
| M4: Client Portal | Week 10 | Accept + deposit payment |
| M5: Invoices | Week 12 | Full invoice cycle |
| M6: Beta | Week 14 | All features, testing |
| M7: Launch | Week 15 | Production deployment |

### 7.2 Beta Testing Plan

1. **Internal Testing (Week 13)**
   - Team members use for real quotes
   - Bug bash session
   - Performance profiling

2. **Closed Beta (Week 14)**
   - 10-20 selected users
   - Feedback collection
   - Critical bug fixes

3. **Open Beta (Week 15)**
   - Public signup
   - Monitoring dashboard
   - Support system ready

### 7.3 Launch Checklist

- [ ] All P0 features complete
- [ ] E2E tests passing
- [ ] Security audit complete
- [ ] Performance targets met
- [ ] Documentation complete
- [ ] Landing page live
- [ ] Support email configured
- [ ] Error tracking enabled
- [ ] Backup system verified
- [ ] Stripe production keys configured
