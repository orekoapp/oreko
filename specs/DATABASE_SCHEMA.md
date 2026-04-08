# Database Schema Specification

**Version:** 1.0.0
**Status:** Production-Ready
**Last Updated:** January 2026
**Database:** PostgreSQL 15+
**ORM:** Prisma 5.x

---

## Table of Contents

1. [Entity Relationship Diagram](#1-entity-relationship-diagram)
2. [Core Entities](#2-core-entities)
3. [Indexes](#3-indexes)
4. [Prisma Schema](#4-prisma-schema)
5. [Migrations Strategy](#5-migrations-strategy)
6. [Soft Deletes](#6-soft-deletes)
7. [Audit Trail](#7-audit-trail)
8. [Data Types & Conventions](#8-data-types--conventions)

---

## 1. Entity Relationship Diagram

```
                                    QUOTECRAFT DATABASE SCHEMA
    ============================================================================================================

                                         AUTHENTICATION & USERS
    +------------------+        +------------------+        +------------------+
    |      users       |        |     accounts     |        |    sessions      |
    +------------------+        +------------------+        +------------------+
    | id (PK, UUID)    |<------o| user_id (FK)     |        | id (PK, UUID)    |
    | email            |        | provider         |        | user_id (FK)     |>------+
    | password_hash    |        | provider_id      |        | session_token    |       |
    | name             |        | access_token     |        | expires_at       |       |
    | avatar_url       |        | refresh_token    |        +------------------+       |
    | email_verified   |        +------------------+                                    |
    | created_at       |                                   +------------------------+   |
    | updated_at       |                                   | password_reset_tokens  |   |
    | deleted_at       |                                   +------------------------+   |
    +------------------+                                   | id (PK, UUID)          |   |
            |                                              | user_id (FK)           |>--+
            | 1:N                                          | token                  |
            v                                              | expires_at             |
    +------------------+                                   +------------------------+
    | workspace_members|
    +------------------+        +------------------+
    | id (PK, UUID)    |        | workspace_invites|
    | workspace_id(FK) |<------o| id (PK, UUID)    |
    | user_id (FK)     |        | workspace_id(FK) |
    | role             |        | email            |
    | invited_at       |        | role             |
    | accepted_at      |        | token            |
    +------------------+        | expires_at       |
            |                   +------------------+
            | N:1
            v
    ============================================================================================================

                                         WORKSPACE & BUSINESS
    +------------------+        +------------------------+
    |   workspaces     |        |   business_profiles    |
    +------------------+        +------------------------+
    | id (PK, UUID)    |<------o| workspace_id (PK, FK)  |  1:1
    | name             |        | business_name          |
    | slug (unique)    |        | logo_url               |
    | owner_id (FK)    |        | email                  |
    | settings (JSON)  |        | phone                  |
    | created_at       |        | address (JSON)         |
    | updated_at       |        | website                |
    | deleted_at       |        | tax_id                 |
    +------------------+        | currency               |
            |                   | timezone               |
            |                   +------------------------+
            |
            +------------------------------------------+------------------------------------------+
            |                    |                     |                    |                    |
            | 1:N                | 1:N                 | 1:N                | 1:N                | 1:N
            v                    v                     v                    v                    v
    +------------------+ +------------------+ +------------------+ +------------------+ +------------------+
    |     clients      | |   rate_cards     | |     quotes       | |    invoices      | |   contracts      |
    +------------------+ +------------------+ +------------------+ +------------------+ +------------------+
    | id (PK, UUID)    | | id (PK, UUID)    | | id (PK, UUID)    | | id (PK, UUID)    | | id (PK, UUID)    |
    | workspace_id(FK) | | workspace_id(FK) | | workspace_id(FK) | | workspace_id(FK) | | workspace_id(FK) |
    | name             | | name             | | client_id (FK)   | | client_id (FK)   | | name             |
    | company          | | description      | | quote_number     | | quote_id (FK)    | | content          |
    | email            | | category_id(FK)  | | status           | | invoice_number   | | is_template      |
    | phone            | | pricing_type     | | title            | | status           | | created_at       |
    | address (JSON)   | | rate             | | issue_date       | | title            | +------------------+
    | notes            | | unit             | | expiration_date  | | issue_date       |         |
    | metadata (JSON)  | | is_active        | | subtotal         | | due_date         |         | 1:N
    | created_at       | | created_at       | | discount_type    | | subtotal         |         v
    +------------------+ +------------------+ | discount_value   | | discount_type    | +------------------+
            |                    |            | tax_total        | | discount_value   | |contract_instances|
            |                    |            | total            | | tax_total        | +------------------+
            |                    |            | notes            | | total            | | id (PK, UUID)    |
            |                    |            | terms            | | amount_paid      | | contract_id (FK) |
            |                    |            | settings (JSON)  | | amount_due       | | quote_id (FK)    |
            |                    |            | accepted_at      | | notes            | | client_id (FK)   |
            |                    |            | signed_at        | | terms            | | status           |
            |                    |            | created_at       | | settings (JSON)  | | signed_at        |
            |                    |            +------------------+ | sent_at          | | signature_data   |
            |                    |                    |            | paid_at          | | ip_address       |
            |                    |                    | 1:N        | created_at       | +------------------+
            |                    |                    v            +------------------+
            |                    |            +------------------+         |
            |                    +---------->o| quote_line_items |         | 1:N
            |                                 +------------------+         v
            |                                 | id (PK, UUID)    | +--------------------+
            |                                 | quote_id (FK)    | | invoice_line_items |
            |                                 | rate_card_id(FK) | +--------------------+
            |                                 | name             | | id (PK, UUID)      |
            |                                 | description      | | invoice_id (FK)    |
            |                                 | quantity         | | rate_card_id (FK)  |
            |                                 | rate             | | name               |
            |                                 | amount           | | description        |
            |                                 | tax_rate         | | quantity           |
            |                                 | sort_order       | | rate               |
            |                                 +------------------+ | amount             |
            |                                         |            | tax_rate           |
            |                                         |            | sort_order         |
            |                                         v            +--------------------+
    ============================================================================================================

                                              PAYMENTS
    +------------------+        +----------------------+
    |     payments     |        |  payment_schedules   |
    +------------------+        +----------------------+
    | id (PK, UUID)    |<------o| id (PK, UUID)        |
    | invoice_id (FK)  |        | invoice_id (FK)      |
    | amount           |        | type                 |
    | payment_method   |        | amount               |
    | stripe_payment_id|        | percentage           |
    | status           |        | due_date             |
    | processed_at     |        | status               |
    | created_at       |        | payment_id (FK)      |
    +------------------+        +----------------------+

    ============================================================================================================

                                         EVENTS & AUDIT
    +------------------+        +------------------+
    |   quote_events   |        |  invoice_events  |
    +------------------+        +------------------+
    | id (PK, UUID)    |        | id (PK, UUID)    |
    | quote_id (FK)    |        | invoice_id (FK)  |
    | event_type       |        | event_type       |
    | actor_id (FK)    |        | actor_id (FK)    |
    | metadata (JSON)  |        | metadata (JSON)  |
    | created_at       |        | created_at       |
    +------------------+        +------------------+

    ============================================================================================================

                                    SETTINGS & CONFIGURATION
    +------------------+        +------------------+        +------------------+
    |    tax_rates     |        | payment_settings |        | branding_settings|
    +------------------+        +------------------+        +------------------+
    | id (PK, UUID)    |        | workspace_id(PK) |        | workspace_id(PK) |
    | workspace_id(FK) |        | stripe_account_id|        | primary_color    |
    | name             |        | stripe_connected |        | accent_color     |
    | rate             |        | payment_methods  |        | logo_url         |
    | is_inclusive     |        | pass_fees        |        | custom_css       |
    | is_default       |        +------------------+        +------------------+
    +------------------+

    +------------------+        +------------------+
    |  email_templates |        | scheduled_emails |
    +------------------+        +------------------+
    | id (PK, UUID)    |        | id (PK, UUID)    |
    | workspace_id(FK) |        | workspace_id(FK) |
    | type             |        | type             |
    | subject          |        | entity_type      |
    | body             |        | entity_id        |
    | is_active        |        | scheduled_for    |
    +------------------+        | sent_at          |
                                | status           |
                                +------------------+

    ============================================================================================================

                                         ATTACHMENTS
    +------------------+
    |   attachments    |
    +------------------+
    | id (PK, UUID)    |
    | workspace_id(FK) |
    | entity_type      |
    | entity_id        |
    | filename         |
    | file_path        |
    | file_size        |
    | mime_type        |
    | uploaded_at      |
    +------------------+
```

---

## 2. Core Entities

### 2.1 User & Authentication

#### users
Primary user accounts for the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NULL | Bcrypt hashed password (null for OAuth users) |
| name | VARCHAR(255) | NULL | Display name |
| avatar_url | TEXT | NULL | Profile image URL |
| email_verified_at | TIMESTAMP | NULL | When email was verified |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

#### accounts (OAuth)
OAuth provider accounts linked to users (NextAuth.js compatible).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| user_id | UUID | FK -> users.id, ON DELETE CASCADE | Associated user |
| type | VARCHAR(50) | NOT NULL | Account type (oauth, email, etc.) |
| provider | VARCHAR(50) | NOT NULL | OAuth provider (google, github) |
| provider_account_id | VARCHAR(255) | NOT NULL | Provider's user ID |
| refresh_token | TEXT | NULL | OAuth refresh token |
| access_token | TEXT | NULL | OAuth access token |
| expires_at | INTEGER | NULL | Token expiration (Unix timestamp) |
| token_type | VARCHAR(50) | NULL | Token type |
| scope | TEXT | NULL | OAuth scopes |
| id_token | TEXT | NULL | OIDC ID token |
| session_state | TEXT | NULL | Session state |

**Unique Constraint:** (provider, provider_account_id)

#### sessions
Active user sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| user_id | UUID | FK -> users.id, ON DELETE CASCADE | Associated user |
| session_token | VARCHAR(255) | UNIQUE, NOT NULL | Session token |
| expires_at | TIMESTAMP | NOT NULL | Session expiration |
| ip_address | VARCHAR(45) | NULL | Client IP address |
| user_agent | TEXT | NULL | Client user agent |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Session creation time |

#### password_reset_tokens
Password reset request tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| user_id | UUID | FK -> users.id, ON DELETE CASCADE | Associated user |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Reset token (hashed) |
| expires_at | TIMESTAMP | NOT NULL | Token expiration |
| used_at | TIMESTAMP | NULL | When token was used |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Token creation time |

#### verification_tokens
Email verification tokens (NextAuth.js compatible).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| identifier | VARCHAR(255) | NOT NULL | Email address |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Verification token |
| expires_at | TIMESTAMP | NOT NULL | Token expiration |

**Unique Constraint:** (identifier, token)

---

### 2.2 Workspace (Multi-tenant)

#### workspaces
Organization/workspace for multi-tenancy.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| name | VARCHAR(255) | NOT NULL | Workspace name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-safe identifier |
| owner_id | UUID | FK -> users.id | Workspace owner |
| settings | JSONB | DEFAULT '{}' | Workspace settings |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Settings JSON Structure:**
```json
{
  "modules": {
    "quotes": true,
    "invoices": true,
    "contracts": false,
    "rate_cards": true
  },
  "defaults": {
    "currency": "USD",
    "timezone": "America/New_York",
    "date_format": "MM/DD/YYYY",
    "payment_terms_days": 30,
    "quote_expiry_days": 30,
    "tax_rate": 0
  },
  "notifications": {
    "email_on_quote_accepted": true,
    "email_on_payment_received": true
  }
}
```

#### workspace_members
User membership in workspaces.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| user_id | UUID | FK -> users.id, ON DELETE CASCADE | Associated user |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'member' | Role: owner/admin/member/viewer |
| invited_at | TIMESTAMP | NULL | When user was invited |
| accepted_at | TIMESTAMP | NULL | When invite was accepted |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Unique Constraint:** (workspace_id, user_id)

**Role Permissions:**
| Role | View | Create | Edit | Delete | Manage Members | Billing |
|------|------|--------|------|--------|----------------|---------|
| owner | Yes | Yes | Yes | Yes | Yes | Yes |
| admin | Yes | Yes | Yes | Yes | Yes | No |
| member | Yes | Yes | Yes | No | No | No |
| viewer | Yes | No | No | No | No | No |

#### workspace_invitations
Pending workspace invitations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Target workspace |
| email | VARCHAR(255) | NOT NULL | Invitee email |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'member' | Assigned role |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Invitation token |
| invited_by | UUID | FK -> users.id | User who sent invite |
| expires_at | TIMESTAMP | NOT NULL | Invitation expiration |
| accepted_at | TIMESTAMP | NULL | When accepted |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |

---

### 2.3 Business Profile

#### business_profiles
Business information for a workspace (1:1 relationship).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| workspace_id | UUID | PK, FK -> workspaces.id | Associated workspace |
| business_name | VARCHAR(255) | NOT NULL | Legal business name |
| logo_url | TEXT | NULL | Business logo URL |
| email | VARCHAR(255) | NULL | Business contact email |
| phone | VARCHAR(50) | NULL | Business phone |
| website | TEXT | NULL | Business website |
| address | JSONB | NULL | Business address |
| tax_id | VARCHAR(100) | NULL | Tax ID (EIN, VAT, etc.) |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | Default currency (ISO 4217) |
| timezone | VARCHAR(50) | NOT NULL, DEFAULT 'UTC' | Default timezone |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Address JSON Structure:**
```json
{
  "line1": "123 Main Street",
  "line2": "Suite 100",
  "city": "Austin",
  "state": "TX",
  "postal_code": "78701",
  "country": "US"
}
```

---

### 2.4 Clients/Contacts

#### clients
Client/contact records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| name | VARCHAR(255) | NOT NULL | Contact name |
| company | VARCHAR(255) | NULL | Company name |
| email | VARCHAR(255) | NOT NULL | Primary email |
| phone | VARCHAR(50) | NULL | Phone number |
| address | JSONB | NULL | Mailing address |
| billing_address | JSONB | NULL | Billing address (if different) |
| tax_id | VARCHAR(100) | NULL | Client tax ID |
| notes | TEXT | NULL | Internal notes |
| metadata | JSONB | DEFAULT '{}' | Custom fields |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

#### client_tags
Tags for organizing clients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| name | VARCHAR(50) | NOT NULL | Tag name |
| color | VARCHAR(7) | NULL | Hex color code |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |

**Unique Constraint:** (workspace_id, name)

#### client_tag_assignments
Many-to-many relationship between clients and tags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| client_id | UUID | FK -> clients.id, ON DELETE CASCADE | Client |
| tag_id | UUID | FK -> client_tags.id, ON DELETE CASCADE | Tag |

**Primary Key:** (client_id, tag_id)

---

### 2.5 Rate Cards

#### rate_card_categories
Categories for organizing rate card items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| name | VARCHAR(100) | NOT NULL | Category name |
| color | VARCHAR(7) | NULL | Hex color code |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Unique Constraint:** (workspace_id, name)

#### rate_cards
Reusable pricing items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| category_id | UUID | FK -> rate_card_categories.id, NULL | Category |
| name | VARCHAR(255) | NOT NULL | Item name |
| description | TEXT | NULL | Item description |
| pricing_type | VARCHAR(20) | NOT NULL, DEFAULT 'fixed' | hourly/daily/fixed/package |
| rate | DECIMAL(12,2) | NOT NULL | Unit price |
| unit | VARCHAR(50) | NULL | Unit label (hour, day, etc.) |
| tax_rate_id | UUID | FK -> tax_rates.id, NULL | Default tax rate |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Pricing Types:**
- `hourly` - Per hour rate
- `daily` - Per day rate
- `fixed` - One-time fixed price
- `package` - Package/bundle price

---

### 2.6 Quotes

#### quotes
Quote/proposal documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| client_id | UUID | FK -> clients.id | Associated client |
| quote_number | VARCHAR(50) | NOT NULL | Human-readable quote number |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | Quote status |
| title | VARCHAR(255) | NULL | Quote title |
| issue_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Issue date |
| expiration_date | DATE | NULL | Expiration date |
| subtotal | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Subtotal before discount/tax |
| discount_type | VARCHAR(10) | NULL | 'percentage' or 'fixed' |
| discount_value | DECIMAL(12,2) | NULL | Discount amount or percentage |
| discount_amount | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Calculated discount |
| tax_total | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Total tax amount |
| total | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Grand total |
| notes | TEXT | NULL | Notes visible to client |
| terms | TEXT | NULL | Terms and conditions |
| internal_notes | TEXT | NULL | Internal notes (not visible to client) |
| settings | JSONB | DEFAULT '{}' | Quote settings |
| access_token | VARCHAR(100) | UNIQUE, NOT NULL | Client portal access token |
| viewed_at | TIMESTAMP | NULL | First viewed timestamp |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | View counter |
| sent_at | TIMESTAMP | NULL | When quote was sent |
| accepted_at | TIMESTAMP | NULL | When quote was accepted |
| declined_at | TIMESTAMP | NULL | When quote was declined |
| signed_at | TIMESTAMP | NULL | When quote was signed |
| signature_data | JSONB | NULL | Signature information |
| converted_to_invoice_id | UUID | NULL | Resulting invoice ID |
| pdf_url | TEXT | NULL | Generated PDF URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Unique Constraint:** (workspace_id, quote_number)

**Status Values:**
- `draft` - Being edited, not sent
- `sent` - Sent to client
- `viewed` - Client has opened the quote
- `accepted` - Client accepted
- `declined` - Client declined
- `expired` - Past expiration date
- `converted` - Converted to invoice

**Settings JSON Structure:**
```json
{
  "require_signature": true,
  "auto_convert_to_invoice": false,
  "deposit_required": true,
  "deposit_type": "percentage",
  "deposit_value": 50,
  "show_line_item_prices": true,
  "allow_partial_acceptance": false
}
```

**Signature Data JSON Structure:**
```json
{
  "signature_url": "https://...",
  "signer_name": "John Doe",
  "signer_email": "john@example.com",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "signed_at": "2026-01-15T10:30:00Z"
}
```

#### quote_line_items
Line items within a quote.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| quote_id | UUID | FK -> quotes.id, ON DELETE CASCADE | Parent quote |
| rate_card_id | UUID | FK -> rate_cards.id, NULL | Source rate card (if any) |
| name | VARCHAR(255) | NOT NULL | Item name |
| description | TEXT | NULL | Item description |
| quantity | DECIMAL(10,2) | NOT NULL, DEFAULT 1 | Quantity |
| rate | DECIMAL(12,2) | NOT NULL | Unit price |
| amount | DECIMAL(12,2) | NOT NULL | Line total (quantity * rate) |
| tax_rate | DECIMAL(5,2) | NULL | Tax percentage |
| tax_amount | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Calculated tax |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

#### quote_events
Audit log for quote activities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| quote_id | UUID | FK -> quotes.id, ON DELETE CASCADE | Associated quote |
| event_type | VARCHAR(50) | NOT NULL | Type of event |
| actor_id | UUID | FK -> users.id, NULL | User who performed action |
| actor_type | VARCHAR(20) | NOT NULL, DEFAULT 'user' | user/client/system |
| metadata | JSONB | DEFAULT '{}' | Additional event data |
| ip_address | VARCHAR(45) | NULL | Client IP address |
| user_agent | TEXT | NULL | Client user agent |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Event time |

**Event Types:**
- `created` - Quote created
- `updated` - Quote modified
- `sent` - Quote sent to client
- `viewed` - Client viewed quote
- `accepted` - Client accepted quote
- `declined` - Client declined quote
- `signed` - Client signed quote
- `expired` - Quote expired
- `converted` - Converted to invoice
- `reminder_sent` - Reminder email sent
- `comment_added` - Comment added

---

### 2.7 Invoices

#### invoices
Invoice documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| client_id | UUID | FK -> clients.id | Associated client |
| quote_id | UUID | FK -> quotes.id, NULL, UNIQUE | Source quote (if converted) |
| invoice_number | VARCHAR(50) | NOT NULL | Human-readable invoice number |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | Invoice status |
| title | VARCHAR(255) | NULL | Invoice title |
| issue_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Issue date |
| due_date | DATE | NOT NULL | Payment due date |
| subtotal | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Subtotal |
| discount_type | VARCHAR(10) | NULL | 'percentage' or 'fixed' |
| discount_value | DECIMAL(12,2) | NULL | Discount amount or percentage |
| discount_amount | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Calculated discount |
| tax_total | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Total tax |
| total | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Grand total |
| amount_paid | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Total amount paid |
| amount_due | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Remaining balance |
| notes | TEXT | NULL | Notes visible to client |
| terms | TEXT | NULL | Payment terms |
| internal_notes | TEXT | NULL | Internal notes |
| settings | JSONB | DEFAULT '{}' | Invoice settings |
| access_token | VARCHAR(100) | UNIQUE, NOT NULL | Client portal access token |
| viewed_at | TIMESTAMP | NULL | First viewed timestamp |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | View counter |
| sent_at | TIMESTAMP | NULL | When invoice was sent |
| paid_at | TIMESTAMP | NULL | When fully paid |
| voided_at | TIMESTAMP | NULL | When voided |
| pdf_url | TEXT | NULL | Generated PDF URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Unique Constraint:** (workspace_id, invoice_number)

**Status Values:**
- `draft` - Being edited
- `sent` - Sent to client
- `viewed` - Client has opened
- `partial` - Partially paid
- `paid` - Fully paid
- `overdue` - Past due date, unpaid
- `void` - Cancelled/voided

**Settings JSON Structure:**
```json
{
  "payment_methods": ["card", "bank_transfer", "manual"],
  "gratuity_enabled": false,
  "gratuity_options": [15, 18, 20, 25],
  "auto_reminders": true,
  "reminder_schedule": [3, 7, 14],
  "late_fee_enabled": false,
  "late_fee_type": "percentage",
  "late_fee_value": 5
}
```

#### invoice_line_items
Line items within an invoice.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| invoice_id | UUID | FK -> invoices.id, ON DELETE CASCADE | Parent invoice |
| rate_card_id | UUID | FK -> rate_cards.id, NULL | Source rate card |
| name | VARCHAR(255) | NOT NULL | Item name |
| description | TEXT | NULL | Item description |
| quantity | DECIMAL(10,2) | NOT NULL, DEFAULT 1 | Quantity |
| rate | DECIMAL(12,2) | NOT NULL | Unit price |
| amount | DECIMAL(12,2) | NOT NULL | Line total |
| tax_rate | DECIMAL(5,2) | NULL | Tax percentage |
| tax_amount | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Calculated tax |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

#### invoice_events
Audit log for invoice activities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| invoice_id | UUID | FK -> invoices.id, ON DELETE CASCADE | Associated invoice |
| event_type | VARCHAR(50) | NOT NULL | Type of event |
| actor_id | UUID | FK -> users.id, NULL | User who performed action |
| actor_type | VARCHAR(20) | NOT NULL, DEFAULT 'user' | user/client/system |
| metadata | JSONB | DEFAULT '{}' | Additional event data |
| ip_address | VARCHAR(45) | NULL | Client IP address |
| user_agent | TEXT | NULL | Client user agent |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Event time |

**Event Types:**
- `created` - Invoice created
- `updated` - Invoice modified
- `sent` - Invoice sent
- `viewed` - Client viewed
- `payment_received` - Payment received
- `partial_payment` - Partial payment received
- `paid` - Fully paid
- `overdue` - Became overdue
- `reminder_sent` - Reminder sent
- `voided` - Invoice voided
- `refund_issued` - Refund processed

---

### 2.8 Payments

#### payments
Payment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| invoice_id | UUID | FK -> invoices.id | Associated invoice |
| amount | DECIMAL(12,2) | NOT NULL | Payment amount |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | Currency code |
| payment_method | VARCHAR(20) | NOT NULL | card/bank/manual |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Payment status |
| stripe_payment_intent_id | VARCHAR(255) | NULL | Stripe Payment Intent ID |
| stripe_charge_id | VARCHAR(255) | NULL | Stripe Charge ID |
| stripe_receipt_url | TEXT | NULL | Stripe receipt URL |
| reference_number | VARCHAR(100) | NULL | Manual payment reference |
| notes | TEXT | NULL | Payment notes |
| processed_at | TIMESTAMP | NULL | When payment was processed |
| refunded_at | TIMESTAMP | NULL | When refunded |
| refund_amount | DECIMAL(12,2) | NULL | Refund amount |
| refund_reason | TEXT | NULL | Refund reason |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Payment Methods:**
- `card` - Credit/debit card via Stripe
- `bank` - ACH/bank transfer
- `manual` - Manual/offline payment

**Status Values:**
- `pending` - Awaiting processing
- `processing` - Being processed
- `completed` - Successfully completed
- `failed` - Payment failed
- `refunded` - Fully refunded
- `partial_refund` - Partially refunded

#### payment_schedules
Payment schedule/milestones for invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| invoice_id | UUID | FK -> invoices.id, ON DELETE CASCADE | Associated invoice |
| type | VARCHAR(20) | NOT NULL | Schedule type |
| description | VARCHAR(255) | NULL | Milestone description |
| amount | DECIMAL(12,2) | NULL | Fixed amount |
| percentage | DECIMAL(5,2) | NULL | Percentage of total |
| due_date | DATE | NOT NULL | Due date |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | pending/paid |
| payment_id | UUID | FK -> payments.id, NULL | Associated payment |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Schedule Types:**
- `one_time` - Single payment (full amount)
- `deposit` - Upfront deposit
- `milestone` - Project milestone payment
- `recurring` - Recurring payment

---

### 2.9 Contracts

#### contracts
Contract templates and documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| name | VARCHAR(255) | NOT NULL | Contract name |
| content | TEXT | NOT NULL | Rich text content (HTML/Markdown) |
| is_template | BOOLEAN | NOT NULL, DEFAULT FALSE | Is this a template? |
| variables | JSONB | DEFAULT '[]' | Template variables |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Variables JSON Structure:**
```json
[
  {"key": "client_name", "label": "Client Name", "type": "text"},
  {"key": "project_scope", "label": "Project Scope", "type": "textarea"},
  {"key": "start_date", "label": "Start Date", "type": "date"}
]
```

#### contract_instances
Instances of contracts sent to clients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| contract_id | UUID | FK -> contracts.id | Source contract |
| quote_id | UUID | FK -> quotes.id, NULL | Associated quote |
| client_id | UUID | FK -> clients.id | Associated client |
| workspace_id | UUID | FK -> workspaces.id | Associated workspace |
| content | TEXT | NOT NULL | Final contract content |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | Contract status |
| access_token | VARCHAR(100) | UNIQUE, NOT NULL | Client access token |
| sent_at | TIMESTAMP | NULL | When sent |
| viewed_at | TIMESTAMP | NULL | When viewed |
| signed_at | TIMESTAMP | NULL | When signed |
| signature_data | JSONB | NULL | Signature information |
| signer_ip_address | VARCHAR(45) | NULL | Signer's IP |
| signer_user_agent | TEXT | NULL | Signer's browser |
| pdf_url | TEXT | NULL | Signed PDF URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Status Values:**
- `draft` - Not yet sent
- `sent` - Sent to client
- `viewed` - Client viewed
- `signed` - Client signed
- `expired` - Past expiration (if applicable)

---

### 2.10 Email & Notifications

#### email_templates
Customizable email templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| type | VARCHAR(50) | NOT NULL | Template type |
| name | VARCHAR(100) | NOT NULL | Template name |
| subject | VARCHAR(255) | NOT NULL | Email subject (supports variables) |
| body | TEXT | NOT NULL | Email body (HTML, supports variables) |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |
| is_default | BOOLEAN | NOT NULL, DEFAULT FALSE | Is default for type |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Template Types:**
- `quote_sent` - When quote is sent
- `quote_accepted` - Quote acceptance confirmation
- `quote_reminder` - Quote expiration reminder
- `invoice_sent` - When invoice is sent
- `invoice_reminder` - Payment reminder
- `invoice_overdue` - Overdue notice
- `payment_received` - Payment confirmation
- `payment_receipt` - Payment receipt
- `contract_sent` - Contract sent
- `contract_signed` - Contract signed confirmation

**Template Variables:**
- `{{client_name}}` - Client's name
- `{{client_email}}` - Client's email
- `{{business_name}}` - Business name
- `{{document_number}}` - Quote/Invoice number
- `{{amount}}` - Total amount
- `{{due_date}}` - Due date
- `{{view_link}}` - Link to view document
- `{{pay_link}}` - Link to pay invoice

#### scheduled_emails
Queue for scheduled email delivery.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| template_id | UUID | FK -> email_templates.id, NULL | Template used |
| type | VARCHAR(50) | NOT NULL | Email type |
| entity_type | VARCHAR(20) | NOT NULL | quote/invoice/contract |
| entity_id | UUID | NOT NULL | Associated entity ID |
| recipient_email | VARCHAR(255) | NOT NULL | Recipient email |
| recipient_name | VARCHAR(255) | NULL | Recipient name |
| subject | VARCHAR(255) | NOT NULL | Final subject |
| body | TEXT | NOT NULL | Final body (rendered) |
| scheduled_for | TIMESTAMP | NOT NULL | When to send |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Status |
| sent_at | TIMESTAMP | NULL | When actually sent |
| error_message | TEXT | NULL | Error if failed |
| retry_count | INTEGER | NOT NULL, DEFAULT 0 | Retry attempts |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Status Values:**
- `pending` - Waiting to be sent
- `sent` - Successfully sent
- `failed` - Failed to send
- `cancelled` - Cancelled (e.g., paid before reminder)

---

### 2.11 Settings & Configuration

#### tax_rates
Tax rate configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| name | VARCHAR(100) | NOT NULL | Tax name (e.g., "Sales Tax") |
| rate | DECIMAL(5,2) | NOT NULL | Tax percentage |
| description | VARCHAR(255) | NULL | Description |
| is_inclusive | BOOLEAN | NOT NULL, DEFAULT FALSE | Tax-inclusive pricing |
| is_default | BOOLEAN | NOT NULL, DEFAULT FALSE | Default tax rate |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

#### payment_settings
Workspace payment configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| workspace_id | UUID | PK, FK -> workspaces.id | Associated workspace |
| stripe_account_id | VARCHAR(255) | NULL | Stripe Connect account ID |
| stripe_account_status | VARCHAR(20) | NULL | pending/active/restricted |
| stripe_onboarding_complete | BOOLEAN | NOT NULL, DEFAULT FALSE | Onboarding completed |
| enabled_payment_methods | JSONB | DEFAULT '["card"]' | Enabled methods |
| pass_processing_fees | BOOLEAN | NOT NULL, DEFAULT FALSE | Pass fees to client |
| default_payment_terms | INTEGER | NOT NULL, DEFAULT 30 | Default payment terms (days) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

#### branding_settings
Workspace branding configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| workspace_id | UUID | PK, FK -> workspaces.id | Associated workspace |
| primary_color | VARCHAR(7) | NULL | Primary brand color (hex) |
| secondary_color | VARCHAR(7) | NULL | Secondary color (hex) |
| accent_color | VARCHAR(7) | NULL | Accent color (hex) |
| logo_url | TEXT | NULL | Logo URL |
| favicon_url | TEXT | NULL | Favicon URL |
| custom_css | TEXT | NULL | Custom CSS for documents |
| font_family | VARCHAR(100) | NULL | Custom font family |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

#### number_sequences
Auto-incrementing number sequences for quotes/invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| type | VARCHAR(20) | NOT NULL | quote/invoice |
| prefix | VARCHAR(20) | NULL | Number prefix (e.g., "QT-") |
| suffix | VARCHAR(20) | NULL | Number suffix |
| current_value | INTEGER | NOT NULL, DEFAULT 0 | Current counter value |
| padding | INTEGER | NOT NULL, DEFAULT 4 | Zero-padding length |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Unique Constraint:** (workspace_id, type)

Example: With prefix "INV-", padding 4, current_value 42 -> "INV-0042"

---

### 2.12 File Attachments

#### attachments
File attachments for various entities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| workspace_id | UUID | FK -> workspaces.id, ON DELETE CASCADE | Associated workspace |
| entity_type | VARCHAR(20) | NOT NULL | quote/invoice/contract/client |
| entity_id | UUID | NOT NULL | Associated entity ID |
| filename | VARCHAR(255) | NOT NULL | Original filename |
| file_path | TEXT | NOT NULL | Storage path/key |
| file_size | INTEGER | NOT NULL | File size in bytes |
| mime_type | VARCHAR(100) | NOT NULL | MIME type |
| uploaded_by | UUID | FK -> users.id | Uploader user ID |
| is_public | BOOLEAN | NOT NULL, DEFAULT FALSE | Publicly accessible |
| uploaded_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload time |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

---

## 3. Indexes

### Performance Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Workspaces
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);

-- Workspace Members
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);

-- Clients
CREATE INDEX idx_clients_workspace_id ON clients(workspace_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_company ON clients(company);
CREATE INDEX idx_clients_workspace_deleted ON clients(workspace_id, deleted_at) WHERE deleted_at IS NULL;

-- Rate Cards
CREATE INDEX idx_rate_cards_workspace_id ON rate_cards(workspace_id);
CREATE INDEX idx_rate_cards_category_id ON rate_cards(category_id);
CREATE INDEX idx_rate_cards_active ON rate_cards(workspace_id, is_active) WHERE is_active = true;

-- Quotes
CREATE INDEX idx_quotes_workspace_id ON quotes(workspace_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_access_token ON quotes(access_token);
CREATE INDEX idx_quotes_workspace_status ON quotes(workspace_id, status);
CREATE INDEX idx_quotes_expiration ON quotes(expiration_date) WHERE status = 'sent';
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);

-- Quote Line Items
CREATE INDEX idx_quote_line_items_quote_id ON quote_line_items(quote_id);
CREATE INDEX idx_quote_line_items_sort ON quote_line_items(quote_id, sort_order);

-- Quote Events
CREATE INDEX idx_quote_events_quote_id ON quote_events(quote_id);
CREATE INDEX idx_quote_events_created_at ON quote_events(created_at DESC);

-- Invoices
CREATE INDEX idx_invoices_workspace_id ON invoices(workspace_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_quote_id ON invoices(quote_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_access_token ON invoices(access_token);
CREATE INDEX idx_invoices_workspace_status ON invoices(workspace_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status IN ('sent', 'viewed', 'partial');
CREATE INDEX idx_invoices_overdue ON invoices(due_date) WHERE status = 'overdue';
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Invoice Line Items
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_sort ON invoice_line_items(invoice_id, sort_order);

-- Invoice Events
CREATE INDEX idx_invoice_events_invoice_id ON invoice_events(invoice_id);
CREATE INDEX idx_invoice_events_created_at ON invoice_events(created_at DESC);

-- Payments
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Payment Schedules
CREATE INDEX idx_payment_schedules_invoice_id ON payment_schedules(invoice_id);
CREATE INDEX idx_payment_schedules_due ON payment_schedules(due_date, status) WHERE status = 'pending';

-- Contracts
CREATE INDEX idx_contracts_workspace_id ON contracts(workspace_id);
CREATE INDEX idx_contracts_template ON contracts(workspace_id, is_template) WHERE is_template = true;

-- Contract Instances
CREATE INDEX idx_contract_instances_contract_id ON contract_instances(contract_id);
CREATE INDEX idx_contract_instances_quote_id ON contract_instances(quote_id);
CREATE INDEX idx_contract_instances_client_id ON contract_instances(client_id);
CREATE INDEX idx_contract_instances_access_token ON contract_instances(access_token);

-- Email Templates
CREATE INDEX idx_email_templates_workspace_type ON email_templates(workspace_id, type);

-- Scheduled Emails
CREATE INDEX idx_scheduled_emails_scheduled ON scheduled_emails(scheduled_for, status) WHERE status = 'pending';
CREATE INDEX idx_scheduled_emails_entity ON scheduled_emails(entity_type, entity_id);

-- Attachments
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_workspace ON attachments(workspace_id);
```

### Full-Text Search Indexes (Optional)

```sql
-- Clients full-text search
CREATE INDEX idx_clients_fts ON clients USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(company, '') || ' ' || coalesce(email, ''))
);

-- Rate Cards full-text search
CREATE INDEX idx_rate_cards_fts ON rate_cards USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);
```

---

## 4. Prisma Schema

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String?   @map("password_hash")
  name            String?
  avatarUrl       String?   @map("avatar_url")
  emailVerifiedAt DateTime? @map("email_verified_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  // Relations
  accounts            Account[]
  sessions            Session[]
  passwordResetTokens PasswordResetToken[]
  workspaceMembers    WorkspaceMember[]
  ownedWorkspaces     Workspace[]          @relation("WorkspaceOwner")
  workspaceInvites    WorkspaceInvitation[] @relation("InvitedBy")
  quoteEvents         QuoteEvent[]
  invoiceEvents       InvoiceEvent[]
  attachments         Attachment[]

  @@index([email])
  @@index([deletedAt])
  @@map("users")
}

model Account {
  id                String  @id @default(uuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refreshToken      String? @map("refresh_token") @db.Text
  accessToken       String? @map("access_token") @db.Text
  expiresAt         Int?    @map("expires_at")
  tokenType         String? @map("token_type")
  scope             String?
  idToken           String? @map("id_token") @db.Text
  sessionState      String? @map("session_state")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  sessionToken String   @unique @map("session_token")
  expiresAt    DateTime @map("expires_at")
  ipAddress    String?  @map("ip_address") @db.VarChar(45)
  userAgent    String?  @map("user_agent") @db.Text
  createdAt    DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

model PasswordResetToken {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  token     String    @unique
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("password_reset_tokens")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expiresAt  DateTime @map("expires_at")

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================
// WORKSPACE & ORGANIZATION
// ============================================

model Workspace {
  id        String    @id @default(uuid())
  name      String
  slug      String    @unique
  ownerId   String    @map("owner_id")
  settings  Json      @default("{}")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  owner              User                  @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  members            WorkspaceMember[]
  invitations        WorkspaceInvitation[]
  businessProfile    BusinessProfile?
  clients            Client[]
  clientTags         ClientTag[]
  rateCardCategories RateCardCategory[]
  rateCards          RateCard[]
  quotes             Quote[]
  invoices           Invoice[]
  contracts          Contract[]
  contractInstances  ContractInstance[]
  emailTemplates     EmailTemplate[]
  scheduledEmails    ScheduledEmail[]
  taxRates           TaxRate[]
  paymentSettings    PaymentSettings?
  brandingSettings   BrandingSettings?
  numberSequences    NumberSequence[]
  attachments        Attachment[]

  @@index([slug])
  @@index([ownerId])
  @@map("workspaces")
}

model WorkspaceMember {
  id          String    @id @default(uuid())
  workspaceId String    @map("workspace_id")
  userId      String    @map("user_id")
  role        String    @default("member")
  invitedAt   DateTime? @map("invited_at")
  acceptedAt  DateTime? @map("accepted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@index([userId])
  @@index([workspaceId])
  @@map("workspace_members")
}

model WorkspaceInvitation {
  id          String    @id @default(uuid())
  workspaceId String    @map("workspace_id")
  email       String
  role        String    @default("member")
  token       String    @unique
  invitedById String    @map("invited_by_id")
  expiresAt   DateTime  @map("expires_at")
  acceptedAt  DateTime? @map("accepted_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  invitedBy User      @relation("InvitedBy", fields: [invitedById], references: [id])

  @@index([workspaceId])
  @@index([email])
  @@map("workspace_invitations")
}

model BusinessProfile {
  workspaceId  String   @id @map("workspace_id")
  businessName String   @map("business_name")
  logoUrl      String?  @map("logo_url")
  email        String?
  phone        String?  @db.VarChar(50)
  website      String?
  address      Json?
  taxId        String?  @map("tax_id") @db.VarChar(100)
  currency     String   @default("USD") @db.VarChar(3)
  timezone     String   @default("UTC") @db.VarChar(50)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@map("business_profiles")
}

// ============================================
// CLIENTS
// ============================================

model Client {
  id             String    @id @default(uuid())
  workspaceId    String    @map("workspace_id")
  name           String
  company        String?
  email          String
  phone          String?   @db.VarChar(50)
  address        Json?
  billingAddress Json?     @map("billing_address")
  taxId          String?   @map("tax_id") @db.VarChar(100)
  notes          String?   @db.Text
  metadata       Json      @default("{}")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  // Relations
  workspace         Workspace              @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  tags              ClientTagAssignment[]
  quotes            Quote[]
  invoices          Invoice[]
  contractInstances ContractInstance[]

  @@index([workspaceId])
  @@index([email])
  @@index([company])
  @@index([workspaceId, deletedAt])
  @@map("clients")
}

model ClientTag {
  id          String   @id @default(uuid())
  workspaceId String   @map("workspace_id")
  name        String   @db.VarChar(50)
  color       String?  @db.VarChar(7)
  createdAt   DateTime @default(now()) @map("created_at")

  workspace Workspace             @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  clients   ClientTagAssignment[]

  @@unique([workspaceId, name])
  @@map("client_tags")
}

model ClientTagAssignment {
  clientId String @map("client_id")
  tagId    String @map("tag_id")

  client Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  tag    ClientTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([clientId, tagId])
  @@map("client_tag_assignments")
}

// ============================================
// RATE CARDS
// ============================================

model RateCardCategory {
  id          String   @id @default(uuid())
  workspaceId String   @map("workspace_id")
  name        String   @db.VarChar(100)
  color       String?  @db.VarChar(7)
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  workspace Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  rateCards RateCard[]

  @@unique([workspaceId, name])
  @@map("rate_card_categories")
}

model RateCard {
  id          String    @id @default(uuid())
  workspaceId String    @map("workspace_id")
  categoryId  String?   @map("category_id")
  name        String
  description String?   @db.Text
  pricingType String    @default("fixed") @map("pricing_type") @db.VarChar(20)
  rate        Decimal   @db.Decimal(12, 2)
  unit        String?   @db.VarChar(50)
  taxRateId   String?   @map("tax_rate_id")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  workspace        Workspace         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  category         RateCardCategory? @relation(fields: [categoryId], references: [id])
  taxRate          TaxRate?          @relation(fields: [taxRateId], references: [id])
  quoteLineItems   QuoteLineItem[]
  invoiceLineItems InvoiceLineItem[]

  @@index([workspaceId])
  @@index([categoryId])
  @@index([workspaceId, isActive])
  @@map("rate_cards")
}

// ============================================
// QUOTES
// ============================================

model Quote {
  id                   String    @id @default(uuid())
  workspaceId          String    @map("workspace_id")
  clientId             String    @map("client_id")
  quoteNumber          String    @map("quote_number") @db.VarChar(50)
  status               String    @default("draft") @db.VarChar(20)
  title                String?
  issueDate            DateTime  @default(now()) @map("issue_date") @db.Date
  expirationDate       DateTime? @map("expiration_date") @db.Date
  subtotal             Decimal   @default(0) @db.Decimal(12, 2)
  discountType         String?   @map("discount_type") @db.VarChar(10)
  discountValue        Decimal?  @map("discount_value") @db.Decimal(12, 2)
  discountAmount       Decimal   @default(0) @map("discount_amount") @db.Decimal(12, 2)
  taxTotal             Decimal   @default(0) @map("tax_total") @db.Decimal(12, 2)
  total                Decimal   @default(0) @db.Decimal(12, 2)
  notes                String?   @db.Text
  terms                String?   @db.Text
  internalNotes        String?   @map("internal_notes") @db.Text
  settings             Json      @default("{}")
  accessToken          String    @unique @default(uuid()) @map("access_token") @db.VarChar(100)
  viewedAt             DateTime? @map("viewed_at")
  viewCount            Int       @default(0) @map("view_count")
  sentAt               DateTime? @map("sent_at")
  acceptedAt           DateTime? @map("accepted_at")
  declinedAt           DateTime? @map("declined_at")
  signedAt             DateTime? @map("signed_at")
  signatureData        Json?     @map("signature_data")
  convertedToInvoiceId String?   @map("converted_to_invoice_id")
  pdfUrl               String?   @map("pdf_url")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  deletedAt            DateTime? @map("deleted_at")

  // Relations
  workspace         Workspace          @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  client            Client             @relation(fields: [clientId], references: [id])
  lineItems         QuoteLineItem[]
  events            QuoteEvent[]
  invoice           Invoice?
  contractInstances ContractInstance[]

  @@unique([workspaceId, quoteNumber])
  @@index([workspaceId])
  @@index([clientId])
  @@index([status])
  @@index([accessToken])
  @@index([workspaceId, status])
  @@index([expirationDate])
  @@index([createdAt(sort: Desc)])
  @@map("quotes")
}

model QuoteLineItem {
  id          String   @id @default(uuid())
  quoteId     String   @map("quote_id")
  rateCardId  String?  @map("rate_card_id")
  name        String
  description String?  @db.Text
  quantity    Decimal  @default(1) @db.Decimal(10, 2)
  rate        Decimal  @db.Decimal(12, 2)
  amount      Decimal  @db.Decimal(12, 2)
  taxRate     Decimal? @map("tax_rate") @db.Decimal(5, 2)
  taxAmount   Decimal  @default(0) @map("tax_amount") @db.Decimal(12, 2)
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  quote    Quote     @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  rateCard RateCard? @relation(fields: [rateCardId], references: [id])

  @@index([quoteId])
  @@index([quoteId, sortOrder])
  @@map("quote_line_items")
}

model QuoteEvent {
  id        String   @id @default(uuid())
  quoteId   String   @map("quote_id")
  eventType String   @map("event_type") @db.VarChar(50)
  actorId   String?  @map("actor_id")
  actorType String   @default("user") @map("actor_type") @db.VarChar(20)
  metadata  Json     @default("{}")
  ipAddress String?  @map("ip_address") @db.VarChar(45)
  userAgent String?  @map("user_agent") @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  quote Quote @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  actor User? @relation(fields: [actorId], references: [id])

  @@index([quoteId])
  @@index([createdAt(sort: Desc)])
  @@map("quote_events")
}

// ============================================
// INVOICES
// ============================================

model Invoice {
  id             String    @id @default(uuid())
  workspaceId    String    @map("workspace_id")
  clientId       String    @map("client_id")
  quoteId        String?   @unique @map("quote_id")
  invoiceNumber  String    @map("invoice_number") @db.VarChar(50)
  status         String    @default("draft") @db.VarChar(20)
  title          String?
  issueDate      DateTime  @default(now()) @map("issue_date") @db.Date
  dueDate        DateTime  @map("due_date") @db.Date
  subtotal       Decimal   @default(0) @db.Decimal(12, 2)
  discountType   String?   @map("discount_type") @db.VarChar(10)
  discountValue  Decimal?  @map("discount_value") @db.Decimal(12, 2)
  discountAmount Decimal   @default(0) @map("discount_amount") @db.Decimal(12, 2)
  taxTotal       Decimal   @default(0) @map("tax_total") @db.Decimal(12, 2)
  total          Decimal   @default(0) @db.Decimal(12, 2)
  amountPaid     Decimal   @default(0) @map("amount_paid") @db.Decimal(12, 2)
  amountDue      Decimal   @default(0) @map("amount_due") @db.Decimal(12, 2)
  notes          String?   @db.Text
  terms          String?   @db.Text
  internalNotes  String?   @map("internal_notes") @db.Text
  settings       Json      @default("{}")
  accessToken    String    @unique @default(uuid()) @map("access_token") @db.VarChar(100)
  viewedAt       DateTime? @map("viewed_at")
  viewCount      Int       @default(0) @map("view_count")
  sentAt         DateTime? @map("sent_at")
  paidAt         DateTime? @map("paid_at")
  voidedAt       DateTime? @map("voided_at")
  pdfUrl         String?   @map("pdf_url")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  // Relations
  workspace        Workspace         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  client           Client            @relation(fields: [clientId], references: [id])
  quote            Quote?            @relation(fields: [quoteId], references: [id])
  lineItems        InvoiceLineItem[]
  events           InvoiceEvent[]
  payments         Payment[]
  paymentSchedules PaymentSchedule[]

  @@unique([workspaceId, invoiceNumber])
  @@index([workspaceId])
  @@index([clientId])
  @@index([quoteId])
  @@index([status])
  @@index([accessToken])
  @@index([workspaceId, status])
  @@index([dueDate])
  @@index([createdAt(sort: Desc)])
  @@map("invoices")
}

model InvoiceLineItem {
  id          String   @id @default(uuid())
  invoiceId   String   @map("invoice_id")
  rateCardId  String?  @map("rate_card_id")
  name        String
  description String?  @db.Text
  quantity    Decimal  @default(1) @db.Decimal(10, 2)
  rate        Decimal  @db.Decimal(12, 2)
  amount      Decimal  @db.Decimal(12, 2)
  taxRate     Decimal? @map("tax_rate") @db.Decimal(5, 2)
  taxAmount   Decimal  @default(0) @map("tax_amount") @db.Decimal(12, 2)
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  invoice  Invoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  rateCard RateCard? @relation(fields: [rateCardId], references: [id])

  @@index([invoiceId])
  @@index([invoiceId, sortOrder])
  @@map("invoice_line_items")
}

model InvoiceEvent {
  id        String   @id @default(uuid())
  invoiceId String   @map("invoice_id")
  eventType String   @map("event_type") @db.VarChar(50)
  actorId   String?  @map("actor_id")
  actorType String   @default("user") @map("actor_type") @db.VarChar(20)
  metadata  Json     @default("{}")
  ipAddress String?  @map("ip_address") @db.VarChar(45)
  userAgent String?  @map("user_agent") @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  actor   User?   @relation(fields: [actorId], references: [id])

  @@index([invoiceId])
  @@index([createdAt(sort: Desc)])
  @@map("invoice_events")
}

// ============================================
// PAYMENTS
// ============================================

model Payment {
  id                    String    @id @default(uuid())
  invoiceId             String    @map("invoice_id")
  amount                Decimal   @db.Decimal(12, 2)
  currency              String    @default("USD") @db.VarChar(3)
  paymentMethod         String    @map("payment_method") @db.VarChar(20)
  status                String    @default("pending") @db.VarChar(20)
  stripePaymentIntentId String?   @map("stripe_payment_intent_id")
  stripeChargeId        String?   @map("stripe_charge_id")
  stripeReceiptUrl      String?   @map("stripe_receipt_url")
  referenceNumber       String?   @map("reference_number") @db.VarChar(100)
  notes                 String?   @db.Text
  processedAt           DateTime? @map("processed_at")
  refundedAt            DateTime? @map("refunded_at")
  refundAmount          Decimal?  @map("refund_amount") @db.Decimal(12, 2)
  refundReason          String?   @map("refund_reason") @db.Text
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  invoice          Invoice           @relation(fields: [invoiceId], references: [id])
  paymentSchedules PaymentSchedule[]

  @@index([invoiceId])
  @@index([status])
  @@index([stripePaymentIntentId])
  @@index([createdAt(sort: Desc)])
  @@map("payments")
}

model PaymentSchedule {
  id          String    @id @default(uuid())
  invoiceId   String    @map("invoice_id")
  type        String    @db.VarChar(20)
  description String?
  amount      Decimal?  @db.Decimal(12, 2)
  percentage  Decimal?  @db.Decimal(5, 2)
  dueDate     DateTime  @map("due_date") @db.Date
  status      String    @default("pending") @db.VarChar(20)
  paymentId   String?   @map("payment_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  invoice Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  payment Payment? @relation(fields: [paymentId], references: [id])

  @@index([invoiceId])
  @@index([dueDate, status])
  @@map("payment_schedules")
}

// ============================================
// CONTRACTS
// ============================================

model Contract {
  id          String    @id @default(uuid())
  workspaceId String    @map("workspace_id")
  name        String
  content     String    @db.Text
  isTemplate  Boolean   @default(false) @map("is_template")
  variables   Json      @default("[]")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  workspace Workspace          @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  instances ContractInstance[]

  @@index([workspaceId])
  @@index([workspaceId, isTemplate])
  @@map("contracts")
}

model ContractInstance {
  id              String    @id @default(uuid())
  contractId      String    @map("contract_id")
  quoteId         String?   @map("quote_id")
  clientId        String    @map("client_id")
  workspaceId     String    @map("workspace_id")
  content         String    @db.Text
  status          String    @default("draft") @db.VarChar(20)
  accessToken     String    @unique @default(uuid()) @map("access_token") @db.VarChar(100)
  sentAt          DateTime? @map("sent_at")
  viewedAt        DateTime? @map("viewed_at")
  signedAt        DateTime? @map("signed_at")
  signatureData   Json?     @map("signature_data")
  signerIpAddress String?   @map("signer_ip_address") @db.VarChar(45)
  signerUserAgent String?   @map("signer_user_agent") @db.Text
  pdfUrl          String?   @map("pdf_url")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  contract  Contract  @relation(fields: [contractId], references: [id])
  quote     Quote?    @relation(fields: [quoteId], references: [id])
  client    Client    @relation(fields: [clientId], references: [id])
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([contractId])
  @@index([quoteId])
  @@index([clientId])
  @@index([accessToken])
  @@map("contract_instances")
}

// ============================================
// EMAIL & NOTIFICATIONS
// ============================================

model EmailTemplate {
  id          String   @id @default(uuid())
  workspaceId String   @map("workspace_id")
  type        String   @db.VarChar(50)
  name        String   @db.VarChar(100)
  subject     String
  body        String   @db.Text
  isActive    Boolean  @default(true) @map("is_active")
  isDefault   Boolean  @default(false) @map("is_default")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  workspace       Workspace        @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  scheduledEmails ScheduledEmail[]

  @@index([workspaceId, type])
  @@map("email_templates")
}

model ScheduledEmail {
  id             String    @id @default(uuid())
  workspaceId    String    @map("workspace_id")
  templateId     String?   @map("template_id")
  type           String    @db.VarChar(50)
  entityType     String    @map("entity_type") @db.VarChar(20)
  entityId       String    @map("entity_id")
  recipientEmail String    @map("recipient_email")
  recipientName  String?   @map("recipient_name")
  subject        String
  body           String    @db.Text
  scheduledFor   DateTime  @map("scheduled_for")
  status         String    @default("pending") @db.VarChar(20)
  sentAt         DateTime? @map("sent_at")
  errorMessage   String?   @map("error_message") @db.Text
  retryCount     Int       @default(0) @map("retry_count")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  workspace Workspace      @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  template  EmailTemplate? @relation(fields: [templateId], references: [id])

  @@index([scheduledFor, status])
  @@index([entityType, entityId])
  @@map("scheduled_emails")
}

// ============================================
// SETTINGS & CONFIGURATION
// ============================================

model TaxRate {
  id          String   @id @default(uuid())
  workspaceId String   @map("workspace_id")
  name        String   @db.VarChar(100)
  rate        Decimal  @db.Decimal(5, 2)
  description String?
  isInclusive Boolean  @default(false) @map("is_inclusive")
  isDefault   Boolean  @default(false) @map("is_default")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  workspace Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  rateCards RateCard[]

  @@index([workspaceId])
  @@map("tax_rates")
}

model PaymentSettings {
  workspaceId              String   @id @map("workspace_id")
  stripeAccountId          String?  @map("stripe_account_id")
  stripeAccountStatus      String?  @map("stripe_account_status") @db.VarChar(20)
  stripeOnboardingComplete Boolean  @default(false) @map("stripe_onboarding_complete")
  enabledPaymentMethods    Json     @default("[\"card\"]") @map("enabled_payment_methods")
  passProcessingFees       Boolean  @default(false) @map("pass_processing_fees")
  defaultPaymentTerms      Int      @default(30) @map("default_payment_terms")
  createdAt                DateTime @default(now()) @map("created_at")
  updatedAt                DateTime @updatedAt @map("updated_at")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@map("payment_settings")
}

model BrandingSettings {
  workspaceId    String   @id @map("workspace_id")
  primaryColor   String?  @map("primary_color") @db.VarChar(7)
  secondaryColor String?  @map("secondary_color") @db.VarChar(7)
  accentColor    String?  @map("accent_color") @db.VarChar(7)
  logoUrl        String?  @map("logo_url")
  faviconUrl     String?  @map("favicon_url")
  customCss      String?  @map("custom_css") @db.Text
  fontFamily     String?  @map("font_family") @db.VarChar(100)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@map("branding_settings")
}

model NumberSequence {
  id           String   @id @default(uuid())
  workspaceId  String   @map("workspace_id")
  type         String   @db.VarChar(20)
  prefix       String?  @db.VarChar(20)
  suffix       String?  @db.VarChar(20)
  currentValue Int      @default(0) @map("current_value")
  padding      Int      @default(4)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, type])
  @@map("number_sequences")
}

// ============================================
// FILE ATTACHMENTS
// ============================================

model Attachment {
  id          String    @id @default(uuid())
  workspaceId String    @map("workspace_id")
  entityType  String    @map("entity_type") @db.VarChar(20)
  entityId    String    @map("entity_id")
  filename    String
  filePath    String    @map("file_path")
  fileSize    Int       @map("file_size")
  mimeType    String    @map("mime_type") @db.VarChar(100)
  uploadedById String   @map("uploaded_by_id")
  isPublic    Boolean   @default(false) @map("is_public")
  uploadedAt  DateTime  @default(now()) @map("uploaded_at")
  deletedAt   DateTime? @map("deleted_at")

  workspace  Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  uploadedBy User      @relation(fields: [uploadedById], references: [id])

  @@index([entityType, entityId])
  @@index([workspaceId])
  @@map("attachments")
}
```

---

## 5. Migrations Strategy

### 5.1 Initial Migration

```bash
# Create initial migration
cd packages/database
npx prisma migrate dev --name init

# This creates:
# - packages/database/prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql
```

### 5.2 Migration Commands

```bash
# Development: Create and apply migration
npx prisma migrate dev --name <migration_name>

# Production: Apply pending migrations
npx prisma migrate deploy

# Reset database (DEVELOPMENT ONLY)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# View migration status
npx prisma migrate status

# Create migration without applying (for review)
npx prisma migrate dev --create-only --name <migration_name>
```

### 5.3 Seeding Development Data

```typescript
// packages/database/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const passwordHash = await hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@oreko.dev' },
    update: {},
    create: {
      email: 'demo@oreko.dev',
      passwordHash,
      name: 'Demo User',
      emailVerifiedAt: new Date(),
    },
  });

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      ownerId: user.id,
      settings: {
        modules: {
          quotes: true,
          invoices: true,
          contracts: true,
          rate_cards: true,
        },
        defaults: {
          currency: 'USD',
          timezone: 'America/New_York',
          payment_terms_days: 30,
        },
      },
    },
  });

  // Create workspace member
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner',
      acceptedAt: new Date(),
    },
  });

  // Create business profile
  await prisma.businessProfile.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      businessName: 'Demo Creative Studio',
      email: 'hello@democreative.com',
      phone: '+1 (555) 123-4567',
      address: {
        line1: '123 Creative Lane',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701',
        country: 'US',
      },
      currency: 'USD',
      timezone: 'America/Chicago',
    },
  });

  // Create rate card categories
  const designCategory = await prisma.rateCardCategory.create({
    data: {
      workspaceId: workspace.id,
      name: 'Design Services',
      color: '#3B82F6',
      sortOrder: 1,
    },
  });

  const devCategory = await prisma.rateCardCategory.create({
    data: {
      workspaceId: workspace.id,
      name: 'Development',
      color: '#10B981',
      sortOrder: 2,
    },
  });

  // Create rate cards
  await prisma.rateCard.createMany({
    data: [
      {
        workspaceId: workspace.id,
        categoryId: designCategory.id,
        name: 'Logo Design',
        description: 'Professional logo design with 3 concepts and 2 revision rounds',
        pricingType: 'fixed',
        rate: 1500.00,
        isActive: true,
      },
      {
        workspaceId: workspace.id,
        categoryId: designCategory.id,
        name: 'Brand Identity Package',
        description: 'Complete brand identity including logo, colors, typography, and guidelines',
        pricingType: 'fixed',
        rate: 5000.00,
        isActive: true,
      },
      {
        workspaceId: workspace.id,
        categoryId: designCategory.id,
        name: 'Graphic Design (Hourly)',
        description: 'General graphic design work',
        pricingType: 'hourly',
        rate: 125.00,
        unit: 'hour',
        isActive: true,
      },
      {
        workspaceId: workspace.id,
        categoryId: devCategory.id,
        name: 'Web Development',
        description: 'Custom web development',
        pricingType: 'hourly',
        rate: 150.00,
        unit: 'hour',
        isActive: true,
      },
      {
        workspaceId: workspace.id,
        categoryId: devCategory.id,
        name: 'Landing Page',
        description: 'Single responsive landing page',
        pricingType: 'fixed',
        rate: 2500.00,
        isActive: true,
      },
    ],
  });

  // Create demo clients
  const client1 = await prisma.client.create({
    data: {
      workspaceId: workspace.id,
      name: 'Sarah Johnson',
      company: 'Bloom Botanicals',
      email: 'sarah@bloombotanicals.com',
      phone: '+1 (555) 987-6543',
      address: {
        line1: '456 Garden Way',
        city: 'Portland',
        state: 'OR',
        postal_code: '97201',
        country: 'US',
      },
      notes: 'Prefers email communication. Interested in ongoing design work.',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      workspaceId: workspace.id,
      name: 'Michael Chen',
      company: 'TechStart Inc',
      email: 'michael@techstart.io',
      phone: '+1 (555) 234-5678',
      address: {
        line1: '789 Innovation Blvd',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94107',
        country: 'US',
      },
    },
  });

  // Create number sequences
  await prisma.numberSequence.createMany({
    data: [
      {
        workspaceId: workspace.id,
        type: 'quote',
        prefix: 'QT-',
        currentValue: 0,
        padding: 4,
      },
      {
        workspaceId: workspace.id,
        type: 'invoice',
        prefix: 'INV-',
        currentValue: 0,
        padding: 4,
      },
    ],
  });

  // Create default tax rate
  await prisma.taxRate.create({
    data: {
      workspaceId: workspace.id,
      name: 'Sales Tax',
      rate: 8.25,
      isDefault: true,
      isActive: true,
    },
  });

  // Create payment settings
  await prisma.paymentSettings.create({
    data: {
      workspaceId: workspace.id,
      enabledPaymentMethods: ['card', 'bank', 'manual'],
      defaultPaymentTerms: 30,
    },
  });

  // Create branding settings
  await prisma.brandingSettings.create({
    data: {
      workspaceId: workspace.id,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#F59E0B',
    },
  });

  // Create email templates
  await prisma.emailTemplate.createMany({
    data: [
      {
        workspaceId: workspace.id,
        type: 'quote_sent',
        name: 'Quote Sent',
        subject: 'Quote {{quote_number}} from {{business_name}}',
        body: `
          <p>Hi {{client_name}},</p>
          <p>Thank you for considering {{business_name}} for your project.</p>
          <p>Please find your quote attached. You can also view it online:</p>
          <p><a href="{{view_link}}">View Quote</a></p>
          <p>This quote is valid until {{expiration_date}}.</p>
          <p>Best regards,<br>{{business_name}}</p>
        `,
        isDefault: true,
      },
      {
        workspaceId: workspace.id,
        type: 'invoice_sent',
        name: 'Invoice Sent',
        subject: 'Invoice {{invoice_number}} from {{business_name}}',
        body: `
          <p>Hi {{client_name}},</p>
          <p>Please find your invoice for {{amount}} attached.</p>
          <p>Payment is due by {{due_date}}.</p>
          <p><a href="{{pay_link}}">Pay Now</a></p>
          <p>Thank you for your business!</p>
          <p>Best regards,<br>{{business_name}}</p>
        `,
        isDefault: true,
      },
      {
        workspaceId: workspace.id,
        type: 'payment_received',
        name: 'Payment Received',
        subject: 'Payment received for Invoice {{invoice_number}}',
        body: `
          <p>Hi {{client_name}},</p>
          <p>We've received your payment of {{amount}} for Invoice {{invoice_number}}.</p>
          <p>Thank you for your prompt payment!</p>
          <p>Best regards,<br>{{business_name}}</p>
        `,
        isDefault: true,
      },
      {
        workspaceId: workspace.id,
        type: 'invoice_reminder',
        name: 'Payment Reminder',
        subject: 'Reminder: Invoice {{invoice_number}} is due soon',
        body: `
          <p>Hi {{client_name}},</p>
          <p>This is a friendly reminder that Invoice {{invoice_number}} for {{amount}} is due on {{due_date}}.</p>
          <p><a href="{{pay_link}}">Pay Now</a></p>
          <p>If you've already sent payment, please disregard this message.</p>
          <p>Best regards,<br>{{business_name}}</p>
        `,
        isDefault: true,
      },
    ],
  });

  console.log('Seed data created successfully!');
  console.log('Demo user: demo@oreko.dev / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seeding:**
```bash
npx prisma db seed
```

**Add to package.json:**
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### 5.4 Production Migration Approach

1. **Pre-deployment checklist:**
   - Back up database before migration
   - Test migration on staging environment
   - Review migration SQL for destructive changes
   - Schedule maintenance window if needed

2. **Zero-downtime migrations:**
   - Add new columns as nullable first
   - Backfill data in separate step
   - Add constraints after data migration
   - Remove old columns in future migration

3. **Rollback strategy:**
   - Keep rollback SQL scripts for each migration
   - Test rollback procedure on staging
   - Document data dependencies

---

## 6. Soft Deletes

The following entities support soft deletes via the `deleted_at` column:

| Entity | Soft Delete | Reason |
|--------|-------------|--------|
| users | Yes | Account recovery, audit compliance |
| workspaces | Yes | Data recovery, billing compliance |
| clients | Yes | Historical data preservation |
| rate_cards | Yes | Historical pricing reference |
| quotes | Yes | Audit trail, recovery |
| invoices | Yes | Legal/tax compliance |
| contracts | Yes | Legal compliance |
| attachments | Yes | Recovery capability |

**Entities without soft delete:**
- sessions (auto-expire)
- verification_tokens (auto-expire)
- events tables (immutable audit log)
- settings tables (overwrite)
- line items (cascade delete with parent)

**Query pattern for soft deletes:**
```typescript
// Prisma middleware for automatic soft delete filtering
prisma.$use(async (params, next) => {
  if (params.model && softDeleteModels.includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        deletedAt: null,
      };
    }
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }
  }
  return next(params);
});
```

---

## 7. Audit Trail

### Event Tables

The system maintains audit trails via dedicated event tables:

- **quote_events** - All quote lifecycle events
- **invoice_events** - All invoice lifecycle events

### Event Recording Pattern

```typescript
// Record quote event
async function recordQuoteEvent(
  quoteId: string,
  eventType: string,
  actorId: string | null,
  actorType: 'user' | 'client' | 'system',
  metadata?: Record<string, unknown>,
  request?: Request
) {
  await prisma.quoteEvent.create({
    data: {
      quoteId,
      eventType,
      actorId,
      actorType,
      metadata: metadata || {},
      ipAddress: request?.headers.get('x-forwarded-for') || null,
      userAgent: request?.headers.get('user-agent') || null,
    },
  });
}

// Usage examples
await recordQuoteEvent(quote.id, 'created', userId, 'user');
await recordQuoteEvent(quote.id, 'sent', userId, 'user', { recipientEmail: client.email });
await recordQuoteEvent(quote.id, 'viewed', null, 'client', {}, request);
await recordQuoteEvent(quote.id, 'accepted', null, 'client', { signatureData }, request);
```

### Event Types Reference

**Quote Events:**
| Event Type | Actor Type | Metadata |
|------------|------------|----------|
| created | user | {} |
| updated | user | { changes: [...] } |
| sent | user | { recipientEmail, method } |
| viewed | client | {} |
| accepted | client | { signatureData } |
| declined | client | { reason } |
| signed | client | { signatureData } |
| expired | system | {} |
| converted | user | { invoiceId } |
| reminder_sent | system | { reminderType } |

**Invoice Events:**
| Event Type | Actor Type | Metadata |
|------------|------------|----------|
| created | user | { fromQuoteId? } |
| updated | user | { changes: [...] } |
| sent | user | { recipientEmail } |
| viewed | client | {} |
| payment_received | system | { paymentId, amount } |
| partial_payment | system | { paymentId, amount } |
| paid | system | { paymentId } |
| overdue | system | {} |
| reminder_sent | system | { reminderNumber } |
| voided | user | { reason } |
| refund_issued | user | { paymentId, amount, reason } |

---

## 8. Data Types & Conventions

### UUID Primary Keys

All primary keys use UUID v4 for:
- Security (non-sequential, unpredictable)
- Portability (generate client-side)
- Distributed systems compatibility

```typescript
// Generate UUID in application
import { randomUUID } from 'crypto';
const id = randomUUID();
```

### Monetary Values

All monetary values use `DECIMAL(12, 2)`:
- 12 total digits, 2 decimal places
- Supports values up to 9,999,999,999.99
- Prevents floating-point precision issues

```typescript
// Prisma type for monetary values
rate: Decimal @db.Decimal(12, 2)

// In application code, use Decimal.js or similar
import Decimal from 'decimal.js';
const total = new Decimal(subtotal).minus(discount).plus(tax);
```

### Timestamps

- All timestamps stored in UTC
- Use `TIMESTAMP WITH TIME ZONE` in PostgreSQL
- Display conversion happens in application layer

```typescript
// Prisma convention
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

### JSON/JSONB Fields

Used for:
- Flexible settings/preferences
- Address objects
- Metadata/custom fields
- Signature data

```typescript
// Always validate JSON structure in application
import { z } from 'zod';

const AddressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string().length(2),
});

// Validate before storing
const validatedAddress = AddressSchema.parse(addressInput);
```

### Naming Conventions

| Convention | Example | Notes |
|------------|---------|-------|
| Tables | `quote_line_items` | snake_case, plural |
| Columns | `created_at` | snake_case |
| Foreign Keys | `workspace_id` | Referenced table + `_id` |
| Indexes | `idx_quotes_workspace_status` | `idx_` prefix |
| Unique Constraints | Inline in column | Via Prisma `@unique` |

### Status Enums

Defined as string columns with application-level validation:

```typescript
// Quote statuses
const QUOTE_STATUSES = ['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'converted'] as const;
type QuoteStatus = typeof QUOTE_STATUSES[number];

// Invoice statuses
const INVOICE_STATUSES = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void'] as const;
type InvoiceStatus = typeof INVOICE_STATUSES[number];
```

---

## Appendix: Quick Reference

### Table Count Summary

| Category | Tables |
|----------|--------|
| Auth & Users | 5 |
| Workspace | 4 |
| Clients | 3 |
| Rate Cards | 2 |
| Quotes | 3 |
| Invoices | 3 |
| Payments | 2 |
| Contracts | 2 |
| Email | 2 |
| Settings | 5 |
| Attachments | 1 |
| **Total** | **32** |

### Foreign Key Relationships

```
users (1) ----< (N) workspace_members >---- (1) workspaces
users (1) ----< (N) sessions
users (1) ----< (N) accounts
workspaces (1) ----< (N) clients
workspaces (1) ----< (N) quotes
workspaces (1) ----< (N) invoices
workspaces (1) ---- (1) business_profiles
workspaces (1) ---- (1) payment_settings
workspaces (1) ---- (1) branding_settings
clients (1) ----< (N) quotes
clients (1) ----< (N) invoices
quotes (1) ----< (N) quote_line_items
quotes (1) ----< (N) quote_events
quotes (1) ---- (0..1) invoices
invoices (1) ----< (N) invoice_line_items
invoices (1) ----< (N) invoice_events
invoices (1) ----< (N) payments
invoices (1) ----< (N) payment_schedules
```

---

**End of Database Schema Specification**
