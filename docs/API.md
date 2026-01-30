# QuoteCraft API Reference

**Version:** 1.0.0
**Last Updated:** January 2026
**Base URL:** `https://your-domain.com`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [REST API Routes](#rest-api-routes)
4. [Server Actions](#server-actions)
5. [Public Portal Routes](#public-portal-routes)
6. [Webhook Endpoints](#webhook-endpoints)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Overview

QuoteCraft provides two primary interfaces for interacting with the application:

1. **REST API Routes** - Traditional HTTP endpoints for specific operations (authentication, payments, PDF generation, webhooks)
2. **Server Actions** - Next.js Server Actions for secure, type-safe mutations (quotes, invoices, clients, settings)

All authenticated endpoints require a valid session obtained through NextAuth.js.

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## Authentication

QuoteCraft uses [NextAuth.js v5](https://authjs.dev/) for authentication with JWT session strategy.

### Authentication Providers

| Provider | Type | Configuration |
|----------|------|---------------|
| Credentials | Email/Password | Built-in bcrypt password hashing |
| Google | OAuth 2.0 | Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |
| GitHub | OAuth 2.0 | Requires `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` |

### NextAuth.js Endpoints

All authentication endpoints are handled by NextAuth.js at `/api/auth/[...nextauth]`.

#### Sign In

```
POST /api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

email=user@example.com&password=securepassword
```

#### Sign Out

```
POST /api/auth/signout
```

#### Get Session

```
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://..."
  },
  "expires": "2024-02-01T00:00:00.000Z"
}
```

#### OAuth Providers

```
GET /api/auth/signin/google
GET /api/auth/signin/github
```

### User Registration

```
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation:**
- `name`: Required, minimum 2 characters
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters

**Success Response (201):**
```json
{
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Validation error or email already exists
- `500` - Server error

### Session Management

Sessions are stored as JWTs with the following claims:
- `id` - User ID
- `email` - User email
- `name` - User display name
- `avatarUrl` - User avatar URL

### Protected Routes

The following route patterns are protected and require authentication:
- `/dashboard/*` - All dashboard routes
- `/quotes/*` - Quote management
- `/invoices/*` - Invoice management
- `/clients/*` - Client management
- `/settings/*` - Settings pages

Public routes (no authentication required):
- `/login`, `/register` - Auth pages
- `/q/[token]` - Public quote portal
- `/i/[token]` - Public invoice portal
- `/c/[token]` - Public contract portal
- `/api/webhooks/*` - Webhook endpoints

---

## REST API Routes

### Health Check

#### GET /api/health

Check application and database health.

**Authentication:** None required

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "connected"
  }
}
```

**Response (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "disconnected"
  },
  "error": "Connection refused"
}
```

---

### PDF Generation

#### GET /api/pdf/quote/[quoteId]

Generate HTML for quote PDF rendering (used by Puppeteer).

**Authentication:** Required (session-based)

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| quoteId | string | Yes | Quote UUID |

**Response (200):** HTML content with `Content-Type: text/html; charset=utf-8`

**Error Responses:**
- `404` - Quote not found
- `500` - Internal server error

---

#### GET /api/pdf/invoice/[invoiceId]

Generate HTML for invoice PDF rendering (used by Puppeteer).

**Authentication:** Required (session-based)

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| invoiceId | string | Yes | Invoice UUID |

**Response (200):** HTML content with `Content-Type: text/html; charset=utf-8`

**Error Responses:**
- `404` - Invoice not found
- `500` - Internal server error

---

### PDF Download

#### GET /api/download/quote/[quoteId]

Download quote as a PDF file.

**Authentication:** Required (session-based)

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| quoteId | string | Yes | Quote UUID |

**Response (200):** PDF file with headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="Quote-QT-0001.pdf"`

**Error Responses:**
- `404` - Quote not found
- `500` - Failed to generate PDF

---

#### GET /api/download/invoice/[invoiceId]

Download invoice as a PDF file.

**Authentication:** Required (session-based)

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| invoiceId | string | Yes | Invoice UUID |

**Response (200):** PDF file with headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="Invoice-INV-0001.pdf"`

**Error Responses:**
- `404` - Invoice not found
- `500` - Failed to generate PDF

---

### Checkout / Payments

#### POST /api/checkout/invoice/[invoiceId]

Create a Stripe payment intent for invoice checkout.

**Authentication:** None required (public endpoint for client payments)

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| invoiceId | string | Yes | Invoice UUID |

**Request Body (optional):**
```json
{
  "amount": 500.00
}
```
If `amount` is not provided, uses the full `amountDue` from the invoice.

**Success Response (200):**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Error Responses:**
- `400` - Invalid request or invoice status
  ```json
  { "error": "Invoice is already paid" }
  ```
- `500` - Failed to create checkout session

---

## Webhook Endpoints

### Stripe Webhook

#### POST /api/webhooks/stripe

Handle Stripe payment webhook events.

**Authentication:** Stripe signature verification

**Headers Required:**
- `stripe-signature` - Stripe webhook signature

**Supported Events:**

| Event Type | Description |
|------------|-------------|
| `payment_intent.succeeded` | Payment completed successfully |
| `payment_intent.payment_failed` | Payment failed |
| `account.updated` | Stripe Connect account status changed |

**Request Body:** Raw Stripe event payload

**Response (200):**
```json
{ "received": true }
```

**Error Responses:**
- `400` - Missing signature or invalid signature
- `500` - Webhook processing failed
- `501` - Stripe not configured

**Configuration:**

Required environment variables:
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

---

## Server Actions

Server Actions are type-safe mutations invoked from React Server Components or client components using `useTransition`. They require an authenticated session.

### Quote Actions

**Location:** `lib/quotes/actions.ts`

#### createQuote

Create a new quote.

```typescript
async function createQuote(data: {
  title: string;
  clientId: string;
  blocks?: QuoteBlock[];
}): Promise<{ success: true; quote: Quote }>
```

#### updateQuote

Update an existing quote.

```typescript
async function updateQuote(
  quoteId: string,
  data: {
    title?: string;
    blocks?: QuoteBlock[];
    notes?: string;
    terms?: string;
    internalNotes?: string;
    settings?: Record<string, unknown>;
  }
): Promise<{ success: true; quote: Quote }>
```

#### getQuote

Get a single quote by ID.

```typescript
async function getQuote(quoteId: string): Promise<QuoteDocument | null>
```

#### getQuotes

Get all quotes with filtering and pagination.

```typescript
async function getQuotes(options?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ quotes: QuoteListItem[]; total: number }>
```

#### deleteQuote

Soft delete a quote.

```typescript
async function deleteQuote(quoteId: string): Promise<{ success: true }>
```

#### duplicateQuote

Create a copy of an existing quote.

```typescript
async function duplicateQuote(quoteId: string): Promise<{ success: true; quoteId: string }>
```

#### updateQuoteStatus

Update quote status.

```typescript
async function updateQuoteStatus(
  quoteId: string,
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'
): Promise<{ success: true }>
```

---

### Quote Portal Actions (Public)

**Location:** `lib/quotes/portal-actions.ts`

These actions do not require authentication - they use access tokens.

#### getQuoteByAccessToken

Get public quote data by access token.

```typescript
async function getQuoteByAccessToken(
  accessToken: string
): Promise<
  | { success: true; quote: PublicQuoteData }
  | { success: false; error: string }
>
```

**PublicQuoteData Fields:**
- `id`, `quoteNumber`, `status`, `title`
- `issueDate`, `expirationDate`, `isExpired`
- `blocks`, `lineItems`, `totals`
- `settings` (requireSignature, depositRequired, etc.)
- `client`, `business`, `branding`
- `notes`, `terms`

#### trackQuoteView

Track when a client views a quote.

```typescript
async function trackQuoteView(accessToken: string): Promise<void>
```

#### acceptQuote

Accept a quote with e-signature.

```typescript
async function acceptQuote(data: {
  accessToken: string;
  signatureData: string;
  signerName: string;
  agreedToTerms: boolean;
}): Promise<{ success: true } | { success: false; error: string }>
```

#### declineQuote

Decline a quote with optional reason.

```typescript
async function declineQuote(data: {
  accessToken: string;
  reason?: string;
  comment?: string;
}): Promise<{ success: true } | { success: false; error: string }>
```

---

### Invoice Actions

**Location:** `lib/invoices/actions.ts`

#### createInvoice

Create a new invoice.

```typescript
async function createInvoice(data: CreateInvoiceData): Promise<{ success: true; invoice: Invoice }>
```

**CreateInvoiceData:**
```typescript
{
  clientId: string;
  title: string;
  dueDate: string;
  lineItems: Array<{
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    taxRate?: number;
  }>;
  notes?: string;
  terms?: string;
  internalNotes?: string;
}
```

#### createInvoiceFromQuote

Convert an accepted quote to an invoice.

```typescript
async function createInvoiceFromQuote(
  quoteId: string
): Promise<{ success: true; invoice: Invoice } | { success: false; error: string }>
```

#### updateInvoice

Update an existing invoice (draft only).

```typescript
async function updateInvoice(
  invoiceId: string,
  data: UpdateInvoiceData
): Promise<{ success: true; invoice: Invoice } | { success: false; error: string }>
```

#### getInvoice

Get a single invoice by ID.

```typescript
async function getInvoice(invoiceId: string): Promise<InvoiceDocument | null>
```

#### getInvoices

Get all invoices with filtering.

```typescript
async function getInvoices(filters?: {
  status?: InvoiceStatus;
  clientId?: string;
  search?: string;
}): Promise<InvoiceListItem[]>
```

**InvoiceStatus Values:**
- `draft`, `sent`, `viewed`, `partial`, `paid`, `overdue`, `voided`

#### updateInvoiceStatus

Update invoice status.

```typescript
async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
): Promise<{ success: true } | { success: false; error: string }>
```

#### sendInvoice

Send invoice to client via email.

```typescript
async function sendInvoice(invoiceId: string): Promise<{ success: true } | { success: false; error: string }>
```

#### deleteInvoice

Soft delete a draft invoice.

```typescript
async function deleteInvoice(invoiceId: string): Promise<{ success: true } | { success: false; error: string }>
```

#### recordPayment

Record a manual payment for an invoice.

```typescript
async function recordPayment(
  invoiceId: string,
  data: {
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }
): Promise<{ success: true } | { success: false; error: string }>
```

---

### Invoice Portal Actions (Public)

**Location:** `lib/invoices/portal-actions.ts`

#### getInvoiceByAccessToken

Get public invoice data by access token.

```typescript
async function getInvoiceByAccessToken(
  accessToken: string
): Promise<
  | { success: true; invoice: PublicInvoiceData }
  | { success: false; error: string }
>
```

**PublicInvoiceData Fields:**
- `id`, `invoiceNumber`, `status`, `title`
- `issueDate`, `dueDate`, `isOverdue`, `daysOverdue`
- `lineItems`, `totals` (including amountPaid, amountDue)
- `payments` (completed payment history)
- `client`, `business`, `branding`
- `canPay` (boolean)

#### trackInvoiceView

Track when a client views an invoice.

```typescript
async function trackInvoiceView(accessToken: string): Promise<void>
```

---

### Client Actions

**Location:** `lib/clients/actions.ts`

#### getClients

Get paginated clients with filtering.

```typescript
async function getClients(filter?: ClientFilter): Promise<PaginatedClients>
```

**ClientFilter:**
```typescript
{
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
```

#### getClientById

Get client details by ID.

```typescript
async function getClientById(id: string): Promise<ClientDetail>
```

#### getClientActivity

Get client activity history (quotes, invoices, payments).

```typescript
async function getClientActivity(clientId: string): Promise<ClientActivity[]>
```

#### createClient

Create a new client.

```typescript
async function createClient(input: CreateClientInput): Promise<{ id: string }>
```

**CreateClientInput:**
```typescript
{
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type?: 'individual' | 'company';
  website?: string;
  taxId?: string;
  address?: ClientAddress;
  billingAddress?: ClientAddress;
  notes?: string;
  tags?: string[];
  contacts?: ClientContactInput[];
}
```

#### updateClient

Update an existing client.

```typescript
async function updateClient(input: UpdateClientInput): Promise<{ id: string }>
```

#### deleteClient

Soft delete a client.

```typescript
async function deleteClient(id: string): Promise<void>
```

#### deleteClients

Bulk soft delete clients.

```typescript
async function deleteClients(ids: string[]): Promise<{ deleted: number }>
```

#### getClientStats

Get client statistics.

```typescript
async function getClientStats(): Promise<ClientStats>
```

**ClientStats:**
```typescript
{
  total: number;
  individuals: number;
  companies: number;
  withActiveQuotes: number;
  withUnpaidInvoices: number;
}
```

#### importClients

Bulk import clients from CSV data.

```typescript
async function importClients(
  data: Array<{
    name: string;
    email: string;
    phone?: string;
    company?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>,
  skipDuplicates?: boolean
): Promise<ClientImportResult>
```

#### searchClients

Search clients for autocomplete.

```typescript
async function searchClients(
  query: string,
  limit?: number
): Promise<Array<{ id: string; name: string; email: string; company: string | null }>>
```

---

### Rate Card Actions

**Location:** `lib/rate-cards/actions.ts`

#### getRateCards

Get rate cards with pagination and filtering.

```typescript
async function getRateCards(filter?: RateCardFilter): Promise<PaginatedRateCards>
```

**RateCardFilter:**
```typescript
{
  search?: string;
  categoryId?: string;
  pricingType?: 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  isActive?: boolean;
  minRate?: number;
  maxRate?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

#### getRateCardById

Get rate card details.

```typescript
async function getRateCardById(id: string): Promise<RateCardDetail>
```

#### createRateCard

Create a new rate card.

```typescript
async function createRateCard(input: CreateRateCardInput): Promise<{ id: string }>
```

**CreateRateCardInput:**
```typescript
{
  name: string;
  description?: string;
  pricingType?: string;
  rate: number;
  unit?: string;
  categoryId?: string;
  taxRateId?: string;
  isActive?: boolean;
}
```

#### updateRateCard

Update a rate card.

```typescript
async function updateRateCard(input: UpdateRateCardInput): Promise<{ id: string }>
```

#### deleteRateCard

Soft delete a rate card.

```typescript
async function deleteRateCard(id: string): Promise<void>
```

#### bulkDeleteRateCards

Bulk delete rate cards.

```typescript
async function bulkDeleteRateCards(ids: string[]): Promise<{ deleted: number }>
```

#### toggleRateCardActive

Toggle rate card active status.

```typescript
async function toggleRateCardActive(id: string): Promise<{ isActive: boolean }>
```

#### duplicateRateCard

Duplicate a rate card.

```typescript
async function duplicateRateCard(id: string, newName?: string): Promise<{ id: string }>
```

#### getRateCardsForSelection

Get rate cards formatted for quote builder selection.

```typescript
async function getRateCardsForSelection(categoryId?: string): Promise<RateCardSelection[]>
```

#### getRateCardStats

Get rate card statistics.

```typescript
async function getRateCardStats(): Promise<RateCardStats>
```

---

### Category Actions

**Location:** `lib/rate-cards/actions.ts`

#### getCategories

Get all rate card categories.

```typescript
async function getCategories(): Promise<CategoryListItem[]>
```

#### createCategory

Create a new category.

```typescript
async function createCategory(input: CreateCategoryInput): Promise<{ id: string }>
```

#### updateCategory

Update a category.

```typescript
async function updateCategory(input: UpdateCategoryInput): Promise<{ id: string }>
```

#### deleteCategory

Delete a category (fails if has rate cards).

```typescript
async function deleteCategory(id: string): Promise<void>
```

#### reorderCategories

Reorder categories by sort order.

```typescript
async function reorderCategories(categoryIds: string[]): Promise<void>
```

---

### Dashboard Actions

**Location:** `lib/dashboard/actions.ts`

#### getDashboardData

Get all dashboard data in a single call.

```typescript
async function getDashboardData(): Promise<DashboardData>
```

**DashboardData:**
```typescript
{
  stats: DashboardStats;
  quoteStatusCounts: QuoteStatusCounts;
  invoiceStatusCounts: InvoiceStatusCounts;
  recentQuotes: RecentQuote[];
  recentInvoices: RecentInvoice[];
  recentActivity: ActivityItem[];
  revenueData: RevenueDataPoint[];
}
```

#### getDashboardStats

Get key business metrics.

```typescript
async function getDashboardStats(): Promise<DashboardStats>
```

**DashboardStats:**
```typescript
{
  totalQuotes: number;
  totalInvoices: number;
  totalClients: number;
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  quotesThisMonth: number;
  invoicesThisMonth: number;
  revenueThisMonth: number;
  conversionRate: number;
}
```

#### getQuoteStatusCounts

Get quote counts by status.

```typescript
async function getQuoteStatusCounts(): Promise<QuoteStatusCounts>
```

#### getInvoiceStatusCounts

Get invoice counts by status.

```typescript
async function getInvoiceStatusCounts(): Promise<InvoiceStatusCounts>
```

#### getRevenueData

Get revenue over time.

```typescript
async function getRevenueData(period?: DashboardPeriod): Promise<RevenueDataPoint[]>
```

**DashboardPeriod:** `'7d' | '30d' | '90d' | '12m' | 'all'`

#### getRecentQuotes

Get recent quotes.

```typescript
async function getRecentQuotes(limit?: number): Promise<RecentQuote[]>
```

#### getRecentInvoices

Get recent invoices.

```typescript
async function getRecentInvoices(limit?: number): Promise<RecentInvoice[]>
```

#### getRecentActivity

Get recent activity feed.

```typescript
async function getRecentActivity(limit?: number): Promise<ActivityItem[]>
```

---

### Settings Actions

**Location:** `lib/settings/actions.ts`

#### Workspace

```typescript
async function getWorkspace(): Promise<WorkspaceData>
async function updateWorkspaceName(name: string): Promise<void>
```

#### Business Profile

```typescript
async function getBusinessProfile(): Promise<BusinessProfileData | null>
async function updateBusinessProfile(input: UpdateBusinessProfileInput): Promise<void>
async function updateBusinessLogo(logoUrl: string | null): Promise<void>
```

#### Branding Settings

```typescript
async function getBrandingSettings(): Promise<BrandingSettingsData | null>
async function updateBrandingSettings(input: UpdateBrandingSettingsInput): Promise<void>
```

#### Payment Settings

```typescript
async function getPaymentSettings(): Promise<PaymentSettingsData | null>
async function updatePaymentSettings(input: UpdatePaymentSettingsInput): Promise<void>
```

#### Tax Rates

```typescript
async function getTaxRates(): Promise<TaxRateData[]>
async function createTaxRate(input: CreateTaxRateInput): Promise<{ id: string }>
async function updateTaxRate(input: UpdateTaxRateInput): Promise<void>
async function deleteTaxRate(id: string): Promise<void>
```

#### Number Sequences

```typescript
async function getNumberSequences(): Promise<NumberSequenceData[]>
async function updateNumberSequence(input: UpdateNumberSequenceInput): Promise<void>
```

#### Combined

```typescript
async function getAllSettings(): Promise<AllSettings>
```

---

### Payment Actions

**Location:** `lib/payments/actions.ts`

#### getPaymentSettings

Get workspace payment settings.

```typescript
async function getPaymentSettings(): Promise<PaymentSettingsData | null>
```

#### updatePaymentSettings

Update payment settings.

```typescript
async function updatePaymentSettings(data: {
  enabledPaymentMethods?: string[];
  passProcessingFees?: boolean;
  defaultPaymentTerms?: number;
}): Promise<{ success: boolean; error?: string }>
```

#### createStripeOnboardingLink

Create Stripe Connect onboarding URL.

```typescript
async function createStripeOnboardingLink(): Promise<StripeOnboardingResult>
```

**StripeOnboardingResult:**
```typescript
{ success: true; url: string } | { success: false; error: string }
```

#### checkStripeAccountStatus

Check Stripe Connect account status.

```typescript
async function checkStripeAccountStatus(): Promise<{
  connected: boolean;
  status: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}>
```

#### createInvoicePaymentIntent

Create payment intent for invoice (used by checkout endpoint).

```typescript
async function createInvoicePaymentIntent(
  invoiceId: string,
  amount?: number
): Promise<PaymentIntentResult>
```

#### getPayments

Get payments for workspace.

```typescript
async function getPayments(filter?: {
  invoiceId?: string;
  status?: string;
  limit?: number;
}): Promise<PaymentListItem[]>
```

#### getPaymentById

Get payment details.

```typescript
async function getPaymentById(paymentId: string): Promise<PaymentDetail | null>
```

#### processPaymentWebhook

Process Stripe webhook (called by webhook endpoint).

```typescript
async function processPaymentWebhook(
  paymentIntentId: string,
  status: 'succeeded' | 'failed',
  chargeId?: string,
  receiptUrl?: string
): Promise<{ success: boolean }>
```

---

## Public Portal Routes

These routes are accessible without authentication using secure access tokens.

### Quote Portal

**URL:** `/q/[token]`

Displays a public view of a quote where clients can:
- View quote details, line items, and totals
- Accept the quote with e-signature
- Decline the quote with optional reason
- Download quote as PDF

**Access Token:** Generated when quote is created, stored in `quote.accessToken`

---

### Invoice Portal

**URL:** `/i/[token]`

Displays a public view of an invoice where clients can:
- View invoice details, line items, and totals
- See payment history
- Make payments via Stripe
- Download invoice as PDF

**Access Token:** Generated when invoice is created, stored in `invoice.accessToken`

---

### Contract Portal

**URL:** `/c/[token]`

Displays a public view of a contract where clients can:
- View contract terms
- Sign with e-signature
- Download signed contract as PDF

**Access Token:** Generated when contract is sent, stored in `contractInstance.accessToken`

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized to access resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Errors

#### Unauthorized
```json
{
  "error": "Unauthorized"
}
```
Session is missing or expired. Re-authenticate.

#### Not Found
```json
{
  "error": "Quote not found"
}
```
The requested resource doesn't exist or belongs to a different workspace.

#### Validation Error
```json
{
  "error": "Invalid request data",
  "details": [
    { "path": ["email"], "message": "Invalid email" }
  ]
}
```
Request body failed Zod schema validation.

---

## Rate Limiting

QuoteCraft currently does not implement application-level rate limiting. It is recommended to configure rate limiting at the reverse proxy level (Traefik or Nginx).

### Recommended Limits

| Endpoint Type | Recommended Limit |
|---------------|-------------------|
| Authentication | 10 requests/minute per IP |
| API endpoints | 100 requests/minute per user |
| Webhooks | 1000 requests/minute per IP |
| PDF generation | 20 requests/minute per user |
| Public portal | 60 requests/minute per token |

### Traefik Configuration Example

```yaml
http:
  middlewares:
    rate-limit:
      rateLimit:
        average: 100
        burst: 50
        period: 1m
```

---

## SDK / Client Libraries

QuoteCraft does not currently provide official SDK libraries. However, since all Server Actions are type-safe TypeScript functions, you can:

1. **Use directly in React components:**
   ```tsx
   import { getQuotes } from '@/lib/quotes/actions';

   export default async function QuotesPage() {
     const { quotes } = await getQuotes();
     // ...
   }
   ```

2. **Call from client components with useTransition:**
   ```tsx
   'use client';
   import { useTransition } from 'react';
   import { createQuote } from '@/lib/quotes/actions';

   function CreateQuoteButton() {
     const [isPending, startTransition] = useTransition();

     const handleCreate = () => {
       startTransition(async () => {
         await createQuote({ title: 'New Quote', clientId: '...' });
       });
     };
   }
   ```

---

## Changelog

### v1.0.0 (January 2026)
- Initial API documentation
- Authentication (NextAuth.js with Credentials, Google, GitHub)
- Quote management APIs
- Invoice management APIs
- Client management APIs
- Rate card management APIs
- Dashboard analytics APIs
- Settings management APIs
- Stripe payment integration
- Public portal access tokens

---

*Last updated: January 30, 2026*
