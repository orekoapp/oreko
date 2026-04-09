# Oreko REST API Contract Specification

**Generated:** 2026-02-24
**Source:** Recovered from production codebase via `/fit-quality`
**Framework:** Next.js 15 App Router (Route Handlers)
**Base URL:** `https://oreko-gamma.vercel.app`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication Patterns](#2-authentication-patterns)
3. [Rate Limiting](#3-rate-limiting)
4. [Error Response Format](#4-error-response-format)
5. [Health & Infrastructure](#5-health--infrastructure)
6. [Authentication Routes](#6-authentication-routes)
7. [Quotes API](#7-quotes-api)
8. [Invoices API](#8-invoices-api)
9. [Clients API](#9-clients-api)
10. [File Upload](#10-file-upload)
11. [PDF Download](#11-pdf-download)
12. [PDF HTML Rendering](#12-pdf-html-rendering)
13. [Checkout & Payments](#13-checkout--payments)
14. [Webhooks](#14-webhooks)
15. [Cron Jobs](#15-cron-jobs)
16. [Cross-Cutting Concerns](#16-cross-cutting-concerns)

---

## 1. Overview

Oreko exposes 18 REST API route handlers organized across authentication, CRUD operations, file management, payments, webhooks, and infrastructure. The primary data mutation API is through Next.js Server Actions (see `server-actions.contract.md`); these REST routes serve as supplementary endpoints for external integrations, PDF generation, Stripe webhooks, and specific use cases where REST semantics are preferred.

### Route Summary

| Route | Methods | Auth | Rate Limited | Purpose |
|-------|---------|------|-------------|---------|
| `/api/health` | GET | None | No | Health check |
| `/api/auth/[...nextauth]` | GET, POST | None | No | NextAuth.js handler |
| `/api/auth/register` | POST | None | No | User registration |
| `/api/auth/forgot-password` | POST | None | No | Password reset request |
| `/api/auth/reset-password` | POST | None | No | Password reset execution |
| `/api/quotes` | GET | Session | Yes (100/min) | List quotes |
| `/api/invoices` | GET | Session | Yes (100/min) | List invoices |
| `/api/clients` | GET | Session | No | List clients |
| `/api/upload` | POST | Session | No | File upload |
| `/api/download/quote/[quoteId]` | GET | Session | No | Quote PDF download |
| `/api/download/invoice/[invoiceId]` | GET | Session | No | Invoice PDF download |
| `/api/pdf/quote/[quoteId]` | GET | Session | No | Quote PDF HTML |
| `/api/pdf/invoice/[invoiceId]` | GET | Session | No | Invoice PDF HTML |
| `/api/checkout/invoice/[invoiceId]` | POST | Access Token | No | Stripe payment intent |
| `/api/webhooks/stripe` | POST | Signature | No | Stripe webhook handler |
| `/api/cron/reset-demo` | GET | Bearer Token | No | Demo data reset |

### Monetary Values

All monetary values in API responses are in **dollars** (not cents). For example, `"total": 4500` means $4,500.00. The only exception is internal Stripe integration code which converts dollars to cents before calling Stripe APIs.

---

## 2. Authentication Patterns

### Pattern A: NextAuth Session

Used by most authenticated endpoints. Verifies the user has an active session via `auth()` from NextAuth v5.

```
Cookie: next-auth.session-token=<session-jwt>
```

**Resolution flow:**
1. Call `auth()` to extract session from cookie
2. Check `session?.user?.id` exists
3. Look up workspace membership via `workspaceMember.findFirst({ where: { userId } })`
4. Use `workspaceId` to scope all queries

### Pattern B: Access Token

Used for public-facing operations (client portal checkout). No session required -- the access token serves as the auth mechanism.

```json
{ "accessToken": "<uuid>" }
```

### Pattern C: Stripe Signature

Used for webhook verification. The raw request body is verified against the `stripe-signature` header using the Stripe webhook secret.

```
stripe-signature: <stripe-signature-header>
```

### Pattern D: Bearer Token (Cron)

Used for Vercel cron jobs. Verified against `CRON_SECRET` environment variable.

```
Authorization: Bearer <cron-secret>
```

### Pattern E: No Auth

Public endpoints that do not require authentication (health check, registration, password reset).

---

## 3. Rate Limiting

### Implementation

In-memory sliding window rate limiter (not distributed). For production at scale, should be replaced with Redis-based limiting.

**Location:** `apps/web/lib/rate-limit.ts`

### Default Configuration

| Parameter | Value |
|-----------|-------|
| Limit | 100 requests |
| Window | 60,000 ms (1 minute) |
| Key | `{resource}:{client-ip}` |
| IP Resolution | `x-forwarded-for` (first value) or `x-real-ip` or `"unknown"` |

### Strict Configuration (not currently used in routes)

| Parameter | Value |
|-----------|-------|
| Limit | 10 requests |
| Window | 60,000 ms (1 minute) |

### Response Headers

All rate-limited endpoints include these headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Maximum requests per window | `100` |
| `X-RateLimit-Remaining` | Remaining requests in current window | `97` |
| `X-RateLimit-Reset` | Unix timestamp when window resets | `1708876800` |

### Rate Limit Exceeded Response

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1708876800

{
  "error": "Too many requests. Please try again later."
}
```

---

## 4. Error Response Format

### Standard JSON Error

```json
{
  "error": "Human-readable error message"
}
```

### Validation Error (Zod)

```json
{
  "error": "Invalid request data",
  "details": [
    {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 2 character(s)",
      "path": ["name"]
    }
  ]
}
```

### Plain Text Error

Some endpoints return plain text responses instead of JSON (PDF download, PDF HTML routes):

```
HTTP/1.1 401 Unauthorized

Unauthorized
```

### Common HTTP Status Codes

| Code | Meaning | Used By |
|------|---------|---------|
| 200 | Success | Most GET endpoints |
| 201 | Created | Registration |
| 400 | Bad Request | Validation errors, missing params |
| 401 | Unauthorized | Missing/invalid auth |
| 404 | Not Found | Resource not found, no workspace |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled errors |
| 501 | Not Implemented | Stripe not configured |
| 503 | Service Unavailable | Health check failure |

---

## 5. Health & Infrastructure

### GET /api/health

**Purpose:** Health check endpoint for monitoring. Tests database connectivity.

**Authentication:** None

**Rate Limiting:** None

**Request:** No parameters.

**Response (200 - Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-24T08:00:00.000Z",
  "services": {
    "database": "connected"
  }
}
```

**Response (503 - Unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-02-24T08:00:00.000Z",
  "services": {
    "database": "disconnected"
  },
  "error": "Connection refused"
}
```

**Implementation Notes:**
- Executes `SELECT 1` raw query against PostgreSQL via Prisma
- No caching; each call tests a live connection
- Error message from database exception is included in unhealthy response

---

## 6. Authentication Routes

### GET, POST /api/auth/[...nextauth]

**Purpose:** NextAuth.js v5 catch-all handler for OAuth flows, session management, CSRF, and sign-in/sign-out.

**Authentication:** Managed by NextAuth internally

**Implementation:** Delegates entirely to NextAuth handlers exported from `lib/auth`:
```typescript
export const { GET, POST } = handlers;
```

**Handled Routes (by NextAuth convention):**
- `GET /api/auth/signin` - Sign-in page
- `POST /api/auth/signin/:provider` - Initiate provider sign-in
- `GET /api/auth/callback/:provider` - OAuth callback
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/providers` - List configured providers

**Configured Providers:**
- Credentials (email + password via bcrypt)
- OAuth providers (configured in `lib/auth/config.ts`)

---

### POST /api/auth/register

**Purpose:** Create a new user account with a default workspace.

**Authentication:** None

**Rate Limiting:** None (should be added for production hardening)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation (Zod):**

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | string | Min 2 characters |
| `email` | string | Valid email format |
| `password` | string | Min 8 characters |

**Response (201 - Created):**
```json
{
  "user": {
    "id": "clx1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Zod validation failure | `{ "error": "Invalid request data", "details": [...] }` |
| 400 | Duplicate email | `{ "error": "An account with this email already exists" }` |
| 500 | Server error | `{ "error": "Something went wrong" }` |

**Side Effects (Transaction):**
1. Hash password with `hashPassword()` (bcrypt)
2. Create `User` record
3. Create `Workspace` named `"{name}'s Workspace"` with random slug
4. Create `WorkspaceMember` with role `owner` and `acceptedAt` set
5. All three operations wrapped in a single `$transaction`

**Business Logic:**
- Workspace slug is generated as `{name-slug}-{random-6-chars}`
- Workspace settings initialized with `{ onboardingCompleted: false }`
- Email uniqueness enforced at application level (checked before insert) and database level (unique constraint)

---

### POST /api/auth/forgot-password

**Purpose:** Request a password reset email. Uses anti-enumeration pattern -- always returns success.

**Authentication:** None

**Rate Limiting:** None (should be added for production hardening)

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validation:**

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | string | Required, non-empty |

**Response (200 - Always):**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link."
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing email | `{ "error": "Email is required" }` |
| 500 | Server error | `{ "error": "Something went wrong" }` |

**Side Effects:**
1. Look up user by email (lowercased)
2. If user not found or no `passwordHash` (OAuth-only user): return success silently (anti-enumeration)
3. Delete any existing `PasswordResetToken` records for this user
4. Generate 32-byte random hex token
5. Create `PasswordResetToken` with 1-hour expiration
6. Send password reset email via Resend with branded HTML template
7. Reset URL format: `{NEXT_PUBLIC_APP_URL}/reset-password?token={token}`

**Security Notes:**
- Response is identical whether user exists or not (prevents email enumeration)
- OAuth-only users silently receive no email
- Previous reset tokens are deleted before creating a new one

---

### POST /api/auth/reset-password

**Purpose:** Execute a password reset using a previously issued token.

**Authentication:** None (token-based)

**Rate Limiting:** None

**Request Body:**
```json
{
  "token": "abc123def456...",
  "password": "NewSecurePass456"
}
```

**Validation:**

| Field | Type | Constraints |
|-------|------|-------------|
| `token` | string | Required, non-empty |
| `password` | string | Required, min 8 characters, must contain uppercase + lowercase + digit |

**Password Strength Regex:** `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/`

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing token | `{ "error": "Token is required" }` |
| 400 | Missing password | `{ "error": "Password is required" }` |
| 400 | Password too short | `{ "error": "Password must be at least 8 characters" }` |
| 400 | Password complexity fail | `{ "error": "Password must contain at least one uppercase letter, one lowercase letter, and one number" }` |
| 400 | Invalid/expired/used token | `{ "error": "Invalid or expired token" }` |
| 500 | Server error | `{ "error": "Something went wrong" }` |

**Side Effects (Transaction):**
1. Look up `PasswordResetToken` by token value (includes user)
2. Verify token exists, not expired (`expiresAt < now`), not used (`usedAt` is null)
3. Hash new password with bcrypt (cost factor 12)
4. Batched transaction:
   - Update `User.passwordHash`
   - Set `PasswordResetToken.usedAt` to current timestamp
5. Expired tokens are deleted on access (cleanup)

---

## 7. Quotes API

### GET /api/quotes

**Purpose:** List quotes for the current user's workspace with pagination, filtering, and search.

**Authentication:** NextAuth Session (Pattern A)

**Rate Limiting:** Yes (100 requests/minute, keyed by `quotes:{client-ip}`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-based) |
| `pageSize` | integer | `20` | Results per page |
| `status` | string | (none) | Filter by status: `draft`, `sent`, `viewed`, `accepted`, `declined`, `expired`, `converted` |
| `search` | string | (none) | Search across `title`, `quoteNumber`, and `client.name` (case-insensitive) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx1234567890",
      "quoteNumber": "Q-0001",
      "title": "Website Redesign Proposal",
      "status": "draft",
      "total": 16500,
      "subtotal": 16500,
      "taxTotal": 0,
      "issueDate": "2026-02-24T00:00:00.000Z",
      "expirationDate": "2026-03-26T00:00:00.000Z",
      "createdAt": "2026-02-24T08:00:00.000Z",
      "updatedAt": "2026-02-24T08:00:00.000Z",
      "client": {
        "id": "clx9876543210",
        "name": "TechStart Inc.",
        "email": "projects@techstart.demo",
        "company": "TechStart Inc."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 401 | No session | `{ "error": "Unauthorized" }` |
| 404 | No workspace | `{ "error": "No workspace found" }` |
| 429 | Rate limited | `{ "error": "Too many requests. Please try again later." }` |
| 500 | Server error | `{ "error": "Failed to fetch quotes" }` |

**Implementation Notes:**
- Workspace resolved from first `workspaceMember` for session user (not cookie-based active workspace)
- Soft-deleted records excluded (`deletedAt: null`)
- Monetary values converted from `Decimal` to `Number` in response
- Dates serialized as ISO 8601 strings
- `expirationDate` may be `null`
- Client object always included (partial select: id, name, email, company)
- Results ordered by `createdAt` descending

---

## 8. Invoices API

### GET /api/invoices

**Purpose:** List invoices for the current user's workspace with pagination, filtering, and search. Computes `amountPaid` and `amountDue` at runtime from payment records.

**Authentication:** NextAuth Session (Pattern A)

**Rate Limiting:** Yes (100 requests/minute, keyed by `invoices:{client-ip}`)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-based) |
| `pageSize` | integer | `20` | Results per page |
| `status` | string | (none) | Filter by status: `draft`, `sent`, `viewed`, `partial`, `paid`, `overdue`, `voided` |
| `search` | string | (none) | Search across `invoiceNumber` and `client.name` (case-insensitive) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx1234567890",
      "invoiceNumber": "INV-0001",
      "status": "paid",
      "total": 4500,
      "subtotal": 4500,
      "taxTotal": 0,
      "amountPaid": 4500,
      "amountDue": 0,
      "issueDate": "2026-01-25T00:00:00.000Z",
      "dueDate": "2026-02-09T00:00:00.000Z",
      "createdAt": "2026-01-25T08:00:00.000Z",
      "updatedAt": "2026-02-06T08:00:00.000Z",
      "client": {
        "id": "clx9876543210",
        "name": "TechStart Inc.",
        "email": "projects@techstart.demo",
        "company": "TechStart Inc."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 4,
    "totalPages": 1
  }
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 401 | No session | `{ "error": "Unauthorized" }` |
| 404 | No workspace | `{ "error": "No workspace found" }` |
| 429 | Rate limited | `{ "error": "Too many requests. Please try again later." }` |
| 500 | Server error | `{ "error": "Failed to fetch invoices" }` |

**Implementation Notes:**
- `amountPaid` computed at runtime by summing `payments[].amount` (not stored field)
- `amountDue` computed as `total - amountPaid`
- Payments included via Prisma `include` with `select: { amount: true }`
- Note: `status` filter queries the stored status field; `overdue` status is computed at runtime in server actions but here the raw stored status is used
- Workspace resolved from first `workspaceMember` (same as quotes)
- Soft-deleted records excluded

---

## 9. Clients API

### GET /api/clients

**Purpose:** List clients for the current user's workspace with pagination and search. Flattens the JSON address field into individual response fields.

**Authentication:** NextAuth Session via `getCurrentUserWorkspace()` (Pattern A)

**Rate Limiting:** None

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-based) |
| `pageSize` | integer | `20` | Results per page |
| `search` | string | (none) | Search across `name`, `email`, and `company` (case-insensitive) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx1234567890",
      "name": "TechStart Inc.",
      "email": "projects@techstart.demo",
      "phone": "+1 (555) 234-5678",
      "company": "TechStart Inc.",
      "address": "123 Main Street",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94102",
      "country": "United States",
      "notes": "Great startup client",
      "createdAt": "2026-02-24T08:00:00.000Z",
      "updatedAt": "2026-02-24T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 401 | No session / no workspace | `{ "error": "Unauthorized" }` |
| 500 | Server error | `{ "error": "Failed to fetch clients" }` |

**Implementation Notes:**
- Uses `getCurrentUserWorkspace()` (cookie-based active workspace) rather than first workspace
- Address JSON field flattened with fallback keys: `street` or `line1` for address, `postalCode` or `zip`
- All nullable string fields default to empty string (`""`) in response
- Soft-deleted records excluded

---

## 10. File Upload

### POST /api/upload

**Purpose:** Upload image files. If the purpose is `"logo"`, also persists the URL to the business profile.

**Authentication:** NextAuth Session (Pattern A)

**Rate Limiting:** None

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Image file to upload |
| `purpose` | string | No | Upload purpose: `"logo"` for business logo, any other value for general upload |

**File Constraints:**

| Constraint | Value |
|------------|-------|
| Maximum size | 2 MB (2,097,152 bytes) |
| Allowed types | `image/png`, `image/jpeg`, `image/jpg`, `image/webp` |

**Response (200):**
```json
{
  "url": "https://storage.example.com/logos/1708876800-a1b2c3d4.png",
  "key": "logos/1708876800-a1b2c3d4.png",
  "size": 125430
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 401 | No session | `{ "error": "Unauthorized" }` |
| 400 | No file provided | `{ "error": "No file provided" }` |
| 400 | Invalid file type | `{ "error": "Invalid file type. Allowed: PNG, JPG, WebP" }` |
| 400 | File too large | `{ "error": "File too large. Maximum size is 2MB" }` |
| 500 | Upload failure | `{ "error": "Failed to upload file" }` |

**Implementation Notes:**
- Filename generated as `{timestamp}-{random-8-chars}.{ext}`
- Files stored in `logos/` folder when purpose is `"logo"`, otherwise `uploads/`
- Files marked as public (`isPublic: true`)
- When `purpose === "logo"`, calls `updateBusinessLogo(url)` server action to persist to business profile
- Uses `uploadFile()` from `lib/services/storage` (abstracted storage service)

---

## 11. PDF Download

### GET /api/download/quote/[quoteId]

**Purpose:** Generate and download a quote as a PDF file.

**Authentication:** NextAuth Session (Pattern A)

**Rate Limiting:** None

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `quoteId` | string | Quote ID (CUID) |

**Response (200):**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="Quote-{quoteNumber}.pdf"`
- **Content-Length:** PDF file size in bytes
- **Body:** Binary PDF data

**Error Responses:**

| Status | Condition | Body (plain text) |
|--------|-----------|-------------------|
| 401 | No session | `Unauthorized` |
| 404 | Quote not found | `Quote not found` |
| 500 | Generation failure | `Failed to generate PDF` |

**Implementation Notes:**
- Calls `getQuotePdfData(quoteId)` to fetch quote data with branding, business profile, and line items
- Generates HTML via `generateQuotePdfHtml(data)`
- Converts HTML to PDF via Puppeteer (`generatePdfFromHtml()`)
- Includes header/footer template with quote number and page numbers
- Footer styled with `#9ca3af` color, 9px font size
- Returns `Uint8Array` wrapped in `NextResponse`
- Does NOT verify workspace ownership (relies on `getQuotePdfData` for scoping)

---

### GET /api/download/invoice/[invoiceId]

**Purpose:** Generate and download an invoice as a PDF file.

**Authentication:** NextAuth Session (Pattern A)

**Rate Limiting:** None

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `invoiceId` | string | Invoice ID (CUID) |

**Response (200):**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="Invoice-{invoiceNumber}.pdf"`
- **Content-Length:** PDF file size in bytes
- **Body:** Binary PDF data

**Error Responses:**

| Status | Condition | Body (plain text) |
|--------|-----------|-------------------|
| 401 | No session | `Unauthorized` |
| 404 | Invoice not found | `Invoice not found` |
| 500 | Generation failure | `Failed to generate PDF` |

**Implementation Notes:**
- Same pattern as quote PDF download
- Calls `getInvoicePdfData(invoiceId)` which includes payment history
- PDF includes invoice number and page numbers in footer

---

## 12. PDF HTML Rendering

These internal endpoints serve HTML for Puppeteer to convert to PDF. Not intended for direct browser consumption.

### GET /api/pdf/quote/[quoteId]

**Purpose:** Return the HTML representation of a quote for PDF rendering by Puppeteer.

**Authentication:** NextAuth Session (Pattern A)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `quoteId` | string | Quote ID (CUID) |

**Response (200):**
- **Content-Type:** `text/html; charset=utf-8`
- **Body:** Full HTML document with inline styles for PDF rendering

**Error Responses:**

| Status | Condition | Body (plain text) |
|--------|-----------|-------------------|
| 401 | No session | `Unauthorized` |
| 404 | Quote not found | `Quote not found` |
| 500 | Server error | `Internal Server Error` |

---

### GET /api/pdf/invoice/[invoiceId]

**Purpose:** Return the HTML representation of an invoice for PDF rendering by Puppeteer.

**Authentication:** NextAuth Session (Pattern A)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `invoiceId` | string | Invoice ID (CUID) |

**Response (200):**
- **Content-Type:** `text/html; charset=utf-8`
- **Body:** Full HTML document with inline styles for PDF rendering

**Error Responses:**

| Status | Condition | Body (plain text) |
|--------|-----------|-------------------|
| 401 | No session | `Unauthorized` |
| 404 | Invoice not found | `Invoice not found` |
| 500 | Server error | `Internal Server Error` |

---

## 13. Checkout & Payments

### POST /api/checkout/invoice/[invoiceId]

**Purpose:** Create a Stripe payment intent for an invoice. Used from the public client portal for invoice payment.

**Authentication:** Access Token in request body (Pattern B)

**Rate Limiting:** None

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `invoiceId` | string | Invoice ID (CUID) |

**Request Body:**
```json
{
  "accessToken": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 4500
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accessToken` | string | Yes | Invoice access token (UUID) |
| `amount` | number | No | Payment amount in dollars. If omitted, uses full invoice amount due |

**Response (200):**
```json
{
  "clientSecret": "pi_3abc_secret_xyz",
  "paymentIntentId": "pi_3abc123"
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing access token | `{ "error": "Access token is required" }` |
| 400 | Payment intent creation failure | `{ "error": "specific error message from createInvoicePaymentIntent" }` |
| 500 | Server error | `{ "error": "Failed to create checkout session" }` |

**Implementation Notes:**
- Delegates to `createInvoicePaymentIntent(invoiceId, amount, accessToken)` server action
- The server action handles: access token validation, invoice lookup, Stripe API call, payment record creation
- Amount is in dollars; the server action converts to cents (`Math.round(amount * 100)`) before calling Stripe
- Request body parsed with `.catch(() => ({}))` for graceful handling of non-JSON bodies
- `amount` field coerced to `Number` if present

---

## 14. Webhooks

### POST /api/webhooks/stripe

**Purpose:** Handle Stripe webhook events for payment processing and Connect account updates.

**Authentication:** Stripe Signature (Pattern C)

**Rate Limiting:** None

**Required Headers:**

| Header | Description |
|--------|-------------|
| `stripe-signature` | Stripe webhook signature for payload verification |

**Request Body:** Raw text (Stripe event JSON)

**Handled Event Types:**

| Event Type | Processing |
|------------|------------|
| `payment_intent.succeeded` | Extracts `paymentIntentId`, `chargeId`, `receiptUrl`; calls `processPaymentWebhook(id, 'succeeded', chargeId, receiptUrl)` |
| `payment_intent.payment_failed` | Extracts `paymentIntentId`; calls `processPaymentWebhook(id, 'failed')` |
| `account.updated` | Logs Stripe Connect account update (no processing) |
| (other) | Logs unhandled event type |

**Response (200 - Success):**
```json
{
  "received": true
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 501 | Stripe not configured | `{ "error": "Stripe not configured" }` |
| 400 | Missing signature header | `{ "error": "Missing signature" }` |
| 400 | Signature verification failure | `{ "error": "Invalid signature" }` |
| 500 | Processing error | `{ "error": "Webhook processing failed" }` |

**Implementation Notes:**
- First checks `isStripeEnabled()` -- returns 501 if Stripe is not configured
- Request body read as raw text (`request.text()`) for signature verification
- Signature verified via `constructWebhookEvent(body, signature)` using Stripe SDK
- For `payment_intent.succeeded`: extracts charge info from `latest_charge` (handles both string ID and object)
- `processPaymentWebhook` is a server action that transactionally updates the payment record and invoice status
- All unrecognized event types are logged but acknowledged with 200
- Idempotency relies on `processPaymentWebhook` checking the `stripePaymentIntentId`

---

## 15. Cron Jobs

### GET /api/cron/reset-demo

**Purpose:** Reset the demo workspace to a clean state with fresh seed data. Runs as a Vercel cron job daily at midnight UTC.

**Authentication:** Bearer Token (Pattern D)

**Schedule:** `0 0 * * *` (daily at midnight UTC, configured in `vercel.json`)

**Required Headers (production only):**

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {CRON_SECRET}` |

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Demo workspace reset successfully",
  "timestamp": "2026-02-24T00:00:00.000Z"
}
```

**Response (200 - Created):**
```json
{
  "success": true,
  "message": "Demo workspace created",
  "timestamp": "2026-02-24T00:00:00.000Z"
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Invalid/missing cron secret (production only) | `{ "error": "Unauthorized" }` |
| 500 | Reset failure | `{ "success": false, "error": "Failed to reset demo workspace", "message": "detailed error" }` |

**Implementation Notes:**

The reset process is comprehensive and handles edge cases:

1. **Duplicate user cleanup:** Finds demo users with trailing whitespace in email (from env var issue) and merges them into the clean user
2. **Workspace lookup:** Finds workspace by `DEMO_CONFIG.workspaceSlug`; creates from scratch if missing
3. **Cascading delete order** (respects foreign key constraints):
   - InvoiceEvent -> InvoiceLineItem -> Invoice
   - QuoteLineItem -> QuoteEvent -> Quote
   - ContractInstance -> Contract
   - Project
   - Client
   - RateCard -> RateCardCategory
   - Notification
   - EmailTemplate
4. **Hardcoded ID cleanup:** Deletes records with specific demo IDs that may exist in other workspaces from initial seeding
5. **Member deduplication:** Removes all workspace members, re-adds only the demo user as owner
6. **Number sequence reset:** Resets `currentValue` to 0
7. **Re-seed:** Calls `seedDemoData(workspaceId)` which creates:
   - 5 clients with demo data
   - 5 projects linked to clients
   - 1 rate card category with 4 rate cards
   - 5 quotes (draft, sent, viewed, accepted, declined)
   - 4 invoices (paid, sent, overdue-as-sent, draft)
   - 3 contract templates (Service Agreement, NDA, Project Contract)
   - 3 contract instances (signed, sent, draft)
   - 6 email templates (quote_sent, quote_reminder, invoice_sent, payment_reminder, payment_received, contract_sent)
   - Number sequences updated to match seeded data counts

**Security Notes:**
- In non-production environments, the cron secret check is skipped (allows manual testing)
- Uses `GET` method (unusual for mutations) because Vercel cron jobs use GET requests

---

## 16. Cross-Cutting Concerns

### Workspace Resolution

Two different patterns exist across the API routes:

| Pattern | Used By | Mechanism |
|---------|---------|-----------|
| First workspace | `/api/quotes`, `/api/invoices` | `workspaceMember.findFirst({ where: { userId } })` |
| Active workspace (cookie) | `/api/clients` | `getCurrentUserWorkspace()` |

This inconsistency means the quotes and invoices API always uses the user's first workspace, while the clients API uses the cookie-based active workspace. This should be unified.

### Soft Delete Filtering

All list endpoints filter `deletedAt: null` to exclude soft-deleted records. This is applied at the Prisma query level in every route handler.

### Pagination

All list endpoints use consistent pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

- `page` is 1-based
- Default `pageSize` is 20 across all endpoints
- `totalPages` computed as `Math.ceil(total / pageSize)`
- `skip` computed as `(page - 1) * pageSize`

### Date Serialization

All dates are serialized as ISO 8601 strings via `.toISOString()`:
```
"2026-02-24T08:00:00.000Z"
```

### Monetary Value Serialization

All `Decimal` database fields are converted to JavaScript `Number` via explicit `Number()` calls:
```typescript
total: Number(quote.total)
```

Values are in dollars (e.g., `4500` = $4,500.00).

### CORS

No explicit CORS headers are set on API routes. CORS is handled by Next.js defaults (same-origin for API routes). The Stripe webhook endpoint accepts cross-origin POST requests implicitly since Stripe sends webhooks from its servers.

### Request Size Limits

| Endpoint | Limit | Mechanism |
|----------|-------|-----------|
| `/api/upload` | 2 MB | Application-level file size check |
| Other endpoints | Default | Next.js default body size limits |

### Error Logging

All endpoints use `console.error()` for error logging with descriptive prefixes:
- `'Health check failed:'`
- `'Registration error:'`
- `'Forgot password error:'`
- `'Error fetching quotes:'`
- `'Error generating quote PDF:'`
- `'Webhook signature verification failed:'`
- `'[Demo Reset] Error resetting demo workspace:'`

No structured logging or external error reporting (e.g., Sentry) is currently configured for API routes.
