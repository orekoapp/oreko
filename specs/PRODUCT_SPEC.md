# QuoteCraft Product Specification

**Version:** 1.0.0
**Status:** Production-Ready for Development
**Last Updated:** January 2026
**Document Owner:** Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [User Personas Reference](#3-user-personas-reference)
4. [Feature Specifications](#4-feature-specifications)
   - [4.1 Quotes Module](#41-quotes-module)
   - [4.2 Invoices Module](#42-invoices-module)
   - [4.3 Rate Card System](#43-rate-card-system)
   - [4.4 Contracts Module](#44-contracts-module)
   - [4.5 Clients/Contacts Module](#45-clientscontacts-module)
   - [4.6 Payments Module](#46-payments-module)
   - [4.7 Dashboard](#47-dashboard)
   - [4.8 Settings](#48-settings)
   - [4.9 Modular Setup (Onboarding)](#49-modular-setup-onboarding)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Out of Scope](#6-out-of-scope)
7. [Success Metrics](#7-success-metrics)
8. [Glossary](#8-glossary)

---

## 1. Executive Summary

### Product Overview

**Name:** QuoteCraft (working title)
**Type:** Open-source, self-hosted visual quote and invoice management tool
**Target Market:** Small business owners, freelancers, solopreneurs, small agencies
**Positioning:** "The open-source alternative to Bloom and Bonsai"

### The Problem

Service professionals face a fragmented toolchain for managing quotes, contracts, and invoices:

| Problem | Impact |
|---------|--------|
| Quote-to-invoice data re-entry | 15-30 minutes wasted per project; 5-10% error rate |
| Payment chasing anxiety | 2-3 hours/month on follow-ups; relationship damage |
| Unprofessional documents | Lost deals, lower close rates |
| Tool fragmentation | 3+ disconnected tools; $50-150/month combined cost |
| Cash flow uncertainty | No visibility into payment pipeline |

### The Solution

QuoteCraft delivers a unified visual quote-to-payment workflow:

- **Visual Quote Builder:** Block-based, drag-and-drop editor (NOT spreadsheet-like)
- **One-Click Conversion:** Quote to invoice with zero data re-entry
- **Integrated Contracts:** E-signatures embedded in the quote acceptance flow
- **Flexible Payment Scheduling:** Deposits, milestones, recurring payments
- **Self-Hosted Option:** Docker deployment for full data ownership
- **Modular Architecture:** Users enable only the modules they need

### Key Differentiators

| Differentiator | Description |
|----------------|-------------|
| **Open Source** | Free self-hosted core, no vendor lock-in |
| **Visual Builder** | Bloom-quality UX with Shadcn/Minimals design system |
| **Docker Deployment** | Single-command self-hosting |
| **Modular Workspace** | Choose only the features you need |
| **Advanced Rate Cards** | Systematic pricing management |
| **Price Point** | Free (self-hosted) or $9-39/mo cloud (50% less than competitors) |

### Business Case

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Open Source Users | 5,000+ | 20,000+ | 50,000+ |
| Paid Cloud Customers | 500 | 2,500 | 8,000 |
| Total ARR | $100K | $400K | $1.2M |

---

## 2. Product Vision & Goals

### Vision Statement

> **A world where every service professional gets paid confidently - on time, every time - with documents as impressive as the work they deliver.**

### Mission Statement

> **We give freelancers and small agencies the tools to create impressive quotes, convert them to signed contracts and invoices effortlessly, and get paid on their terms - all from one beautifully designed platform.**

### Product Principles

| Principle | Description |
|-----------|-------------|
| **One Workflow, Not Three Tools** | Quote, contract, and invoice should be a single continuous flow |
| **Beautiful by Default** | Every document should look professional immediately |
| **Confidence Over Complexity** | Users should feel confident at every step |
| **Respect the Client Relationship** | Getting paid shouldn't damage relationships |
| **Mobile-Ready Reality** | Core workflows must work from mobile devices |
| **Integrate, Don't Replicate** | Excel at quote-to-payment; integrate with accounting tools |
| **Time is Money** | Measure success in time saved for users |

### Strategic Goals

| Goal | Target | Timeline |
|------|--------|----------|
| Time to first quote | < 10 minutes | MVP |
| Quote-to-invoice conversion usage | > 90% | Month 3 |
| Average days to payment | < 14 days | Month 6 |
| NPS score | > 40 | Month 6 |
| Monthly churn | < 5% | Month 12 |

### North Star Metric

**Weekly Active Users Who Get Paid**

Definition: Unique users per week who have at least one invoice marked as paid.

---

## 3. User Personas Reference

### Primary Personas (P0)

#### Creative Claire - Freelance Designer

| Attribute | Details |
|-----------|---------|
| **Profile** | 32, Austin TX, Freelance Graphic Designer, $120K/year |
| **Business** | Solo LLC, 4 years freelancing |
| **Current Tools** | Canva (quotes) + Wave (invoices) + HelloSign (contracts) |
| **Top Pains** | Quote-to-invoice friction, chasing payments, unprofessional documents |
| **Key Quote** | "I became a designer to create beautiful things, not to spend evenings wrestling with invoices" |
| **Willingness to Pay** | $15-39/month for clear time savings |

**Jobs to Be Done:**
- Create professional-looking quotes quickly
- Convert accepted quotes to invoices without re-entry
- Get paid faster without awkward follow-ups
- Look as professional as larger agencies

#### Contractor Chris - Home Services Business Owner

| Attribute | Details |
|-----------|---------|
| **Profile** | 45, Denver CO, Owner of Thompson Renovations LLC, $850K/year revenue |
| **Business** | 4 full-time employees + 2-3 subcontractors, 12 years in business |
| **Current Tools** | Microsoft Word (quotes) + QuickBooks Desktop (invoices) |
| **Top Pains** | Can't quote on-site, scope creep without documentation, deposit collection delays |
| **Key Quote** | "I'm a contractor, not a paper-pusher. But paperwork protects you and wins jobs" |
| **Willingness to Pay** | $30-50/month for clear value |

**Jobs to Be Done:**
- Quote from job site, not office
- Collect deposits before ordering materials
- Track milestone payments clearly
- Protect business with clear contracts

### Secondary Personas (P1)

#### Agency Amanda - Small Agency Owner

| Attribute | Details |
|-----------|---------|
| **Profile** | 38, Chicago IL, Digital Marketing Agency, $1.2M/year, 8 employees |
| **Top Pains** | Retainer billing complexity, team bottleneck, tool fragmentation |

#### Consultant Carlos - B2B Consultant

| Attribute | Details |
|-----------|---------|
| **Profile** | 52, Boston MA, Management Consultant, $350K/year |
| **Top Pains** | Executive-level appearance, complex payment structures |

### Anti-Personas (Do NOT Build For)

| Persona | Why Excluded |
|---------|--------------|
| **Enterprise Emily** | Complex procurement, SOC2, multi-level approvals |
| **Retail Rachel** | Product-based, inventory, high-volume transactions |
| **Hobbyist Henry** | <$5K revenue, won't pay for software |
| **SaaS Steve** | Subscription billing, dunning, usage-based pricing |

---

## 4. Feature Specifications

### 4.1 Quotes Module

#### 4.1.1 Quotes List Page

**Description:** Central hub for managing all quotes with filtering, sorting, and quick actions.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| QT-001 | As a user, I want to navigate to quotes via Projects > Quotes so I can manage all my quotes | P0 |
| QT-002 | As a user, I want to toggle between Invoices and Quotes tabs so I can quickly switch contexts | P0 |
| QT-003 | As a user, I want to search by client name, quote number, or project so I can find quotes quickly | P0 |
| QT-004 | As a user, I want sortable columns so I can organize quotes by date, status, or amount | P0 |
| QT-005 | As a user, I want to see quote status badges so I know the state of each quote at a glance | P0 |

**Acceptance Criteria:**

- [ ] List displays columns: Contact (avatar, name, company), Quote #, Project/Lead, Expiration Date, Total, Status
- [ ] Status badges: Draft, Sent, Accepted, Expired, Declined
- [ ] Search filters quotes in real-time (debounced 300ms)
- [ ] Columns sortable by clicking header (Date, Amount, Status)
- [ ] Pagination or infinite scroll for > 50 quotes
- [ ] Mobile-responsive table view (cards on mobile)

**Row Actions:**

| Action | Description | Keyboard Shortcut |
|--------|-------------|-------------------|
| Open | View quote details | Enter |
| Copy Public Link | Copy client-facing URL | Cmd+L |
| Edit | Open quote editor | E |
| Send | Send quote via email | S |
| Convert to Invoice | One-click conversion | I |
| Download PDF | Generate and download PDF | D |
| Duplicate | Create copy of quote | Cmd+D |
| Delete | Move to trash (soft delete) | Del |

---

#### 4.1.2 Create/Edit Quote Flow (Visual Builder)

**Description:** Clean, block-based visual editor for creating professional quotes. NOT spreadsheet-like.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| QT-010 | As Claire, I want to create a beautiful quote in <10 minutes using a visual builder | P0 |
| QT-011 | As Claire, I want to add my logo and brand colors so quotes reflect my business | P0 |
| QT-012 | As Chris, I want to add detailed line items with descriptions so clients understand scope | P0 |
| QT-013 | As a user, I want to drag-and-drop reorder line items so I can organize the quote logically | P0 |
| QT-014 | As a user, I want real-time preview so I see exactly what clients will see | P0 |
| QT-015 | As Claire, I want to save quotes as drafts so I can work on them later | P0 |
| QT-016 | As Chris, I want to set quote expiration dates so clients are motivated to respond | P1 |
| QT-017 | As a user, I want to attach files to quotes so I can include supporting documents | P1 |

**Acceptance Criteria:**

**Header Section:**
- [ ] Customer selector with search and create-new option
- [ ] Issue Date picker (defaults to today)
- [ ] Expiration Date picker (configurable default, e.g., 14 days)
- [ ] Auto-generated Quote # (customizable format in settings)
- [ ] Options panel: Bill as Company toggle, PO Number field, Custom Fields

**Line Items:**
- [ ] Visual line item editor (NOT table/spreadsheet)
- [ ] Fields per item: Item Name, Description (rich text), Rate, Quantity, Amount, Tax toggle
- [ ] Drag-and-drop reordering with visual feedback
- [ ] Add line item button with animation
- [ ] Delete line item with confirmation for items with data
- [ ] Auto-calculate: Line Total = Rate x Quantity
- [ ] Auto-calculate: Subtotal, Tax, Grand Total
- [ ] Support for different tax rates per line item

**Rate Card Integration:**
- [ ] "Add from Rate Card" button opens rate card picker
- [ ] Quick-search rate card items
- [ ] One-click add rate card item to quote
- [ ] Rate card item values can be overridden per-quote

**Enhancements:**
- [ ] Rich text descriptions with formatting (bold, italic, lists)
- [ ] Contract attachment option (link existing or upload)
- [ ] File attachments (images, PDFs, max 10MB each, 5 files max)
- [ ] Calendar event linking (optional integration)

**Payment Settings:**
- [ ] Deposit toggle: Enable/disable deposit requirement
- [ ] Deposit amount: Percentage (%) or fixed amount ($)
- [ ] Payment schedule preview showing expected payments
- [ ] Deposit collected on acceptance

**Approval Settings:**
- [ ] E-signature requirement toggle
- [ ] Auto-convert to invoice on acceptance toggle (default: on)

**Preview Modes:**
- [ ] Client view (exactly what client sees)
- [ ] Email preview (email template with quote link)
- [ ] PDF preview (generated PDF)

**Template System:**
- [ ] Minimum 3 professional templates at launch
- [ ] Templates use Minimals design system
- [ ] Template selection on quote creation
- [ ] Template customization (colors, fonts via settings)

---

#### 4.1.3 Client-Facing Quote Accept Page

**Description:** Clean, professional page where clients view, sign, and accept quotes with optional deposit payment.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| QT-020 | As a client, I want to view quotes without creating an account | P0 |
| QT-021 | As a client, I want to accept quotes with an electronic signature | P0 |
| QT-022 | As a client, I want to pay the deposit when I accept so the project can start | P0 |
| QT-023 | As a client, I want to view and sign contracts before accepting the quote | P0 |
| QT-024 | As a client, I want to download a PDF copy of the quote | P1 |
| QT-025 | As a client, I want to ask questions about the quote without leaving the page | P2 |

**Acceptance Criteria:**

- [ ] Accessible via secure link (no login required)
- [ ] Mobile-responsive design (priority on mobile)
- [ ] Page loads in < 3 seconds on 4G connection
- [ ] Clear visual hierarchy focused on "Accept" CTA
- [ ] Company branding (logo, colors) displayed
- [ ] Quote details clearly presented:
  - Client name and address
  - Quote number and date
  - Line items with descriptions
  - Subtotal, tax, total
  - Payment schedule (if deposits/milestones)
  - Expiration date (if set)

**Contract Signing Flow (if attached):**
- [ ] Contract displayed before accept button is enabled
- [ ] "I agree to the terms" checkbox
- [ ] Full contract viewable in modal or inline
- [ ] Flow: View Contract -> Sign Contract -> Accept Quote

**E-Signature Capture:**
- [ ] Draw signature with mouse/finger
- [ ] Type signature option (auto-generate cursive)
- [ ] Legal disclaimer text displayed
- [ ] Timestamp and IP address recorded
- [ ] Signature data stored securely

**Deposit Payment (if configured):**
- [ ] Deposit amount clearly displayed
- [ ] Payment method selection (Credit Card, ACH)
- [ ] Secure Stripe-powered checkout
- [ ] Payment required to complete acceptance
- [ ] Payment confirmation displayed

**Post-Acceptance:**
- [ ] Confirmation message displayed
- [ ] Signed quote PDF sent to both parties
- [ ] Quote status updated to "Accepted"
- [ ] Invoice auto-generated (if setting enabled)
- [ ] Thank you email sent to client

---

### 4.2 Invoices Module

#### 4.2.1 Invoices List Page

**Description:** Central hub for managing all invoices with the same structure as Quotes list.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| IN-001 | As a user, I want to view all invoices in a list so I can manage my billing | P0 |
| IN-002 | As a user, I want to filter invoices by status so I can focus on what needs attention | P0 |
| IN-003 | As a user, I want to see overdue invoices highlighted so I know what to follow up on | P0 |

**Acceptance Criteria:**

- [ ] Same list structure as Quotes list
- [ ] Status badges: Draft, Unpaid, Paid, Overdue, Partial
- [ ] Overdue invoices visually highlighted (red badge, sorted first option)
- [ ] Filter by status, date range, client
- [ ] Sort by date, amount, status, client

**Row Actions:**

| Action | Description |
|--------|-------------|
| Open | View invoice details |
| Copy Public Link | Copy client payment URL |
| Manage Payments | View/record payments |
| Edit | Edit invoice (if not paid) |
| Send | Send invoice via email |
| Send Reminder | Send payment reminder |
| Recurring Settings | Configure recurring schedule |
| Download PDF | Generate and download PDF |
| Duplicate | Create copy of invoice |
| Delete | Move to trash (soft delete) |

---

#### 4.2.2 Create/Edit Invoice Flow

**Description:** Visual builder for invoices, consistent with quote editor but with payment-specific features.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| IN-010 | As Claire, I want to convert accepted quotes to invoices with one click | P0 |
| IN-011 | As a user, I want to create invoices from scratch when not starting from a quote | P0 |
| IN-012 | As Chris, I want to set up milestone payment schedules for large projects | P0 |
| IN-013 | As a user, I want to offer discounts (% or $) on invoices | P1 |
| IN-014 | As a user, I want to enable client tipping/gratuity | P2 |

**Acceptance Criteria:**

**Header Section:**
- [ ] Customer selector (pre-filled if from quote)
- [ ] Issue Date picker
- [ ] Due Date picker (with preset options: Net 7, Net 14, Net 30, Custom)
- [ ] Auto-generated Invoice # (customizable format)
- [ ] Reference to source quote (if converted)

**Line Items:**
- [ ] Same visual editor as quotes
- [ ] Pre-filled if converted from quote
- [ ] Tax settings per line item (inclusive/exclusive toggle)
- [ ] Tax calculation preview

**Payment Settings (CRITICAL):**

| Setting | Options | Description |
|---------|---------|-------------|
| Payment Schedule | One-time, Deposit first, Retainers, Split payments (Milestones), Recurring | How payments are structured |
| Discounts | Percentage (%) or Fixed Amount ($) | Discount applied to total |
| Gratuity | Enable/Disable | Allow client tipping |
| Payment Methods | Credit Card toggle, ACH toggle | Which methods are accepted |
| Fee Pass-through | Enable/Disable | Pass processing fees to client |

**Payment Schedule Builder:**
- [ ] Visual schedule builder for milestones
- [ ] Add/remove payment milestones
- [ ] Set amount (% or $) per milestone
- [ ] Set due date or trigger (e.g., "upon completion")
- [ ] Schedule templates: 50/50, 30/30/40, Monthly, Custom
- [ ] Preview of payment timeline

**Recurring Invoice Settings:**
- [ ] Frequency: Weekly, Bi-weekly, Monthly, Quarterly, Annually
- [ ] Start date
- [ ] End date or "Until cancelled"
- [ ] Auto-send toggle
- [ ] Auto-charge saved payment method toggle

**Preview Modes:**
- [ ] Payment Page (what client sees)
- [ ] Email Preview
- [ ] PDF Preview

---

#### 4.2.3 Client-Facing Payment Page

**Description:** Clean, simplified page focused on making payment easy for clients.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| IN-020 | As a client, I want to view my invoice and pay without creating an account | P0 |
| IN-021 | As a client, I want to choose between credit card and bank transfer | P0 |
| IN-022 | As a client, I want to make partial payments if allowed | P1 |
| IN-023 | As a client, I want to save my payment method for future invoices | P1 |
| IN-024 | As a client, I want a receipt immediately after paying | P0 |

**Acceptance Criteria:**

- [ ] Accessible via secure link (no login required)
- [ ] Mobile-responsive, optimized for mobile payment
- [ ] Clear "Pay" CTA above the fold
- [ ] Invoice summary visible:
  - Invoice number and date
  - Due date
  - Amount due
  - Payment schedule (if milestones)
  - Link to view full invoice details

**Payment Methods:**
- [ ] Credit Card (Visa, Mastercard, Amex)
- [ ] ACH/Bank Transfer
- [ ] Processing fee display (if pass-through enabled)
- [ ] Fee comparison between methods

**Partial Payment Support (if enabled):**
- [ ] Option to pay full amount or partial
- [ ] Minimum partial payment amount (configurable)
- [ ] Remaining balance displayed after partial

**Payment Confirmation:**
- [ ] Confirmation page with receipt summary
- [ ] Receipt PDF downloadable
- [ ] Email confirmation sent
- [ ] Invoice status updated immediately

---

### 4.3 Rate Card System

**Description:** Advanced rate card management for quick quote creation with predefined services and pricing. This is a key differentiator - no competitor offers this level of rate management.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| RC-001 | As Claire, I want to maintain a rate card of my services so I can quickly add items to quotes | P0 |
| RC-002 | As a user, I want multiple pricing tiers per service (hourly, daily, project) | P0 |
| RC-003 | As a user, I want to organize rate card items with categories/tags | P0 |
| RC-004 | As a user, I want to quickly add rate card items to quotes | P0 |
| RC-005 | As a user, I want to bulk import/export rate cards via CSV | P1 |
| RC-006 | As a user, I want to override rate card pricing on specific quotes | P0 |

**Acceptance Criteria:**

**Rate Card List:**
- [ ] List view of all rate card items
- [ ] Columns: Name, Description, Pricing Tiers, Category, Last Used
- [ ] Filter by category/tag
- [ ] Search by name or description
- [ ] Quick edit inline

**Rate Card Item Editor:**
- [ ] Item Name (required)
- [ ] Description (rich text, optional)
- [ ] Unit Type selector: Hourly, Daily, Weekly, Monthly, Project-based, Per Item
- [ ] Pricing input based on unit type
- [ ] Multiple pricing tiers:
  - Tier Name (e.g., "Standard", "Rush", "Premium")
  - Tier Price
  - Tier Description
- [ ] Category selector (create new or select existing)
- [ ] Tags (multi-select, create new)
- [ ] Default tax rate

**Pricing Tier Examples:**

| Service | Hourly | Daily | Project |
|---------|--------|-------|---------|
| Logo Design | $150/hr | $1,000/day | $2,500 |
| Brand Guidelines | $125/hr | $900/day | $3,500 |
| Website Design | $175/hr | $1,200/day | $8,000+ |

**Quick-Add to Quotes:**
- [ ] Rate card picker modal in quote editor
- [ ] Search/filter rate card items
- [ ] Select tier when adding
- [ ] One-click add to quote
- [ ] Price can be overridden after adding
- [ ] "Add all from package" option for bundled services

**Bulk Import/Export:**
- [ ] CSV export of all rate card items
- [ ] CSV import with validation
- [ ] Template CSV downloadable
- [ ] Import preview with error highlighting
- [ ] Merge or replace option on import

**Rate Card Visual Editor:**
- [ ] Matches overall design language (Shadcn/Minimals)
- [ ] Drag-and-drop reorder categories
- [ ] Collapse/expand categories

---

### 4.4 Contracts Module

**Description:** Contract templates with merge fields and e-signature collection, integrated with quotes.

**Priority:** P1 (Should Have - v1.1)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| CT-001 | As Chris, I want to attach contracts to quotes so clients sign before work begins | P0 |
| CT-002 | As a user, I want contract templates with merge fields so contracts auto-fill | P1 |
| CT-003 | As a user, I want to collect e-signatures (drawn or typed) | P0 |
| CT-004 | As a user, I want signed contracts stored and easily retrievable | P0 |

**Acceptance Criteria:**

**Contract Templates:**
- [ ] Template editor with rich text
- [ ] Merge fields: {{client_name}}, {{project_name}}, {{quote_total}}, {{date}}, etc.
- [ ] Preview with sample data
- [ ] Industry template library (5+ templates):
  - General Services Agreement
  - Creative Services Contract
  - Construction/Renovation Contract
  - Consulting Agreement
  - Retainer Agreement

**Contract Attachment:**
- [ ] Attach existing template to quote
- [ ] Upload custom contract (PDF)
- [ ] Multiple contracts per quote (rare but supported)

**E-Signature Collection:**
- [ ] Draw signature (canvas, works on touch)
- [ ] Type signature (rendered in script font)
- [ ] Both parties can sign
- [ ] Signature legally binding (E-SIGN, UETA compliant)
- [ ] Audit trail: timestamp, IP address, user agent

**Signed Contract Storage:**
- [ ] PDF generated with embedded signatures
- [ ] Stored linked to quote/project
- [ ] Quick retrieval from client profile
- [ ] Download and share options

---

### 4.5 Clients/Contacts Module

**Description:** Client list with profiles, history, and quick actions.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| CL-001 | As a user, I want to maintain a list of clients with contact information | P0 |
| CL-002 | As a user, I want to see all quotes/invoices for a client in one place | P0 |
| CL-003 | As a user, I want to quickly create a new quote for an existing client | P0 |
| CL-004 | As a user, I want to search and filter my client list | P0 |

**Acceptance Criteria:**

**Client List:**
- [ ] List view with columns: Name, Company, Email, Phone, Total Billed, Last Activity
- [ ] Search by name, email, company
- [ ] Filter by: Active/Inactive, Has Outstanding, Date Range
- [ ] Sort by name, recent activity, total billed

**Client Profile:**
- [ ] Contact Information:
  - Name (required)
  - Company (optional)
  - Email (required)
  - Phone (optional)
  - Address (optional, multi-line)
  - Notes (rich text)
- [ ] Custom fields (configurable in settings)

**Client History:**
- [ ] Quotes tab: All quotes for client
- [ ] Invoices tab: All invoices for client
- [ ] Payments tab: All payments from client
- [ ] Activity timeline: Recent activity feed
- [ ] Lifetime value: Total paid to date

**Quick Actions from Profile:**
- [ ] New Quote for Client
- [ ] New Invoice for Client
- [ ] Send Message (opens email composer)
- [ ] View Outstanding Balance

---

### 4.6 Payments Module

**Description:** Payment recording, tracking, and automated reminders.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| PM-001 | As a user, I want payments recorded automatically when clients pay online | P0 |
| PM-002 | As a user, I want to manually record payments (checks, cash) | P0 |
| PM-003 | As a user, I want to track partial payments against invoices | P0 |
| PM-004 | As a user, I want automated payment reminders so I don't chase clients manually | P0 |
| PM-005 | As a user, I want to process refunds when needed | P1 |

**Acceptance Criteria:**

**Payment Recording:**
- [ ] Automatic: Stripe webhook updates payment status
- [ ] Manual: Record payment with amount, date, method, notes
- [ ] Payment methods: Credit Card, ACH, Check, Cash, Other
- [ ] Partial payment tracking with remaining balance
- [ ] Payment receipt generated

**Payment History:**
- [ ] Per-invoice payment history
- [ ] Per-client payment history
- [ ] Global payment log (all payments)
- [ ] Export payment history to CSV

**Payment Reminders (Automated):**
- [ ] Configurable reminder schedule:
  - X days before due date
  - On due date
  - X days after due date (overdue)
- [ ] Customizable email templates
- [ ] Enable/disable per invoice
- [ ] Reminder history tracking
- [ ] Stop reminders when paid

**Refund Processing:**
- [ ] Initiate refund from payment record
- [ ] Full or partial refund
- [ ] Refund processed via Stripe
- [ ] Invoice status updated to reflect refund
- [ ] Refund confirmation to client

---

### 4.7 Dashboard

**Description:** Overview metrics, recent activity, and quick actions for day-to-day management.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| DB-001 | As a user, I want to see key metrics at a glance when I log in | P0 |
| DB-002 | As a user, I want to see recent activity to stay on top of my business | P0 |
| DB-003 | As a user, I want quick actions to create quotes/invoices without navigation | P0 |
| DB-004 | As Chris, I want to see expected cash flow so I can plan ahead | P1 |

**Acceptance Criteria:**

**Overview Metrics:**

| Metric | Description |
|--------|-------------|
| Revenue This Month | Total paid invoices this month |
| Outstanding Invoices | Total amount owed (unpaid + overdue) |
| Overdue Amount | Amount past due date |
| Quotes Pending | Number of sent quotes awaiting response |
| Accepted This Month | Number of quotes accepted this month |
| Quote-to-Close Rate | % of sent quotes that were accepted |

**Metric Cards:**
- [ ] Visual cards with metric value and comparison to previous period
- [ ] Click to view detailed breakdown
- [ ] Positive/negative trend indicators

**Recent Activity Feed:**
- [ ] Timeline of recent events:
  - Quote sent/viewed/accepted/declined
  - Invoice sent/viewed/paid
  - Payment received
  - Reminder sent
- [ ] Filterable by type
- [ ] Click to navigate to relevant item
- [ ] Show 10 most recent, "View All" link

**Quick Actions:**
- [ ] "New Quote" button (prominent)
- [ ] "New Invoice" button
- [ ] "New Client" button
- [ ] Search bar (global search)

**Cash Flow View (P1):**
- [ ] Expected payments calendar view
- [ ] List of upcoming payments by date
- [ ] Overdue items highlighted

---

### 4.8 Settings

**Description:** Business profile, integrations, customization, and user preferences.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| ST-001 | As a user, I want to configure my business profile (logo, name, address) | P0 |
| ST-002 | As a user, I want to connect Stripe for payment processing | P0 |
| ST-003 | As a user, I want to customize email templates | P1 |
| ST-004 | As a user, I want to configure tax rates and defaults | P0 |
| ST-005 | As a user, I want to customize branding for client-facing pages | P1 |
| ST-006 | As a user, I want to manage which modules are enabled | P0 |

**Acceptance Criteria:**

**Business Profile:**
- [ ] Business name
- [ ] Logo upload (PNG, JPG, max 5MB)
- [ ] Business address (for invoices)
- [ ] Contact email
- [ ] Contact phone
- [ ] Website URL
- [ ] Business registration/tax ID (optional)

**Payment Gateway Configuration:**
- [ ] Stripe Connect integration
- [ ] Connect Stripe account flow (OAuth)
- [ ] Test mode toggle
- [ ] Payment method toggles: Credit Card, ACH
- [ ] Fee pass-through settings
- [ ] Payout schedule display (from Stripe)

**Email Templates:**
- [ ] Quote sent email template
- [ ] Quote accepted email template
- [ ] Invoice sent email template
- [ ] Payment reminder templates (multiple for schedule)
- [ ] Payment received email template
- [ ] Variables/merge fields support
- [ ] Preview before save
- [ ] Reset to default option

**Tax Settings:**
- [ ] Default tax rate
- [ ] Multiple tax rates (for different regions/types)
- [ ] Tax inclusive/exclusive default
- [ ] Tax ID display on documents

**Branding Settings:**
- [ ] Primary color picker
- [ ] Secondary color picker
- [ ] Font selection (from approved list)
- [ ] Client-facing page preview
- [ ] PDF template selection

**Module Management:**
- [ ] Toggle modules on/off:
  - Quotes (always on)
  - Contracts
  - Invoices
  - Rate Cards
- [ ] Workspace shows only enabled modules
- [ ] Data preserved when module disabled

**User Preferences:**
- [ ] Date format
- [ ] Currency (display format)
- [ ] Time zone
- [ ] Notification preferences (email, in-app)

---

### 4.9 Modular Setup (Onboarding)

**Description:** Guided onboarding that lets users choose which modules to enable, creating a focused workspace.

**Priority:** P0 (Must Have)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| ON-001 | As a new user, I want to sign up quickly with just email | P0 |
| ON-002 | As a new user, I want to choose which modules I need so my workspace isn't cluttered | P0 |
| ON-003 | As a new user, I want guided setup to configure my business | P0 |
| ON-004 | As a new user, I want to send my first quote within 10 minutes of signup | P0 |
| ON-005 | As a new user, I want to skip optional steps and come back later | P0 |

**Acceptance Criteria:**

**Signup:**
- [ ] Email-only signup (required)
- [ ] Google OAuth option (optional)
- [ ] No credit card required for trial
- [ ] Password creation after email verification
- [ ] Instant access to dashboard (email verification async)

**Module Selection Step:**
- [ ] Clear explanation of each module
- [ ] Recommended selections based on user type
- [ ] Modules:
  - **Quotes** (default enabled, can't disable)
  - **Contracts** (optional, recommended for Chris)
  - **Invoices** (default enabled, can disable)
  - **Rate Cards** (optional, recommended for Claire)
- [ ] Visual preview of workspace with selected modules

**Setup Wizard:**

| Step | Required | Fields |
|------|----------|--------|
| 1. Business Basics | Yes | Business name, email |
| 2. Branding | No (skip) | Logo, colors |
| 3. Payment Setup | No (skip) | Stripe Connect |
| 4. Module Selection | Yes | Choose modules |
| 5. First Template | Yes | Select quote template |

- [ ] Progress indicator showing steps
- [ ] "Skip for now" on optional steps
- [ ] Estimated time remaining displayed
- [ ] Complete in < 5 minutes

**First Quote Guidance:**
- [ ] Tooltip hints on first quote creation
- [ ] Sample content suggestions
- [ ] Template pre-selected
- [ ] Celebration moment on first quote sent

**Post-Onboarding:**
- [ ] Checklist of recommended next steps
- [ ] Tutorial links for each module
- [ ] Support access information

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Page Load Time | < 3 seconds | Core Web Vitals (LCP) |
| Time to Interactive | < 4 seconds | TTI metric |
| First Contentful Paint | < 1.5 seconds | FCP metric |
| API Response Time | < 500ms (95th percentile) | Server logs |
| PDF Generation | < 5 seconds | User-perceived time |
| Search Results | < 300ms | Debounced, incremental |

### 5.2 Scalability

| Requirement | Target |
|-------------|--------|
| Concurrent Users | 1,000+ per instance |
| Documents per Account | 100,000+ |
| Clients per Account | 10,000+ |
| File Storage | 10GB per account (configurable) |
| Database Size | < 100GB per instance |

### 5.3 Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | JWT tokens, secure HTTP-only cookies |
| Password Storage | bcrypt with cost factor 12+ |
| Data Encryption | TLS 1.3 in transit, AES-256 at rest |
| PCI Compliance | Stripe handles all card data (PCI-DSS) |
| Session Management | 24-hour expiry, refresh token rotation |
| API Security | Rate limiting (100 req/min), CORS configuration |
| E-Signature Compliance | E-SIGN Act, UETA compliant |
| Audit Logging | All sensitive actions logged with timestamp, user, IP |

### 5.4 Accessibility

| Requirement | Standard |
|-------------|----------|
| WCAG Compliance | Level AA |
| Keyboard Navigation | Full keyboard support |
| Screen Reader Support | ARIA labels, semantic HTML |
| Color Contrast | Minimum 4.5:1 ratio |
| Focus Indicators | Visible focus states |
| Text Scaling | Support up to 200% zoom |

### 5.5 Reliability

| Requirement | Target |
|-------------|--------|
| Uptime (Cloud) | 99.5% |
| Data Backup | Daily automated backups |
| Backup Retention | 30 days |
| Recovery Time Objective | < 4 hours |
| Recovery Point Objective | < 24 hours |

### 5.6 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| Mobile Safari | iOS 14+ |
| Chrome Android | Latest |

### 5.7 Deployment Requirements

| Requirement | Specification |
|-------------|---------------|
| Docker Support | Single-command docker-compose deployment |
| Docker Image Size | < 500MB |
| Memory Usage | < 1GB baseline |
| Database | PostgreSQL 14+ |
| Node.js | 18 LTS or later |
| SSL/TLS | Required for production |

---

## 6. Out of Scope

The following features are explicitly **NOT** being built. This prevents scope creep and maintains focus.

### 6.1 Explicitly Excluded Features

| Feature | Reason | Alternative |
|---------|--------|-------------|
| **Full Accounting** | Different product category | Integrate with QuickBooks/Xero |
| **CRM/Lead Management** | Scope creep, HoneyBook territory | Basic client list only |
| **Project Management** | Different product category | Integrate with Asana/Monday |
| **Time Tracking** | Outside core value prop | Integrate with Toggl/Harvest |
| **Inventory Management** | B2B service focus, not products | Out of scope |
| **Multi-Currency** | Complexity for initial market | Post-MVP if demand |
| **Mobile Native App** | Web-first approach | PWA later |
| **AI-Powered Features** | Premature, needs data | Post-product-market-fit |
| **Marketplace/Template Store** | Platform play, not MVP | Year 2+ |
| **Multi-Language UI** | Complexity | English only for MVP |
| **Advanced Reporting** | Beyond basic dashboard | Post-MVP |
| **Payroll** | Different product category | Integrate with Gusto |
| **Scheduling/Booking** | Phase 2 consideration | Focus on quotes first |

### 6.2 Features Deferred to Future Versions

| Feature | Target Version | Rationale |
|---------|----------------|-----------|
| Milestone Payment Builder | v1.1 | Core deposit works in MVP |
| QuickBooks Integration | v1.1 | Focus on standalone value first |
| Team/Multi-User | v1.2 | Solo users are primary target |
| Change Order Workflow | v1.2 | Contract module extension |
| White Label | v1.2 | Agency tier feature |
| API Access | v1.2 | Platform play |
| Calendar Integration | v1.2 | Nice-to-have |
| Block-Based Editor (Notion-like) | v1.2 | Visual builder MVP first |

---

## 7. Success Metrics

### 7.1 Primary Metrics (North Star)

| Metric | Target | Timeline | Measurement |
|--------|--------|----------|-------------|
| **Weekly Active Users Who Get Paid** | 100 | Month 3 | Users with paid invoice in last 7 days |
| **Monthly Recurring Revenue** | $5,000 | Month 6 | Stripe subscriptions |
| **Net Promoter Score** | > 40 | Month 6 | In-app survey at day 14 |

### 7.2 Activation Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Signup Completion Rate | > 80% | Started vs completed signup |
| Time to First Quote | < 15 minutes | Signup to quote created |
| First Quote Sent (24hr) | > 40% | Users who send quote within 24hr |
| Onboarding Completion | > 70% | Full setup wizard completion |
| Module Selection | Track | Which modules users enable |

### 7.3 Engagement Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Quote-to-Invoice Conversion | > 90% | Invoices created from quotes |
| Payment Reminder Usage | > 80% | Invoices with reminders enabled |
| Rate Card Adoption | > 50% | Users with 5+ rate card items |
| Mobile Usage | > 30% | Sessions from mobile devices |
| Weekly Return Rate | > 60% | Users returning within 7 days |

### 7.4 Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Trial-to-Paid Conversion | > 10% | Signups to paid subscribers |
| Monthly Churn | < 5% | Cancelled subscriptions |
| Average Revenue Per User | > $30 | MRR / paying customers |
| Customer Acquisition Cost | < $50 | Marketing spend / new customers |
| Lifetime Value | > $300 | ARPU x average customer lifespan |

### 7.5 Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| P0 Bugs in Production | 0 | Bug tracking system |
| Page Load Time | < 3s | Core Web Vitals monitoring |
| Error Rate | < 0.1% | Error tracking (Sentry) |
| Support Tickets per User | < 0.5/month | Support system |
| Payment Success Rate | > 98% | Stripe dashboard |

### 7.6 Kill Criteria

If after 45 days post-launch any of these are true, reassess strategy:

| Kill Signal | Threshold | Response |
|-------------|-----------|----------|
| Paying customers | < 20 (vs 50 target) | Diagnose product/market fit |
| Trial-to-paid conversion | < 5% (vs 10% target) | Pricing/value problem |
| Activation rate | < 20% (vs 40% target) | Onboarding/UX problem |
| NPS score | < 0 (negative) | Fundamental product issue |
| >30% cite "wrong features" | Churn survey | Feature pivot needed |

---

## 8. Glossary

| Term | Definition |
|------|------------|
| **Quote** | A document sent to a client proposing work and pricing; may include terms and require acceptance |
| **Invoice** | A document requesting payment for work; includes due date and payment instructions |
| **Contract** | A legally binding agreement defining terms of work; may be attached to quotes |
| **E-Signature** | Electronic signature for legally binding acceptance; compliant with E-SIGN Act |
| **Deposit** | Upfront payment required before work begins; typically 25-50% of project total |
| **Milestone** | A payment triggered by completing a project phase; used for large projects |
| **Retainer** | Recurring payment for ongoing services; billed monthly or per agreed schedule |
| **Rate Card** | A catalog of services with predefined pricing tiers; used for quick quote creation |
| **Block Editor** | Drag-and-drop document editor with modular content blocks |
| **Module** | A feature set that can be enabled/disabled (e.g., Quotes, Contracts, Invoices) |
| **Client Portal** | Web page where clients view, accept, and pay for quotes/invoices |
| **Stripe Connect** | Payment platform integration allowing users to accept payments |
| **ACH** | Automated Clearing House; bank-to-bank electronic payment method |
| **PCI-DSS** | Payment Card Industry Data Security Standard; we comply via Stripe |
| **ARPU** | Average Revenue Per User |
| **MRR** | Monthly Recurring Revenue |
| **NPS** | Net Promoter Score; measure of customer satisfaction |
| **LTV** | Lifetime Value; total revenue expected from a customer |
| **CAC** | Customer Acquisition Cost |
| **Shadcn UI** | React component library used for UI implementation |
| **Minimals** | Design system providing visual language and styling |
| **Docker** | Containerization platform for self-hosted deployment |
| **PWA** | Progressive Web App; web app with native-like capabilities |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | January 2026 | Product Team | Initial specification |

---

## Appendix A: Technical Architecture Overview

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React + TypeScript | Modern, type-safe, large talent pool |
| UI Components | Shadcn UI | High-quality, customizable, accessible |
| Design System | Minimals | Premium design language |
| Backend | Node.js + TypeScript | Full-stack JavaScript |
| Database | PostgreSQL | Relational data, proven reliability |
| Deployment | Docker + docker-compose | Self-hosted first |
| Payments | Stripe Connect | Industry standard |
| Email | SendGrid (or SMTP) | Reliable delivery |
| Auth | Passport.js | Self-hosted auth |
| PDF | Puppeteer or react-pdf | Quality output |

### Data Model (High-Level)

```
Users
  |-- Organizations (business profile)
       |-- Clients
       |-- Quotes
       |    |-- Quote Items
       |    |-- Quote Attachments
       |-- Invoices
       |    |-- Invoice Items
       |    |-- Payments
       |-- Contracts
       |-- Rate Cards
            |-- Rate Card Items
            |-- Pricing Tiers
```

---

## Appendix B: Competitive Feature Comparison

| Feature | QuoteCraft | Bloom | Bonsai | FreshBooks | Wave |
|---------|------------|-------|--------|------------|------|
| Visual Quote Builder | Yes | Yes | Partial | No | No |
| Self-Hosted Option | **Yes** | No | No | No | No |
| Open Source | **Yes** | No | No | No | No |
| Rate Card System | **Yes** | No | No | No | No |
| Modular Workspace | **Yes** | No | No | No | No |
| E-Signatures | Yes | Yes | Yes | No | No |
| One-Click Conversion | Yes | Partial | Partial | Limited | - |
| Starting Price | Free | $13/mo | $17/mo | $17/mo | Free |

---

## Appendix C: User Story Index

### P0 (Must Have) - MVP

| ID | Epic | Story Summary |
|----|------|---------------|
| QT-001 | Quotes | Navigate to quotes list |
| QT-002 | Quotes | Toggle between tabs |
| QT-003 | Quotes | Search quotes |
| QT-004 | Quotes | Sort quotes |
| QT-005 | Quotes | View quote status |
| QT-010 | Quote Builder | Create quote in < 10 min |
| QT-011 | Quote Builder | Add branding |
| QT-012 | Quote Builder | Add detailed line items |
| QT-013 | Quote Builder | Drag-and-drop reorder |
| QT-014 | Quote Builder | Real-time preview |
| QT-015 | Quote Builder | Save as draft |
| QT-020 | Client Portal | View without login |
| QT-021 | Client Portal | Accept with signature |
| QT-022 | Client Portal | Pay deposit |
| QT-023 | Client Portal | Sign contract |
| IN-001 | Invoices | View invoice list |
| IN-002 | Invoices | Filter by status |
| IN-003 | Invoices | Highlight overdue |
| IN-010 | Invoice Builder | Convert quote to invoice |
| IN-011 | Invoice Builder | Create from scratch |
| IN-020 | Client Portal | View and pay invoice |
| IN-021 | Client Portal | Choose payment method |
| IN-024 | Client Portal | Receive receipt |
| RC-001 | Rate Cards | Maintain rate card |
| RC-002 | Rate Cards | Multiple pricing tiers |
| RC-003 | Rate Cards | Organize with categories |
| RC-004 | Rate Cards | Quick-add to quotes |
| RC-006 | Rate Cards | Override pricing |
| CL-001 | Clients | Maintain client list |
| CL-002 | Clients | View client history |
| CL-003 | Clients | Quick create quote |
| CL-004 | Clients | Search and filter |
| PM-001 | Payments | Automatic recording |
| PM-002 | Payments | Manual recording |
| PM-003 | Payments | Partial payment tracking |
| PM-004 | Payments | Automated reminders |
| DB-001 | Dashboard | View metrics |
| DB-002 | Dashboard | Recent activity |
| DB-003 | Dashboard | Quick actions |
| ST-001 | Settings | Business profile |
| ST-002 | Settings | Payment gateway |
| ST-004 | Settings | Tax settings |
| ST-006 | Settings | Module management |
| ON-001 | Onboarding | Quick signup |
| ON-002 | Onboarding | Module selection |
| ON-003 | Onboarding | Guided setup |
| ON-004 | Onboarding | First quote < 10 min |
| ON-005 | Onboarding | Skip optional steps |

### P1 (Should Have) - v1.1

| ID | Epic | Story Summary |
|----|------|---------------|
| QT-016 | Quotes | Quote expiration |
| QT-017 | Quotes | File attachments |
| QT-024 | Client Portal | Download PDF |
| IN-012 | Invoices | Milestone payments |
| IN-013 | Invoices | Discounts |
| IN-022 | Client Portal | Partial payments |
| IN-023 | Client Portal | Save payment method |
| RC-005 | Rate Cards | Bulk import/export |
| CT-002 | Contracts | Template merge fields |
| PM-005 | Payments | Refunds |
| DB-004 | Dashboard | Cash flow view |
| ST-003 | Settings | Email templates |
| ST-005 | Settings | Branding customization |

### P2 (Nice to Have) - v1.2+

| ID | Epic | Story Summary |
|----|------|---------------|
| QT-025 | Client Portal | In-page questions |
| IN-014 | Invoices | Client tipping |

---

*End of Product Specification Document*
