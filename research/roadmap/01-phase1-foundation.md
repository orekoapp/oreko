# Phase 1: Foundation - Detailed Specifications

## Overview

**Duration:** Months 1-4
**Goal:** Build infrastructure for machine consumption
**Priority:** P0 - Critical for AI-era transformation

---

## 1. Comprehensive REST API v1

### 1.1 API Design Principles

```
Principle                 Implementation
─────────────────────────────────────────────────────────────
RESTful conventions      Standard HTTP methods, resource-based URLs
Consistent responses     Unified response envelope for all endpoints
Versioning              URL-based (/api/v1/), header support
Pagination              Cursor-based for large collections
Filtering               Query params with consistent syntax
Rate limiting           Token bucket algorithm, per-API-key
Idempotency             Idempotency-Key header support
```

### 1.2 Response Envelope

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      cursor: string | null;
      hasMore: boolean;
      total?: number;
    };
    rateLimit?: {
      remaining: number;
      reset: number;
    };
  };
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;           // Machine-readable: "QUOTE_NOT_FOUND"
    message: string;        // Human-readable description
    details?: object;       // Additional context
    requestId: string;      // For support/debugging
  };
}
```

### 1.3 API Endpoints Specification

#### Quotes API

```yaml
# List quotes
GET /api/v1/quotes
  Query Parameters:
    - status: draft | sent | viewed | accepted | declined | expired
    - client_id: string
    - created_after: ISO8601
    - created_before: ISO8601
    - cursor: string
    - limit: number (default: 20, max: 100)
  Response: ApiResponse<Quote[]>

# Create quote
POST /api/v1/quotes
  Body:
    client_id: string (required)
    title: string (required)
    valid_until: ISO8601
    currency: string (default: USD)
    items: QuoteItem[]
    notes: string
    terms: string
    template_id?: string
  Response: ApiResponse<Quote>

# Get quote
GET /api/v1/quotes/:id
  Response: ApiResponse<Quote>

# Update quote
PATCH /api/v1/quotes/:id
  Body: Partial<QuoteInput>
  Response: ApiResponse<Quote>

# Delete quote (soft delete)
DELETE /api/v1/quotes/:id
  Response: ApiResponse<{ deleted: true }>

# Quote actions
POST /api/v1/quotes/:id/send
  Body:
    recipient_email?: string
    message?: string
    cc?: string[]
  Response: ApiResponse<{ sent_at: ISO8601 }>

POST /api/v1/quotes/:id/duplicate
  Response: ApiResponse<Quote>

POST /api/v1/quotes/:id/convert-to-invoice
  Body:
    due_date?: ISO8601
    payment_terms?: string
  Response: ApiResponse<Invoice>

# Quote items (nested resource)
POST /api/v1/quotes/:id/items
GET /api/v1/quotes/:id/items
PATCH /api/v1/quotes/:id/items/:itemId
DELETE /api/v1/quotes/:id/items/:itemId
POST /api/v1/quotes/:id/items/reorder
  Body: { item_ids: string[] }
```

#### Invoices API

```yaml
# List invoices
GET /api/v1/invoices
  Query Parameters:
    - status: draft | sent | viewed | paid | partial | overdue | void
    - client_id: string
    - quote_id: string
    - due_after: ISO8601
    - due_before: ISO8601
    - cursor: string
    - limit: number
  Response: ApiResponse<Invoice[]>

# Create invoice
POST /api/v1/invoices
  Body:
    client_id: string (required)
    quote_id?: string
    due_date: ISO8601 (required)
    items: InvoiceItem[]
    notes?: string
    payment_terms?: string
  Response: ApiResponse<Invoice>

# Get invoice
GET /api/v1/invoices/:id
  Response: ApiResponse<Invoice>

# Update invoice
PATCH /api/v1/invoices/:id
  Body: Partial<InvoiceInput>
  Response: ApiResponse<Invoice>

# Invoice actions
POST /api/v1/invoices/:id/send
POST /api/v1/invoices/:id/remind
POST /api/v1/invoices/:id/void
POST /api/v1/invoices/:id/record-payment
  Body:
    amount: number
    method: stripe | bank | cash | check | other
    reference?: string
    paid_at?: ISO8601

# Get payment link
GET /api/v1/invoices/:id/payment-link
  Response: ApiResponse<{ url: string, expires_at: ISO8601 }>
```

#### Clients API

```yaml
GET /api/v1/clients
POST /api/v1/clients
GET /api/v1/clients/:id
PATCH /api/v1/clients/:id
DELETE /api/v1/clients/:id

# Client relationships
GET /api/v1/clients/:id/quotes
GET /api/v1/clients/:id/invoices
GET /api/v1/clients/:id/contracts
GET /api/v1/clients/:id/activity
  Response: ApiResponse<ActivityEvent[]>

# Client portal
POST /api/v1/clients/:id/portal-access
  Body:
    expires_in?: number  // hours, default 72
  Response: ApiResponse<{ portal_url: string, token: string }>
```

#### Rate Cards API

```yaml
GET /api/v1/rate-cards
POST /api/v1/rate-cards
GET /api/v1/rate-cards/:id
PATCH /api/v1/rate-cards/:id
DELETE /api/v1/rate-cards/:id

# Rate card items
GET /api/v1/rate-cards/:id/items
POST /api/v1/rate-cards/:id/items
PATCH /api/v1/rate-cards/:id/items/:itemId
DELETE /api/v1/rate-cards/:id/items/:itemId
```

#### Contracts API

```yaml
GET /api/v1/contracts
POST /api/v1/contracts
GET /api/v1/contracts/:id
PATCH /api/v1/contracts/:id

# Contract actions
POST /api/v1/contracts/:id/send
GET /api/v1/contracts/:id/signature-status
POST /api/v1/contracts/:id/void
```

#### Templates API

```yaml
GET /api/v1/templates
POST /api/v1/templates
GET /api/v1/templates/:id
PATCH /api/v1/templates/:id
DELETE /api/v1/templates/:id

# Template application
POST /api/v1/templates/:id/apply
  Body:
    target_type: quote | invoice | contract
    variables?: Record<string, string>
  Response: ApiResponse<{ content: object }>
```

#### Organization/Settings API

```yaml
GET /api/v1/organization
PATCH /api/v1/organization
GET /api/v1/organization/branding
PATCH /api/v1/organization/branding
GET /api/v1/organization/billing
GET /api/v1/organization/usage
```

#### Analytics API

```yaml
GET /api/v1/analytics/overview
  Query: { period: 7d | 30d | 90d | 12m }
  Response: ApiResponse<{
    quotes_created: number
    quotes_accepted: number
    acceptance_rate: number
    revenue_quoted: number
    revenue_invoiced: number
    revenue_collected: number
  }>

GET /api/v1/analytics/quotes
GET /api/v1/analytics/invoices
GET /api/v1/analytics/clients
GET /api/v1/analytics/trends
```

### 1.4 Data Models

```typescript
interface Quote {
  id: string;
  number: string;              // Q-2025-0001
  status: QuoteStatus;
  client_id: string;
  client: ClientSummary;
  title: string;
  items: QuoteItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number;
  total: number;
  currency: string;
  valid_until: string;
  notes: string | null;
  terms: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  signature: SignatureData | null;
  created_at: string;
  updated_at: string;
  created_by: UserSummary;
}

interface QuoteItem {
  id: string;
  type: 'service' | 'product' | 'expense' | 'text';
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  taxable: boolean;
  rate_card_item_id: string | null;
  position: number;
}

interface Invoice {
  id: string;
  number: string;              // INV-2025-0001
  status: InvoiceStatus;
  client_id: string;
  client: ClientSummary;
  quote_id: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  issue_date: string;
  due_date: string;
  payment_terms: string | null;
  notes: string | null;
  payments: Payment[];
  sent_at: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: Address | null;
  notes: string | null;
  tags: string[];
  custom_fields: Record<string, string>;
  stats: {
    total_quoted: number;
    total_invoiced: number;
    total_paid: number;
    quotes_count: number;
    invoices_count: number;
    average_payment_days: number;
  };
  created_at: string;
  updated_at: string;
}

interface RateCard {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  is_default: boolean;
  items: RateCardItem[];
  created_at: string;
  updated_at: string;
}

interface RateCardItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  unit_price: number;
  taxable: boolean;
  position: number;
}
```

### 1.5 Authentication & Authorization

```yaml
Authentication Methods:
  1. API Keys (primary for integrations)
     Header: Authorization: Bearer qc_live_xxxxxxxxxxxx
     Scopes: read, write, admin

  2. OAuth 2.0 (for third-party apps)
     Grant types: authorization_code, refresh_token
     Scopes: quotes:read, quotes:write, invoices:read, etc.

  3. Session tokens (for web app)
     Cookie-based, httpOnly

API Key Types:
  - Live keys: qc_live_* (production)
  - Test keys: qc_test_* (sandbox)

Key Management Endpoints:
  GET /api/v1/api-keys
  POST /api/v1/api-keys
  DELETE /api/v1/api-keys/:id
  POST /api/v1/api-keys/:id/rotate
```

### 1.6 Rate Limiting

```yaml
Limits by Plan:
  Free:       100 requests/minute,   1,000/day
  Pro:        500 requests/minute,  10,000/day
  Business: 2,000 requests/minute,  50,000/day
  Enterprise: Custom

Headers:
  X-RateLimit-Limit: 500
  X-RateLimit-Remaining: 487
  X-RateLimit-Reset: 1706745600

Rate Limit Response (429):
  {
    "success": false,
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Rate limit exceeded. Retry after 45 seconds.",
      "details": {
        "retry_after": 45,
        "limit": 500,
        "window": "1m"
      }
    }
  }
```

---

## 2. Webhook System

### 2.1 Webhook Events

```yaml
Quote Events:
  - quote.created
  - quote.updated
  - quote.sent
  - quote.viewed
  - quote.accepted
  - quote.declined
  - quote.expired
  - quote.deleted

Invoice Events:
  - invoice.created
  - invoice.updated
  - invoice.sent
  - invoice.viewed
  - invoice.paid
  - invoice.partial_payment
  - invoice.overdue
  - invoice.voided
  - invoice.deleted

Client Events:
  - client.created
  - client.updated
  - client.deleted

Payment Events:
  - payment.received
  - payment.failed
  - payment.refunded

Contract Events:
  - contract.created
  - contract.sent
  - contract.viewed
  - contract.signed
  - contract.voided
```

### 2.2 Webhook Payload Structure

```typescript
interface WebhookPayload<T> {
  id: string;                    // Unique event ID
  type: string;                  // Event type
  api_version: string;           // "2025-01-01"
  created_at: string;            // ISO8601 timestamp
  data: {
    object: T;                   // Full object at time of event
    previous_attributes?: Partial<T>;  // For update events
  };
  organization_id: string;
  livemode: boolean;
}

// Example: quote.accepted
{
  "id": "evt_1234567890",
  "type": "quote.accepted",
  "api_version": "2025-01-01",
  "created_at": "2025-01-15T10:30:00Z",
  "data": {
    "object": {
      "id": "quo_abc123",
      "number": "Q-2025-0042",
      "status": "accepted",
      "client_id": "cli_xyz789",
      "total": 5000.00,
      "accepted_at": "2025-01-15T10:30:00Z",
      "signature": {
        "name": "John Client",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "signed_at": "2025-01-15T10:30:00Z"
      }
      // ... full quote object
    },
    "previous_attributes": {
      "status": "sent"
    }
  },
  "organization_id": "org_def456",
  "livemode": true
}
```

### 2.3 Webhook Management API

```yaml
# List webhook endpoints
GET /api/v1/webhooks
  Response: ApiResponse<WebhookEndpoint[]>

# Create webhook endpoint
POST /api/v1/webhooks
  Body:
    url: string (required)
    events: string[] (required)  # ["quote.*", "invoice.paid"]
    description?: string
    secret?: string              # Auto-generated if not provided
  Response: ApiResponse<WebhookEndpoint>

# Update webhook endpoint
PATCH /api/v1/webhooks/:id
  Body:
    url?: string
    events?: string[]
    enabled?: boolean

# Delete webhook endpoint
DELETE /api/v1/webhooks/:id

# Get webhook endpoint
GET /api/v1/webhooks/:id
  Response: ApiResponse<WebhookEndpoint>

# Test webhook endpoint
POST /api/v1/webhooks/:id/test
  Body:
    event_type: string
  Response: ApiResponse<{ delivered: boolean, response_code: number }>

# List webhook deliveries
GET /api/v1/webhooks/:id/deliveries
  Query: { status?: success | failed, cursor, limit }
  Response: ApiResponse<WebhookDelivery[]>

# Retry webhook delivery
POST /api/v1/webhooks/:id/deliveries/:deliveryId/retry
```

### 2.4 Webhook Security

```typescript
// Signature verification
// Header: X-Oreko-Signature: t=1706745600,v1=sha256_hash

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const [timestamp, hash] = parseSignature(signature);

  // Prevent replay attacks (5 min tolerance)
  if (Date.now() / 1000 - timestamp > 300) {
    return false;
  }

  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(expectedHash)
  );
}
```

### 2.5 Retry Policy

```yaml
Retry Schedule:
  - Immediate (on failure)
  - 5 minutes
  - 30 minutes
  - 2 hours
  - 8 hours
  - 24 hours (final attempt)

Failure Conditions:
  - HTTP status >= 400
  - Timeout (30 seconds)
  - Connection error

Success Conditions:
  - HTTP status 2xx

Automatic Disabling:
  - After 7 consecutive days of failures
  - Email notification sent to admin
```

---

## 3. Immutable Audit Logging

### 3.1 Audit Log Schema

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: string;           // ISO8601, microsecond precision
  organization_id: string;

  // Actor information
  actor: {
    type: 'user' | 'api_key' | 'system' | 'webhook';
    id: string;
    email?: string;
    ip_address?: string;
    user_agent?: string;
    api_key_name?: string;
  };

  // Action details
  action: string;              // "quote.created", "invoice.payment.recorded"
  resource_type: string;       // "quote", "invoice", "client"
  resource_id: string;

  // Change tracking
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };

  // Context
  context?: {
    request_id?: string;
    session_id?: string;
    source?: 'web' | 'api' | 'mcp' | 'automation';
  };

  // Integrity
  checksum: string;            // SHA-256 of entry content
  previous_checksum: string;   // Chain verification
}
```

### 3.2 Audit Log API

```yaml
# Query audit logs
GET /api/v1/audit-logs
  Query Parameters:
    - resource_type: string
    - resource_id: string
    - actor_id: string
    - action: string
    - from: ISO8601
    - to: ISO8601
    - cursor: string
    - limit: number (max: 100)
  Response: ApiResponse<AuditLogEntry[]>

# Get specific audit log entry
GET /api/v1/audit-logs/:id
  Response: ApiResponse<AuditLogEntry>

# Verify audit log integrity
GET /api/v1/audit-logs/verify
  Query: { from: ISO8601, to: ISO8601 }
  Response: ApiResponse<{
    verified: boolean,
    entries_checked: number,
    first_entry: string,
    last_entry: string,
    broken_chain_at?: string
  }>

# Export audit logs
POST /api/v1/audit-logs/export
  Body:
    format: json | csv
    from: ISO8601
    to: ISO8601
    resource_types?: string[]
  Response: ApiResponse<{ export_url: string, expires_at: ISO8601 }>
```

### 3.3 Logged Actions

```yaml
Quotes:
  - quote.created
  - quote.updated (with field-level changes)
  - quote.sent
  - quote.viewed
  - quote.accepted
  - quote.declined
  - quote.expired
  - quote.deleted
  - quote.restored
  - quote.duplicated
  - quote.converted_to_invoice
  - quote.item.added
  - quote.item.updated
  - quote.item.removed
  - quote.item.reordered

Invoices:
  - invoice.created
  - invoice.updated
  - invoice.sent
  - invoice.viewed
  - invoice.payment.recorded
  - invoice.payment.refunded
  - invoice.voided
  - invoice.deleted
  - invoice.reminder.sent

Clients:
  - client.created
  - client.updated
  - client.deleted
  - client.merged
  - client.portal_access.granted
  - client.portal_access.revoked

Contracts:
  - contract.created
  - contract.updated
  - contract.sent
  - contract.viewed
  - contract.signed
  - contract.voided

Security:
  - user.login
  - user.logout
  - user.password.changed
  - user.mfa.enabled
  - user.mfa.disabled
  - api_key.created
  - api_key.deleted
  - api_key.rotated
  - webhook.created
  - webhook.updated
  - webhook.deleted

Settings:
  - organization.updated
  - branding.updated
  - team_member.invited
  - team_member.removed
  - team_member.role.changed
```

### 3.4 Storage & Retention

```yaml
Storage Strategy:
  - Primary: PostgreSQL with partitioning by month
  - Archive: S3-compatible object storage (after 90 days)
  - Compression: gzip for archived data

Retention Policy:
  Free:       90 days active, 1 year archived
  Pro:        1 year active, 3 years archived
  Business:   2 years active, 7 years archived
  Enterprise: Custom (up to unlimited)

Performance:
  - Index on: timestamp, organization_id, resource_type, resource_id, actor.id
  - Partition by: month
  - Target query time: < 100ms for recent logs
```

---

## 4. API Documentation Portal

### 4.1 Documentation Structure

```
/docs
├── Getting Started
│   ├── Authentication
│   ├── Making Your First Request
│   ├── Error Handling
│   └── Rate Limits
├── API Reference
│   ├── Quotes
│   ├── Invoices
│   ├── Clients
│   ├── Rate Cards
│   ├── Contracts
│   ├── Templates
│   └── Webhooks
├── Guides
│   ├── Creating a Quote Workflow
│   ├── Quote to Invoice Conversion
│   ├── Setting Up Webhooks
│   └── Building Integrations
├── SDKs
│   ├── JavaScript/TypeScript
│   ├── Python
│   └── PHP
└── Changelog
```

### 4.2 Interactive Features

```yaml
API Explorer:
  - Live API testing in browser
  - Pre-filled examples
  - Response visualization
  - Copy-paste ready code snippets

Code Examples:
  - JavaScript/TypeScript (fetch, axios)
  - Python (requests, httpx)
  - PHP (Guzzle)
  - cURL
  - Ruby
  - Go

Webhook Testing:
  - Webhook simulator
  - Local tunnel integration (ngrok-style)
  - Sample payload generator
```

### 4.3 Implementation

```yaml
Technology:
  - Mintlify or custom Next.js docs
  - OpenAPI 3.1 specification
  - Auto-generated from code annotations

Features:
  - Search (Algolia or built-in)
  - Dark mode
  - Version switcher
  - Feedback widget
  - Community examples
```

---

## 5. Implementation Timeline

### Week 1-2: API Foundation
- [ ] Set up API versioning structure
- [ ] Implement response envelope
- [ ] Create base controller patterns
- [ ] Set up API authentication (API keys)
- [ ] Implement rate limiting

### Week 3-4: Core Endpoints
- [ ] Quotes API (CRUD + actions)
- [ ] Invoices API (CRUD + actions)
- [ ] Clients API (CRUD + relationships)
- [ ] Rate Cards API

### Week 5-6: Additional Endpoints
- [ ] Contracts API
- [ ] Templates API
- [ ] Analytics API
- [ ] Organization/Settings API

### Week 7-8: Webhook System
- [ ] Webhook management endpoints
- [ ] Event emission infrastructure
- [ ] Delivery queue (BullMQ)
- [ ] Retry logic
- [ ] Signature generation

### Week 9-10: Audit Logging
- [ ] Audit log schema and migrations
- [ ] Logging middleware
- [ ] Query endpoints
- [ ] Integrity verification
- [ ] Export functionality

### Week 11-12: Documentation
- [ ] OpenAPI specification
- [ ] Documentation portal setup
- [ ] Code examples for all endpoints
- [ ] SDK scaffolding (JS/TS)

### Week 13-14: Testing & Polish
- [ ] Comprehensive API tests
- [ ] Load testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Beta documentation feedback

---

## 6. Success Criteria

| Metric | Target |
|--------|--------|
| API endpoint coverage | 100% of features |
| API response time (p95) | < 200ms |
| Webhook delivery success rate | > 99.5% |
| Documentation completeness | > 90% (measured by coverage tool) |
| API test coverage | > 85% |
| Audit log query time (recent) | < 100ms |
