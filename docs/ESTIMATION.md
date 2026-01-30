# QuoteCraft Feature Estimation

## Estimation Methodology

**Complexity Scale:**
- **XS (1 point):** Trivial, < 2 hours
- **S (2 points):** Simple, 2-4 hours
- **M (3 points):** Medium, 4-8 hours (1 day)
- **L (5 points):** Large, 1-2 days
- **XL (8 points):** Extra Large, 2-4 days
- **XXL (13 points):** Very Large, 4+ days

**Risk Levels:**
- **Low:** Well-understood, proven patterns
- **Medium:** Some unknowns, but manageable
- **High:** Significant unknowns or dependencies

---

## Epic 1: Project Foundation

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Monorepo setup (Turborepo + pnpm) | M (3) | Low | None | Standard setup |
| Prisma schema & initial migration | L (5) | Low | Monorepo | Based on DATABASE_SCHEMA.md |
| Docker development environment | M (3) | Low | Prisma | PostgreSQL, Redis |
| Environment configuration | S (2) | Low | None | .env management |
| Tailwind + Shadcn UI setup | M (3) | Low | Monorepo | UI foundation |
| NextAuth.js configuration | L (5) | Medium | Prisma | Auth adapters |
| Base layout components | M (3) | Low | Shadcn | Sidebar, header, etc. |
| CI/CD pipeline (GitHub Actions) | M (3) | Low | None | Lint, test, build |

**Epic Total: 27 points**

---

## Epic 2: Authentication & User Management

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Email/password signup | M (3) | Low | NextAuth | Standard flow |
| Email verification | M (3) | Low | Email service | Token-based |
| Login page | S (2) | Low | NextAuth | Form + validation |
| Password reset flow | M (3) | Low | Email, NextAuth | Token-based |
| Google OAuth (optional) | S (2) | Low | NextAuth | Provider config |
| Session management | S (2) | Low | NextAuth | Cookie-based |
| User profile page | S (2) | Low | Forms | Basic settings |
| Workspace creation | M (3) | Medium | Prisma | Multi-tenant setup |
| Workspace switching | S (2) | Low | Context | If user has multiple |

**Epic Total: 22 points**

---

## Epic 3: Onboarding Flow

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Module selection step | M (3) | Low | UI | Quotes, Invoices, etc. |
| Business profile setup | M (3) | Low | Forms | Name, logo, address |
| Branding setup (optional) | S (2) | Low | Color picker | Colors, logo |
| Stripe Connect setup (optional) | L (5) | High | Stripe SDK | OAuth flow |
| Template selection | S (2) | Low | UI | Choose quote style |
| Onboarding progress tracking | S (2) | Low | State | Resume capability |
| Skip functionality | XS (1) | Low | Navigation | Skip any step |

**Epic Total: 18 points**

---

## Epic 4: Dashboard

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Dashboard layout | M (3) | Low | Layout | Grid structure |
| Stats cards (revenue, outstanding) | M (3) | Low | Queries | Aggregation |
| Recent activity feed | M (3) | Medium | Events | Real-time-ish |
| Pending quotes widget | S (2) | Low | Queries | List + counts |
| Overdue invoices widget | S (2) | Low | Queries | List + highlight |
| Quick action buttons | XS (1) | Low | Navigation | New Quote, etc. |
| Upcoming payments list | M (3) | Low | Queries | Schedule view |

**Epic Total: 17 points**

---

## Epic 5: Client Management

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Client list page | M (3) | Low | Table | Search, filter |
| Client creation form | M (3) | Low | Forms | Validation |
| Client edit form | S (2) | Low | Forms | Pre-filled |
| Client detail page | M (3) | Low | Layout | Tabs: info, quotes, invoices |
| Client search | S (2) | Low | Query | Autocomplete |
| Client import (CSV) | L (5) | Medium | Parser | P1 feature |
| Client export (CSV) | S (2) | Low | Export | Download |
| Client soft delete | S (2) | Low | Prisma | Archive |

**Epic Total: 22 points**

---

## Epic 6: Rate Card System

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Rate card list page | M (3) | Low | Table | Categories |
| Rate card category management | M (3) | Low | CRUD | Drag reorder |
| Rate card item form | M (3) | Low | Forms | Pricing tiers |
| Pricing tier editor | M (3) | Medium | UI | Dynamic rows |
| Quick-add to quote | M (3) | Low | Modal | Picker + select |
| Rate card search | S (2) | Low | Query | Autocomplete |
| Rate card import (CSV) | L (5) | Medium | Parser | P1 feature |
| Rate card export (CSV) | S (2) | Low | Export | Download |

**Epic Total: 24 points**

---

## Epic 7: Visual Quote Builder (Core Feature)

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Quote editor layout (3-panel) | L (5) | Medium | Layout | Blocks, canvas, props |
| Block-based document canvas | XL (8) | High | dnd-kit | Core differentiator |
| Header block component | M (3) | Low | Form | Logo, title |
| Text block component | M (3) | Low | Tiptap | Rich text |
| Line items block | XL (8) | High | Forms, calc | Drag reorder, totals |
| Image block component | M (3) | Low | Upload | Attachment |
| Divider block component | XS (1) | Low | UI | Simple separator |
| Signature block component | L (5) | Medium | Canvas | Draw/type |
| Properties panel | L (5) | Medium | Forms | Context-aware |
| Rate card integration | M (3) | Medium | Modal | Drag from sidebar |
| Real-time preview | M (3) | Medium | State | WYSIWYG |
| Template system | L (5) | Medium | Designs | 3+ templates |
| Auto-save (draft) | M (3) | Low | Debounce | Background save |
| Quote calculations | M (3) | Low | Logic | Subtotal, tax, total |
| Deposit settings | M (3) | Low | Forms | % or $ amount |
| Expiration date | S (2) | Low | Datepicker | Default configurable |
| Attached files | M (3) | Medium | Upload | Multi-file |
| Quote validation | M (3) | Low | Zod | Before send |

**Epic Total: 69 points**

---

## Epic 8: Quote Management

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Quotes list page | M (3) | Low | Table | Filter, search, sort |
| Quote status badges | S (2) | Low | UI | Draft, Sent, etc. |
| Quote row actions | M (3) | Low | Dropdown | Edit, send, etc. |
| Send quote (email) | L (5) | Medium | Email | Template + link |
| Copy public link | XS (1) | Low | Clipboard | Share URL |
| Duplicate quote | S (2) | Low | Copy | New draft |
| Archive/delete quote | S (2) | Low | Soft delete | Confirmation |
| Quote detail view | M (3) | Low | Layout | Read-only |
| Quote activity log | M (3) | Low | Events | Timeline |

**Epic Total: 24 points**

---

## Epic 9: Client Quote Portal

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Public quote view page | L (5) | Medium | Layout | No auth required |
| Quote accept flow | L (5) | Medium | State | Terms, signature |
| E-signature capture (draw) | L (5) | High | Canvas | Touch support |
| E-signature capture (type) | M (3) | Low | Font | Cursive render |
| Contract view (if attached) | M (3) | Low | Modal | Read before sign |
| Deposit payment (Stripe) | XL (8) | High | Stripe | Payment intent |
| Acceptance confirmation | S (2) | Low | UI | Success page |
| PDF download | M (3) | Medium | Puppeteer | Signed document |
| Quote expired state | S (2) | Low | UI | Disabled accept |
| Mobile responsive design | M (3) | Low | CSS | Touch-first |

**Epic Total: 39 points**

---

## Epic 10: Invoice System

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Quote-to-invoice conversion | L (5) | Medium | Copy logic | One-click |
| Invoice editor (similar to quote) | L (5) | Low | Reuse | Minor differences |
| Invoice list page | M (3) | Low | Table | Same as quotes |
| Invoice status badges | S (2) | Low | UI | Unpaid, Paid, etc. |
| Payment schedule builder | L (5) | Medium | UI | Milestones |
| Recurring invoice setup | L (5) | Medium | Cron | Frequency, auto-send |
| Invoice detail view | M (3) | Low | Layout | Payments history |
| Due date management | S (2) | Low | Datepicker | Net 30, etc. |
| Late fee calculation | M (3) | Medium | Logic | P1 feature |
| Invoice reminders | L (5) | Medium | Email, queue | Scheduled |

**Epic Total: 38 points**

---

## Epic 11: Client Invoice Portal

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Public invoice view page | M (3) | Low | Layout | No auth |
| Payment method selection | M (3) | Low | UI | Card, ACH |
| Credit card payment (Stripe) | L (5) | High | Stripe | Payment flow |
| ACH bank payment (Stripe) | L (5) | High | Stripe | Bank flow |
| Partial payment option | M (3) | Medium | Logic | If enabled |
| Payment confirmation | S (2) | Low | UI | Receipt |
| PDF invoice download | M (3) | Low | Puppeteer | Generate |
| Save payment method | M (3) | Medium | Stripe | Customer portal |
| Processing fee display | S (2) | Low | Calc | Pass-through |

**Epic Total: 29 points**

---

## Epic 12: Payment Processing

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Stripe Connect OAuth | L (5) | High | Stripe | Onboarding |
| Payment intent creation | M (3) | Medium | Stripe | Server-side |
| Webhook handler (Stripe) | L (5) | High | Stripe | payment_intent.* |
| Manual payment recording | M (3) | Low | Form | Check, cash |
| Payment history | M (3) | Low | Table | Per invoice |
| Refund processing | L (5) | High | Stripe | Partial/full |
| Payout dashboard link | S (2) | Low | Stripe | External |

**Epic Total: 26 points**

---

## Epic 13: Contracts (P1)

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Contract template editor | L (5) | Medium | Tiptap | Merge fields |
| Contract attachment to quote | M (3) | Low | UI | Picker |
| Contract signing flow | L (5) | Medium | Signature | Reuse component |
| Signed contract storage | M (3) | Low | Storage | PDF generation |
| Contract template library | M (3) | Low | Seed data | 5 templates |

**Epic Total: 19 points** (P1)

---

## Epic 14: PDF Generation

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| PDF service setup | L (5) | Medium | Puppeteer | Docker config |
| Quote PDF template | L (5) | Medium | HTML/CSS | Match preview |
| Invoice PDF template | L (5) | Low | HTML/CSS | Similar to quote |
| Signed quote PDF | M (3) | Medium | Composite | With signature |
| Receipt PDF | M (3) | Low | HTML/CSS | Simple format |
| Background generation | M (3) | Medium | Queue | BullMQ job |

**Epic Total: 24 points**

---

## Epic 15: Email System

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Email service abstraction | M (3) | Low | Interface | SMTP/SendGrid |
| Email template rendering | M (3) | Low | React Email | Variables |
| Quote sent email | M (3) | Low | Template | With link |
| Invoice sent email | M (3) | Low | Template | With link |
| Payment received email | M (3) | Low | Template | Receipt |
| Payment reminder email | M (3) | Low | Template | Overdue |
| Welcome email | S (2) | Low | Template | Onboarding |
| Email queue processing | M (3) | Medium | BullMQ | Retry logic |
| Email template customization | L (5) | Medium | WYSIWYG | P1 feature |

**Epic Total: 28 points**

---

## Epic 16: Settings

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Settings layout | S (2) | Low | Layout | Sidebar nav |
| Business profile settings | M (3) | Low | Forms | Name, address |
| Branding settings | M (3) | Low | Forms | Colors, logo |
| Payment gateway settings | M (3) | Medium | Stripe | Connect status |
| Tax settings | M (3) | Low | Forms | Rates |
| Email template settings | L (5) | Medium | Editor | P1 |
| Module enable/disable | S (2) | Low | Toggles | Workspace config |
| Number sequence settings | S (2) | Low | Forms | Prefix, format |
| Notification preferences | S (2) | Low | Checkboxes | Email toggles |

**Epic Total: 25 points**

---

## Epic 17: Landing Page

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Landing page layout | M (3) | Low | Layout | Marketing |
| Hero section | M (3) | Low | UI | CTA prominent |
| Features section | M (3) | Low | Cards | Icons |
| Pricing section | M (3) | Low | Cards | 4 tiers |
| Testimonials section | S (2) | Low | Carousel | Social proof |
| FAQ accordion | S (2) | Low | Shadcn | Expandable |
| Footer | S (2) | Low | Links | Standard |
| SEO meta tags | S (2) | Low | Head | OG, schema |
| Animation/motion | M (3) | Low | Framer | Scroll effects |

**Epic Total: 23 points**

---

## Epic 18: Infrastructure & DevOps

| Feature | Complexity | Risk | Dependencies | Notes |
|---------|------------|------|--------------|-------|
| Docker production setup | L (5) | Medium | Docker | Multi-stage |
| Docker Compose orchestration | M (3) | Low | Docker | Services |
| Traefik reverse proxy | M (3) | Medium | Docker | SSL, routing |
| Health check endpoints | S (2) | Low | API | /health |
| Logging setup | M (3) | Medium | Pino | Structured |
| Error tracking (Sentry) | M (3) | Low | SDK | Integration |
| Database backup strategy | M (3) | Medium | Cron | pg_dump |
| Redis configuration | S (2) | Low | Docker | Persistence |
| Environment management | S (2) | Low | Dotenv | Validation |

**Epic Total: 26 points**

---

## Summary by Priority

### P0 (Must Have - MVP)

| Epic | Points | Cumulative |
|------|--------|------------|
| Foundation | 27 | 27 |
| Authentication | 22 | 49 |
| Onboarding | 18 | 67 |
| Dashboard | 17 | 84 |
| Clients | 22 | 106 |
| Rate Cards | 24 | 130 |
| **Quote Builder** | **69** | **199** |
| Quote Management | 24 | 223 |
| Client Quote Portal | 39 | 262 |
| Invoice System | 38 | 300 |
| Client Invoice Portal | 29 | 329 |
| Payments | 26 | 355 |
| PDF Generation | 24 | 379 |
| Email System | 28 | 407 |
| Settings | 25 | 432 |
| Landing Page | 23 | 455 |
| Infrastructure | 26 | 481 |

**Total MVP Points: ~481 story points**

### P1 (Should Have - v1.1)

| Feature | Points |
|---------|--------|
| Contracts Module | 19 |
| Client Import | 5 |
| Rate Card Import | 5 |
| Email Template Editor | 5 |
| Advanced Branding | 5 |
| Recurring Invoices | 5 |

**Total P1 Points: ~44 story points**

---

## Risk Assessment

### High Risk Areas

1. **Visual Quote Builder** (XL - 8 points)
   - Core differentiator
   - Complex drag-and-drop
   - Must feel premium
   - Mitigation: Prototype early, user testing

2. **Stripe Integration** (Multiple)
   - Connect onboarding
   - Webhook handling
   - Refund processing
   - Mitigation: Sandbox testing, error handling

3. **PDF Generation**
   - Must match WYSIWYG preview
   - Performance concerns
   - Mitigation: Caching, async generation

4. **E-Signature Capture**
   - Legal compliance
   - Touch device support
   - Mitigation: Research existing solutions, audit trail

### Dependencies Graph

```
Foundation
    │
    ├── Authentication
    │       │
    │       └── Onboarding
    │               │
    │               └── Dashboard
    │
    ├── Clients ─────────────────┐
    │                            │
    ├── Rate Cards ──────────────┤
    │                            │
    └── Quote Builder ◄──────────┘
            │
            ├── Quote Management
            │       │
            │       └── Client Quote Portal
            │               │
            │               └── Payments
            │
            └── Invoice System
                    │
                    └── Client Invoice Portal
                            │
                            └── Payments
```

---

## Recommended Team Allocation

| Role | Focus Area |
|------|------------|
| Lead Developer | Quote Builder, Architecture |
| Full-Stack Dev 1 | Auth, Clients, Settings |
| Full-Stack Dev 2 | Invoices, Payments, Email |
| Frontend Dev | UI Components, Landing Page |
| DevOps | Infrastructure, CI/CD |

---

## Estimated Timeline

Assuming 10 story points per developer per sprint (2 weeks):

| Phase | Duration | Focus |
|-------|----------|-------|
| Foundation | 2 weeks | Setup, Auth, Base |
| Core Features | 6 weeks | Quote Builder, Clients |
| Payments | 4 weeks | Stripe, Portals |
| Polish | 2 weeks | Testing, Fixes |
| Launch Prep | 1 week | Deployment, Docs |

**Total Estimated Duration: 15 weeks (~4 months)**

*Note: Estimates assume experienced Next.js developers with full-time dedication.*
