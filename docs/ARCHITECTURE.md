# QuoteCraft Architecture Design

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                │
│    │   Browser    │    │   Mobile     │    │   Client     │                │
│    │   (React)    │    │   Browser    │    │   Portal     │                │
│    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                │
│           │                   │                   │                         │
│           └───────────────────┼───────────────────┘                         │
│                               │                                              │
│                               │ HTTPS                                        │
│                               ▼                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                             EDGE LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐     │
│    │                         CDN / Edge                               │     │
│    │                    (Vercel/Cloudflare)                          │     │
│    │  ┌────────────┐  ┌────────────┐  ┌────────────┐               │     │
│    │  │   Static   │  │    Edge    │  │   Cache    │               │     │
│    │  │   Assets   │  │  Functions │  │   (KV)     │               │     │
│    │  └────────────┘  └────────────┘  └────────────┘               │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                               │                                              │
│                               ▼                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         APPLICATION LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐     │
│    │                    Next.js Application                           │     │
│    │                                                                   │     │
│    │  ┌─────────────────────────────────────────────────────────┐   │     │
│    │  │                    App Router                            │   │     │
│    │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │     │
│    │  │  │   Pages    │  │   Layouts  │  │   Loading  │        │   │     │
│    │  │  │  (RSC)     │  │   (RSC)    │  │   States   │        │   │     │
│    │  │  └────────────┘  └────────────┘  └────────────┘        │   │     │
│    │  └─────────────────────────────────────────────────────────┘   │     │
│    │                                                                   │     │
│    │  ┌───────────────────────┐  ┌────────────────────────────┐    │     │
│    │  │    API Routes         │  │     Server Actions          │    │     │
│    │  │  /api/public/*       │  │  createQuote()              │    │     │
│    │  │  /api/webhooks/*     │  │  updateInvoice()            │    │     │
│    │  └───────────────────────┘  └────────────────────────────┘    │     │
│    │                                                                   │     │
│    │  ┌─────────────────────────────────────────────────────────┐   │     │
│    │  │                    Business Logic                        │   │     │
│    │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │     │
│    │  │  │  Services  │  │ Validators │  │   Utils    │        │   │     │
│    │  │  └────────────┘  └────────────┘  └────────────┘        │   │     │
│    │  └─────────────────────────────────────────────────────────┘   │     │
│    │                                                                   │     │
│    └───────────────────────────────────────────────────────────────────┘     │
│                               │                                              │
│                               ▼                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                          DATA LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Prisma    │  │   Redis    │  │   Storage  │  │   Queue    │           │
│  │  Client    │  │   Client   │  │   Client   │  │  (BullMQ)  │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │               │               │               │                    │
│        ▼               ▼               ▼               ▼                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ PostgreSQL │  │   Redis    │  │  S3/Local  │  │   Redis    │           │
│  │            │  │            │  │  Storage   │  │  (Queue)   │           │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                        EXTERNAL SERVICES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Stripe   │  │   Email    │  │   Sentry   │  │   Vercel   │           │
│  │  Payments  │  │  Provider  │  │   Errors   │  │  Analytics │           │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Monorepo Structure

```
quote-software/
├── apps/
│   └── web/                          # Next.js 14 Application
│       ├── app/                      # App Router
│       │   ├── (auth)/              # Authentication routes
│       │   │   ├── login/
│       │   │   ├── register/
│       │   │   ├── forgot-password/
│       │   │   └── verify-email/
│       │   ├── (dashboard)/         # Protected dashboard routes
│       │   │   ├── layout.tsx       # Dashboard layout with sidebar
│       │   │   ├── page.tsx         # Dashboard home
│       │   │   ├── quotes/
│       │   │   │   ├── page.tsx     # Quotes list
│       │   │   │   ├── new/         # Create quote
│       │   │   │   └── [id]/        # Quote detail/edit
│       │   │   ├── invoices/
│       │   │   ├── clients/
│       │   │   ├── rate-cards/
│       │   │   └── settings/
│       │   ├── (public)/            # Public routes (no auth)
│       │   │   ├── q/[token]/       # Quote accept page
│       │   │   └── i/[token]/       # Invoice pay page
│       │   ├── api/
│       │   │   ├── auth/[...nextauth]/ # NextAuth routes
│       │   │   ├── webhooks/
│       │   │   │   └── stripe/
│       │   │   └── public/          # Unauthenticated endpoints
│       │   └── (marketing)/         # Landing page
│       │       ├── page.tsx
│       │       ├── pricing/
│       │       └── features/
│       ├── components/              # React components
│       ├── lib/                     # Application logic
│       │   ├── actions/             # Server actions
│       │   ├── services/            # Business logic services
│       │   ├── hooks/               # Custom React hooks
│       │   ├── utils/               # Utility functions
│       │   └── validations/         # Zod schemas
│       ├── styles/                  # Global styles
│       └── types/                   # TypeScript types
│
├── packages/
│   ├── database/                    # Prisma package
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── client.ts            # Prisma client instance
│   │       └── index.ts             # Exports
│   │
│   ├── ui/                          # Shared UI components
│   │   ├── src/
│   │   │   ├── components/          # Shadcn UI components
│   │   │   └── styles/              # Component styles
│   │   └── tailwind.config.ts       # Shared Tailwind config
│   │
│   ├── email-templates/             # React Email templates
│   │   └── src/
│   │       ├── templates/
│   │       │   ├── QuoteSent.tsx
│   │       │   ├── InvoiceSent.tsx
│   │       │   ├── PaymentReceived.tsx
│   │       │   └── Reminder.tsx
│   │       └── index.ts
│   │
│   ├── pdf-templates/               # PDF generation templates
│   │   └── src/
│   │       ├── templates/
│   │       │   ├── QuoteTemplate.tsx
│   │       │   ├── InvoiceTemplate.tsx
│   │       │   └── ReceiptTemplate.tsx
│   │       └── index.ts
│   │
│   └── shared/                      # Shared utilities
│       └── src/
│           ├── constants/           # Shared constants
│           ├── types/               # Shared TypeScript types
│           └── utils/               # Shared utilities
│
├── docker/
│   ├── development/
│   │   └── docker-compose.yml
│   └── production/
│       ├── Dockerfile
│       ├── docker-compose.yml
│       └── traefik/
│
├── docs/                            # Documentation
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Lint, test, type-check
│       └── deploy.yml               # Deployment workflow
│
├── turbo.json                       # Turborepo config
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json                    # Root TS config
```

---

## 3. Data Flow Architecture

### 3.1 Quote Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          QUOTE CREATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

User clicks "New Quote"
        │
        ▼
┌───────────────────────────────────────┐
│  1. Navigate to /quotes/new           │
│     - Server Component renders form   │
│     - Load client list (RSC)          │
│     - Load rate cards (RSC)           │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│  2. Client Component: QuoteBuilder    │
│     - State: quote data               │
│     - Drag-drop blocks                │
│     - Live calculations               │
└───────────────────┬───────────────────┘
                    │
                    │ Auto-save (debounced)
                    ▼
┌───────────────────────────────────────┐
│  3. Server Action: saveQuoteDraft     │
│     - Validate with Zod               │
│     - Update database (Prisma)        │
│     - Return updated quote            │
└───────────────────┬───────────────────┘
                    │
                    │ User clicks "Send"
                    ▼
┌───────────────────────────────────────┐
│  4. Server Action: sendQuote          │
│     - Validate quote completeness     │
│     - Update status to "sent"         │
│     - Generate PDF (background job)   │
│     - Queue email (BullMQ)            │
│     - Create event log                │
└───────────────────┬───────────────────┘
                    │
                    │ Background
                    ▼
┌───────────────────────────────────────┐
│  5. Background Jobs                   │
│     - Generate PDF (Puppeteer)        │
│     - Send email (Email provider)     │
│     - Update PDF URL in database      │
└───────────────────────────────────────┘
```

### 3.2 Quote Acceptance Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         QUOTE ACCEPTANCE FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

Client clicks link in email
        │
        │ /q/[accessToken]
        ▼
┌───────────────────────────────────────┐
│  1. Public Route: Load Quote          │
│     - Validate access token           │
│     - Check not expired               │
│     - Load quote data                 │
│     - Track view event                │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│  2. Client Portal: QuotePortal        │
│     - Display quote details           │
│     - Show contract (if attached)     │
│     - Accept terms checkbox           │
│     - Signature capture               │
└───────────────────┬───────────────────┘
                    │
                    │ Client signs & accepts
                    ▼
┌───────────────────────────────────────┐
│  3. API Route: acceptQuote            │
│     - Validate signature data         │
│     - Store signature (audit trail)   │
│     - Record IP, timestamp, user agent│
└───────────────────┬───────────────────┘
                    │
                    │ If deposit required
                    ▼
┌───────────────────────────────────────┐
│  4. Stripe Integration                │
│     - Create PaymentIntent            │
│     - Render Stripe Elements          │
│     - Process payment                 │
└───────────────────┬───────────────────┘
                    │
                    │ Stripe webhook
                    ▼
┌───────────────────────────────────────┐
│  5. Webhook: payment_intent.succeeded │
│     - Update quote status: accepted   │
│     - Create payment record           │
│     - Convert to invoice (if enabled) │
│     - Generate signed PDF             │
│     - Send confirmation emails        │
└───────────────────────────────────────┘
```

### 3.3 Payment Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PAYMENT PROCESSING FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

Client clicks "Pay Invoice"
        │
        │ /i/[accessToken]
        ▼
┌───────────────────────────────────────┐
│  1. Load Invoice Portal               │
│     - Validate access token           │
│     - Check invoice status            │
│     - Calculate amount due            │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│  2. Payment Form                      │
│     - Select payment method           │
│     - Select amount (full/partial)    │
│     - Enter card/bank details         │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│  3. Create Payment Intent             │
│     POST /api/public/invoices/pay     │
│     - Validate amount                 │
│     - Calculate fees                  │
│     - Create Stripe PaymentIntent     │
│     - Return client_secret            │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│  4. Stripe.js                         │
│     - stripe.confirmPayment()         │
│     - Handle 3D Secure if needed      │
│     - Redirect on success             │
└───────────────────┬───────────────────┘
                    │
                    │ Async
                    ▼
┌───────────────────────────────────────┐
│  5. Webhook Handler                   │
│     POST /api/webhooks/stripe         │
│                                       │
│     payment_intent.succeeded:         │
│     - Create Payment record           │
│     - Update invoice.amount_paid      │
│     - Update invoice.amount_due       │
│     - Check if fully paid             │
│     - Update invoice.status           │
│     - Queue receipt email             │
│     - Create event log                │
│                                       │
│     payment_intent.payment_failed:    │
│     - Log failure                     │
│     - Notify user (optional)          │
└───────────────────────────────────────┘
```

---

## 4. Service Layer Architecture

### 4.1 Service Structure

```typescript
// lib/services/quote.service.ts

import { prisma } from '@quotecraft/database';
import { QuoteCreateInput, QuoteUpdateInput } from '../validations/quote';
import { generateQuoteNumber } from '../utils/sequences';
import { queueEmail } from '../queue/email';
import { queuePdfGeneration } from '../queue/pdf';

export class QuoteService {
  /**
   * Create a new quote draft
   */
  async create(workspaceId: string, userId: string, data: QuoteCreateInput) {
    const quoteNumber = await generateQuoteNumber(workspaceId);

    const quote = await prisma.quote.create({
      data: {
        workspaceId,
        createdById: userId,
        quoteNumber,
        clientId: data.clientId,
        title: data.title,
        expirationDate: data.expirationDate,
        settings: data.settings ?? {},
        lineItems: {
          create: data.lineItems.map((item, index) => ({
            ...item,
            sortOrder: index,
            amount: item.quantity * item.rate,
          })),
        },
      },
      include: {
        lineItems: true,
        client: true,
      },
    });

    // Recalculate totals
    await this.recalculateTotals(quote.id);

    // Log event
    await this.logEvent(quote.id, 'created', userId);

    return quote;
  }

  /**
   * Update an existing quote
   */
  async update(quoteId: string, userId: string, data: QuoteUpdateInput) {
    const quote = await prisma.quote.findUniqueOrThrow({
      where: { id: quoteId },
    });

    // Only allow updates if draft
    if (quote.status !== 'draft') {
      throw new AppError('QUOTE_NOT_EDITABLE', 'Cannot edit a sent quote', 400);
    }

    // Update quote
    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Recalculate if line items changed
    if (data.lineItems) {
      await this.recalculateTotals(quoteId);
    }

    return updated;
  }

  /**
   * Send quote to client
   */
  async send(quoteId: string, userId: string) {
    const quote = await prisma.quote.findUniqueOrThrow({
      where: { id: quoteId },
      include: {
        client: true,
        workspace: {
          include: {
            businessProfile: true,
          },
        },
        lineItems: true,
      },
    });

    // Validate quote is complete
    this.validateForSend(quote);

    // Update status
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });

    // Queue PDF generation
    await queuePdfGeneration({
      type: 'quote',
      id: quoteId,
    });

    // Queue email
    await queueEmail({
      type: 'quote_sent',
      to: quote.client.email,
      data: {
        quoteId: quote.id,
        clientName: quote.client.name,
        quoteNumber: quote.quoteNumber,
        total: quote.total,
        viewUrl: this.getPublicUrl(quote.accessToken),
        businessName: quote.workspace.businessProfile?.businessName,
      },
    });

    // Log event
    await this.logEvent(quoteId, 'sent', userId);

    return quote;
  }

  /**
   * Accept quote (called from public portal)
   */
  async accept(
    accessToken: string,
    signature: SignatureData,
    ipAddress: string,
    userAgent: string
  ) {
    const quote = await prisma.quote.findUniqueOrThrow({
      where: { accessToken },
      include: {
        workspace: true,
        lineItems: true,
      },
    });

    // Validate can be accepted
    if (quote.status !== 'sent' && quote.status !== 'viewed') {
      throw new AppError('INVALID_STATUS', 'Quote cannot be accepted', 400);
    }

    if (quote.expirationDate && new Date() > quote.expirationDate) {
      throw new AppError('QUOTE_EXPIRED', 'This quote has expired', 400);
    }

    // Store signature
    const quoteSignature = await prisma.quoteSignature.create({
      data: {
        quoteId: quote.id,
        signatureType: signature.type,
        signatureData: signature.data,
        ipAddress,
        userAgent,
        signedAt: new Date(),
      },
    });

    // Update quote status
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    // Log event
    await this.logEvent(quote.id, 'accepted', null, 'client', { ipAddress });

    // Auto-convert to invoice if enabled
    if (quote.settings.autoConvertToInvoice !== false) {
      await this.convertToInvoice(quote.id);
    }

    return quote;
  }

  /**
   * Convert accepted quote to invoice
   */
  async convertToInvoice(quoteId: string) {
    const quote = await prisma.quote.findUniqueOrThrow({
      where: { id: quoteId },
      include: {
        lineItems: true,
        client: true,
      },
    });

    if (quote.status !== 'accepted') {
      throw new AppError('INVALID_STATUS', 'Only accepted quotes can be converted', 400);
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(quote.workspaceId);

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        workspaceId: quote.workspaceId,
        clientId: quote.clientId,
        quoteId: quote.id,
        invoiceNumber,
        title: quote.title,
        subtotal: quote.subtotal,
        taxTotal: quote.taxTotal,
        total: quote.total,
        amountDue: quote.total,
        dueDate: addDays(new Date(), 30), // Default Net 30
        lineItems: {
          create: quote.lineItems.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            sortOrder: item.sortOrder,
            rateCardId: item.rateCardId,
          })),
        },
      },
    });

    // If deposit was paid, record it
    if (quote.depositEnabled && quote.depositAmount) {
      // Deposit payment would have been recorded during acceptance
    }

    return invoice;
  }

  // Private methods

  private async recalculateTotals(quoteId: string) {
    const quote = await prisma.quote.findUniqueOrThrow({
      where: { id: quoteId },
      include: { lineItems: true },
    });

    const subtotal = quote.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const taxTotal = quote.lineItems.reduce((sum, item) => sum + Number(item.taxAmount), 0);
    const total = subtotal + taxTotal;

    await prisma.quote.update({
      where: { id: quoteId },
      data: { subtotal, taxTotal, total },
    });
  }

  private validateForSend(quote: QuoteWithRelations) {
    const errors: string[] = [];

    if (!quote.clientId) {
      errors.push('Client is required');
    }

    if (quote.lineItems.length === 0) {
      errors.push('At least one line item is required');
    }

    if (quote.total <= 0) {
      errors.push('Quote total must be greater than zero');
    }

    if (errors.length > 0) {
      throw new ValidationError('Quote validation failed', { errors });
    }
  }

  private getPublicUrl(accessToken: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL}/q/${accessToken}`;
  }

  private async logEvent(
    quoteId: string,
    eventType: string,
    actorId: string | null,
    actorType: 'user' | 'client' | 'system' = 'user',
    metadata: Record<string, unknown> = {}
  ) {
    await prisma.quoteEvent.create({
      data: {
        quoteId,
        eventType,
        actorId,
        actorType,
        metadata,
      },
    });
  }
}

export const quoteService = new QuoteService();
```

### 4.2 Service Registry

```typescript
// lib/services/index.ts

export { quoteService } from './quote.service';
export { invoiceService } from './invoice.service';
export { clientService } from './client.service';
export { rateCardService } from './rate-card.service';
export { paymentService } from './payment.service';
export { emailService } from './email.service';
export { pdfService } from './pdf.service';
export { stripeService } from './stripe.service';
```

---

## 5. Background Job Architecture

### 5.1 Queue Setup

```typescript
// lib/queue/index.ts

import { Queue, Worker, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// Define queues
export const emailQueue = new Queue('email', { connection });
export const pdfQueue = new Queue('pdf', { connection });
export const reminderQueue = new Queue('reminder', { connection });

// Email worker
const emailWorker = new Worker('email', async (job) => {
  const { type, to, data } = job.data;

  switch (type) {
    case 'quote_sent':
      await sendQuoteSentEmail(to, data);
      break;
    case 'invoice_sent':
      await sendInvoiceSentEmail(to, data);
      break;
    case 'payment_received':
      await sendPaymentReceivedEmail(to, data);
      break;
    case 'payment_reminder':
      await sendPaymentReminderEmail(to, data);
      break;
  }
}, { connection });

// PDF worker
const pdfWorker = new Worker('pdf', async (job) => {
  const { type, id } = job.data;

  switch (type) {
    case 'quote':
      await generateQuotePdf(id);
      break;
    case 'invoice':
      await generateInvoicePdf(id);
      break;
    case 'receipt':
      await generateReceiptPdf(id);
      break;
  }
}, { connection });

// Reminder scheduler (runs every hour)
export async function scheduleReminders() {
  const now = new Date();

  // Find invoices with reminders due
  const invoices = await prisma.scheduledEmail.findMany({
    where: {
      type: 'invoice_reminder',
      status: 'pending',
      scheduledFor: { lte: now },
    },
    include: {
      workspace: true,
    },
  });

  for (const scheduled of invoices) {
    await reminderQueue.add('send', scheduled);
    await prisma.scheduledEmail.update({
      where: { id: scheduled.id },
      data: { status: 'queued' },
    });
  }
}
```

### 5.2 Job Types

```typescript
// lib/queue/types.ts

export interface EmailJob {
  type:
    | 'quote_sent'
    | 'invoice_sent'
    | 'payment_received'
    | 'payment_reminder'
    | 'welcome'
    | 'password_reset';
  to: string;
  data: Record<string, unknown>;
}

export interface PdfJob {
  type: 'quote' | 'invoice' | 'receipt' | 'contract';
  id: string;
  options?: {
    includeSignature?: boolean;
    watermark?: string;
  };
}

export interface ReminderJob {
  invoiceId: string;
  reminderType: 'before_due' | 'on_due' | 'after_due';
  dayOffset: number;
}
```

---

## 6. Authentication Architecture

### 6.1 NextAuth Configuration

```typescript
// lib/auth.ts

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@quotecraft/database';
import { compare } from 'bcryptjs';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
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
          throw new Error('Email and password required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        if (!user.emailVerifiedAt) {
          throw new Error('Please verify your email');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.activeWorkspaceId = session.activeWorkspaceId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.activeWorkspaceId = token.activeWorkspaceId as string;
      }
      return session;
    },
  },
});

// Auth middleware helper
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      workspaces: {
        include: {
          workspace: true,
        },
      },
    },
  });
}

// Workspace authorization helper
export async function getWorkspace(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    include: {
      workspace: {
        include: {
          businessProfile: true,
        },
      },
    },
  });

  if (!membership) {
    throw new AuthorizationError('Not a member of this workspace');
  }

  return membership;
}
```

### 6.2 Middleware

```typescript
// middleware.ts

import { auth } from './lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth } = req;

  const isLoggedIn = !!auth?.user;
  const isAuthPage = nextUrl.pathname.startsWith('/login') ||
                     nextUrl.pathname.startsWith('/register');
  const isDashboard = nextUrl.pathname.startsWith('/dashboard') ||
                      nextUrl.pathname.match(/^\/(quotes|invoices|clients|settings)/);
  const isPublicPage = nextUrl.pathname.startsWith('/q/') ||
                       nextUrl.pathname.startsWith('/i/');

  // Public pages are always accessible
  if (isPublicPage) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Protect dashboard routes
  if (isDashboard && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

---

## 7. Error Handling Architecture

### 7.1 Error Classes

```typescript
// lib/errors/index.ts

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHENTICATED', message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super('FORBIDDEN', message, 403);
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
    super('RATE_LIMITED', 'Too many requests', 429, { retryAfter });
  }
}
```

### 7.2 Error Handler

```typescript
// lib/errors/handler.ts

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from './index';
import { logger } from '../logger';

export function handleError(error: unknown): NextResponse {
  // Log all errors
  logger.error({ error }, 'Request error');

  // Known application errors
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: error.flatten().fieldErrors,
      },
    }, { status: 400 });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: {
          code: 'CONFLICT',
          message: 'Resource already exists',
        },
      }, { status: 409 });
    }

    if (error.code === 'P2025') {
      return NextResponse.json({
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      }, { status: 404 });
    }
  }

  // Unknown errors - don't leak details in production
  const isDev = process.env.NODE_ENV === 'development';

  return NextResponse.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev && error instanceof Error ? error.message : 'Something went wrong',
    },
  }, { status: 500 });
}
```

---

## 8. Deployment Architecture

### 8.1 Docker Production Setup

```dockerfile
# docker/production/Dockerfile

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/
COPY packages/email-templates/package.json ./packages/email-templates/
COPY packages/pdf-templates/package.json ./packages/pdf-templates/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN pnpm --filter @quotecraft/database db:generate

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built application
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy Prisma
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start server
CMD ["node", "apps/web/server.js"]
```

### 8.2 Docker Compose (Production)

```yaml
# docker/production/docker-compose.yml

version: '3.8'

services:
  app:
    build:
      context: ../..
      dockerfile: docker/production/Dockerfile
    restart: always
    environment:
      - DATABASE_URL=postgresql://quotecraft:${DB_PASSWORD}@postgres:5432/quotecraft
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.app.tls=true"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
    networks:
      - internal
      - web

  postgres:
    image: postgres:15-alpine
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      - POSTGRES_DB=quotecraft
      - POSTGRES_USER=quotecraft
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U quotecraft"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  traefik:
    image: traefik:v3.0
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./traefik/acme.json:/acme.json
    networks:
      - web

volumes:
  postgres_data:
  redis_data:

networks:
  internal:
  web:
    external: true
```

---

## 9. Monitoring Architecture

```typescript
// lib/monitoring/index.ts

import * as Sentry from '@sentry/nextjs';
import { logger } from '../logger';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});

// Custom metrics
export const metrics = {
  quoteCreated: () => {
    logger.info({ metric: 'quote_created' });
  },

  quoteSent: () => {
    logger.info({ metric: 'quote_sent' });
  },

  quoteAccepted: (value: number) => {
    logger.info({ metric: 'quote_accepted', value });
  },

  paymentReceived: (amount: number, method: string) => {
    logger.info({ metric: 'payment_received', amount, method });
  },

  pdfGenerated: (type: string, duration: number) => {
    logger.info({ metric: 'pdf_generated', type, duration });
  },

  emailSent: (type: string) => {
    logger.info({ metric: 'email_sent', type });
  },

  apiLatency: (endpoint: string, duration: number) => {
    logger.info({ metric: 'api_latency', endpoint, duration });
  },

  error: (code: string, context?: Record<string, unknown>) => {
    logger.error({ metric: 'error', code, ...context });
    Sentry.captureException(new Error(code), { extra: context });
  },
};
```
