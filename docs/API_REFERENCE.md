# Oreko API Reference

**Version:** 1.0
**Base URL:** `https://oreko.app/api/v1`
**Authentication:** Bearer token (API key)

---

## Authentication

All API requests require a **Bearer token** in the `Authorization` header.

```
Authorization: Bearer qc_sk_your_api_key_here
```

You can generate API keys from **Settings > API** in your Oreko dashboard.

### Key Format

API keys follow the format `qc_sk_` followed by a 64-character hex string. Keys are hashed before storage — Oreko never stores your raw key. Save it securely when generated.

### Authentication Errors

| Status | Message | Description |
|--------|---------|-------------|
| `401` | Missing or invalid Authorization header | No `Bearer` token provided |
| `401` | Invalid API key format | Key doesn't start with `qc_sk_` |
| `401` | Invalid or revoked API key | Key not found or has been revoked |
| `401` | API key has expired | Key has passed its expiration date |
| `429` | Too many requests | Rate limit exceeded |

---

## Common Patterns

### Pagination

List endpoints support pagination via query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (minimum: 1) |
| `limit` | integer | `25` | Items per page (maximum: 100) |

**Response format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 42,
    "totalPages": 2
  }
}
```

### Filtering

List endpoints support a `search` query parameter for text-based filtering.

```
GET /api/v1/clients?search=acme&page=1&limit=10
```

### Soft Deletes

All delete operations are soft deletes — records are marked with a `deletedAt` timestamp and excluded from future queries. They are not permanently removed.

### Currency

Currency defaults to your workspace currency (set in Settings). You can override it per document using a 3-letter ISO currency code (e.g., `USD`, `EUR`, `INR`, `JPY`).

---

## Clients

### List Clients

```
GET /api/v1/clients
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `search` | string | Search by name, email, or company |

**Response (200):**
```json
{
  "data": [
    {
      "id": "00d92e87-b0eb-44fb-8052-5635600e2964",
      "name": "Brad Humble J",
      "email": "brad@humbletech.com",
      "phone": null,
      "company": "Humble tech",
      "address": {
        "city": "",
        "state": "",
        "street": "",
        "country": "Sweden",
        "postalCode": ""
      },
      "billingAddress": {},
      "metadata": {
        "tags": [],
        "type": "company",
        "website": "",
        "contacts": []
      },
      "createdAt": "2026-03-24T13:31:19.921Z",
      "updatedAt": "2026-03-24T13:31:40.036Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### Get Client

```
GET /api/v1/clients/:id
```

**Response (200):**
```json
{
  "id": "00d92e87-b0eb-44fb-8052-5635600e2964",
  "name": "Brad Humble J",
  "email": "brad@humbletech.com",
  "phone": null,
  "company": "Humble tech",
  "address": {
    "city": "",
    "state": "",
    "street": "",
    "country": "Sweden",
    "postalCode": ""
  },
  "billingAddress": {},
  "metadata": {},
  "createdAt": "2026-03-24T13:31:19.921Z",
  "updatedAt": "2026-03-24T13:31:40.036Z"
}
```

**Errors:**
- `404` — Client not found

---

### Create Client

```
POST /api/v1/clients
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Client name |
| `email` | string | Yes | Client email (must be unique in workspace) |
| `phone` | string | No | Phone number |
| `company` | string | No | Company name |
| `address` | object | No | Address with `street`, `city`, `state`, `postalCode`, `country` |
| `billingAddress` | object | No | Billing address (same shape as address) |
| `metadata` | object | No | Custom metadata (max 10KB) |

**Example:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "company": "Smith Design Co",
  "phone": "+1-555-0123"
}
```

**Response (201):**
```json
{
  "id": "8ff9ae4c-caee-46e4-b5d2-90c651dc2027",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0123",
  "company": "Smith Design Co",
  "address": null,
  "billingAddress": null,
  "metadata": {},
  "createdAt": "2026-03-26T05:07:11.256Z"
}
```

**Errors:**
- `400` — Validation error (missing name/email, invalid email format)
- `409` — A client with this email already exists

---

### Update Client

```
PATCH /api/v1/clients/:id
Content-Type: application/json
```

Send only the fields you want to update.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Client name (cannot be empty) |
| `email` | string | Client email (uniqueness checked) |
| `phone` | string | Phone number |
| `company` | string | Company name |
| `address` | object | Address object |
| `billingAddress` | object | Billing address object |
| `metadata` | object | Custom metadata |

**Example:**
```json
{
  "name": "Jane Smith Updated",
  "phone": "+1-555-9999"
}
```

**Response (200):** Updated client object.

**Errors:**
- `400` — Client name cannot be empty
- `404` — Client not found
- `409` — A client with this email already exists

---

### Delete Client

```
DELETE /api/v1/clients/:id
```

**Response (200):**
```json
{
  "message": "Client deleted"
}
```

**Errors:**
- `404` — Client not found

---

### Bulk Import Clients

```
POST /api/v1/clients/import
Content-Type: application/json
```

Import up to **500 clients** in a single request.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clients` | array | Yes | Array of client objects (max 500) |
| `skipDuplicates` | boolean | No | Skip clients with existing emails (default: `true`) |

Each client object in the array:

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `email` | string | Yes |
| `phone` | string | No |
| `company` | string | No |
| `street` | string | No |
| `city` | string | No |
| `state` | string | No |
| `postalCode` | string | No |
| `country` | string | No |

**Example:**
```json
{
  "clients": [
    {
      "name": "Client A",
      "email": "a@example.com",
      "company": "Company A"
    },
    {
      "name": "Client B",
      "email": "b@example.com"
    }
  ],
  "skipDuplicates": true
}
```

**Response (201):**
```json
{
  "message": "Import complete: 2 created, 0 skipped, 0 failed",
  "success": 2,
  "failed": 0,
  "skipped": 0,
  "errors": [],
  "created": [
    { "id": "...", "name": "Client A", "email": "a@example.com" },
    { "id": "...", "name": "Client B", "email": "b@example.com" }
  ]
}
```

---

## Quotes

### List Quotes

```
GET /api/v1/quotes
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `status` | string | Filter by status: `draft`, `sent`, `viewed`, `accepted`, `declined`, `expired`, `converted` |
| `search` | string | Search by quote title |

**Response (200):**
```json
{
  "data": [
    {
      "id": "ce29bf4f-c115-4d90-99f7-edb7155ec7e4",
      "quoteNumber": "QT-0004",
      "title": "Item 1",
      "status": "draft",
      "client": {
        "id": "52afbb95-ed7d-44f4-9b4d-5394b6e4c0a4",
        "name": "John Wick",
        "email": "john@example.com",
        "company": null
      },
      "currency": "EUR",
      "subtotal": 19000,
      "discountType": null,
      "discountValue": null,
      "discountAmount": 0,
      "taxTotal": 0,
      "total": 19000,
      "notes": null,
      "terms": "...",
      "issueDate": "2026-03-25T00:00:00.000Z",
      "expirationDate": "2026-04-24T00:00:00.000Z",
      "sentAt": null,
      "acceptedAt": null,
      "declinedAt": null,
      "lineItems": [
        {
          "id": "e53e101b-ce0b-430f-b6d7-1979c5db0ce5",
          "name": "Item 1",
          "description": "Item description",
          "quantity": 1,
          "rate": 14000,
          "amount": 14000,
          "taxRate": null,
          "taxAmount": 0
        }
      ],
      "createdAt": "2026-03-25T07:50:16.486Z",
      "updatedAt": "2026-03-25T07:50:16.486Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### Get Quote

```
GET /api/v1/quotes/:id
```

**Response (200):** Full quote object with all fields and line items.

**Errors:**
- `404` — Quote not found

---

### Create Quote

```
POST /api/v1/quotes
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Quote title |
| `clientId` | string | Yes | Client UUID |
| `currency` | string | No | 3-letter ISO code (defaults to workspace currency) |
| `lineItems` | array | No | Array of line item objects |

Each line item:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Item name |
| `description` | string | No | Item description |
| `quantity` | number | Yes | Quantity (>= 0) |
| `rate` | number | Yes | Unit price (>= 0) |
| `taxRate` | number | No | Tax percentage (0-100) |

**Example:**
```json
{
  "title": "Website Redesign",
  "clientId": "52afbb95-ed7d-44f4-9b4d-5394b6e4c0a4",
  "currency": "USD",
  "lineItems": [
    {
      "name": "Web Development",
      "description": "Full stack development",
      "quantity": 10,
      "rate": 100,
      "taxRate": 5
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "c0ead122-ba22-4283-afa2-5d0b9ad6081e",
  "quoteNumber": "QT0005",
  "title": "Website Redesign",
  "status": "draft",
  "client": {
    "id": "52afbb95-ed7d-44f4-9b4d-5394b6e4c0a4",
    "name": "John Wick",
    "email": "john@example.com",
    "company": null
  },
  "currency": "USD",
  "subtotal": 1000,
  "taxTotal": 50,
  "total": 1050,
  "lineItems": [
    {
      "id": "0c3d0bac-03bd-4b6b-9411-a14c4fddefe6",
      "name": "Web Development",
      "description": "Full stack development",
      "quantity": 10,
      "rate": 100,
      "amount": 1000
    }
  ],
  "createdAt": "2026-03-26T05:14:44.578Z"
}
```

**Errors:**
- `400` — Validation error (missing title/clientId, invalid currency)
- `404` — Client not found

---

### Update Quote

```
PATCH /api/v1/quotes/:id
Content-Type: application/json
```

Send only the fields you want to update.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Quote title |
| `notes` | string | Notes visible to client |
| `terms` | string | Terms and conditions |
| `status` | string | New status (valid transitions enforced) |
| `lineItems` | array | Replaces all existing line items |

**Status Transitions:**

| From | Allowed To |
|------|------------|
| `draft` | `sent` |
| `sent` | `viewed`, `accepted`, `declined`, `expired` |
| `viewed` | `accepted`, `declined`, `expired` |
| `declined` | `draft` |
| `expired` | `draft` |
| `accepted` | (cannot change) |

**Example:**
```json
{
  "title": "Website Redesign v2",
  "notes": "Updated scope to include mobile"
}
```

**Response (200):** Updated quote object.

**Errors:**
- `400` — Invalid status transition, cannot modify accepted quotes
- `404` — Quote not found

---

### Duplicate Quote

```
POST /api/v1/quotes/:id/duplicate
```

No request body needed. Creates a copy with title `"Original Title (Copy)"` and status `draft`.

**Response (201):** A new quote object with a new `id`, new `quoteNumber`, status set to `draft`, and all line items copied from the original.

**Errors:**
- `404` — Quote not found

---

### Send Quote

```
POST /api/v1/quotes/:id/send
Content-Type: application/json
```

Sends the quote to the client via email. Status is updated to `sent` only if the email is delivered successfully.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | No | Custom message included in the email |
| `recipients` | string[] | No | Additional email addresses (max 10) |

**Example:**
```json
{
  "message": "Please review the attached quote."
}
```

**Response (200):**
```json
{
  "message": "Quote sent successfully",
  "emailSent": true,
  "quoteUrl": "https://oreko.app/q/f90046e6-ff33-41df-bdda-d47ad5653d46"
}
```

**Errors:**
- `400` — Quote status must be `draft`, `sent`, or `viewed`; total cannot be zero
- `404` — Quote not found
- `502` — Email service failure

---

### Delete Quote

```
DELETE /api/v1/quotes/:id
```

**Response (200):**
```json
{
  "message": "Quote deleted"
}
```

**Errors:**
- `404` — Quote not found

---

## Invoices

### List Invoices

```
GET /api/v1/invoices
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `status` | string | Filter: `draft`, `sent`, `viewed`, `partial`, `paid`, `overdue`, `voided` |
| `clientId` | string | Filter by client UUID |
| `search` | string | Search by invoice title |

**Response (200):** Paginated array of invoices (same structure as quotes, plus `amountPaid`, `amountDue`, `paidAt`, `voidedAt`).

---

### Get Invoice

```
GET /api/v1/invoices/:id
```

**Response (200):**
```json
{
  "id": "801b97f4-4253-4bf9-8254-e7f0f2d0a788",
  "invoiceNumber": "INV0003",
  "title": "API Test Invoice",
  "status": "draft",
  "client": {
    "id": "52afbb95-ed7d-44f4-9b4d-5394b6e4c0a4",
    "name": "John Wick",
    "email": "john@example.com",
    "company": null
  },
  "currency": "INR",
  "issueDate": "2026-03-26T00:00:00.000Z",
  "dueDate": "2026-04-30T00:00:00.000Z",
  "subtotal": 1000,
  "discountType": null,
  "discountValue": null,
  "discountAmount": 0,
  "taxTotal": 100,
  "total": 1100,
  "amountPaid": 0,
  "amountDue": 1100,
  "notes": null,
  "terms": null,
  "sentAt": null,
  "paidAt": null,
  "voidedAt": null,
  "lineItems": [
    {
      "id": "af95c4bf-cf9d-426b-b4e3-a7e293f813e8",
      "name": "Consulting",
      "description": "API testing session",
      "quantity": 5,
      "rate": 200,
      "amount": 1000,
      "taxRate": 10,
      "taxAmount": 100
    }
  ],
  "createdAt": "2026-03-26T05:26:19.729Z",
  "updatedAt": "2026-03-26T05:26:19.729Z"
}
```

**Errors:**
- `404` — Invoice not found

---

### Create Invoice

```
POST /api/v1/invoices
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Invoice title |
| `clientId` | string | Yes | Client UUID |
| `dueDate` | string | Yes | Due date in ISO format (e.g., `2026-04-30`) |
| `currency` | string | No | 3-letter ISO code (defaults to workspace currency) |
| `lineItems` | array | No | Array of line item objects |
| `notes` | string | No | Notes visible to client |
| `terms` | string | No | Terms and conditions |

Line items follow the same format as quotes.

**Example:**
```json
{
  "title": "March Consulting",
  "clientId": "52afbb95-ed7d-44f4-9b4d-5394b6e4c0a4",
  "dueDate": "2026-04-30",
  "lineItems": [
    {
      "name": "Consulting",
      "description": "Strategy session",
      "quantity": 5,
      "rate": 200,
      "taxRate": 10
    }
  ]
}
```

**Response (201):** Invoice object with auto-generated `invoiceNumber`, calculated totals, `amountPaid: 0`, and `status: "draft"`.

**Errors:**
- `400` — Validation error
- `404` — Client not found

---

### Update Invoice

```
PATCH /api/v1/invoices/:id
Content-Type: application/json
```

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Invoice title |
| `notes` | string | Notes visible to client |
| `terms` | string | Terms and conditions |
| `dueDate` | string | Due date (ISO format) |
| `status` | string | New status (valid transitions enforced) |
| `lineItems` | array | Replaces all existing line items |

**Status Transitions:**

| From | Allowed To |
|------|------------|
| `draft` | `sent` |
| `sent` | `viewed`, `partial`, `paid`, `overdue`, `voided` |
| `viewed` | `partial`, `paid`, `overdue`, `voided` |
| `partial` | `paid`, `voided` |
| `paid` | `voided` |
| `overdue` | `paid`, `partial`, `voided` |
| `voided` | (cannot change) |

**Restrictions:**
- Cannot modify line items on `paid` or `voided` invoices
- Cannot delete `paid` or `voided` invoices (must void instead)

**Response (200):** Updated invoice object.

**Errors:**
- `400` — Invalid status transition, financial restriction
- `404` — Invoice not found

---

### Send Invoice

```
POST /api/v1/invoices/:id/send
Content-Type: application/json
```

Sends the invoice to the client via email.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | No | Custom message included in the email |
| `recipients` | string[] | No | Additional email addresses (max 10) |

**Response (200):**
```json
{
  "message": "Invoice sent successfully",
  "emailSent": true,
  "invoiceUrl": "https://oreko.app/i/b3586c37-84a3-4891-9305-3ceed85896d0"
}
```

**Errors:**
- `400` — Invoice status must be `draft`, `sent`, or `viewed`; total cannot be zero
- `404` — Invoice not found
- `502` — Email service failure

---

### Create Invoice from Quote

```
POST /api/v1/invoices/from-quote/:quoteId
Content-Type: application/json
```

Convert an **accepted** quote directly into an invoice. All line items, client info, and settings are copied automatically — zero data re-entry.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dueDays` | integer | No | Days until due (0-365, default: 30) |

**Example:**
```json
{
  "dueDays": 14
}
```

**Response (201):** Full invoice object created from the quote.

**Errors:**
- `400` — Quote is not in `accepted` status, or invoice already exists for this quote
- `404` — Quote not found

---

### Delete Invoice

```
DELETE /api/v1/invoices/:id
```

**Response (200):**
```json
{
  "message": "Invoice deleted"
}
```

**Errors:**
- `400` — Cannot delete paid or partially paid invoices (void them instead)
- `404` — Invoice not found

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request (validation error, invalid status transition) |
| `401` | Unauthorized (invalid or missing API key) |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate email) |
| `429` | Rate limit exceeded |
| `502` | Upstream service failure (e.g., email delivery failed) |
| `500` | Internal server error |

---

## Rate Limiting

API requests are rate-limited by IP address. If you exceed the limit, you'll receive a `429` response with `Retry-After` headers.

---

## Quick Start

### 1. Generate an API Key

Go to **Settings > API** in your Oreko dashboard and create a new API key. Copy it immediately — it won't be shown again.

### 2. Make Your First Request

```bash
curl -X GET https://oreko.app/api/v1/clients \
  -H "Authorization: Bearer qc_sk_your_api_key"
```

You should see a paginated list of your clients.

### 3. Create a Quote

```bash
curl -X POST https://oreko.app/api/v1/quotes \
  -H "Authorization: Bearer qc_sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Website Redesign",
    "clientId": "52afbb95-ed7d-44f4-9b4d-5394b6e4c0a4",
    "lineItems": [
      {
        "name": "Design & Development",
        "quantity": 1,
        "rate": 5000,
        "taxRate": 10
      }
    ]
  }'
```

Replace `clientId` with an actual client ID from step 2.

### 4. Send It to Your Client

```bash
curl -X POST https://oreko.app/api/v1/quotes/{quoteId}/send \
  -H "Authorization: Bearer qc_sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Please review the attached quote."
  }'
```

Replace `{quoteId}` with the `id` from step 3. Your client will receive an email with a link to view and accept the quote.

### 5. Convert to Invoice When Accepted

Once the client accepts the quote, convert it to an invoice:

```bash
curl -X POST https://oreko.app/api/v1/invoices/from-quote/{quoteId} \
  -H "Authorization: Bearer qc_sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{ "dueDays": 14 }'
```

This creates an invoice with all line items copied from the quote — zero data re-entry.
