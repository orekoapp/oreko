# MVP Definition: Invoices & Quotes Software

**Document Version:** 1.1
**Phase:** 9 - MVP Definition
**Last Updated:** January 2026
**Status:** Ready for Development Kickoff

---

## Executive Summary

This document defines the Minimum Viable Product (MVP) for our Invoices & Quotes software. The MVP is designed to validate core assumptions, deliver immediate value to target personas, and establish a foundation for iterative growth toward $100K ARR in Year 1.

**MVP Philosophy:**
> **Build the smallest thing that makes freelancers and contractors say "This is better than what I'm using now" - and proves they'll pay for it.**

We are NOT building a minimal product. We are building a **Minimum Lovable Product** that:
1. Solves the #1 pain point (quote-to-invoice friction) completely
2. Delivers immediate, measurable value (time saved, faster payments)
3. Validates willingness to pay $19-69/month
4. Creates word-of-mouth through delightful UX

**Key Technical Decisions:**
- **Self-Hosted First:** Docker-based deployment via docker-compose
- **UI/UX:** Shadcn UI components with Minimals design system (distinct from Bloom)
- **Visual Builder:** Drag-and-drop quote creation (NOT spreadsheet-like)
- **Modular Workspace:** Users choose which modules to enable (quotes/contracts/invoices)

---

## 1. MVP Philosophy

### What MVP Means for This Product

**We Are Building:**
- A **visual quote builder** with intuitive drag-and-drop UX (Bloom-inspired flow, distinct architecture)
- A focused quote-to-payment workflow that eliminates manual re-entry
- An **advanced rate card system** for quick service/pricing management
- A beautiful, professional document experience using Minimals design language
- Flexible payment scheduling that competitors don't offer well
- A **modular workspace** where users enable only what they need
- **Self-hosted deployment** via Docker for full data ownership
- A delightful experience that drives referrals

**We Are NOT Building:**
- A full CRM (that's HoneyBook/Dubsado territory)
- A complete accounting solution (that's QuickBooks/FreshBooks)
- A Bloom clone (different architecture, different visual language)
- Every feature for every persona
- Perfection on day one

### MVP Success Definition

The MVP succeeds when:
1. **50+ paying customers** within 30 days of launch
2. **>40% activation rate** (users who send first quote within 7 days)
3. **NPS >30** from early users
4. **<5% monthly churn** in months 2-3
5. **Testimonials** from 5+ customers we can publish

---

## 2. Problem Statement

### The Core Problem (One Sentence)

> **Freelancers and contractors waste hours recreating quote data in invoices, miss payments due to manual tracking, and look unprofessional compared to competitors - all while paying for multiple disconnected tools.**

### Problem Evidence

| Problem | Evidence | Impact |
|---------|----------|--------|
| Quote-to-invoice re-entry | 15-30 min wasted per project; 5-10% error rate | $6,000+ annual productivity loss |
| Payment chasing anxiety | 2-3 hours/month on follow-ups; relationship damage | 15-20% invoices paid late |
| Cash flow uncertainty | No visibility into payment pipeline | Cash flow stress affects 61% of SMBs |
| Unprofessional documents | DIY quotes undermine positioning | Lost deals, lower close rates |
| Tool fragmentation | 3+ tools for quotes/contracts/invoices | $50-150/month, workflow friction |

---

## 3. Target User (MVP Focus)

### Primary Persona: Creative Claire

| Attribute | Details |
|-----------|---------|
| **Who** | Freelance designer/consultant, 1-5 active clients |
| **Revenue** | $50K-$200K/year |
| **Current Tools** | Canva (quotes) + Wave/PayPal (invoices) + HelloSign (contracts) |
| **Top Pain** | Quote-to-invoice friction, chasing payments |
| **Willingness to Pay** | $15-39/month for clear time savings |

**Why Claire First:**
- Largest addressable segment (15-20M US freelancers)
- Lower support burden (solo operator)
- Viral potential (design community shares tools)
- Validates core value prop before adding complexity

### Secondary Persona: Contractor Chris (Light MVP Support)

| Attribute | Details |
|-----------|---------|
| **Who** | Renovation contractor, 4-7 person team |
| **Revenue** | $500K-$2M/year |
| **Current Tools** | Word templates + QuickBooks |
| **Top Pain** | Deposit/milestone payments, scope documentation |
| **Willingness to Pay** | $39-69/month |

**MVP Strategy for Chris:**
- Core workflow works for Chris
- Payment scheduling (deposits, milestones) included
- Full contractor-specific features in v1.1-1.2

### Explicitly NOT Targeting in MVP

- **Enterprise Emily** - Complex procurement, SOC2 requirements
- **Agency Amanda** - Multi-user collaboration (v1.1)
- **Retail Rachel** - Product-based, inventory needs
- **Hobbyist Henry** - <$5K revenue, won't pay

---

## 4. MVP Scope Definition

### 4.1 Must-Have Features (MVP v1.0)

These features are **required** for launch. Without them, the product fails to deliver core value.

#### Feature 1: Visual Quote Builder

| Aspect | Specification |
|--------|---------------|
| **Description** | Create professional, branded quotes using a visual drag-and-drop builder interface (NOT spreadsheet-like) |
| **User Story** | As Claire, I want to create a beautiful quote in <10 minutes using a visual builder so I can respond to client inquiries professionally |
| **Acceptance Criteria** | - **Visual builder interface** - intuitive, modern UX inspired by Bloom but with distinct visual language<br>- Create quote with company branding (logo, colors)<br>- Add/edit/delete line items with visual feedback<br>- Drag-and-drop reordering of line items<br>- Auto-calculate totals with tax support<br>- Real-time preview (WYSIWYG)<br>- Save as draft<br>- 3+ professional templates using Minimals design system<br>- Mobile-responsive output |
| **Dependencies** | Client database, template system, Shadcn UI components |
| **Effort Estimate** | Large (2.5 weeks) |

#### Feature 2: One-Click Quote-to-Invoice Conversion

| Aspect | Specification |
|--------|---------------|
| **Description** | Convert accepted quote to invoice with single click, no data re-entry |
| **User Story** | As Claire, I want to convert an accepted quote to invoice instantly so I never waste time recreating data |
| **Acceptance Criteria** | - "Convert to Invoice" button on accepted quotes<br>- All line items, client info, amounts transferred automatically<br>- Invoice links back to original quote<br>- Option to review/edit before sending<br>- Works within 2 clicks |
| **Dependencies** | Quote system, Invoice system |
| **Effort Estimate** | Medium (1 week) |

#### Feature 3: Invoice Creation & Management

| Aspect | Specification |
|--------|---------------|
| **Description** | Create, send, and track professional invoices |
| **User Story** | As Claire, I want to send professional invoices and know when they're viewed/paid |
| **Acceptance Criteria** | - Create invoice with line items and branding<br>- Set due date and payment terms<br>- Send via email with tracking<br>- Status tracking (sent, viewed, paid, overdue)<br>- View notification when client opens<br>- Dashboard showing all invoice statuses |
| **Dependencies** | Email service, payment integration |
| **Effort Estimate** | Large (2 weeks) |

#### Feature 4: Payment Collection (Stripe Integration)

| Aspect | Specification |
|--------|---------------|
| **Description** | Accept credit card and ACH payments online |
| **User Story** | As Claire, I want clients to pay me online so I get paid faster and look professional |
| **Acceptance Criteria** | - Stripe Connect integration<br>- Credit card payments (2.9% + $0.30 + markup)<br>- ACH payments (0.8% + markup)<br>- Secure, PCI-compliant checkout<br>- Payment confirmation to both parties<br>- Automatic invoice status update on payment |
| **Dependencies** | Stripe account setup, webhook handling |
| **Effort Estimate** | Large (2 weeks) |

#### Feature 5: E-Signature on Quote Acceptance

| Aspect | Specification |
|--------|---------------|
| **Description** | Clients sign quotes electronically to formally accept |
| **User Story** | As Claire, I want clients to sign quotes so I have documented approval before starting work |
| **Acceptance Criteria** | - Signature capture (draw or type)<br>- Legally compliant (E-SIGN, UETA)<br>- Timestamp and IP address recorded<br>- Signed copy sent to both parties<br>- PDF download of signed document<br>- Quote status updates to "Accepted" |
| **Dependencies** | Document generation, email delivery |
| **Effort Estimate** | Large (2 weeks) |

#### Feature 6: Basic Payment Scheduling (Deposits)

| Aspect | Specification |
|--------|---------------|
| **Description** | Collect deposits on quote acceptance |
| **User Story** | As Chris, I want to collect a deposit when the client accepts so I have cash flow to start the project |
| **Acceptance Criteria** | - Set deposit amount (% or fixed) on quote<br>- Deposit collected on acceptance flow<br>- Clear display to client of what they're paying<br>- Remaining balance tracks automatically<br>- Invoice for balance can reference original quote |
| **Dependencies** | Payment integration, quote acceptance flow |
| **Effort Estimate** | Medium (1 week) |

#### Feature 7: Rate Card System

| Aspect | Specification |
|--------|---------------|
| **Description** | Advanced rate card management for quick quote creation with predefined services and pricing |
| **User Story** | As Claire, I want to maintain a rate card of my services so I can quickly add pre-configured items to quotes |
| **Acceptance Criteria** | - Create and manage service/product rate cards<br>- Define name, description, unit type, and pricing per item<br>- Support multiple pricing tiers (hourly, daily, project-based)<br>- Quick-add rate card items to quotes<br>- Bulk import/export rate cards<br>- Visual rate card editor matching overall design language<br>- Categories/tags for organizing rate card items<br>- Override pricing when adding to specific quotes |
| **Dependencies** | Quote builder, database schema |
| **Effort Estimate** | Medium (1.5 weeks) |

#### Feature 8: Automated Payment Reminders

| Aspect | Specification |
|--------|---------------|
| **Description** | Send automatic reminder emails for unpaid invoices |
| **User Story** | As Claire, I want automatic payment reminders so I don't have to awkwardly chase clients |
| **Acceptance Criteria** | - Configurable reminder schedule (before, on, after due date)<br>- Professional, customizable email templates<br>- Enable/disable per invoice<br>- Track reminder history<br>- Stop reminders when paid |
| **Dependencies** | Email service, scheduler |
| **Effort Estimate** | Medium (1 week) |

#### Feature 9: Client Portal (Basic)

| Aspect | Specification |
|--------|---------------|
| **Description** | Clients view and pay invoices/quotes without login |
| **User Story** | As a client, I want to view and pay easily from any device without creating an account |
| **Acceptance Criteria** | - Secure link access (no login required)<br>- Mobile-responsive view<br>- View quote/invoice details clearly<br>- Accept quote with signature<br>- Pay invoice with card/ACH<br>- Download PDF |
| **Dependencies** | Security layer, payment integration |
| **Effort Estimate** | Large (2 weeks) |

#### Feature 10: Dashboard & Reporting (Basic)

| Aspect | Specification |
|--------|---------------|
| **Description** | Overview of quotes, invoices, and payment status |
| **User Story** | As Claire, I want to see all my quotes and invoices in one place so I know what's going on |
| **Acceptance Criteria** | - Dashboard with status summary (quotes sent, accepted; invoices paid, overdue)<br>- List views with filters and search<br>- Quick actions (send reminder, convert, duplicate)<br>- Total outstanding amount visible<br>- Recent activity feed |
| **Dependencies** | Data aggregation |
| **Effort Estimate** | Medium (1 week) |

#### Feature 11: Modular Onboarding

| Aspect | Specification |
|--------|---------------|
| **Description** | Get users to first quote sent quickly with modular workspace setup |
| **User Story** | As a new user, I want to set up only the modules I need so my workspace stays clean and focused |
| **Acceptance Criteria** | - Signup with email only (Google OAuth optional)<br>- Setup wizard: company name, logo, payment setup<br>- **Modular setup step:** Choose which modules to enable:<br>  - Quotes module (default enabled)<br>  - Contracts module (optional)<br>  - Invoices module (optional)<br>- Users can enable/disable modules later in settings<br>- Workspace shows only enabled modules (prevents clutter)<br>- Skip option for non-essential steps<br>- First quote template pre-selected<br>- Tooltips on first quote creation<br>- Celebration on first quote sent |
| **Dependencies** | Auth system, Stripe Connect onboarding, module configuration system |
| **Effort Estimate** | Medium (1.5 weeks) |

---

### 4.2 Should-Have Features (v1.1 - 2-4 weeks post-launch)

Important features that can wait 1-2 sprints without blocking launch.

| Feature | Description | Persona Value | Effort |
|---------|-------------|---------------|--------|
| **Milestone Payment Schedule** | Visual builder for multi-payment projects (30/30/30/10) | Chris - Critical | Large |
| **Quote Templates Library** | 10+ industry-specific templates | Claire - High | Medium |
| **Saved Line Items** | Reusable line item library for quick quoting | Both - High | Medium |
| **Quote Duplication** | One-click duplicate for repeat clients | Claire - High | Small |
| **Contract Integration** | Attach/embed contract terms in quotes | Chris - High | Large |
| **Client Database** | Manage client contacts with history | Both - Medium | Medium |
| **QuickBooks Sync** | Export invoices to QuickBooks Online | Chris - Medium | Large |
| **Quote View Tracking** | Detailed analytics on quote views | Claire - Medium | Small |

---

### 4.3 Could-Have Features (v1.2+ - 2-3 months post-launch)

Nice to have features for future iterations.

| Feature | Description | Persona Value | Effort |
|---------|-------------|---------------|--------|
| **Block-Based Editor** | Notion-like drag-and-drop document editor | Claire - High | Very Large |
| **Recurring Invoices** | Auto-generate invoices on schedule | Both - Medium | Large |
| **Multi-User (Team)** | Add team members with permissions | Chris/Amanda - High | Very Large |
| **Calendar Integration** | Sync payment due dates to Google/Outlook | Both - Medium | Medium |
| **Change Order Workflow** | Formal change order process for contractors | Chris - High | Large |
| **White Label** | Remove branding for agencies | Amanda - Medium | Large |
| **API Access** | Public API for integrations | Developer - Low | Very Large |
| **Expense Pass-Through** | Add expenses to invoices | Chris - Medium | Medium |

---

### 4.4 Won't-Have Features (Explicitly Out of Scope)

These are NOT being built for MVP and should be actively avoided.

| Feature | Why Excluded | Alternative |
|---------|--------------|-------------|
| **Full Accounting** | Different problem, QuickBooks does this | Integrate with QuickBooks |
| **CRM/Contact Management** | Scope creep, HoneyBook territory | Basic client list only |
| **Project Management** | Different product category | External tools |
| **Time Tracking** | Outside core value prop | External tools |
| **Inventory Management** | B2B product, not service focus | Out of scope |
| **Multi-Currency** | Complexity for small market | Post-MVP if demand |
| **Mobile Native App** | Web-first, mobile-responsive sufficient | PWA later |
| **AI Features** | Premature, needs data first | Post-product-market-fit |
| **Marketplace/Templates Store** | Platform play, not MVP | Year 2+ |

---

## 5. Feature Details for MVP

### 5.1 Feature Prioritization Matrix

| Feature | User Value (1-10) | Business Value (1-10) | Effort (1-10) | Priority Score | Priority |
|---------|-------------------|----------------------|---------------|----------------|----------|
| Visual Quote Builder | 10 | 10 | 8 | 2.50 | P0 |
| One-Click Conversion | 10 | 9 | 4 | 4.75 | P0 |
| Invoice Management | 10 | 10 | 7 | 2.86 | P0 |
| Payment Collection | 9 | 10 | 7 | 2.71 | P0 |
| E-Signatures | 8 | 9 | 6 | 2.83 | P0 |
| Deposit Scheduling | 8 | 8 | 4 | 4.00 | P0 |
| **Rate Card System** | 9 | 8 | 5 | 3.40 | P0 |
| Payment Reminders | 9 | 8 | 4 | 4.25 | P0 |
| Client Portal | 8 | 8 | 7 | 2.29 | P0 |
| Dashboard | 7 | 7 | 4 | 3.50 | P0 |
| Modular Onboarding | 8 | 9 | 5 | 3.40 | P0 |

*Priority Score = (User Value + Business Value) / Effort. Higher is better.*

### 5.2 User Stories Summary

| Epic | Story ID | Story | Priority |
|------|----------|-------|----------|
| Onboarding | US-001 | As a new user, I want to sign up with just email so I can start quickly | P0 |
| Onboarding | US-002 | As a new user, I want guided setup with module selection so I know what to do first | P0 |
| Onboarding | US-003 | As a new user, I want to choose which modules (quotes/contracts/invoices) to enable | P0 |
| Quotes | US-010 | As Claire, I want to create a professional quote using a visual builder in <10 min | P0 |
| Quotes | US-011 | As Claire, I want to add my logo and brand colors | P0 |
| Quotes | US-012 | As Claire, I want to send quotes via email | P0 |
| Quotes | US-013 | As Chris, I want to set quote expiration dates | P0 |
| Rate Card | US-014 | As Claire, I want to manage a rate card of my services for quick quoting | P0 |
| Rate Card | US-015 | As Claire, I want to quickly add rate card items to quotes | P0 |
| Conversion | US-020 | As Claire, I want one-click quote-to-invoice conversion | P0 |
| Invoices | US-030 | As Claire, I want to create and send professional invoices | P0 |
| Invoices | US-031 | As Claire, I want to know when my invoice is viewed | P0 |
| Invoices | US-032 | As Claire, I want automatic payment reminders | P0 |
| Payments | US-040 | As a client, I want to pay by credit card easily | P0 |
| Payments | US-041 | As Chris, I want to collect deposits on acceptance | P0 |
| Signatures | US-050 | As Claire, I want clients to sign quotes electronically | P0 |
| Client | US-060 | As a client, I want to view quotes without logging in | P0 |
| Dashboard | US-070 | As Claire, I want to see all my quotes/invoices in one place | P0 |

---

## 6. Technical Requirements

### 6.1 Architecture Philosophy

**Self-Hosted First:** The product is designed for self-hosted deployment as the primary use case. This provides:
- Full data ownership and privacy for users
- No vendor lock-in
- Flexibility for customization
- Lower total cost of ownership for power users

### 6.2 Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend** | React + TypeScript | Modern, type-safe, large talent pool |
| **UI Components** | **Shadcn UI** | High-quality, customizable, accessible components |
| **Design System** | **Minimals** | Premium design language, distinct from competitors |
| **Backend** | Node.js + TypeScript | JavaScript full-stack, shared code |
| **Database** | PostgreSQL | Relational data, proven reliability |
| **Deployment** | **Docker + docker-compose** | Self-hosted first, easy deployment |
| **Payments** | Stripe Connect | Industry standard, developer-friendly |
| **Email** | SendGrid (or SMTP) | Reliable delivery, self-hosted SMTP option |
| **Auth** | Self-hosted auth (Passport.js) | No external dependency for self-hosted |
| **PDF Generation** | Puppeteer or react-pdf | Quality output, customizable |

### 6.3 Deployment Architecture

| Component | Technology | Notes |
|-----------|------------|-------|
| **Container Runtime** | Docker | All services containerized |
| **Orchestration** | docker-compose | Single-command deployment |
| **Database** | PostgreSQL (containerized) | Persistent volume for data |
| **Reverse Proxy** | Traefik or Nginx | SSL termination, routing |
| **File Storage** | Local volume or S3-compatible | Configurable per deployment |

**Deployment Options:**
1. **Self-Hosted (Primary):** Full docker-compose stack on user's infrastructure
2. **Cloud-Hosted (Future):** Managed SaaS option for users who prefer hosted solution

### 6.4 Visual Design Philosophy

**Visual Language:**
- Completely distinct from Bloom and other competitors
- Premium, modern aesthetic using Minimals design system
- Focus on visual builder experience (NOT spreadsheet-like)
- Clean, intuitive interfaces that users are proud to show clients

**Reference Point:**
- Bloom's UX is a reference for "Visual Quote" and "Booking" flow concepts
- NOT a copy - entirely different architecture, visual language, and implementation

### 6.5 Non-Functional Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **Page Load Time** | <3 seconds | Core Web Vitals |
| **Uptime** | 99.5% (self-hosted dependent) | Monitoring |
| **Mobile Responsive** | All screens 320px+ | Manual testing |
| **Security** | PCI-DSS compliant | Stripe handles card data |
| **Data Backup** | Daily backups, 30-day retention | Automated (Docker volumes) |
| **GDPR Compliance** | Yes | Privacy policy, data export |
| **Docker Image Size** | <500MB | Optimized multi-stage builds |
| **Memory Usage** | <1GB baseline | Container resource limits |

### 6.6 Integration Requirements

| Integration | Priority | MVP Scope |
|-------------|----------|-----------|
| **Stripe** | Required | Full payment processing |
| **Email (SendGrid)** | Required | Transactional emails |
| **Google OAuth** | Required | Optional signup method |
| **QuickBooks** | Post-MVP | v1.1 |
| **Xero** | Post-MVP | v1.2 |
| **Zapier** | Post-MVP | v1.2 |

---

## 7. Launch Criteria

### 7.1 Feature Completeness

All P0 features must meet acceptance criteria:

- [ ] Visual quote builder with templates and branding (Shadcn UI + Minimals)
- [ ] Rate card system for service/pricing management
- [ ] One-click quote-to-invoice conversion
- [ ] Invoice creation, sending, and tracking
- [ ] Stripe payment processing (CC + ACH)
- [ ] E-signature on quote acceptance
- [ ] Deposit collection on acceptance
- [ ] Automated payment reminders
- [ ] Client portal (no-login view and pay)
- [ ] Dashboard with status overview
- [ ] Modular onboarding flow with module selection <10 min to first quote

### 7.2 Quality Gates

| Gate | Criteria | Pass/Fail |
|------|----------|-----------|
| **Zero P0 Bugs** | No critical/blocking bugs | Must pass |
| **Performance** | All pages load <3 seconds on 4G | Must pass |
| **Mobile** | All flows work on mobile (iOS Safari, Chrome Android) | Must pass |
| **Security Audit** | No high/critical vulnerabilities | Must pass |
| **Payment Testing** | 10+ successful test payments (CC + ACH) | Must pass |
| **Email Delivery** | >95% delivery rate in testing | Must pass |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) | Must pass |
| **Docker Deployment** | Successful deployment via docker-compose | Must pass |

### 7.3 Business Readiness

| Item | Ready? |
|------|--------|
| Pricing page live | [ ] |
| Stripe Connect onboarding working | [ ] |
| Support email/system ready | [ ] |
| Help docs for top 10 questions | [ ] |
| Privacy policy and ToS published | [ ] |
| Analytics tracking implemented | [ ] |
| Error monitoring active (Sentry) | [ ] |
| Docker images published | [ ] |
| docker-compose.yml documented | [ ] |

---

## 8. Success Criteria (Validation)

### 8.1 Quantitative Success Metrics (30 Days Post-Launch)

| Metric | Target | Measurement | Pass/Fail |
|--------|--------|-------------|-----------|
| **Paying Customers** | >=50 | Stripe subscriptions | |
| **Trial Signups** | >=500 | Database count | |
| **Trial-to-Paid Conversion** | >=10% | Signup to payment | |
| **Activation Rate** | >=40% | % who send first quote in 7 days | |
| **Quote-to-Invoice Usage** | >=60% | % of invoices from converted quotes | |
| **Week 1 Retention** | >=50% | Return visit in week 1 | |
| **Month 1 Churn** | <=8% | Cancel/no-renew rate | |
| **MRR** | >=$1,500 | Monthly recurring revenue | |

### 8.2 Qualitative Success Signals

| Signal | Target | Measurement |
|--------|--------|-------------|
| **NPS Score** | >=30 | In-app survey at day 14 |
| **Feature Requests** | Aligned with roadmap | Support tickets, feedback |
| **Testimonials** | >=5 publishable | Outreach to happy users |
| **Word-of-Mouth** | Signs of referral traffic | Analytics, "how did you hear" |
| **Social Mentions** | Positive sentiment | Twitter, Reddit, communities |

### 8.3 Assumption Validation

| Assumption | How We'll Validate | Success Criteria |
|------------|-------------------|------------------|
| Users will pay $19-39/mo for this | Trial conversions | >=10% conversion |
| One-click conversion is killer feature | Feature usage analytics | >=60% use it |
| E-signatures are must-have | Feature usage + cancellation reasons | >=50% use signatures |
| Automated reminders reduce chasing pain | User feedback, NPS drivers | Listed as top value |
| Deposit scheduling matters | Feature adoption, Chris persona traction | >=30% set deposits |

---

## 9. Kill Criteria

### 9.1 When to Reconsider/Pivot

If after **45 days** post-launch any of these are true:

| Kill Signal | Threshold | Response |
|-------------|-----------|----------|
| Paying customers | <20 (vs 50 target) | Pause growth spend, diagnose |
| Trial-to-paid conversion | <5% (vs 10% target) | Product/pricing problem |
| Activation rate | <20% (vs 40% target) | Onboarding/UX problem |
| NPS score | <0 (negative) | Fundamental product issue |
| >30% cite "wrong features" | Churn survey | Pivot feature set |
| >50% request refund | Within 7 days | Product not delivering value |

### 9.2 Pivot Options (If Kill Criteria Met)

1. **Feature Pivot:** Double down on specific feature that IS working
2. **Persona Pivot:** Shift primary target (e.g., all-in on contractors)
3. **Price Pivot:** Test lower price point or freemium
4. **Channel Pivot:** Change acquisition strategy
5. **Product Pivot:** Apply learnings to adjacent problem

### 9.3 Decision Timeline

| Day | Decision Point |
|-----|----------------|
| Day 14 | Early signal review - adjust messaging/onboarding |
| Day 30 | First success review - continue/adjust |
| Day 45 | Kill criteria evaluation - continue/pivot/stop |
| Day 60 | Final MVP validation - scale or pivot |

---

## 10. MVP Timeline

### 10.1 High-Level Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Specification** | 1 week | Detailed specs, wireframes |
| **Architecture** | 1 week | Tech design, database schema, Docker setup |
| **Core Development** | 7 weeks | All P0 features |
| **Integration & Testing** | 1 week | Stripe, email, Docker testing, QA |
| **Soft Launch** | 1 week | Beta users (50-100) |
| **Public Launch** | 1 week | Marketing, launch activities |
| **Total** | **12 weeks** | |

### 10.2 Development Sprint Plan

**Sprint 1 (Weeks 1-2): Foundation & Infrastructure**
- [ ] Project setup (repo, CI/CD, environments)
- [ ] **Docker setup** (Dockerfile, docker-compose.yml)
- [ ] Database schema design (PostgreSQL)
- [ ] Auth system implementation (Passport.js)
- [ ] **Shadcn UI component library setup** with Minimals design tokens
- [ ] Modular onboarding flow (signup, module selection, setup)

**Sprint 2 (Weeks 3-4): Visual Quote Builder & Rate Cards**
- [ ] **Visual quote builder** (drag-and-drop, WYSIWYG)
- [ ] **Rate card system** (create, manage, import/export)
- [ ] Quick-add rate card items to quotes
- [ ] Template system (3 templates using Minimals)
- [ ] Quote status tracking

**Sprint 3 (Weeks 5-6): Quote Delivery & Signatures**
- [ ] Quote sending (email delivery)
- [ ] Client quote view (no-login)
- [ ] E-signature capture
- [ ] Quote acceptance flow
- [ ] Signed document generation

**Sprint 4 (Weeks 7-8): Payments & Deposits**
- [ ] Deposit collection flow
- [ ] Quote-to-invoice conversion
- [ ] Stripe Connect integration
- [ ] Payment processing (CC, ACH)
- [ ] Payment confirmation flow

**Sprint 5 (Weeks 9-10): Invoices & Automation**
- [ ] Invoice creation/editor (visual builder consistent with quotes)
- [ ] Invoice sending/tracking
- [ ] Payment reminders system
- [ ] Dashboard and reporting
- [ ] Client portal polish

**Sprint 6 (Weeks 11-12): Polish & Launch**
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] **Docker image optimization** (multi-stage builds)
- [ ] Security audit fixes
- [ ] Soft launch to beta users
- [ ] Feedback incorporation
- [ ] Documentation (docker-compose setup guide)
- [ ] Public launch

### 10.3 Key Milestones

| Date | Milestone | Success Criteria |
|------|-----------|------------------|
| Week 2 | Alpha: Docker dev environment + first quote creatable | docker-compose up works, team can create quote |
| Week 4 | Alpha: Visual builder + rate cards | Visual quote builder functional with rate cards |
| Week 6 | Beta: Quote acceptance with signatures | End-to-end quote flow works |
| Week 8 | Beta: Payments working | Test payments successful |
| Week 10 | RC: Feature complete | All P0 features done |
| Week 12 | Soft launch | 50 beta users onboarded via Docker
| Week 12 | Public launch | Open to all |

---

## 11. Risks & Mitigations

### 11.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Stripe integration complexity | Medium | High | Use Stripe Connect docs, allocate buffer time |
| PDF generation quality issues | Medium | Medium | Test early, have fallback approach |
| Email deliverability problems | Low | High | Use SendGrid, monitor delivery rates |
| Performance at scale | Low | Medium | Load test before launch, design for scale |
| Security vulnerabilities | Low | Critical | Security review, follow OWASP guidelines |

### 11.2 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Features don't resonate | Medium | High | User feedback during soft launch, quick iteration |
| UX too complex | Medium | Medium | Usability testing, simplify ruthlessly |
| Wrong persona priority | Low | High | Track persona mix in signups, adjust messaging |
| Competition ships similar | Medium | Medium | Move fast, focus on execution excellence |
| Scope creep delays launch | High | High | Strict P0 discipline, defer everything else |

### 11.3 Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Price resistance | Medium | High | Start with promotional pricing, test elasticity |
| Fiverr users choose established players | Medium | Medium | Superior migration offer, targeted content |
| Economic downturn affects freelancers | Low | Medium | Emphasize ROI messaging |
| HoneyBook/Dubsado improve rapidly | Medium | Medium | Focus on niche excellence, not feature parity |

### 11.4 Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Support overwhelm at launch | Medium | Medium | Strong docs, self-service first |
| Payment processor issues | Low | High | Have Stripe support contact, fallback options |
| Key team member unavailable | Low | High | Cross-training, documentation |

---

## 12. Dependencies

### 12.1 External Dependencies

| Dependency | Status | Risk | Mitigation |
|------------|--------|------|------------|
| Stripe Connect approval | Required | Low | Apply early, follow guidelines |
| SendGrid account | Required | Low | Standard signup |
| Domain and SSL | Required | Low | Already owned/managed |
| AWS/Hosting setup | Required | Low | Standard setup |

### 12.2 Internal Dependencies

| Dependency | Status | Risk | Mitigation |
|------------|--------|------|------------|
| Design system/components | Needed | Medium | Allocate design time week 1 |
| Quote templates (3) | Needed | Low | Design during sprint 2 |
| Copy/content | Needed | Low | Write during development |
| Marketing materials | Needed | Medium | Parallel track during dev |

---

## 13. Post-MVP Roadmap Preview

### v1.1 (Weeks 13-16): Enhancement
- Milestone payment scheduling (full)
- Quote templates library (10+)
- Client database with history
- Quote duplication
- Saved line items library

### v1.2 (Weeks 17-20): Expansion
- QuickBooks Online sync
- Contract templates
- Recurring invoices
- Quote view analytics
- Mobile optimizations

### v2.0 (Months 5-6): Platform
- Multi-user/teams
- Block-based editor
- Calendar integration
- API access
- White-label option

---

## 14. Handoff Checklist

### Research Artifacts Completed
- [x] Market opportunity validated (MARKET_ANALYSIS.md)
- [x] Target personas defined (USER_PERSONAS.md)
- [x] Problem validated with secondary research (INTERVIEW_SYNTHESIS.md)
- [x] Competitive positioning clear (COMPETITIVE_ANALYSIS.md)
- [x] Value proposition defined (VALUE_PROPOSITION.md)
- [x] Product strategy documented (PRODUCT_VISION.md)
- [x] Business model viable (BUSINESS_MODEL.md)
- [x] User journeys mapped (USER_JOURNEYS.md)
- [x] MVP scope locked (MVP_DEFINITION.md)

### Ready for Development
- [x] All P0 features clearly defined
- [x] Acceptance criteria written for each feature
- [x] Out of scope explicitly documented
- [x] Technical requirements specified
- [x] Timeline estimated
- [x] Risks identified with mitigations
- [x] Success/kill criteria defined

---

## Appendix A: MVP Feature Cards

### Feature Card Template

Each feature should have a detailed card before development:

```
FEATURE: [Name]
EPIC: [Epic Name]
PRIORITY: P0/P1/P2
EFFORT: Small/Medium/Large

USER STORY:
As a [persona], I want [goal] so that [benefit].

ACCEPTANCE CRITERIA:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

TECHNICAL NOTES:
- Implementation considerations
- API endpoints needed
- Data model changes

DESIGN REQUIREMENTS:
- Wireframe link
- UI components needed
- Mobile considerations

DEPENDENCIES:
- Other features required
- External services

TESTING REQUIREMENTS:
- Unit tests
- Integration tests
- User acceptance criteria
```

---

## Appendix B: Competitive Feature Gap (MVP Focus)

| Feature | Us (MVP) | HoneyBook | FreshBooks | Wave | Dubsado | Bloom |
|---------|----------|-----------|------------|------|---------|-------|
| **Visual quote builder** | **Yes** | Basic | No | No | Basic | **Yes** |
| **Rate card system** | **Yes** | No | Basic | No | No | Partial |
| **Modular workspace** | **Yes** | No | No | No | No | No |
| Quote creation | Yes | Yes | Yes | No | Yes | Yes |
| One-click quote-to-invoice | **Yes** | Partial | No | - | Partial | Yes |
| E-signatures | Yes | Yes | No | No | Yes | Yes |
| Deposit collection | Yes | Yes | Manual | No | Yes | Yes |
| Payment reminders | Yes | Yes | Basic | Basic | Yes | Yes |
| Credit card + ACH | Yes | Yes | Yes | Yes | Yes | Yes |
| No-login client view | Yes | Yes | Yes | Yes | Yes | Yes |
| Mobile-responsive | Yes | Yes | Yes | Yes | No | Yes |
| **Self-hosted option** | **Yes** | No | No | No | No | No |
| **Starting Price** | **$19/mo** | $29/mo | $17/mo | Free | $35/mo | $13/mo |

**Key Differentiators:**
- **Visual Builder UX:** Inspired by Bloom's approach but with completely different architecture and Minimals visual language
- **Rate Card System:** More advanced than any competitor - full service catalog management
- **Modular Workspace:** Users choose only the modules they need (quotes/contracts/invoices)
- **Self-Hosted:** Only solution offering full Docker-based self-hosting option

---

## Appendix C: User Story Backlog (P0 Only)

| ID | Story | Epic | Points |
|----|-------|------|--------|
| US-001 | Sign up with email | Onboarding | 3 |
| US-002 | Guided setup wizard with module selection | Onboarding | 5 |
| US-003 | Choose modules (quotes/contracts/invoices) | Onboarding | 3 |
| US-010 | Create quote using visual builder | Quotes | 10 |
| US-011 | Add branding to quote | Quotes | 3 |
| US-012 | Send quote via email | Quotes | 5 |
| US-013 | Set quote expiration | Quotes | 2 |
| US-014 | Create and manage rate card items | Rate Card | 5 |
| US-015 | Quick-add rate card items to quotes | Rate Card | 3 |
| US-016 | Import/export rate cards | Rate Card | 3 |
| US-020 | Convert quote to invoice | Conversion | 5 |
| US-030 | Create invoice | Invoices | 8 |
| US-031 | Send invoice with tracking | Invoices | 5 |
| US-032 | Set up payment reminders | Invoices | 5 |
| US-040 | Accept credit card payment | Payments | 8 |
| US-041 | Accept ACH payment | Payments | 5 |
| US-042 | Collect deposit on acceptance | Payments | 5 |
| US-050 | E-signature on quote | Signatures | 8 |
| US-060 | Client views quote (no login) | Client Portal | 5 |
| US-061 | Client accepts and pays | Client Portal | 5 |
| US-070 | Dashboard overview | Dashboard | 5 |
| US-071 | Quote/invoice list views | Dashboard | 3 |
| **Total** | | | **109 points** |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | MVP Definer Agent | Initial document creation |
| 1.1 | January 2026 | PM Feedback | Updated technical requirements (Docker, Shadcn UI, Minimals), added Visual Quote Builder, Rate Card System, Modular Onboarding |

---

**Next Step:**

```bash
# Run project kickoff with MVP definition
/project-kickoff --mvp-definition ./research/MVP_DEFINITION.md
```

This will initiate the development lifecycle with all research artifacts as input.

---

*This MVP Definition document serves as the contract between product research and engineering. Any scope changes require explicit discussion and sign-off. The goal is to launch in 11 weeks and validate product-market fit.*
