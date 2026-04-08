# Oreko Technical Analysis

## 1. Data Model Analysis

### 1.1 Core Entities Relationship

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER                                   │
│  ┌──────────┐                                                   │
│  │  User    │                                                   │
│  │  - id    │                                                   │
│  │  - email │                                                   │
│  └────┬─────┘                                                   │
│       │ owns                                                    │
│       ▼                                                         │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │  Workspace   │◄────────│WorkspaceMember│                     │
│  │  - settings  │ 1:n     │  - role      │                     │
│  │  - modules   │         └──────────────┘                     │
│  └──────┬───────┘                                               │
│         │ has                                                   │
│         ▼                                                       │
├─────────┼───────────────────────────────────────────────────────┤
│ BUSINESS│                                                       │
│         │                                                       │
│    ┌────┴────┐    ┌──────────┐    ┌──────────┐                │
│    │ Client  │    │ RateCard │    │ Contract │                │
│    └────┬────┘    └────┬─────┘    └────┬─────┘                │
│         │              │               │                        │
│         │              │               │                        │
├─────────┼──────────────┼───────────────┼────────────────────────┤
│DOCUMENTS│              │               │                        │
│         ▼              ▼               ▼                        │
│    ┌─────────┐ uses ┌────────────┐ attached ┌────────────────┐│
│    │  Quote  │◄─────│ LineItem   │    │     │ContractInstance││
│    │- status │      │- rateCardId│◄───┘     │ - signedAt     ││
│    │- total  │      └────────────┘          └────────────────┘│
│    └────┬────┘                                                  │
│         │ converts to                                           │
│         ▼                                                       │
│    ┌─────────┐      ┌────────────┐      ┌─────────┐           │
│    │ Invoice │──────│ LineItem   │      │ Payment │           │
│    │- status │ 1:n  │            │  1:n │- stripe │           │
│    │- amtDue │      └────────────┘      └─────────┘           │
│    └─────────┘                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Quote State Machine

```
                    ┌─────────┐
                    │  DRAFT  │◄─────── Create new
                    └────┬────┘
                         │ Send
                         ▼
                    ┌─────────┐
        ┌──────────│  SENT   │──────────┐
        │          └────┬────┘          │
        │               │ Client opens  │
        │               ▼               │
        │          ┌─────────┐          │
        │          │ VIEWED  │          │
        │          └────┬────┘          │
        │               │               │
        ▼               ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │ EXPIRED │    │ACCEPTED │    │DECLINED │
   └─────────┘    └────┬────┘    └─────────┘
                       │
                       │ Convert to invoice
                       ▼
                  ┌──────────┐
                  │ INVOICE  │
                  │ CREATED  │
                  └──────────┘
```

### 1.3 Invoice State Machine

```
                    ┌─────────┐
                    │  DRAFT  │◄─────── Create new / Convert from quote
                    └────┬────┘
                         │ Send
                         ▼
                    ┌─────────┐
                    │  SENT   │
                    └────┬────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             ▼             ▼
      ┌─────────┐  ┌─────────┐  ┌─────────┐
      │ OVERDUE │  │ PARTIAL │  │   PAID  │
      └────┬────┘  └────┬────┘  └─────────┘
           │            │
           └─────┬──────┘
                 │ Full payment
                 ▼
            ┌─────────┐
            │   PAID  │
            └─────────┘

Special states:
- VOIDED: Invoice cancelled (refunded or error)
```

### 1.4 Payment Flow

```
Client clicks "Pay"
        │
        ▼
┌───────────────────┐
│ Select Payment    │
│ Method            │
│ - Card            │
│ - ACH/Bank        │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐     ┌───────────────────┐
│ Create Payment    │     │ Stripe Checkout   │
│ Intent (Server)   │────▶│ or Elements       │
└───────────────────┘     └────────┬──────────┘
                                   │
                                   ▼
                          ┌───────────────────┐
                          │ Payment           │
                          │ processing...     │
                          └────────┬──────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Webhook:        │      │ Webhook:        │      │ Webhook:        │
│ succeeded       │      │ failed          │      │ requires_action │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         ▼                        ▼                        ▼
   Update invoice           Show error             3D Secure
   Mark as paid             Allow retry            Redirect
   Send receipt
```

---

## 2. API Design Analysis

### 2.1 RESTful Endpoints

```
Authentication
--------------
POST   /api/auth/register        # Create account
POST   /api/auth/login           # Session start
POST   /api/auth/logout          # Session end
POST   /api/auth/forgot-password # Request reset
POST   /api/auth/reset-password  # Complete reset
GET    /api/auth/session         # Current user

Workspaces
----------
GET    /api/workspaces           # List user's workspaces
POST   /api/workspaces           # Create workspace
GET    /api/workspaces/:id       # Get workspace
PATCH  /api/workspaces/:id       # Update workspace
DELETE /api/workspaces/:id       # Archive workspace

Clients
-------
GET    /api/clients              # List clients (paginated)
POST   /api/clients              # Create client
GET    /api/clients/:id          # Get client details
PATCH  /api/clients/:id          # Update client
DELETE /api/clients/:id          # Archive client

Rate Cards
----------
GET    /api/rate-cards           # List rate cards
POST   /api/rate-cards           # Create rate card
GET    /api/rate-cards/:id       # Get rate card
PATCH  /api/rate-cards/:id       # Update rate card
DELETE /api/rate-cards/:id       # Archive rate card

Rate Card Categories
--------------------
GET    /api/rate-card-categories
POST   /api/rate-card-categories
PATCH  /api/rate-card-categories/:id
DELETE /api/rate-card-categories/:id

Quotes
------
GET    /api/quotes               # List quotes (paginated, filtered)
POST   /api/quotes               # Create quote
GET    /api/quotes/:id           # Get quote details
PATCH  /api/quotes/:id           # Update quote
DELETE /api/quotes/:id           # Archive quote
POST   /api/quotes/:id/send      # Send to client
POST   /api/quotes/:id/duplicate # Create copy
POST   /api/quotes/:id/convert   # Convert to invoice
GET    /api/quotes/:id/pdf       # Generate/get PDF

Invoices
--------
GET    /api/invoices             # List invoices
POST   /api/invoices             # Create invoice
GET    /api/invoices/:id         # Get invoice details
PATCH  /api/invoices/:id         # Update invoice
DELETE /api/invoices/:id         # Archive invoice
POST   /api/invoices/:id/send    # Send to client
POST   /api/invoices/:id/remind  # Send reminder
GET    /api/invoices/:id/pdf     # Generate/get PDF

Payments
--------
GET    /api/invoices/:id/payments    # List payments for invoice
POST   /api/invoices/:id/payments    # Record manual payment
POST   /api/payments/:id/refund      # Process refund

Settings
--------
GET    /api/settings/business    # Business profile
PATCH  /api/settings/business    # Update business
GET    /api/settings/branding    # Branding settings
PATCH  /api/settings/branding    # Update branding
GET    /api/settings/payment     # Payment settings
PATCH  /api/settings/payment     # Update payment settings
GET    /api/settings/taxes       # Tax rates
POST   /api/settings/taxes       # Add tax rate
PATCH  /api/settings/taxes/:id   # Update tax rate
DELETE /api/settings/taxes/:id   # Remove tax rate

Email Templates
---------------
GET    /api/email-templates      # List templates
PATCH  /api/email-templates/:id  # Update template
POST   /api/email-templates/:id/preview # Preview with sample data

Public (Client Portal)
----------------------
GET    /api/public/quotes/:token     # View quote (no auth)
POST   /api/public/quotes/:token/accept  # Accept quote
GET    /api/public/invoices/:token   # View invoice (no auth)
POST   /api/public/invoices/:token/pay   # Create payment intent

Stripe Webhooks
---------------
POST   /api/webhooks/stripe      # Stripe event handler

Uploads
-------
POST   /api/uploads              # Upload file
GET    /api/uploads/:id          # Get file metadata
DELETE /api/uploads/:id          # Delete file
```

### 2.2 Server Actions (Next.js)

For mutations, prefer Server Actions over API routes:

```typescript
// lib/actions/quotes.ts
'use server'

export async function createQuote(data: CreateQuoteInput) {}
export async function updateQuote(id: string, data: UpdateQuoteInput) {}
export async function sendQuote(id: string) {}
export async function duplicateQuote(id: string) {}
export async function convertToInvoice(id: string) {}
export async function deleteQuote(id: string) {}

// lib/actions/clients.ts
export async function createClient(data: CreateClientInput) {}
export async function updateClient(id: string, data: UpdateClientInput) {}
export async function deleteClient(id: string) {}

// etc.
```

---

## 3. Security Analysis

### 3.1 Authentication Flow

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT                                  │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/auth/login
                              │ { email, password }
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                         SERVER                                  │
│                                                                 │
│  1. Validate input (Zod)                                       │
│  2. Find user by email                                         │
│  3. Verify password (bcrypt.compare)                           │
│  4. Check email verified                                       │
│  5. Create session (NextAuth)                                  │
│  6. Set HTTP-only cookie                                       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Set-Cookie: next-auth.session-token=xxx
                              │ HttpOnly, Secure, SameSite=Lax
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT                                  │
│  Cookie stored in browser                                       │
│  Automatically sent with subsequent requests                    │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Authorization Matrix

| Resource | Owner | Admin | Member | Public |
|----------|-------|-------|--------|--------|
| Workspace Settings | ✅ | ✅ | ❌ | ❌ |
| Create Quote | ✅ | ✅ | ✅ | ❌ |
| Send Quote | ✅ | ✅ | ✅ | ❌ |
| View Quote (internal) | ✅ | ✅ | ✅ | ❌ |
| View Quote (portal) | - | - | - | ✅ (with token) |
| Accept Quote | - | - | - | ✅ (with token) |
| Process Payment | - | - | - | ✅ (with token) |
| Delete Quote | ✅ | ✅ | ❌ | ❌ |
| Manage Team | ✅ | ❌ | ❌ | ❌ |

### 3.3 Rate Limiting Strategy

```typescript
// Endpoint rate limits
const limits = {
  // Authentication (prevent brute force)
  '/api/auth/login': { window: '15m', max: 5 },
  '/api/auth/register': { window: '1h', max: 10 },
  '/api/auth/forgot-password': { window: '1h', max: 3 },

  // Public endpoints (prevent abuse)
  '/api/public/*': { window: '1m', max: 60 },
  '/api/webhooks/*': { window: '1m', max: 1000 },

  // General API
  '/api/*': { window: '1m', max: 100 },

  // Expensive operations
  '/api/*/pdf': { window: '1m', max: 10 },
  '/api/uploads': { window: '1m', max: 20 },
};
```

### 3.4 Input Validation

All inputs validated with Zod schemas:

```typescript
// lib/validations/quote.ts
export const createQuoteSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  expirationDate: z.coerce.date().optional(),
  lineItems: z.array(lineItemSchema).min(1),
  deposit: z.object({
    enabled: z.boolean(),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().positive(),
  }).optional(),
  notes: z.string().max(5000).optional(),
  settings: quoteSettingsSchema.optional(),
});

// Server-side validation
export async function createQuote(rawData: unknown) {
  const data = createQuoteSchema.parse(rawData); // Throws if invalid
  // ... proceed with validated data
}
```

---

## 4. Performance Analysis

### 4.1 Database Query Optimization

**Common Query Patterns:**

```sql
-- Dashboard stats (use materialized views for large workspaces)
SELECT
  COUNT(*) FILTER (WHERE status = 'sent') as pending_quotes,
  SUM(total) FILTER (WHERE status = 'sent') as pending_value,
  COUNT(*) FILTER (WHERE i.status = 'sent' AND i.due_date < NOW()) as overdue_count
FROM quotes q
LEFT JOIN invoices i ON i.workspace_id = q.workspace_id
WHERE q.workspace_id = $1;

-- Quote list with client (use eager loading)
SELECT q.*, c.name as client_name, c.company as client_company
FROM quotes q
JOIN clients c ON c.id = q.client_id
WHERE q.workspace_id = $1
ORDER BY q.created_at DESC
LIMIT 50 OFFSET 0;
```

**Index Strategy:**

```sql
-- Essential indexes (already in schema)
CREATE INDEX idx_quotes_workspace_status ON quotes(workspace_id, status);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_workspace_status ON invoices(workspace_id, status);

-- Full-text search indexes (add later if needed)
CREATE INDEX idx_quotes_search ON quotes USING gin(to_tsvector('english', title));
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('english', name || ' ' || COALESCE(company, '')));
```

### 4.2 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        CACHING LAYERS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Browser Cache (Client)                                         │
│  ├── Static assets (JS, CSS, images) - 1 year                  │
│  ├── API responses - No cache (dynamic)                        │
│  └── Font files - 1 year                                        │
│                                                                 │
│  CDN/Edge Cache (Vercel/Cloudflare)                            │
│  ├── Landing page - 5 minutes, stale-while-revalidate          │
│  ├── Public quote/invoice pages - 1 minute                     │
│  └── API routes - No cache                                      │
│                                                                 │
│  Redis Cache (Server)                                           │
│  ├── Session data - 24 hours                                    │
│  ├── Rate limit counters - Per window                           │
│  ├── Workspace settings - 5 minutes                             │
│  └── Generated PDFs - 1 hour                                    │
│                                                                 │
│  Database Query Cache (Prisma)                                  │
│  └── Query results - Short-lived (connection pooling)           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Bundle Size Optimization

```
Target: Main bundle < 200KB gzipped

Strategies:
1. Server Components (no client JS by default)
2. Dynamic imports for heavy components
   - Quote editor (loaded on demand)
   - PDF preview (loaded on demand)
   - Rich text editor (Tiptap - loaded in editor only)
   - Signature canvas (loaded in accept flow)
3. Tree shaking
   - Import specific Shadcn components
   - Import specific date-fns functions
4. Route-based code splitting (automatic with App Router)
```

---

## 5. Integration Points Analysis

### 5.1 Stripe Connect Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    STRIPE CONNECT ONBOARDING                    │
└────────────────────────────────────────────────────────────────┘

User clicks "Connect Stripe"
         │
         ▼
┌──────────────────┐
│ Generate OAuth   │
│ link with state  │
└────────┬─────────┘
         │
         │  Redirect to Stripe
         ▼
┌──────────────────┐
│ Stripe hosted    │
│ onboarding flow  │
│ - Business info  │
│ - Bank account   │
│ - Identity       │
└────────┬─────────┘
         │
         │  Redirect back with code
         ▼
┌──────────────────┐
│ Exchange code    │
│ for account ID   │
│ Store in DB      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Poll for         │
│ onboarding       │
│ completion       │
└────────┬─────────┘
         │
         ▼
     ✅ Ready to accept payments
```

### 5.2 Email Integration

```typescript
// Abstract email provider
interface EmailProvider {
  send(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
  }): Promise<{ id: string }>;
}

// Implementations
class SMTPProvider implements EmailProvider { /* ... */ }
class SendGridProvider implements EmailProvider { /* ... */ }
class ResendProvider implements EmailProvider { /* ... */ }

// Factory
function createEmailProvider(config: EmailConfig): EmailProvider {
  switch (config.provider) {
    case 'smtp': return new SMTPProvider(config);
    case 'sendgrid': return new SendGridProvider(config);
    case 'resend': return new ResendProvider(config);
    default: throw new Error(`Unknown provider: ${config.provider}`);
  }
}
```

### 5.3 Storage Abstraction

```typescript
// Abstract storage provider
interface StorageProvider {
  upload(file: Buffer, path: string): Promise<{ url: string }>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getSignedUrl(path: string, expiresIn: number): Promise<string>;
}

// Implementations
class LocalStorageProvider implements StorageProvider { /* ... */ }
class S3StorageProvider implements StorageProvider { /* ... */ }

// Self-hosted: LocalStorageProvider
// Cloud: S3StorageProvider
```

---

## 6. Error Handling Analysis

### 6.1 Error Types

```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super('AUTHORIZATION_ERROR', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('RATE_LIMIT', 'Too many requests', 429, { retryAfter });
  }
}
```

### 6.2 Error Response Format

```typescript
// Consistent error response
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Example responses
// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "email": "Invalid email format",
      "amount": "Must be positive"
    }
  }
}

// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Quote not found"
  }
}

// 500 Internal Server Error (production)
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong"
  }
}
```

---

## 7. Testing Strategy

### 7.1 Test Pyramid

```
                    ┌─────────┐
                    │   E2E   │  10%
                    │ Tests   │  Playwright
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │   Integration       │  30%
              │   Tests             │  Vitest + Prisma
              └──────────┬──────────┘
                         │
         ┌───────────────┴───────────────┐
         │         Unit Tests            │  60%
         │    Components, Utilities      │  Vitest + RTL
         └───────────────────────────────┘
```

### 7.2 Critical E2E Flows

1. **User Signup & Onboarding**
   - Register with email
   - Verify email
   - Complete onboarding
   - Create first quote

2. **Quote Flow**
   - Create quote with line items
   - Send quote to client
   - Client views quote
   - Client accepts & pays deposit
   - Quote converts to invoice

3. **Invoice Flow**
   - Create invoice (or convert from quote)
   - Send to client
   - Client pays full amount
   - Payment confirmation

4. **Settings Flow**
   - Update business profile
   - Connect Stripe
   - Configure branding

---

## 8. Deployment Architecture

### 8.1 Self-Hosted (Docker Compose)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=oreko
      - POSTGRES_USER=oreko
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  traefik:
    image: traefik:v3.0
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik:/etc/traefik
```

### 8.2 Cloud (Vercel + Managed Services)

```
┌─────────────────────────────────────────────────────────────────┐
│                           VERCEL                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Next.js    │  │  Serverless │  │   Edge      │            │
│  │  App        │  │  Functions  │  │  Functions  │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                    EXTERNAL SERVICES                         │
    │                                                              │
    │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
    │  │  Neon         │  │  Upstash      │  │  S3 / R2      │   │
    │  │  (PostgreSQL) │  │  (Redis)      │  │  (Storage)    │   │
    │  └───────────────┘  └───────────────┘  └───────────────┘   │
    │                                                              │
    │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
    │  │  Stripe       │  │  Resend       │  │  Sentry       │   │
    │  │  (Payments)   │  │  (Email)      │  │  (Errors)     │   │
    │  └───────────────┘  └───────────────┘  └───────────────┘   │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
```

---

## 9. Monitoring & Observability

### 9.1 Metrics to Track

**Application Metrics:**
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Active users (DAU, WAU, MAU)
- Quote conversion rate
- Payment success rate

**Business Metrics:**
- Quotes sent per day
- Total quote value
- Average quote value
- Invoice paid amount
- Days to payment (average)

**Infrastructure Metrics:**
- CPU/Memory usage
- Database connections
- Redis memory
- Disk usage

### 9.2 Logging Strategy

```typescript
// Structured logging with Pino
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Log context
logger.info({
  workspaceId,
  quoteId,
  action: 'quote.sent',
  clientEmail: '***@***.com' // Redact PII
}, 'Quote sent successfully');

// Error logging
logger.error({
  err,
  workspaceId,
  requestId,
}, 'Failed to process payment');
```

---

## 10. Migration Considerations

### 10.1 Data Import

For users migrating from other tools:

```typescript
// CSV import format for clients
interface ClientImport {
  name: string;           // Required
  email: string;          // Required
  company?: string;
  phone?: string;
  address_line1?: string;
  address_city?: string;
  address_state?: string;
  address_postal_code?: string;
  address_country?: string;
  notes?: string;
}

// CSV import format for rate cards
interface RateCardImport {
  name: string;           // Required
  category?: string;
  description?: string;
  pricing_type: 'fixed' | 'hourly' | 'daily';
  rate: number;           // Required
  unit?: string;
}
```

### 10.2 Export Format

All data exportable in standard formats:
- Clients: CSV
- Rate Cards: CSV
- Quotes: JSON, PDF
- Invoices: JSON, PDF
- Full backup: JSON (all data)
