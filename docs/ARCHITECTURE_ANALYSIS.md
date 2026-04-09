# Oreko Architecture Analysis

> Evaluated against business-driven architectural requirements for an open-source invoice/billing system.

---

## Executive Summary

Oreko is a **modular monolith** built on Next.js 15 with a Turborepo workspace structure. It gets several things right — workspace-based multi-tenancy, audit trails, lean deployment via Docker Compose, and clean separation of concerns. However, there are significant gaps in **plugin/extensibility**, **multi-currency support**, **financial record immutability**, **internationalization**, and **deployment simplicity** that would limit its viability as a widely-adopted open-source billing tool.

### Scorecard

| Requirement | Score | Status |
|---|---|---|
| Easy self-hosting / minimal dependencies | 6/10 | ⚠️ Redis dependency is unnecessary for MVP |
| $5-10/month VPS viability | 5/10 | ⚠️ Redis + Puppeteer push RAM requirements |
| Financial record immutability | 4/10 | 🔴 Soft deletes on invoices — not append-only |
| Multi-currency & locale | 3/10 | 🔴 Single currency per workspace, no i18n |
| Plugin/extensibility model | 2/10 | 🔴 No hooks, events, or plugin registry |
| Security & trust | 7/10 | ✅ Solid foundation, some gaps |
| Monolith / modular monolith | 9/10 | ✅ Correct architecture choice |
| Single-database PostgreSQL | 9/10 | ✅ Prisma + PostgreSQL, well-modeled |
| Docker Compose deployment | 7/10 | ⚠️ Works but Traefik adds complexity |
| REST API for building on top | 6/10 | ⚠️ Exists but incomplete, no OpenAPI spec |

---

## 1. Community as Your "Scale Unknown"

### What Oreko Does Well

- **Modular monolith** — single Next.js deployment, no distributed systems overhead. Easy to clone, build, and contribute to.
- **Turborepo workspaces** separate `database`, `ui`, `types`, and `web` packages cleanly.
- **Docker Compose** provided for both development (3 services) and production (4 services).
- **Vercel-compatible** for managed hosting — zero-config deployment path exists.
- **Multi-stage Dockerfile** produces a lean production image (~200MB).

### Gaps

- **Redis is a hard dependency** but isn't doing meaningful work yet. It's listed as required in docker-compose but the actual usage is limited to in-memory rate limiting (which doesn't even use Redis). This adds a service that provides no value to a solo freelancer on a laptop.
- **Traefik in production compose** is good for advanced users but raises the bar for someone just wanting to try the tool. A simpler Caddy or nginx-based option would lower the barrier.
- **No `docker-compose up` one-liner** with sensible defaults. Users must configure ~15 environment variables before first run.

### Recommendation

```
Priority: HIGH
Action: Make Redis optional. Add a quick-start docker-compose
        with embedded defaults (SQLite or PostgreSQL-only).
        Provide a single-command setup script.
```

---

## 2. Zero Budget Assumption ($5-10/month VPS)

### Current Infrastructure Requirements

| Service | RAM Usage | Required? |
|---|---|---|
| Next.js app | ~256-512MB | Yes |
| PostgreSQL 16 | ~128-256MB | Yes |
| Redis 7 | ~64-128MB | Currently yes |
| Traefik v3 | ~64-128MB | Production only |
| Puppeteer/Chromium | ~512MB (peak) | For PDF generation |
| **Total** | **~1-1.5GB** | |

A $5/month VPS typically has 1GB RAM. Oreko cannot run on it. A $10/month VPS (2GB) would be tight, especially during PDF generation when Puppeteer spawns a headless Chrome instance consuming ~512MB.

### Dependency Weight Analysis

| Dependency | Necessity | Alternative |
|---|---|---|
| PostgreSQL | Essential | Keep (correct choice) |
| Redis | Unnecessary for MVP | Remove — use PostgreSQL for sessions, in-memory for cache |
| Puppeteer/Chromium | Heavy | Replace with `weasyprint`, `wkhtmltopdf`, or `typst` for lighter PDF generation |
| Traefik | Overkill for single-service | Replace with Caddy (auto-SSL, zero config) |
| Stripe SDK | Essential for payments | Keep, but make optional |
| Resend | Email delivery | Keep as optional; support raw SMTP natively |

### Recommendation

```
Priority: HIGH
Action: Drop Redis requirement. Replace Puppeteer with a lighter
        PDF engine. Replace Traefik with Caddy. Target: 1GB RAM
        total for the entire stack.
```

---

## 3. Regulatory Complexity — Financial Record Integrity

### Current State: PROBLEMATIC

**Oreko uses soft deletes on financial records.** This is architecturally wrong for a billing system.

```prisma
// Current schema — invoices can be soft-deleted
model Invoice {
  deletedAt  DateTime?   // ← This allows "deleting" invoices
  // ... other fields
}
```

**Problems:**

1. **Invoices are legal documents.** In most jurisdictions (EU, US, India, Australia), once an invoice is issued, it cannot be deleted — only credited or voided. A soft delete that hides the record from queries effectively removes it from the user's view, which breaks audit trail continuity.

2. **Quote-to-invoice conversion is mutable.** The system allows modifying invoices after creation. Financial records should be append-only: create, then create adjustments/credits — never modify the original.

3. **No credit note system.** When an invoice needs correction, the standard pattern is: void original → issue credit note → issue corrected invoice. Oreko has no credit note model.

4. **No sequential numbering guarantee.** While `invoiceNumber` is unique per workspace, there's no guarantee of sequential, gap-free numbering — a legal requirement in many jurisdictions (EU VAT Directive, Indian GST).

### What Oreko Does Right

- **Event audit trail tables** (`QuoteEvent`, `InvoiceEvent`) capture state changes with actor, IP, user agent, and metadata. This is a solid foundation.
- **E-signature audit data** stored with IP, user agent, timestamp, and document hash (SHA-256).
- **Idempotent webhook processing** via `StripeWebhookEvent` deduplication table.

### Recommendation

```
Priority: CRITICAL
Action:
1. Remove deletedAt from Invoice model — invoices are immutable once issued
2. Add CreditNote model for corrections
3. Add InvoiceStatus: draft → issued → paid → voided (no deletion)
4. Enforce sequential, gap-free invoice numbering per workspace
5. Make line items immutable after invoice is issued (snapshot pattern)
6. Add "amendment" pattern: original_invoice_id → amended_invoice_id chain
```

---

## 4. Multi-Currency and Locale

### Current State: INSUFFICIENT

**Major Issues:**

#### 4.1 Monetary Values Stored as Dollars (Major Units)

```prisma
rate       Decimal  @db.Decimal(12, 2)  // Stores 150.00 for $150
amount     Decimal  @db.Decimal(12, 2)  // Stores 4500.00 for $4,500
```

This is problematic because:
- **Floating-point rounding errors** in calculations. While `Decimal(12,2)` avoids IEEE 754 issues in storage, JavaScript operations on these values use `Number` (float64), introducing rounding during multiplication.
- **Not all currencies have 2 decimal places.** JPY has 0, BHD has 3, Bitcoin has 8. Storing in minor units (cents/paise/sen) with a `currency` field solves this universally.
- **The codebase has a documented footgun** (from MEMORY.md): "Global `formatCurrency()` does NOT divide by 100" — indicating past confusion about the storage format.

#### 4.2 Single Currency Per Workspace

```prisma
model BusinessProfile {
  currency  String  @default("USD") @db.VarChar(3)
}
```

A freelancer working with clients in USD and EUR cannot use a single workspace. This forces either:
- Multiple workspaces (losing unified reporting)
- Ignoring currency differences (incorrect financial records)

#### 4.3 No Internationalization

- No i18n framework (no `next-intl`, `react-i18next`, or similar)
- All UI strings are hardcoded in English
- `formatCurrency()` defaults to `en-US` locale
- Date formatting defaults to `en-US`
- No RTL support
- Tax labels are English-only ("Tax", "VAT", "GST" are all just free-text strings)

### Recommendation

```
Priority: HIGH
Action:
1. Store monetary values as integers in minor units (cents)
   - Add currency field to Quote, Invoice, Payment models
   - Migration: multiply existing values by 100
2. Support per-document currency (not just per-workspace)
3. Add exchange rate snapshot at document creation time
4. Integrate next-intl for UI string externalization
5. Add locale to BusinessProfile and user preferences
6. Support RTL layouts for Arabic/Hebrew markets
```

---

## 5. Plugin/Extensibility Model

### Current State: NON-EXISTENT

**This is the most critical architectural gap.** The analysis requirement states: *"This is your most important architectural decision"* — and Oreko has no extension mechanism whatsoever.

#### What's Missing

| Extension Point | Current State | Impact |
|---|---|---|
| Payment gateways | Stripe hardcoded throughout | Can't add PayPal, Razorpay, Mollie without forking |
| Tax engines | Database-stored flat rates | Can't plug in Avalara, TaxJar, or regional tax calculators |
| PDF templates | Hardcoded HTML functions | Users can't customize invoice appearance without code |
| Email templates | Database-stored but limited | No Liquid/Handlebars templating, no drag-and-drop editor |
| Webhooks (outgoing) | None | Can't notify external systems on quote.sent, invoice.paid, etc. |
| Custom fields | None | Can't add industry-specific fields to quotes/invoices |
| Integrations | None | No Zapier, no n8n, no native QuickBooks/Xero sync |
| Hook system | None | Contributors must modify core code for any customization |
| Event bus | None | No way to react to system events asynchronously |

#### What Exists (Partial)

- **Stripe webhook ingress** — well-structured, idempotent, signature-verified. Could serve as a pattern for other gateways.
- **Email templates in database** — foundation for template customization, but no templating engine.
- **Tax rates in database** — foundation for tax rules, but no calculation engine abstraction.

### Recommendation

```
Priority: CRITICAL
Action: Implement a phased extensibility architecture:

Phase 1 — Event System (Immediate)
  - Define domain events: quote.created, quote.sent, quote.accepted,
    invoice.created, invoice.sent, invoice.paid, payment.received, etc.
  - Implement synchronous event bus (no Redis needed)
  - Add outgoing webhook support (POST to user-configured URLs on events)

Phase 2 — Provider Abstractions (Short-term)
  - PaymentProvider interface: charge(), refund(), createCheckout()
  - Stripe as first implementation, Razorpay/PayPal as community additions
  - PDFProvider interface: generate(template, data) → Buffer
  - EmailProvider interface: send(to, subject, html) → void
  - StorageProvider interface: already partially exists, formalize it

Phase 3 — Template Engine (Medium-term)
  - Adopt Handlebars or Liquid for PDF and email templates
  - Store templates in database with version history
  - Provide template editor UI (or integrate existing open-source editors)
  - Allow custom CSS per template

Phase 4 — Plugin Registry (Long-term)
  - Define plugin manifest format (name, version, hooks, providers)
  - Plugin lifecycle: install, activate, deactivate, uninstall
  - Settings UI per plugin
  - Community plugin marketplace
```

---

## 6. Security and Trust

### Current State: SOLID FOUNDATION

#### Strengths

| Security Control | Implementation | Status |
|---|---|---|
| Authentication | NextAuth.js with JWT, OAuth + Credentials | ✅ Good |
| Password hashing | bcryptjs (cost 12+) | ✅ Good |
| RBAC | Viewer/Editor/Admin/Owner per workspace | ✅ Good |
| Workspace isolation | All queries include workspaceId filter | ✅ Good |
| Audit trail | QuoteEvent/InvoiceEvent with IP, user agent | ✅ Good |
| E-signature proof | Document hash, IP, user agent, timestamp, OTP | ✅ Good |
| XSS prevention | DOMPurify + React escaping | ✅ Good |
| SQL injection | Prisma parameterized queries | ✅ Good |
| Path traversal | assertSafePath() in storage module | ✅ Good |
| CSRF protection | Origin validation | ✅ Good |
| Webhook security | Stripe signature verification + idempotency | ✅ Good |
| PDF DoS prevention | 2MB HTML limit, 15s timeout | ✅ Good |

#### Gaps

| Security Control | Status | Risk |
|---|---|---|
| Rate limiting | In-memory only (per-instance) | 🟡 Medium — doesn't work on serverless/multi-instance |
| CSP headers | Not configured | 🟡 Medium — XSS mitigation gap |
| HSTS | Not configured | 🟡 Medium — downgrade attack possible |
| Sensitive field encryption | Not implemented | 🟡 Medium — Stripe keys in env only (fine), but client data unencrypted at rest |
| Session invalidation | No force-logout capability | 🟡 Low — JWT-based, can't revoke individual sessions |
| API key authentication | None | 🟡 Medium — no programmatic access for integrations |
| Dependency scanning | No automated CVE checks | 🟡 Medium — supply chain risk |
| Secrets rotation | No mechanism | 🟡 Low — manual process |

### Recommendation

```
Priority: MEDIUM
Action:
1. Add CSP and HSTS headers (via next.config.js or Traefik)
2. Move rate limiting to Redis (when Redis is justified) or
   use Vercel's built-in rate limiting on managed deployment
3. Add API key authentication for programmatic access
4. Add dependabot or Snyk for automated vulnerability scanning
5. Consider at-rest encryption for client PII (email, address, phone)
```

---

## 7. Architecture Pattern Assessment

### Current: Modular Monolith ✅

Oreko correctly chose a modular monolith pattern. This is the right call for an open-source billing tool.

```
oreko/
├── apps/web/                    # Single deployable unit
│   ├── app/                     # Next.js App Router (pages + API)
│   ├── components/              # React components
│   └── lib/                     # Business logic, organized by domain
│       ├── auth/                # Authentication
│       ├── quotes/              # Quote domain
│       ├── invoices/            # Invoice domain
│       ├── clients/             # Client domain
│       ├── contracts/           # Contract domain
│       ├── payments/            # Payment domain
│       ├── pdf/                 # PDF generation
│       ├── services/            # External service adapters
│       ├── workspace/           # Multi-tenancy
│       └── validations/         # Zod schemas
├── packages/database/           # Prisma schema + client
├── packages/ui/                 # Shared UI components
└── packages/shared/             # Shared types + utilities
```

#### Strengths of This Pattern

1. **Single deployment** — `docker-compose up` runs everything
2. **Easy to contribute** — no service discovery, no API contracts between services
3. **Transactional integrity** — single database, ACID guarantees on related operations
4. **Low operational overhead** — no message queues, no service mesh, no distributed tracing needed
5. **Refactorable** — clear domain boundaries in `lib/` make future extraction possible

#### Improvement Opportunities

1. **Domain boundaries aren't enforced.** Any file can import from any other `lib/` directory. Consider barrel exports (`index.ts`) that expose only public APIs per domain.
2. **Server actions mixed with business logic.** Some `actions.ts` files contain both the Next.js server action wrapper and the business logic. Separating these would make the business logic testable without Next.js context.
3. **No dependency injection.** Services (email, PDF, storage, payment) are imported directly. An IoC container or factory pattern would enable the plugin system described in Section 5.

### Recommendation

```
Priority: MEDIUM
Action:
1. Add barrel exports per domain (lib/quotes/index.ts exports public API)
2. Separate server actions from business logic (actions.ts calls service.ts)
3. Introduce factory pattern for swappable services:
   - createPaymentProvider(config) → PaymentProvider
   - createPDFGenerator(config) → PDFGenerator
   - createEmailSender(config) → EmailSender
4. Add domain event emission at service boundaries
```

---

## 8. Database Design Assessment

### Strengths

- **PostgreSQL** — correct choice. Transactional integrity, JSON support, widely available, excellent Prisma support.
- **Workspace-based multi-tenancy** — clean isolation model with `workspaceId` on all entities.
- **Audit trail tables** — `QuoteEvent` and `InvoiceEvent` capture state transitions with full context.
- **Relational integrity** — proper foreign keys, unique constraints on business identifiers (quoteNumber, invoiceNumber per workspace).
- **Settings as JSON** — `Workspace.settings`, `Quote.settings` use Prisma's `Json` type for flexible configuration without schema changes.

### Issues

| Issue | Severity | Detail |
|---|---|---|
| Monetary values in major units | High | Should be minor units (cents) to avoid floating-point issues in JS |
| No currency per document | High | Currency locked to workspace, not to individual quotes/invoices |
| Soft deletes on immutable records | High | Invoices, payments should never be soft-deleted |
| No credit note model | High | No way to correct issued invoices per accounting standards |
| No exchange rate tracking | Medium | Multi-currency requires snapshot rates at document creation |
| No numbering sequence table | Medium | Gap-free sequential numbering needs a dedicated sequence mechanism |
| Decimal(12,2) precision | Low | Fine for most currencies, insufficient for crypto (8 decimals) |
| No partitioning strategy | Low | Large workspaces could benefit from table partitioning on workspaceId |

### Recommendation

```
Priority: HIGH
Action: See sections 3 and 4 for specific schema changes.
Additional:
- Add NumberSequence table for gap-free invoice/quote numbering
- Add ExchangeRate table for multi-currency rate snapshots
- Add CreditNote model linked to original Invoice
- Consider computed columns for derived totals (PostgreSQL generated columns)
```

---

## 9. Docker Compose Deployment Assessment

### Development Compose ✅

```yaml
# docker-compose.yml — 3 services
services:
  postgres:    # PostgreSQL 16 Alpine, port 5432
  redis:       # Redis 7 Alpine, port 6379
  mailpit:     # Development email capture, ports 1025/8025
```

Clean and appropriate for development.

### Production Compose ⚠️

```yaml
# docker-compose.prod.yml — 4 services
services:
  web:         # Next.js app, port 3000
  postgres:    # PostgreSQL 16, internal only
  redis:       # Redis 7 with auth, internal only
  traefik:     # Reverse proxy, ports 80/443
```

#### Issues for Self-Hosting Adoption

1. **Environment variable sprawl.** ~15 required variables before first run. Compare to Plausible Analytics (4 variables) or Umami (3 variables).

2. **Traefik is powerful but complex.** For a single-service deployment, Caddy would provide:
   - Automatic HTTPS with zero configuration
   - Single binary, no Docker socket access needed
   - Simpler Caddyfile vs Traefik labels

3. **No setup wizard or CLI.** Tools like `./setup.sh` that generate `.env` files interactively dramatically improve first-run experience.

4. **Redis as required service.** Adds 64-128MB RAM and operational complexity for no current benefit to a solo user.

5. **No backup automation.** Database backups require manual `pg_dump` commands. A cron-based backup container would improve trust.

6. **No update/migration path documented.** How does a self-hosted user upgrade from v1.0 to v1.1? Database migrations? Breaking changes?

### Recommended Production Compose (Simplified)

```yaml
# Proposed: 2 services minimum
services:
  web:
    image: oreko/oreko:latest
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://oreko:password@postgres:5432/oreko
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment:
      POSTGRES_DB: oreko
      POSTGRES_USER: oreko
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U oreko"]

volumes:
  pgdata:
```

Add Caddy/Traefik as an optional overlay compose file for SSL.

### Recommendation

```
Priority: HIGH
Action:
1. Create docker-compose.simple.yml with just web + postgres (2 services)
2. Replace Traefik with Caddy in default production compose
3. Create setup.sh script for interactive .env generation
4. Add backup container with automated daily pg_dump
5. Document upgrade path with migration commands
6. Publish pre-built Docker image to GHCR/Docker Hub
```

---

## 10. REST API Assessment

### Current State

The API exists but is incomplete and undocumented.

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/quotes` | GET | JWT | List quotes (paginated) |
| `/api/quotes` | POST | JWT | Create quote |
| `/api/quotes/[id]/autosave` | POST | JWT | Autosave quote draft |
| `/api/invoices` | GET | JWT | List invoices |
| `/api/invoices` | POST | JWT | Create invoice |
| `/api/clients` | GET | JWT | List clients |
| `/api/clients` | POST | JWT | Create client |
| `/api/pdf/quote/[id]` | GET | JWT | Get quote PDF HTML |
| `/api/pdf/invoice/[id]` | GET | JWT | Get invoice PDF HTML |
| `/api/checkout/[id]` | POST | Public | Create Stripe checkout session |
| `/api/upload` | POST | JWT | Upload file |
| `/api/webhooks/stripe` | POST | Stripe sig | Stripe webhook handler |
| `/api/health` | GET | None | Health check |

### Gaps

1. **No OpenAPI/Swagger specification.** Third-party developers can't discover or test the API without reading source code.
2. **No API versioning.** Breaking changes will affect all consumers simultaneously.
3. **No API key authentication.** Only JWT (session-based) auth — can't build integrations or CI/CD pipelines.
4. **Incomplete CRUD.** No PUT/PATCH/DELETE endpoints for most resources. Most mutations happen via server actions (not accessible externally).
5. **No webhook outbound.** Can receive Stripe webhooks but can't notify external systems.
6. **No rate limiting headers consistency.** Some endpoints return rate limit headers, others don't.

### Recommendation

```
Priority: MEDIUM
Action:
1. Add OpenAPI 3.0 spec (use next-swagger-doc or similar)
2. Add API key authentication alongside JWT
3. Complete CRUD endpoints for all resources
4. Add API versioning (URL prefix: /api/v1/)
5. Add outbound webhook system for domain events
6. Publish API documentation at /api/docs
```

---

## Summary: Priority Actions

### 🔴 Critical (Architecture Blockers)

| # | Action | Effort | Impact |
|---|---|---|---|
| 1 | **Financial record immutability** — Remove soft deletes from invoices, add credit notes, enforce append-only pattern | High | Without this, the tool is legally non-compliant in most jurisdictions |
| 2 | **Plugin/extensibility foundation** — Event system + provider abstractions for payments, PDF, email | High | Without this, community can't contribute payment gateways or customizations |
| 3 | **Multi-currency per document** — Currency field on quotes/invoices, exchange rate snapshots | Medium | Without this, adoption is limited to single-currency businesses |

### 🟡 High Priority (Adoption Blockers)

| # | Action | Effort | Impact |
|---|---|---|---|
| 4 | **Remove Redis dependency** — Use PostgreSQL for sessions, make Redis optional | Low | Reduces minimum deployment to 2 services, fits $5/month VPS |
| 5 | **Simplify production deployment** — Caddy instead of Traefik, setup script, pre-built images | Medium | Dramatically lowers self-hosting barrier |
| 6 | **Store monetary values as minor units** — Migrate from dollars to cents | Medium | Eliminates floating-point calculation errors |
| 7 | **Internationalization foundation** — Integrate next-intl, externalize strings | Medium | Opens adoption to non-English markets |

### 🟢 Medium Priority (Quality & Growth)

| # | Action | Effort | Impact |
|---|---|---|---|
| 8 | **Complete REST API + OpenAPI spec** | Medium | Enables third-party integrations |
| 9 | **Add CSP/HSTS security headers** | Low | Closes security gaps |
| 10 | **Lighter PDF generation** — Replace Puppeteer with weasyprint or typst | Medium | Reduces RAM from ~1.5GB to ~512MB |
| 11 | **API key authentication** | Low | Enables programmatic access |
| 12 | **Outbound webhook system** | Medium | Enables Zapier/n8n integrations |

---

## Conclusion

Oreko has a **solid architectural foundation** — the modular monolith pattern, PostgreSQL-first design, workspace-based multi-tenancy, and audit trail system are all correct choices. The codebase is well-organized and the deployment story (Docker Compose + Vercel) covers both self-hosted and managed scenarios.

However, it currently operates as a **closed application rather than an open platform.** The three critical gaps — financial record immutability, extensibility, and multi-currency support — must be addressed before Oreko can credibly serve as an open-source alternative to commercial billing tools. The good news is that the existing architecture doesn't fight against these changes — the monolith can evolve incrementally without a rewrite.

The recommended path is:
1. Fix the data model (immutability, currencies, minor units)
2. Add the event system and provider abstractions
3. Simplify deployment (drop Redis, simplify reverse proxy)
4. Then let the community build on top
