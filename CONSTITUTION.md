# Oreko Development Constitution

## Purpose

This constitution establishes the inviolable principles, boundaries, and guardrails for the Oreko development project. All development decisions, implementations, and architectural choices must comply with these rules.

---

## Article I: Core Identity

### 1.1 Product Definition

Oreko is **exclusively** a visual quote and invoice management tool. It is:
- An open-source, self-hosted solution
- A SaaS option for cloud deployment
- A tool for freelancers, small businesses, and agencies

### 1.2 Product Scope Boundaries

**Oreko SHALL:**
- Create, manage, and send professional quotes
- Convert quotes to invoices seamlessly
- Handle e-signatures and contract attachments
- Process payments via Stripe
- Provide client-facing portals for acceptance and payment
- Offer rate card management for quick quoting
- Generate professional PDFs

**Oreko SHALL NOT:**
- Become a full accounting system
- Include CRM/lead management features
- Add project management capabilities
- Track time (beyond basic invoice line items)
- Manage inventory
- Handle payroll

---

## Article II: User Experience Principles

### 2.1 Visual Builder First

The quote/invoice builder MUST be:
- Block-based and visual (NOT spreadsheet-like)
- Drag-and-drop enabled
- WYSIWYG (What You See Is What You Get)
- Mobile-responsive

**PROHIBITION:** No table-based data entry interfaces for quotes. The builder must feel like designing a document, not filling a form.

### 2.2 Client Experience

Client-facing pages MUST:
- Work without requiring an account/login
- Be mobile-first in design
- Load in under 3 seconds on 4G
- Be accessible (WCAG 2.1 AA compliant)
- Support the business's custom branding

### 2.3 Time to Value

- First quote creation MUST be achievable in under 10 minutes from signup
- Onboarding MUST be skippable (users can configure later)
- Default settings MUST be sensible (no mandatory configuration)

---

## Article III: Technical Constraints

### 3.1 Technology Stack (Non-Negotiable)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14+ (App Router) | Modern React, SSR, edge-ready |
| Language | TypeScript (strict) | Type safety |
| UI | Shadcn UI + Tailwind | Customizable, accessible |
| Database | PostgreSQL 15+ | Reliability, JSON support |
| ORM | Prisma 5+ | Type-safe queries |
| Auth | NextAuth.js v5 | Flexible, self-hostable |
| Payments | Stripe Connect | Industry standard |
| Package Manager | pnpm | Speed, disk efficiency |

**PROHIBITION:** No alternative technologies without documented justification and team approval.

### 3.2 Architecture Principles

1. **Server Components First**
   - Default to React Server Components
   - Client components only when interactivity required
   - No unnecessary hydration

2. **Database as Source of Truth**
   - All state that matters persists to database
   - Client state for UI only (forms, modals)
   - No complex client-side state management (Redux, etc.) unless proven necessary

3. **Type Safety End-to-End**
   - Prisma types for database
   - Zod schemas for validation
   - TypeScript strict mode everywhere

4. **Monorepo Structure**
   - Shared code in packages/
   - Application code in apps/
   - Clear dependency boundaries

### 3.3 Performance Requirements

| Metric | Target | Mandatory |
|--------|--------|-----------|
| Largest Contentful Paint | < 2.5s | Yes |
| First Input Delay | < 100ms | Yes |
| Cumulative Layout Shift | < 0.1 | Yes |
| API Response (95th) | < 500ms | Yes |
| PDF Generation | < 5s | Yes |
| Bundle Size (main) | < 200KB | Yes |

### 3.4 Security Requirements

1. **Authentication**
   - Session-based with secure HTTP-only cookies
   - Password hashing with bcrypt (cost factor 12+)
   - Email verification required for production

2. **Data Protection**
   - TLS 1.3 for all connections
   - Encryption at rest for sensitive data
   - No PII in logs

3. **Payment Security**
   - PCI compliance via Stripe (no card data handled)
   - Payment intents for all transactions
   - Webhook signature verification

4. **API Security**
   - Authentication on all protected routes
   - Rate limiting (100 req/min default)
   - Input validation on every endpoint

---

## Article IV: Data Management

### 4.1 Data Ownership

- Self-hosted users OWN their data completely
- Cloud users data exportable at any time
- No vendor lock-in for data

### 4.2 Data Integrity

1. **Audit Trails**
   - All quote/invoice state changes logged
   - E-signature events with timestamp, IP, user agent
   - Payment events immutable

2. **Soft Deletes**
   - Users, workspaces, clients, quotes, invoices use soft delete
   - Hard delete only for compliance requests (GDPR)

3. **Backups**
   - Self-hosted: User responsibility (documented)
   - Cloud: Daily automated, 30-day retention

### 4.3 Multi-Tenancy

- Workspace isolation is mandatory
- No cross-workspace data leakage
- Row-level security patterns where applicable

---

## Article V: Code Quality

### 5.1 Code Standards

1. **No `any` Types**
   - TypeScript strict mode enforced
   - Explicit types for function parameters and returns
   - Generic types where appropriate

2. **Testing Requirements**
   - Unit tests for business logic
   - Integration tests for API routes
   - E2E tests for critical user flows
   - Minimum 70% coverage for core modules

3. **Documentation**
   - All public APIs documented
   - Complex logic commented
   - README for each package

### 5.2 Code Review Rules

- All code changes require PR
- At least one approval required
- CI must pass (lint, types, tests)
- No force pushes to main

### 5.3 Dependency Management

- Audit dependencies monthly
- No packages with known vulnerabilities
- Prefer well-maintained, widely-used packages
- Lock versions in production

---

## Article VI: Feature Development

### 6.1 Feature Prioritization

| Priority | Definition | Timeline |
|----------|------------|----------|
| P0 | Must have for MVP | Before launch |
| P1 | Should have | v1.1 (post-launch) |
| P2 | Nice to have | v1.2+ |

### 6.2 Feature Approval Process

1. Document the feature in specs
2. Validate against product scope (Article I)
3. Estimate complexity and impact
4. Approve only if aligned with core product

### 6.3 Feature Rejection Criteria

A feature MUST be rejected if it:
- Conflicts with Article I scope boundaries
- Compromises Article III security requirements
- Cannot meet Article III performance targets
- Adds significant complexity without clear value

---

## Article VII: Integration Philosophy

### 7.1 Integration Principles

- **Integrate, Don't Replicate** - Partner with best-in-class tools
- **Optional Dependencies** - Integrations must be optional
- **Graceful Degradation** - System works without external services

### 7.2 Approved Integration Categories

| Category | Examples | Priority |
|----------|----------|----------|
| Payments | Stripe | P0 (Required) |
| Email | SMTP, SendGrid, Resend | P0 |
| Storage | Local, S3 | P0 |
| Accounting | QuickBooks, Xero | P1 |
| Calendar | Google Calendar | P2 |

### 7.3 Integration Requirements

- All integrations must have disable option
- Credentials stored securely (encrypted)
- Webhook handlers must be idempotent
- Rate limits respected

---

## Article VIII: Deployment

### 8.1 Self-Hosted Deployment

**MUST Support:**
- Single docker-compose command deployment
- Environment variable configuration only
- No mandatory external services except database

**Requirements:**
- Docker image < 500MB
- Memory usage < 1GB baseline
- Works on commodity hardware (2GB RAM, 2 CPU)

### 8.2 Cloud Deployment

- Multi-tenant architecture
- Per-workspace isolation
- Automatic scaling capability
- 99.5% uptime SLA target

### 8.3 Environment Requirements

| Environment | Purpose | Data |
|-------------|---------|------|
| Development | Local development | Mock/seed data |
| Staging | Pre-production testing | Anonymized data |
| Production | Live users | Real data |

---

## Article IX: Accessibility

### 9.1 WCAG 2.1 AA Compliance (Mandatory)

- Color contrast 4.5:1 minimum
- All interactive elements keyboard accessible
- Screen reader compatible (ARIA labels)
- Focus indicators visible
- No flashing content

### 9.2 Motion Preferences

- Respect `prefers-reduced-motion`
- Essential animations only
- Provide static alternatives

---

## Article X: Amendment Process

### 10.1 Constitution Changes

This constitution may only be amended through:
1. Written proposal with justification
2. Impact analysis on existing code
3. Team consensus (or Product Owner approval)
4. Documentation of the change

### 10.2 Exception Requests

Temporary exceptions may be granted:
1. Document the exception and reason
2. Set expiration date
3. Create ticket to resolve
4. No permanent exceptions allowed

---

## Appendix A: Prohibited Patterns

1. **No CSS-in-JS runtime** (use Tailwind)
2. **No client-side routing hijacking** (use Next.js navigation)
3. **No localStorage for sensitive data**
4. **No inline styles** (use Tailwind classes)
5. **No default exports** (except pages/layouts)
6. **No console.log in production** (use proper logging)
7. **No hardcoded credentials**
8. **No direct DOM manipulation** (use React)

## Appendix B: Required Patterns

1. **Server Actions for mutations**
2. **Zod for all input validation**
3. **Prisma for all database access**
4. **Error boundaries for graceful failure**
5. **Loading states for async operations**
6. **Optimistic updates where appropriate**
7. **Proper TypeScript generics where needed**

---

*This constitution was established on January 30, 2026 and governs all development activities for the Oreko project.*
