# Technical Specification: Visual Quote & Invoice Management Software

**Version:** 1.0
**Last Updated:** January 2026
**Status:** Ready for Development
**Document Type:** Technical Architecture Specification

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Database Design](#4-database-design)
5. [Docker Configuration](#5-docker-configuration)
6. [Security](#6-security)
7. [Integrations](#7-integrations)
8. [Performance](#8-performance)
9. [Monitoring & Logging](#9-monitoring--logging)
10. [Development Setup](#10-development-setup)
11. [Deployment Guide](#11-deployment-guide)

---

## 1. System Overview

### 1.1 Product Summary

A self-hosted, open-source visual quote and invoice management application designed for freelancers, small business owners, and agencies. The system provides a modern, visually appealing alternative to Bloom and Bonsai with full data ownership through Docker-based deployment.

### 1.2 Architecture Diagram

```
                                    EXTERNAL SERVICES
                            +---------------------------+
                            |  Stripe API  |  SMTP      |
                            |  (Payments)  |  (Email)   |
                            +------+-------+-----+------+
                                   |             |
                                   v             v
+------------------------------------------------------------------+
|                        REVERSE PROXY (Traefik)                    |
|                    SSL Termination | Load Balancing               |
|                         Port 80/443 (Public)                      |
+----------------------------------+-------------------------------+
                                   |
                                   v
+------------------------------------------------------------------+
|                     NEXT.JS APPLICATION                           |
|  +------------------------------------------------------------+  |
|  |                    APP ROUTER (Frontend)                    |  |
|  |  +------------------+  +------------------+  +------------+ |  |
|  |  | Marketing Pages  |  | Dashboard/App    |  | Client     | |  |
|  |  | (SSG)            |  | (SSR + Client)   |  | Portal     | |  |
|  |  +------------------+  +------------------+  +------------+ |  |
|  +------------------------------------------------------------+  |
|  |                    API ROUTES (Backend)                     |  |
|  |  +----------+  +----------+  +----------+  +-------------+ |  |
|  |  | Auth API |  | Quotes   |  | Invoices |  | Payments    | |  |
|  |  |          |  | API      |  | API      |  | API         | |  |
|  |  +----------+  +----------+  +----------+  +-------------+ |  |
|  +------------------------------------------------------------+  |
|                         Port 3000 (Internal)                      |
+----------------------------------+-------------------------------+
                                   |
                    +--------------+--------------+
                    |              |              |
                    v              v              v
+---------------+  +---------------+  +---------------------------+
|   PostgreSQL  |  |     Redis     |  |      File Storage         |
|   Database    |  |  Cache/Queue  |  |  (Local / S3-Compatible)  |
|   Port 5432   |  |   Port 6379   |  |                           |
+---------------+  +---------------+  +---------------------------+
```

### 1.3 Component Overview

| Component | Purpose | Technology |
|-----------|---------|------------|
| **Web Application** | UI + API in unified deployment | Next.js 14+ (App Router) |
| **Database** | Persistent data storage | PostgreSQL 15+ |
| **Cache/Queue** | Session cache, background jobs | Redis 7+ |
| **Reverse Proxy** | SSL, routing, load balancing | Traefik v3 |
| **File Storage** | Documents, images, PDFs | Local FS / S3-compatible |
| **Background Worker** | Reminders, scheduled tasks | BullMQ |

### 1.4 Data Flow

```
User Request Flow:
==================

1. QUOTE CREATION:
   User -> Traefik -> Next.js (React UI) -> API Route -> Prisma -> PostgreSQL
                                                      -> Redis (cache)
                                                      -> File Storage (assets)

2. QUOTE ACCEPTANCE (Client):
   Client -> Traefik -> Client Portal -> API Route -> Prisma -> PostgreSQL
                                                   -> Stripe (deposit payment)
                                                   -> Email Service (confirmation)

3. INVOICE GENERATION:
   User clicks "Convert" -> API Route -> Prisma (create invoice from quote)
                                      -> PDF Generation (Puppeteer)
                                      -> File Storage (save PDF)
                                      -> Email Service (send to client)

4. PAYMENT PROCESSING:
   Client pays -> Stripe Checkout -> Webhook -> API Route -> Prisma (update status)
                                                          -> Email (receipt)
                                                          -> BullMQ (cancel reminders)

5. AUTOMATED REMINDERS:
   BullMQ Scheduler -> Check overdue invoices -> Prisma (query)
                                              -> Email Service (send reminder)
                                              -> Prisma (log reminder)
```

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Next.js** | 14.x+ | Framework | App Router for modern React patterns, SSR/SSG flexibility, API routes for backend |
| **React** | 18.x | UI Library | Industry standard, large ecosystem, excellent DX |
| **TypeScript** | 5.x | Language | Type safety, better IDE support, reduced runtime errors |
| **Shadcn UI** | Latest | Component Library | High-quality, accessible, fully customizable components |
| **Tailwind CSS** | 3.4+ | Styling | Utility-first, consistent design system, small bundle |
| **Zustand** | 4.x | State Management | Lightweight, simple API, TypeScript-first |
| **React Hook Form** | 7.x | Form Handling | Performance, validation integration, minimal re-renders |
| **Zod** | 3.x | Validation | TypeScript-first schema validation, shared with backend |
| **Tiptap** | 2.x | Rich Text Editor | Extensible, headless, ProseMirror-based |
| **dnd-kit** | 6.x | Drag & Drop | Accessible, performant, modern API |
| **React-PDF** | 7.x | PDF Generation | Client-side PDF preview and generation |
| **date-fns** | 3.x | Date Utilities | Tree-shakeable, immutable, TypeScript support |

### 2.2 Backend

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Node.js** | 20 LTS | Runtime | Latest LTS, ESM support, performance improvements |
| **Next.js API Routes** | 14.x | API Layer | Unified deployment, shared types, simpler architecture |
| **Prisma** | 5.x | ORM | Type-safe queries, migrations, excellent DX |
| **PostgreSQL** | 15+ | Database | Relational data, JSONB for flexibility, proven reliability |
| **Redis** | 7+ | Cache/Queue | Session storage, job queue backing store |
| **BullMQ** | 4.x | Job Queue | Reliable job processing, scheduling, retries |
| **NextAuth.js** | 4.x/5.x | Authentication | Self-hosted auth, multiple providers, session management |
| **Nodemailer** | 6.x | Email | SMTP flexibility, self-hosted compatible |
| **Puppeteer** | 21.x | PDF Generation | High-quality server-side PDF rendering |
| **Sharp** | 0.33.x | Image Processing | Fast image optimization, WebP conversion |

### 2.3 Infrastructure

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Docker** | 24+ | Containerization | Consistent environments, easy deployment |
| **Docker Compose** | 2.x | Orchestration | Single-node deployment, simple configuration |
| **Traefik** | 3.x | Reverse Proxy | Auto SSL (Let's Encrypt), Docker integration |
| **MinIO** | Latest | S3 Storage | Self-hosted S3-compatible, optional |

### 2.4 Development & DevOps

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **pnpm** | 8.x | Package Manager | Fast, disk efficient, workspace support |
| **Turborepo** | Latest | Monorepo Build | Caching, parallel execution, incremental builds |
| **Vitest** | 1.x | Unit Testing | Fast, ESM native, Jest compatible |
| **Playwright** | 1.x | E2E Testing | Cross-browser, reliable, great DX |
| **ESLint** | 8.x | Linting | Code quality, consistency |
| **Prettier** | 3.x | Formatting | Consistent code style |
| **Husky** | 9.x | Git Hooks | Pre-commit checks, quality gates |
| **GitHub Actions** | - | CI/CD | Automated testing, deployment |

---

## 3. Architecture

### 3.1 Monorepo Structure

```
oreko/
├── apps/
│   └── web/                          # Next.js application
│       ├── app/                      # App Router pages
│       │   ├── (auth)/               # Auth pages (login, register)
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   ├── register/
│       │   │   │   └── page.tsx
│       │   │   └── layout.tsx
│       │   ├── (dashboard)/          # Authenticated app pages
│       │   │   ├── dashboard/
│       │   │   │   └── page.tsx
│       │   │   ├── quotes/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── new/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── [id]/
│       │   │   │       ├── page.tsx
│       │   │   │       └── edit/
│       │   │   │           └── page.tsx
│       │   │   ├── invoices/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── new/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx
│       │   │   ├── clients/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx
│       │   │   ├── rate-cards/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx
│       │   │   ├── settings/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── profile/
│       │   │   │   ├── company/
│       │   │   │   ├── payments/
│       │   │   │   ├── templates/
│       │   │   │   └── modules/
│       │   │   └── layout.tsx
│       │   ├── (marketing)/          # Public marketing pages
│       │   │   ├── page.tsx          # Home
│       │   │   ├── pricing/
│       │   │   └── layout.tsx
│       │   ├── (portal)/             # Client portal (public)
│       │   │   ├── q/[token]/        # Quote view
│       │   │   │   └── page.tsx
│       │   │   ├── i/[token]/        # Invoice view
│       │   │   │   └── page.tsx
│       │   │   ├── pay/[token]/      # Payment page
│       │   │   │   └── page.tsx
│       │   │   └── layout.tsx
│       │   ├── api/                   # API Routes
│       │   │   ├── auth/
│       │   │   │   └── [...nextauth]/
│       │   │   │       └── route.ts
│       │   │   ├── quotes/
│       │   │   │   ├── route.ts
│       │   │   │   └── [id]/
│       │   │   │       ├── route.ts
│       │   │   │       ├── send/
│       │   │   │       │   └── route.ts
│       │   │   │       ├── accept/
│       │   │   │       │   └── route.ts
│       │   │   │       └── convert/
│       │   │   │           └── route.ts
│       │   │   ├── invoices/
│       │   │   │   ├── route.ts
│       │   │   │   └── [id]/
│       │   │   │       ├── route.ts
│       │   │   │       └── send/
│       │   │   │           └── route.ts
│       │   │   ├── clients/
│       │   │   │   └── route.ts
│       │   │   ├── rate-cards/
│       │   │   │   └── route.ts
│       │   │   ├── payments/
│       │   │   │   ├── route.ts
│       │   │   │   └── webhook/
│       │   │   │       └── route.ts
│       │   │   ├── upload/
│       │   │   │   └── route.ts
│       │   │   └── health/
│       │   │       └── route.ts
│       │   ├── layout.tsx
│       │   ├── loading.tsx
│       │   ├── error.tsx
│       │   ├── not-found.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── ui/                   # Shadcn UI components
│       │   ├── forms/                # Form components
│       │   ├── layout/               # Layout components
│       │   ├── quotes/               # Quote-specific components
│       │   ├── invoices/             # Invoice-specific components
│       │   └── shared/               # Shared components
│       ├── lib/
│       │   ├── auth.ts               # NextAuth configuration
│       │   ├── prisma.ts             # Prisma client
│       │   ├── redis.ts              # Redis client
│       │   ├── stripe.ts             # Stripe configuration
│       │   ├── email.ts              # Email service
│       │   ├── pdf.ts                # PDF generation
│       │   ├── storage.ts            # File storage abstraction
│       │   └── utils.ts              # Utility functions
│       ├── hooks/                    # Custom React hooks
│       ├── stores/                   # Zustand stores
│       ├── types/                    # TypeScript types
│       ├── middleware.ts             # Next.js middleware
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── database/                     # Prisma schema & migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   └── index.ts              # Re-export Prisma client
│   │   └── package.json
│   │
│   ├── ui/                           # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── styles/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── email-templates/              # Email templates
│   │   ├── src/
│   │   │   ├── quote-sent.tsx
│   │   │   ├── invoice-sent.tsx
│   │   │   ├── payment-received.tsx
│   │   │   ├── payment-reminder.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── pdf-templates/                # PDF templates
│   │   ├── src/
│   │   │   ├── quote.tsx
│   │   │   ├── invoice.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── shared/                       # Shared utilities & types
│       ├── src/
│       │   ├── types/
│       │   ├── validators/
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf                    # Optional Nginx config
│
├── scripts/
│   ├── setup.sh                      # Initial setup script
│   ├── backup.sh                     # Database backup
│   └── restore.sh                    # Database restore
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       └── docker-publish.yml
│
├── docker-compose.yml                # Production compose
├── docker-compose.dev.yml            # Development compose
├── docker-compose.override.yml       # Local overrides
├── .env.example
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### 3.2 API Design

#### 3.2.1 RESTful Endpoints

```
Authentication:
POST   /api/auth/register           # Create account
POST   /api/auth/login              # Sign in
POST   /api/auth/logout             # Sign out
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password
GET    /api/auth/session            # Get current session

Quotes:
GET    /api/quotes                  # List quotes (paginated, filtered)
POST   /api/quotes                  # Create quote
GET    /api/quotes/:id              # Get quote details
PUT    /api/quotes/:id              # Update quote
DELETE /api/quotes/:id              # Delete quote (soft delete)
POST   /api/quotes/:id/send         # Send quote to client
POST   /api/quotes/:id/accept       # Accept quote (client action)
POST   /api/quotes/:id/decline      # Decline quote (client action)
POST   /api/quotes/:id/convert      # Convert to invoice
POST   /api/quotes/:id/duplicate    # Duplicate quote
GET    /api/quotes/:id/pdf          # Download PDF

Invoices:
GET    /api/invoices                # List invoices
POST   /api/invoices                # Create invoice
GET    /api/invoices/:id            # Get invoice details
PUT    /api/invoices/:id            # Update invoice
DELETE /api/invoices/:id            # Delete invoice (soft delete)
POST   /api/invoices/:id/send       # Send invoice to client
POST   /api/invoices/:id/remind     # Send payment reminder
GET    /api/invoices/:id/pdf        # Download PDF

Clients:
GET    /api/clients                 # List clients
POST   /api/clients                 # Create client
GET    /api/clients/:id             # Get client details
PUT    /api/clients/:id             # Update client
DELETE /api/clients/:id             # Delete client (soft delete)
GET    /api/clients/:id/quotes      # Client's quotes
GET    /api/clients/:id/invoices    # Client's invoices

Rate Cards:
GET    /api/rate-cards              # List rate card items
POST   /api/rate-cards              # Create rate card item
GET    /api/rate-cards/:id          # Get rate card item
PUT    /api/rate-cards/:id          # Update rate card item
DELETE /api/rate-cards/:id          # Delete rate card item
POST   /api/rate-cards/import       # Bulk import
GET    /api/rate-cards/export       # Export to CSV/JSON

Templates:
GET    /api/templates               # List templates
POST   /api/templates               # Create template
GET    /api/templates/:id           # Get template
PUT    /api/templates/:id           # Update template
DELETE /api/templates/:id           # Delete template

Payments:
POST   /api/payments/create-session # Create Stripe checkout session
POST   /api/payments/webhook        # Stripe webhook handler
GET    /api/payments/:id            # Get payment details
POST   /api/payments/:id/refund     # Issue refund

Settings:
GET    /api/settings                # Get user settings
PUT    /api/settings                # Update settings
GET    /api/settings/company        # Get company info
PUT    /api/settings/company        # Update company info
POST   /api/settings/logo           # Upload company logo

Uploads:
POST   /api/upload                  # Upload file
DELETE /api/upload/:id              # Delete file

Public Portal:
GET    /api/portal/quote/:token     # Get quote for client view
GET    /api/portal/invoice/:token   # Get invoice for client view
POST   /api/portal/sign/:token      # Sign quote/contract
POST   /api/portal/pay/:token       # Initialize payment

Health:
GET    /api/health                  # Health check
GET    /api/health/ready            # Readiness check
```

#### 3.2.2 API Response Format

```typescript
// Success Response
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

// Error Response
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

### 3.3 Authentication Flow

```
Registration Flow:
==================
1. User submits email + password
2. Server validates input
3. Server hashes password (bcrypt, 12 rounds)
4. Server creates user record
5. Server creates default workspace
6. Server sends verification email (optional)
7. Server returns session token
8. Client redirects to onboarding

Login Flow:
===========
1. User submits email + password
2. Server validates credentials
3. Server creates session (JWT or database session)
4. Server sets secure httpOnly cookie
5. Client redirects to dashboard

Session Management:
==================
- Sessions stored in Redis (fast lookup)
- JWT for stateless API access (optional)
- Session expiry: 7 days (configurable)
- Refresh token rotation supported
- CSRF protection via double-submit cookie

OAuth Flow (Optional):
=====================
1. User clicks "Sign in with Google"
2. Redirect to OAuth provider
3. Provider redirects back with code
4. Server exchanges code for tokens
5. Server creates/links user account
6. Server creates session
```

### 3.4 File Storage Strategy

```typescript
// Storage abstraction - supports local and S3
interface StorageProvider {
  upload(file: Buffer, key: string, contentType: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
}

// Local storage implementation (default)
class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor(basePath: string = '/data/uploads') {
    this.basePath = basePath;
  }

  async upload(file: Buffer, key: string): Promise<string> {
    const filePath = path.join(this.basePath, key);
    await fs.writeFile(filePath, file);
    return `/uploads/${key}`;
  }
  // ...
}

// S3 storage implementation (optional)
class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor(config: S3Config) {
    this.client = new S3Client(config);
    this.bucket = config.bucket;
  }

  async upload(file: Buffer, key: string, contentType: string): Promise<string> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    }));
    return `s3://${this.bucket}/${key}`;
  }
  // ...
}

// File organization
/data/
├── uploads/
│   ├── logos/
│   │   └── {userId}/{filename}
│   ├── documents/
│   │   └── {workspaceId}/{year}/{month}/{filename}
│   └── signatures/
│       └── {documentId}/{filename}
└── generated/
    └── pdfs/
        └── {workspaceId}/{year}/{month}/{filename}
```

---

## 4. Database Design

### 4.1 Entity Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │───────│  Workspace  │───────│   Client    │
└─────────────┘  1:N  └─────────────┘  1:N  └─────────────┘
                            │                     │
                            │ 1:N                 │ 1:N
                            │                     │
                      ┌─────┴─────┐         ┌─────┴─────┐
                      │           │         │           │
                ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
                │  Quote  │ │ Invoice │ │RateCard │ │Template │
                └─────────┘ └─────────┘ └─────────┘ └─────────┘
                     │           │
                     │ 1:N       │ 1:N
                     │           │
                ┌─────────┐ ┌─────────┐
                │LineItem │ │ Payment │
                └─────────┘ └─────────┘
```

### 4.2 Prisma Schema

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  avatarUrl     String?
  emailVerified DateTime?

  // OAuth
  accounts      Account[]
  sessions      Session[]

  // Relationships
  workspaces    WorkspaceMember[]

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  @@index([email])
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================
// WORKSPACE & ORGANIZATION
// ============================================

model Workspace {
  id             String   @id @default(cuid())
  name           String
  slug           String   @unique

  // Company Info
  companyName    String?
  companyEmail   String?
  companyPhone   String?
  companyWebsite String?
  companyAddress Json?    // { street, city, state, zip, country }
  logoUrl        String?

  // Branding
  brandColors    Json?    // { primary, secondary, accent }

  // Settings
  currency       String   @default("USD")
  timezone       String   @default("America/New_York")
  dateFormat     String   @default("MM/DD/YYYY")

  // Modules enabled
  quotesEnabled    Boolean @default(true)
  invoicesEnabled  Boolean @default(true)
  contractsEnabled Boolean @default(false)

  // Stripe Connect
  stripeAccountId   String?
  stripeOnboarded   Boolean @default(false)

  // Defaults
  defaultTaxRate       Decimal? @db.Decimal(5, 2)
  defaultPaymentTerms  Int      @default(30) // days
  quoteExpiryDays      Int      @default(30)

  // Relationships
  members        WorkspaceMember[]
  clients        Client[]
  quotes         Quote[]
  invoices       Invoice[]
  rateCards      RateCard[]
  templates      Template[]

  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?

  @@index([slug])
  @@map("workspaces")
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String
  role        WorkspaceRole @default(MEMBER)

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([workspaceId, userId])
  @@map("workspace_members")
}

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// ============================================
// CLIENTS
// ============================================

model Client {
  id            String   @id @default(cuid())
  workspaceId   String

  // Contact Info
  name          String
  email         String
  phone         String?
  company       String?

  // Address
  address       Json?    // { street, city, state, zip, country }

  // Billing
  taxId         String?

  // Notes
  notes         String?  @db.Text

  // Relationships
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  quotes        Quote[]
  invoices      Invoice[]

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  @@index([workspaceId])
  @@index([email])
  @@map("clients")
}

// ============================================
// RATE CARDS
// ============================================

model RateCard {
  id            String   @id @default(cuid())
  workspaceId   String

  // Item Details
  name          String
  description   String?  @db.Text
  category      String?

  // Pricing
  unitType      UnitType @default(FIXED)
  unitPrice     Decimal  @db.Decimal(10, 2)

  // Tax
  taxable       Boolean  @default(true)

  // Status
  active        Boolean  @default(true)

  // Relationships
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  lineItems     LineItem[]

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  @@index([workspaceId])
  @@index([category])
  @@map("rate_cards")
}

enum UnitType {
  FIXED      // One-time fixed price
  HOURLY     // Per hour
  DAILY      // Per day
  WEEKLY     // Per week
  MONTHLY    // Per month
  QUANTITY   // Per unit/quantity
}

// ============================================
// QUOTES
// ============================================

model Quote {
  id              String   @id @default(cuid())
  workspaceId     String
  clientId        String

  // Quote Number
  number          String

  // Status
  status          QuoteStatus @default(DRAFT)

  // Dates
  issueDate       DateTime @default(now())
  expiryDate      DateTime?
  acceptedAt      DateTime?
  declinedAt      DateTime?

  // Content
  title           String?
  introduction    String?  @db.Text
  terms           String?  @db.Text
  notes           String?  @db.Text

  // Amounts
  subtotal        Decimal  @db.Decimal(10, 2) @default(0)
  taxRate         Decimal? @db.Decimal(5, 2)
  taxAmount       Decimal  @db.Decimal(10, 2) @default(0)
  discountType    DiscountType?
  discountValue   Decimal? @db.Decimal(10, 2)
  discountAmount  Decimal  @db.Decimal(10, 2) @default(0)
  total           Decimal  @db.Decimal(10, 2) @default(0)

  // Deposit
  depositRequired Boolean  @default(false)
  depositType     DepositType?
  depositValue    Decimal? @db.Decimal(10, 2)
  depositAmount   Decimal  @db.Decimal(10, 2) @default(0)
  depositPaid     Boolean  @default(false)
  depositPaidAt   DateTime?

  // Signature
  signatureData   Json?    // { imageUrl, ipAddress, userAgent, timestamp }
  signedAt        DateTime?

  // Access
  accessToken     String   @unique @default(cuid())
  viewedAt        DateTime?
  viewCount       Int      @default(0)

  // PDF
  pdfUrl          String?

  // Template
  templateId      String?

  // Relationships
  workspace       Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  client          Client    @relation(fields: [clientId], references: [id])
  template        Template? @relation(fields: [templateId], references: [id])
  lineItems       LineItem[]
  invoice         Invoice?  @relation("QuoteToInvoice")
  payments        Payment[]
  activities      Activity[]
  reminders       Reminder[]

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  @@index([workspaceId])
  @@index([clientId])
  @@index([status])
  @@index([accessToken])
  @@map("quotes")
}

enum QuoteStatus {
  DRAFT
  SENT
  VIEWED
  ACCEPTED
  DECLINED
  EXPIRED
  CONVERTED
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

enum DepositType {
  PERCENTAGE
  FIXED
}

// ============================================
// INVOICES
// ============================================

model Invoice {
  id              String   @id @default(cuid())
  workspaceId     String
  clientId        String
  quoteId         String?  @unique

  // Invoice Number
  number          String

  // Status
  status          InvoiceStatus @default(DRAFT)

  // Dates
  issueDate       DateTime @default(now())
  dueDate         DateTime
  paidAt          DateTime?

  // Content
  title           String?
  notes           String?  @db.Text
  terms           String?  @db.Text

  // Amounts
  subtotal        Decimal  @db.Decimal(10, 2) @default(0)
  taxRate         Decimal? @db.Decimal(5, 2)
  taxAmount       Decimal  @db.Decimal(10, 2) @default(0)
  discountType    DiscountType?
  discountValue   Decimal? @db.Decimal(10, 2)
  discountAmount  Decimal  @db.Decimal(10, 2) @default(0)
  total           Decimal  @db.Decimal(10, 2) @default(0)
  amountPaid      Decimal  @db.Decimal(10, 2) @default(0)
  amountDue       Decimal  @db.Decimal(10, 2) @default(0)

  // Access
  accessToken     String   @unique @default(cuid())
  viewedAt        DateTime?
  viewCount       Int      @default(0)

  // PDF
  pdfUrl          String?

  // Reminders
  remindersEnabled Boolean @default(true)

  // Relationships
  workspace       Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  client          Client    @relation(fields: [clientId], references: [id])
  quote           Quote?    @relation("QuoteToInvoice", fields: [quoteId], references: [id])
  lineItems       LineItem[]
  payments        Payment[]
  activities      Activity[]
  reminders       Reminder[]

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  @@index([workspaceId])
  @@index([clientId])
  @@index([status])
  @@index([accessToken])
  @@map("invoices")
}

enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED
  PARTIAL
  PAID
  OVERDUE
  CANCELLED
}

// ============================================
// LINE ITEMS
// ============================================

model LineItem {
  id            String   @id @default(cuid())
  quoteId       String?
  invoiceId     String?
  rateCardId    String?

  // Item Details
  name          String
  description   String?  @db.Text

  // Pricing
  unitType      UnitType @default(FIXED)
  unitPrice     Decimal  @db.Decimal(10, 2)
  quantity      Decimal  @db.Decimal(10, 2) @default(1)
  amount        Decimal  @db.Decimal(10, 2)

  // Tax
  taxable       Boolean  @default(true)

  // Order
  sortOrder     Int      @default(0)

  // Relationships
  quote         Quote?   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  invoice       Invoice? @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  rateCard      RateCard? @relation(fields: [rateCardId], references: [id])

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([quoteId])
  @@index([invoiceId])
  @@map("line_items")
}

// ============================================
// PAYMENTS
// ============================================

model Payment {
  id              String   @id @default(cuid())
  quoteId         String?
  invoiceId       String?

  // Payment Details
  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("USD")

  // Type
  type            PaymentType @default(PAYMENT)
  method          PaymentMethod?

  // Status
  status          PaymentStatus @default(PENDING)

  // Stripe
  stripePaymentIntentId String?
  stripeChargeId        String?
  stripeRefundId        String?

  // Refund
  refundedAmount  Decimal? @db.Decimal(10, 2)
  refundedAt      DateTime?
  refundReason    String?

  // Notes
  notes           String?

  // Relationships
  quote           Quote?   @relation(fields: [quoteId], references: [id])
  invoice         Invoice? @relation(fields: [invoiceId], references: [id])

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([quoteId])
  @@index([invoiceId])
  @@index([stripePaymentIntentId])
  @@map("payments")
}

enum PaymentType {
  DEPOSIT
  PAYMENT
  REFUND
}

enum PaymentMethod {
  CARD
  ACH
  MANUAL
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

// ============================================
// TEMPLATES
// ============================================

model Template {
  id            String   @id @default(cuid())
  workspaceId   String

  // Template Info
  name          String
  type          TemplateType

  // Content
  content       Json     // Template structure

  // Status
  isDefault     Boolean  @default(false)
  active        Boolean  @default(true)

  // Relationships
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  quotes        Quote[]

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  @@index([workspaceId])
  @@index([type])
  @@map("templates")
}

enum TemplateType {
  QUOTE
  INVOICE
  CONTRACT
}

// ============================================
// REMINDERS
// ============================================

model Reminder {
  id            String   @id @default(cuid())
  quoteId       String?
  invoiceId     String?

  // Schedule
  scheduledFor  DateTime
  type          ReminderType

  // Status
  status        ReminderStatus @default(SCHEDULED)
  sentAt        DateTime?

  // Content
  emailSubject  String?
  emailBody     String?  @db.Text

  // Relationships
  quote         Quote?   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  invoice       Invoice? @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([scheduledFor])
  @@index([status])
  @@map("reminders")
}

enum ReminderType {
  QUOTE_EXPIRY
  PAYMENT_DUE
  PAYMENT_OVERDUE
}

enum ReminderStatus {
  SCHEDULED
  SENT
  CANCELLED
  FAILED
}

// ============================================
// ACTIVITY LOG
// ============================================

model Activity {
  id            String   @id @default(cuid())
  quoteId       String?
  invoiceId     String?

  // Activity Info
  type          ActivityType
  description   String

  // Actor
  actorType     ActorType
  actorId       String?
  actorName     String?
  actorEmail    String?

  // Metadata
  metadata      Json?
  ipAddress     String?
  userAgent     String?

  // Relationships
  quote         Quote?   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  invoice       Invoice? @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  // Timestamps
  createdAt     DateTime @default(now())

  @@index([quoteId])
  @@index([invoiceId])
  @@index([createdAt])
  @@map("activities")
}

enum ActivityType {
  CREATED
  UPDATED
  SENT
  VIEWED
  SIGNED
  ACCEPTED
  DECLINED
  CONVERTED
  PAYMENT_RECEIVED
  REMINDER_SENT
  COMMENT_ADDED
}

enum ActorType {
  USER
  CLIENT
  SYSTEM
}
```

### 4.3 Migration Strategy

```bash
# Initial migration
pnpm db:migrate:dev --name init

# Create new migration
pnpm db:migrate:dev --name add_feature_x

# Apply migrations in production
pnpm db:migrate:deploy

# Reset database (development only)
pnpm db:reset

# Generate Prisma client
pnpm db:generate
```

**Migration Best Practices:**
1. Always create migrations for schema changes
2. Test migrations on staging before production
3. Back up database before applying migrations
4. Use meaningful migration names
5. Never edit existing migrations after deployment

---

## 5. Docker Configuration

### 5.1 Dockerfile (Multi-stage Production Build)

```dockerfile
# docker/Dockerfile

# ============================================
# Base stage - shared dependencies
# ============================================
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# ============================================
# Dependencies stage
# ============================================
FROM base AS deps

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/
COPY packages/email-templates/package.json ./packages/email-templates/
COPY packages/pdf-templates/package.json ./packages/pdf-templates/

RUN pnpm install --frozen-lockfile

# ============================================
# Builder stage
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

# ============================================
# Production stage
# ============================================
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

# Install Chromium for Puppeteer (PDF generation)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy Prisma files
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma ./node_modules/.prisma

# Create data directories
RUN mkdir -p /data/uploads /data/generated && chown -R nextjs:nodejs /data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "apps/web/server.js"]
```

### 5.2 Docker Compose (Production)

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ============================================
  # Application
  # ============================================
  app:
    image: ghcr.io/yourorg/oreko:latest
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: quote-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://quote:${DB_PASSWORD}@postgres:5432/quote?schema=public
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=${APP_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_FROM=${SMTP_FROM}
      - STORAGE_TYPE=${STORAGE_TYPE:-local}
      - S3_ENDPOINT=${S3_ENDPOINT:-}
      - S3_BUCKET=${S3_BUCKET:-}
      - S3_ACCESS_KEY=${S3_ACCESS_KEY:-}
      - S3_SECRET_KEY=${S3_SECRET_KEY:-}
    volumes:
      - app_data:/data
    networks:
      - internal
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.quote.rule=Host(`${APP_DOMAIN}`)"
      - "traefik.http.routers.quote.entrypoints=websecure"
      - "traefik.http.routers.quote.tls.certresolver=letsencrypt"
      - "traefik.http.services.quote.loadbalancer.server.port=3000"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ============================================
  # Background Worker
  # ============================================
  worker:
    image: ghcr.io/yourorg/oreko:latest
    container_name: quote-worker
    restart: unless-stopped
    command: ["node", "apps/web/worker.js"]
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://quote:${DB_PASSWORD}@postgres:5432/quote?schema=public
      - REDIS_URL=redis://redis:6379
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_FROM=${SMTP_FROM}
    networks:
      - internal

  # ============================================
  # PostgreSQL Database
  # ============================================
  postgres:
    image: postgres:15-alpine
    container_name: quote-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=quote
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=quote
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U quote -d quote"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================
  # Redis
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: quote-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - internal
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================
  # Traefik Reverse Proxy
  # ============================================
  traefik:
    image: traefik:v3.0
    container_name: quote-traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=proxy"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_certs:/letsencrypt
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.${APP_DOMAIN}`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.routers.traefik.middlewares=auth"
      - "traefik.http.middlewares.auth.basicauth.users=${TRAEFIK_USERS}"

  # ============================================
  # Database Backup (Optional)
  # ============================================
  backup:
    image: prodrigestivill/postgres-backup-local
    container_name: quote-backup
    restart: unless-stopped
    depends_on:
      - postgres
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=quote
      - POSTGRES_USER=quote
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - SCHEDULE=@daily
      - BACKUP_KEEP_DAYS=7
      - BACKUP_KEEP_WEEKS=4
      - BACKUP_KEEP_MONTHS=6
    volumes:
      - backup_data:/backups
    networks:
      - internal

networks:
  internal:
    driver: bridge
  proxy:
    driver: bridge

volumes:
  app_data:
  postgres_data:
  redis_data:
  traefik_certs:
  backup_data:
```

### 5.3 Development Docker Compose

```yaml
# docker-compose.dev.yml

version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: quote-postgres-dev
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=quote
      - POSTGRES_PASSWORD=devpassword
      - POSTGRES_DB=quote
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: quote-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

  mailhog:
    image: mailhog/mailhog
    container_name: quote-mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

  minio:
    image: minio/minio
    container_name: quote-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_dev_data:/data
    command: server /data --console-address ":9001"

volumes:
  postgres_dev_data:
  redis_dev_data:
  minio_dev_data:
```

### 5.4 Environment Variables

```bash
# .env.example

# ============================================
# Application
# ============================================
NODE_ENV=production
APP_URL=https://quotes.yourdomain.com
APP_DOMAIN=quotes.yourdomain.com

# ============================================
# Database
# ============================================
DATABASE_URL=postgresql://quote:your-secure-password@postgres:5432/quote?schema=public
DB_PASSWORD=your-secure-password

# ============================================
# Redis
# ============================================
REDIS_URL=redis://redis:6379

# ============================================
# Authentication
# ============================================
NEXTAUTH_URL=https://quotes.yourdomain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ============================================
# Stripe
# ============================================
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Payment processing markup (percentage)
STRIPE_CARD_MARKUP=0.5
STRIPE_ACH_MARKUP=0.3

# ============================================
# Email (SMTP)
# ============================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM="Your Company <noreply@yourdomain.com>"
SMTP_SECURE=false

# ============================================
# File Storage
# ============================================
# Options: local, s3
STORAGE_TYPE=local

# S3-Compatible Storage (if STORAGE_TYPE=s3)
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# ============================================
# SSL/Traefik
# ============================================
ACME_EMAIL=admin@yourdomain.com
TRAEFIK_USERS=admin:$apr1$encrypted$password

# ============================================
# Application Settings
# ============================================
DEFAULT_CURRENCY=USD
DEFAULT_TIMEZONE=America/New_York
DEFAULT_DATE_FORMAT=MM/DD/YYYY

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# Feature Flags
# ============================================
ENABLE_GOOGLE_OAUTH=false
ENABLE_REGISTRATION=true
ENABLE_DEMO_MODE=false
```

---

## 6. Security

### 6.1 Authentication & Authorization

```typescript
// lib/auth.ts - NextAuth Configuration

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    ...(process.env.ENABLE_GOOGLE_OAUTH === 'true'
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
```

### 6.2 Authorization Middleware

```typescript
// middleware.ts

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/q/', // Quote portal
  '/i/', // Invoice portal
  '/pay/', // Payment portal
  '/api/auth',
  '/api/health',
  '/api/portal',
  '/api/payments/webhook',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path is public
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check authentication
  const session = await auth();

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
```

### 6.3 Data Encryption

```typescript
// lib/encryption.ts

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

export class Encryption {
  private key: Buffer;

  constructor(secret: string) {
    // Derive key from secret using PBKDF2
    this.key = crypto.pbkdf2Sync(
      secret,
      'salt', // In production, use a proper salt
      100000,
      KEY_LENGTH,
      'sha512'
    );
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, tagHex, encrypted] = ciphertext.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Encrypt sensitive fields before storage
export const encryption = new Encryption(process.env.ENCRYPTION_KEY!);
```

### 6.4 Input Validation

```typescript
// lib/validators/quote.ts

import { z } from 'zod';

export const lineItemSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  unitType: z.enum(['FIXED', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUANTITY']),
  unitPrice: z.number().min(0).max(999999.99),
  quantity: z.number().min(0.01).max(9999.99),
  taxable: z.boolean().default(true),
  rateCardId: z.string().cuid().optional(),
});

export const createQuoteSchema = z.object({
  clientId: z.string().cuid(),
  title: z.string().max(255).optional(),
  introduction: z.string().max(5000).optional(),
  terms: z.string().max(5000).optional(),
  notes: z.string().max(2000).optional(),
  expiryDate: z.coerce.date().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  discountValue: z.number().min(0).optional(),
  depositRequired: z.boolean().default(false),
  depositType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  depositValue: z.number().min(0).optional(),
  lineItems: z.array(lineItemSchema).min(1).max(100),
  templateId: z.string().cuid().optional(),
});

export const updateQuoteSchema = createQuoteSchema.partial();

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
```

### 6.5 Rate Limiting

```typescript
// lib/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Use local Redis in self-hosted mode
const redis = new Redis({
  url: process.env.REDIS_URL!,
});

// Different rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limit
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Auth endpoints (stricter)
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // Email sending
  email: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1h'),
    analytics: true,
    prefix: 'ratelimit:email',
  }),

  // Payment endpoints
  payment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1m'),
    analytics: true,
    prefix: 'ratelimit:payment',
  }),
};

export async function checkRateLimit(
  limiter: keyof typeof rateLimiters,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  const result = await rateLimiters[limiter].limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
  };
}
```

### 6.6 CORS Configuration

```typescript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.APP_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
      {
        // Portal routes (public)
        source: '/q/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 6.7 Security Headers

```typescript
// middleware.ts (extended)

const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self';
    connect-src 'self' https://api.stripe.com;
    frame-src https://js.stripe.com https://hooks.stripe.com;
  `.replace(/\s+/g, ' ').trim(),
};
```

---

## 7. Integrations

### 7.1 Stripe Integration

```typescript
// lib/stripe.ts

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Create checkout session for invoice payment
export async function createCheckoutSession({
  invoiceId,
  amount,
  currency,
  customerEmail,
  successUrl,
  cancelUrl,
  stripeAccountId,
}: {
  invoiceId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  stripeAccountId?: string;
}) {
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card', 'us_bank_account'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Invoice Payment`,
              description: `Payment for invoice`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    },
    stripeAccountId
      ? { stripeAccount: stripeAccountId }
      : undefined
  );

  return session;
}

// Create Stripe Connect account link for onboarding
export async function createConnectAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}

// Create a new Stripe Connect account
export async function createConnectAccount(email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
      us_bank_account_ach_payments: { requested: true },
    },
  });

  return account;
}
```

### 7.2 Stripe Webhook Handler

```typescript
// app/api/payments/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendPaymentReceivedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(paymentIntent);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(paymentIntent);
      break;
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      await handleAccountUpdated(account);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.invoiceId;
  const quoteId = session.metadata?.quoteId;

  if (invoiceId) {
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        amountPaid: session.amount_total! / 100,
        amountDue: 0,
      },
      include: { client: true, workspace: true },
    });

    await prisma.payment.create({
      data: {
        invoiceId,
        amount: session.amount_total! / 100,
        currency: session.currency!.toUpperCase(),
        type: 'PAYMENT',
        method: 'CARD',
        status: 'SUCCEEDED',
        stripePaymentIntentId: session.payment_intent as string,
      },
    });

    await prisma.activity.create({
      data: {
        invoiceId,
        type: 'PAYMENT_RECEIVED',
        description: `Payment of ${session.amount_total! / 100} received`,
        actorType: 'CLIENT',
        actorName: invoice.client.name,
        actorEmail: invoice.client.email,
      },
    });

    // Cancel pending reminders
    await prisma.reminder.updateMany({
      where: { invoiceId, status: 'SCHEDULED' },
      data: { status: 'CANCELLED' },
    });

    // Send confirmation email
    await sendPaymentReceivedEmail(invoice);
  }

  if (quoteId) {
    // Handle deposit payment
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        depositPaid: true,
        depositPaidAt: new Date(),
      },
    });
  }
}
```

### 7.3 Email Service (SMTP)

```typescript
// lib/email.ts

import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import {
  QuoteSentEmail,
  InvoiceSentEmail,
  PaymentReceivedEmail,
  PaymentReminderEmail,
} from '@oreko/email-templates';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, text, from, replyTo } = options;

  try {
    const result = await transporter.sendMail({
      from: from || process.env.SMTP_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      replyTo,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendQuoteSentEmail(quote: any) {
  const portalUrl = `${process.env.APP_URL}/q/${quote.accessToken}`;

  const html = render(
    QuoteSentEmail({
      clientName: quote.client.name,
      quoteNumber: quote.number,
      total: quote.total,
      currency: quote.workspace.currency,
      expiryDate: quote.expiryDate,
      portalUrl,
      companyName: quote.workspace.companyName,
      logoUrl: quote.workspace.logoUrl,
    })
  );

  return sendEmail({
    to: quote.client.email,
    subject: `Quote #${quote.number} from ${quote.workspace.companyName}`,
    html,
    replyTo: quote.workspace.companyEmail,
  });
}

export async function sendInvoiceSentEmail(invoice: any) {
  const portalUrl = `${process.env.APP_URL}/i/${invoice.accessToken}`;

  const html = render(
    InvoiceSentEmail({
      clientName: invoice.client.name,
      invoiceNumber: invoice.number,
      total: invoice.total,
      currency: invoice.workspace.currency,
      dueDate: invoice.dueDate,
      portalUrl,
      companyName: invoice.workspace.companyName,
      logoUrl: invoice.workspace.logoUrl,
    })
  );

  return sendEmail({
    to: invoice.client.email,
    subject: `Invoice #${invoice.number} from ${invoice.workspace.companyName}`,
    html,
    replyTo: invoice.workspace.companyEmail,
  });
}

export async function sendPaymentReminderEmail(invoice: any, reminderType: string) {
  const portalUrl = `${process.env.APP_URL}/i/${invoice.accessToken}`;

  const subjects = {
    PAYMENT_DUE: `Reminder: Invoice #${invoice.number} is due today`,
    PAYMENT_OVERDUE: `Overdue: Invoice #${invoice.number} requires payment`,
  };

  const html = render(
    PaymentReminderEmail({
      clientName: invoice.client.name,
      invoiceNumber: invoice.number,
      total: invoice.amountDue,
      currency: invoice.workspace.currency,
      dueDate: invoice.dueDate,
      reminderType,
      portalUrl,
      companyName: invoice.workspace.companyName,
    })
  );

  return sendEmail({
    to: invoice.client.email,
    subject: subjects[reminderType as keyof typeof subjects],
    html,
    replyTo: invoice.workspace.companyEmail,
  });
}
```

### 7.4 Background Jobs (BullMQ)

```typescript
// lib/queue.ts

import { Queue, Worker, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@/lib/prisma';
import { sendPaymentReminderEmail } from '@/lib/email';

const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// Queues
export const reminderQueue = new Queue('reminders', { connection });
export const emailQueue = new Queue('emails', { connection });
export const pdfQueue = new Queue('pdfs', { connection });

// Scheduler for delayed jobs
new QueueScheduler('reminders', { connection });

// Reminder Worker
const reminderWorker = new Worker(
  'reminders',
  async (job) => {
    const { reminderId } = job.data;

    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      include: {
        invoice: {
          include: {
            client: true,
            workspace: true,
          },
        },
      },
    });

    if (!reminder || reminder.status !== 'SCHEDULED') {
      return { skipped: true };
    }

    // Check if invoice is still unpaid
    if (reminder.invoice?.status === 'PAID') {
      await prisma.reminder.update({
        where: { id: reminderId },
        data: { status: 'CANCELLED' },
      });
      return { cancelled: true };
    }

    // Send reminder email
    const result = await sendPaymentReminderEmail(
      reminder.invoice,
      reminder.type
    );

    if (result.success) {
      await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      await prisma.activity.create({
        data: {
          invoiceId: reminder.invoiceId,
          type: 'REMINDER_SENT',
          description: `Payment reminder sent`,
          actorType: 'SYSTEM',
        },
      });
    } else {
      await prisma.reminder.update({
        where: { id: reminderId },
        data: { status: 'FAILED' },
      });
    }

    return result;
  },
  { connection }
);

// Schedule reminder
export async function scheduleReminder(
  invoiceId: string,
  type: 'PAYMENT_DUE' | 'PAYMENT_OVERDUE',
  scheduledFor: Date
) {
  const reminder = await prisma.reminder.create({
    data: {
      invoiceId,
      type,
      scheduledFor,
      status: 'SCHEDULED',
    },
  });

  const delay = scheduledFor.getTime() - Date.now();

  await reminderQueue.add(
    'send-reminder',
    { reminderId: reminder.id },
    {
      delay: Math.max(delay, 0),
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  return reminder;
}

// Schedule default reminders for an invoice
export async function scheduleInvoiceReminders(invoice: any) {
  if (!invoice.remindersEnabled) return;

  const dueDate = new Date(invoice.dueDate);

  // Reminder on due date
  await scheduleReminder(invoice.id, 'PAYMENT_DUE', dueDate);

  // Reminder 3 days after due date
  const threeDaysAfter = new Date(dueDate);
  threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);
  await scheduleReminder(invoice.id, 'PAYMENT_OVERDUE', threeDaysAfter);

  // Reminder 7 days after due date
  const sevenDaysAfter = new Date(dueDate);
  sevenDaysAfter.setDate(sevenDaysAfter.getDate() + 7);
  await scheduleReminder(invoice.id, 'PAYMENT_OVERDUE', sevenDaysAfter);
}
```

---

## 8. Performance

### 8.1 Caching Strategy

```typescript
// lib/cache.ts

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

const CACHE_TTL = {
  short: 60,           // 1 minute
  medium: 300,         // 5 minutes
  long: 3600,          // 1 hour
  veryLong: 86400,     // 24 hours
};

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

export async function setCache<T>(
  key: string,
  value: T,
  ttl: keyof typeof CACHE_TTL = 'medium'
): Promise<void> {
  await redis.setex(key, CACHE_TTL[ttl], JSON.stringify(value));
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Cache keys
export const cacheKeys = {
  workspace: (id: string) => `workspace:${id}`,
  workspaceSettings: (id: string) => `workspace:${id}:settings`,
  client: (id: string) => `client:${id}`,
  rateCards: (workspaceId: string) => `rate-cards:${workspaceId}`,
  templates: (workspaceId: string) => `templates:${workspaceId}`,
  dashboardStats: (workspaceId: string) => `dashboard:${workspaceId}:stats`,
};

// Example usage with caching
export async function getWorkspaceWithCache(id: string) {
  const cacheKey = cacheKeys.workspace(id);

  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Fetch from database
  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: true },
      },
    },
  });

  if (workspace) {
    await setCache(cacheKey, workspace, 'medium');
  }

  return workspace;
}
```

### 8.2 Database Indexing

```sql
-- Additional indexes for performance (add via migration)

-- Quotes
CREATE INDEX idx_quotes_workspace_status ON quotes(workspace_id, status);
CREATE INDEX idx_quotes_client_status ON quotes(client_id, status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_expiry_date ON quotes(expiry_date) WHERE status = 'SENT';

-- Invoices
CREATE INDEX idx_invoices_workspace_status ON invoices(workspace_id, status);
CREATE INDEX idx_invoices_client_status ON invoices(client_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status IN ('SENT', 'VIEWED', 'OVERDUE');
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Payments
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);

-- Reminders
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_for) WHERE status = 'SCHEDULED';

-- Activities
CREATE INDEX idx_activities_quote ON activities(quote_id, created_at DESC);
CREATE INDEX idx_activities_invoice ON activities(invoice_id, created_at DESC);

-- Full-text search on clients
CREATE INDEX idx_clients_search ON clients USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(company, ''))
);

-- Full-text search on rate cards
CREATE INDEX idx_rate_cards_search ON rate_cards USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);
```

### 8.3 Image Optimization

```typescript
// lib/image.ts

import sharp from 'sharp';
import { storage } from '@/lib/storage';

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export async function optimizeImage(
  buffer: Buffer,
  options: OptimizeOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    format = 'webp',
  } = options;

  let image = sharp(buffer);

  // Get metadata
  const metadata = await image.metadata();

  // Resize if needed
  if (
    (metadata.width && metadata.width > maxWidth) ||
    (metadata.height && metadata.height > maxHeight)
  ) {
    image = image.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to target format
  switch (format) {
    case 'webp':
      image = image.webp({ quality });
      break;
    case 'jpeg':
      image = image.jpeg({ quality, progressive: true });
      break;
    case 'png':
      image = image.png({ compressionLevel: 9 });
      break;
  }

  return image.toBuffer();
}

// Generate thumbnail
export async function generateThumbnail(
  buffer: Buffer,
  size: number = 200
): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, { fit: 'cover' })
    .webp({ quality: 70 })
    .toBuffer();
}

// Upload with optimization
export async function uploadOptimizedImage(
  file: Buffer,
  key: string,
  options?: OptimizeOptions
) {
  const optimized = await optimizeImage(file, options);
  return storage.upload(optimized, key, 'image/webp');
}
```

### 8.4 Bundle Optimization

```typescript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-*',
      'lucide-react',
      'date-fns',
    ],
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Reduce bundle size
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use lighter alternatives
        'lodash': 'lodash-es',
      };
    }

    return config;
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 9. Monitoring & Logging

### 9.1 Application Logging

```typescript
// lib/logger.ts

import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // Production: JSON output for log aggregators
  // Development: Pretty print
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
        },
      },

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'passwordHash',
      'accessToken',
      'stripeSecretKey',
      'authorization',
      '*.password',
      '*.passwordHash',
    ],
    censor: '[REDACTED]',
  },

  // Add request ID for tracing
  mixin() {
    return {
      service: 'oreko',
      version: process.env.npm_package_version,
    };
  },
});

// Create child loggers for different modules
export const dbLogger = logger.child({ module: 'database' });
export const authLogger = logger.child({ module: 'auth' });
export const paymentLogger = logger.child({ module: 'payment' });
export const emailLogger = logger.child({ module: 'email' });
export const queueLogger = logger.child({ module: 'queue' });

// Log API requests
export function logRequest(req: Request, res: Response, duration: number) {
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    status: res.status,
    duration,
    userAgent: req.headers.get('user-agent'),
  });
}

// Log errors
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({
    type: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });
}
```

### 9.2 Error Tracking

```typescript
// lib/error-tracking.ts

import * as Sentry from '@sentry/nextjs';

// Initialize Sentry (if DSN provided)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Filter out non-actionable errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],

    beforeSend(event) {
      // Scrub sensitive data
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  logger.error({ error, ...context });

  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  logger.info({ message, level });

  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
}
```

### 9.3 Health Checks

```typescript
// app/api/health/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};
  let healthy = true;

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok', latency: Date.now() - dbStart };
  } catch (error) {
    checks.database = { status: 'error', error: (error as Error).message };
    healthy = false;
  }

  // Redis check
  const redisStart = Date.now();
  try {
    await redis.ping();
    checks.redis = { status: 'ok', latency: Date.now() - redisStart };
  } catch (error) {
    checks.redis = { status: 'error', error: (error as Error).message };
    healthy = false;
  }

  // Storage check (basic)
  checks.storage = { status: 'ok' };

  const response = {
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  return NextResponse.json(response, {
    status: healthy ? 200 : 503,
  });
}

// Readiness check (more thorough)
// app/api/health/ready/route.ts

export async function GET() {
  const checks: Record<string, boolean> = {};

  // Check database connection and migrations
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis = true;
  } catch {
    checks.redis = false;
  }

  const ready = Object.values(checks).every(Boolean);

  return NextResponse.json(
    { ready, checks },
    { status: ready ? 200 : 503 }
  );
}
```

### 9.4 Metrics Collection

```typescript
// lib/metrics.ts

import { Counter, Histogram, Registry } from 'prom-client';

export const register = new Registry();

// Request metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Business metrics
export const quotesCreated = new Counter({
  name: 'quotes_created_total',
  help: 'Total number of quotes created',
  registers: [register],
});

export const invoicesCreated = new Counter({
  name: 'invoices_created_total',
  help: 'Total number of invoices created',
  registers: [register],
});

export const paymentsProcessed = new Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['status', 'method'],
  registers: [register],
});

export const emailsSent = new Counter({
  name: 'emails_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['type', 'status'],
  registers: [register],
});

// Metrics endpoint
// app/api/metrics/route.ts
export async function GET() {
  const metrics = await register.metrics();
  return new Response(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  });
}
```

---

## 10. Development Setup

### 10.1 Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| pnpm | 8.x | Package manager |
| Docker | 24.x | Local services |
| Docker Compose | 2.x | Service orchestration |
| Git | 2.x | Version control |

### 10.2 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourorg/oreko.git
cd oreko

# 2. Install dependencies
pnpm install

# 3. Copy environment file
cp .env.example .env.local

# 4. Start development services (PostgreSQL, Redis, Mailhog)
docker-compose -f docker-compose.dev.yml up -d

# 5. Generate Prisma client
pnpm db:generate

# 6. Run database migrations
pnpm db:migrate:dev

# 7. Seed the database (optional)
pnpm db:seed

# 8. Start development server
pnpm dev

# Application will be available at http://localhost:3000
# Mailhog UI at http://localhost:8025
```

### 10.3 Environment Configuration (Development)

```bash
# .env.local (development)

# Application
NODE_ENV=development
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://quote:devpassword@localhost:5432/quote?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-change-in-production

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Mailhog for development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="Quote App <noreply@localhost>"
SMTP_SECURE=false

# Storage
STORAGE_TYPE=local

# Feature Flags
ENABLE_GOOGLE_OAUTH=false
ENABLE_REGISTRATION=true
ENABLE_DEMO_MODE=true
```

### 10.4 Development Scripts

```json
// package.json scripts

{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "start": "turbo start",
    "lint": "turbo lint",
    "lint:fix": "turbo lint -- --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "turbo type-check",
    "test": "turbo test",
    "test:watch": "turbo test -- --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:generate": "pnpm --filter @oreko/database db:generate",
    "db:migrate:dev": "pnpm --filter @oreko/database db:migrate:dev",
    "db:migrate:deploy": "pnpm --filter @oreko/database db:migrate:deploy",
    "db:push": "pnpm --filter @oreko/database db:push",
    "db:seed": "pnpm --filter @oreko/database db:seed",
    "db:reset": "pnpm --filter @oreko/database db:reset",
    "db:studio": "pnpm --filter @oreko/database db:studio",
    "docker:dev": "docker-compose -f docker-compose.dev.yml up -d",
    "docker:dev:down": "docker-compose -f docker-compose.dev.yml down",
    "docker:build": "docker build -f docker/Dockerfile -t oreko .",
    "docker:run": "docker-compose up -d",
    "prepare": "husky install"
  }
}
```

---

## 11. Deployment Guide

### 11.1 Self-Hosted Deployment

#### Step 1: Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Docker | 24.x | 24.x |

#### Step 2: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER

# Create application directory
sudo mkdir -p /opt/oreko
sudo chown $USER:$USER /opt/oreko
cd /opt/oreko
```

#### Step 3: Configure Environment

```bash
# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/yourorg/oreko/main/docker-compose.yml

# Create environment file
cat > .env << 'EOF'
# Application
APP_URL=https://quotes.yourdomain.com
APP_DOMAIN=quotes.yourdomain.com

# Database
DB_PASSWORD=$(openssl rand -base64 32)

# Auth
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Stripe
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_FROM="Your Company <noreply@yourdomain.com>"

# SSL
ACME_EMAIL=admin@yourdomain.com

# Storage
STORAGE_TYPE=local
EOF

# Edit with your actual values
nano .env
```

#### Step 4: Deploy

```bash
# Pull images and start services
docker compose pull
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f app

# Run database migrations
docker compose exec app pnpm db:migrate:deploy
```

#### Step 5: Verify Deployment

```bash
# Check health endpoint
curl -s https://quotes.yourdomain.com/api/health | jq

# Expected output:
# {
#   "status": "healthy",
#   "timestamp": "2026-01-30T...",
#   "version": "1.0.0",
#   "checks": {
#     "database": { "status": "ok", "latency": 5 },
#     "redis": { "status": "ok", "latency": 1 },
#     "storage": { "status": "ok" }
#   }
# }
```

### 11.2 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | - | Environment (production/development) |
| `APP_URL` | Yes | - | Full application URL |
| `APP_DOMAIN` | Yes | - | Domain for Traefik routing |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `DB_PASSWORD` | Yes | - | Database password |
| `REDIS_URL` | Yes | - | Redis connection string |
| `NEXTAUTH_URL` | Yes | - | NextAuth callback URL |
| `NEXTAUTH_SECRET` | Yes | - | NextAuth encryption secret |
| `STRIPE_SECRET_KEY` | Yes | - | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Yes | - | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | - | Stripe webhook signing secret |
| `SMTP_HOST` | Yes | - | SMTP server host |
| `SMTP_PORT` | Yes | 587 | SMTP server port |
| `SMTP_USER` | Yes | - | SMTP username |
| `SMTP_PASSWORD` | Yes | - | SMTP password |
| `SMTP_FROM` | Yes | - | Default from email |
| `SMTP_SECURE` | No | false | Use TLS |
| `STORAGE_TYPE` | No | local | Storage type (local/s3) |
| `S3_ENDPOINT` | No | - | S3-compatible endpoint |
| `S3_BUCKET` | No | - | S3 bucket name |
| `S3_ACCESS_KEY` | No | - | S3 access key |
| `S3_SECRET_KEY` | No | - | S3 secret key |
| `ACME_EMAIL` | Yes | - | Email for Let's Encrypt |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth client secret |
| `ENABLE_GOOGLE_OAUTH` | No | false | Enable Google sign-in |
| `ENABLE_REGISTRATION` | No | true | Allow new registrations |
| `SENTRY_DSN` | No | - | Sentry error tracking DSN |
| `LOG_LEVEL` | No | info | Log level (debug/info/warn/error) |

### 11.3 Backup & Restore

#### Automated Backups

The `backup` service in docker-compose.yml handles automated daily backups with:
- Daily backups retained for 7 days
- Weekly backups retained for 4 weeks
- Monthly backups retained for 6 months

Backups are stored in the `backup_data` volume.

#### Manual Backup

```bash
# Create backup script
cat > /opt/oreko/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/oreko/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
docker compose exec -T postgres pg_dump -U quote quote | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# File storage backup
tar -czf "$BACKUP_DIR/files_$TIMESTAMP.tar.gz" -C /var/lib/docker/volumes/oreko_app_data/_data .

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x /opt/oreko/scripts/backup.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/oreko/scripts/backup.sh") | crontab -
```

#### Restore from Backup

```bash
# Stop application
docker compose stop app worker

# Restore database
gunzip -c backups/db_20260130_020000.sql.gz | docker compose exec -T postgres psql -U quote quote

# Restore files
tar -xzf backups/files_20260130_020000.tar.gz -C /var/lib/docker/volumes/oreko_app_data/_data

# Start application
docker compose start app worker

# Run any pending migrations
docker compose exec app pnpm db:migrate:deploy
```

### 11.4 Upgrading

```bash
cd /opt/oreko

# Pull latest images
docker compose pull

# Stop services
docker compose down

# Start with new images
docker compose up -d

# Run migrations
docker compose exec app pnpm db:migrate:deploy

# Verify health
curl -s https://quotes.yourdomain.com/api/health
```

### 11.5 Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | Check logs: `docker compose logs app` |
| Database connection failed | Verify `DATABASE_URL` and postgres container is running |
| SSL certificate issues | Check Traefik logs: `docker compose logs traefik` |
| Emails not sending | Verify SMTP settings, check `docker compose logs worker` |
| Payment webhooks failing | Verify `STRIPE_WEBHOOK_SECRET`, check Stripe dashboard |
| High memory usage | Increase Redis maxmemory, check for memory leaks |
| Slow performance | Check database indexes, enable caching, review logs |

---

## Appendix A: API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `QUOTE_EXPIRED` | 410 | Quote has expired |
| `ALREADY_ACCEPTED` | 409 | Quote already accepted |
| `ALREADY_PAID` | 409 | Invoice already paid |

---

## Appendix B: Database Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| users | email | Login lookup |
| workspaces | slug | URL-based lookup |
| clients | workspace_id, email | Client lookup |
| quotes | workspace_id, status | Dashboard queries |
| quotes | access_token | Portal access |
| invoices | workspace_id, status | Dashboard queries |
| invoices | due_date | Reminder scheduling |
| reminders | scheduled_for, status | Job processing |
| activities | quote_id, created_at | Activity timeline |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Architecture Team | Initial specification |

---

*This technical specification serves as the authoritative reference for the development team. Any architectural changes require review and approval before implementation.*
