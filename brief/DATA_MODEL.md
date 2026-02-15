# Data Model Specifications

This document outlines the database schema requirements to support the features described in the brief.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Client    │       │   Project   │       │    Quote    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │───┐   │ id          │
│ name        │   │   │ clientId    │◄──┘   │ projectId   │◄──┐
│ email       │   │   │ name        │   │   │ quoteNumber │   │
│ company     │   └──►│ description │   │   │ status      │   │
│ ...         │       │ ...         │   │   │ total       │   │
└─────────────┘       └─────────────┘   │   │ expiryDate  │   │
                                        │   │ invoiceId   │───┼───┐
                                        │   └─────────────┘   │   │
                                        │                     │   │
                                        │   ┌─────────────┐   │   │
                                        │   │   Invoice   │   │   │
                                        │   ├─────────────┤   │   │
                                        │   │ id          │◄──┼───┘
                                        └──►│ projectId   │   │
                                            │ quoteId     │◄──┘
                                            │ invoiceNo   │
                                            │ status      │
                                            │ amount      │
                                            │ paidAt      │
                                            └─────────────┘
```

---

## Schema Updates Required

### 1. Quote Status Enum

```prisma
enum QuoteStatus {
  DRAFT
  SENT
  EXPIRED
  ACCEPTED
}
```

### 2. Invoice Status Enum

```prisma
enum InvoiceStatus {
  PENDING
  PAID
  OVERDUE
  PARTIAL
}
```

### 3. Quote Model Updates

```prisma
model Quote {
  id            String      @id @default(cuid())
  quoteNumber   String      @unique  // Format: QT-XXX

  // Relationships
  projectId     String
  project       Project     @relation(fields: [projectId], references: [id])
  clientId      String
  client        Client      @relation(fields: [clientId], references: [id])

  // Status tracking
  status        QuoteStatus @default(DRAFT)
  sentAt        DateTime?
  acceptedAt    DateTime?
  expiredAt     DateTime?

  // Financial
  subtotal      Decimal     @db.Decimal(10, 2)
  taxRate       Decimal     @db.Decimal(5, 2) @default(0)
  taxAmount     Decimal     @db.Decimal(10, 2)
  total         Decimal     @db.Decimal(10, 2)

  // Dates
  expiryDate    DateTime
  validDays     Int         @default(30)

  // Conversion link
  invoiceId     String?     @unique
  invoice       Invoice?    @relation("QuoteToInvoice", fields: [invoiceId], references: [id])

  // Line items
  items         QuoteItem[]

  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([projectId])
  @@index([clientId])
  @@index([status])
}
```

### 4. Invoice Model Updates

```prisma
model Invoice {
  id            String        @id @default(cuid())
  invoiceNumber String        @unique  // Format: INV-XXX

  // Relationships
  projectId     String
  project       Project       @relation(fields: [projectId], references: [id])
  clientId      String
  client        Client        @relation(fields: [clientId], references: [id])

  // Source quote link (optional - invoices can be standalone)
  sourceQuote   Quote?        @relation("QuoteToInvoice")

  // Status tracking
  status        InvoiceStatus @default(PENDING)
  issuedAt      DateTime      @default(now())
  dueDate       DateTime
  paidAt        DateTime?

  // Financial
  subtotal      Decimal       @db.Decimal(10, 2)
  taxRate       Decimal       @db.Decimal(5, 2) @default(0)
  taxAmount     Decimal       @db.Decimal(10, 2)
  total         Decimal       @db.Decimal(10, 2)
  amountPaid    Decimal       @db.Decimal(10, 2) @default(0)
  balanceDue    Decimal       @db.Decimal(10, 2)

  // Line items
  items         InvoiceItem[]

  // Payments
  payments      Payment[]

  // Timestamps
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([projectId])
  @@index([clientId])
  @@index([status])
  @@index([dueDate])
}
```

### 5. Project Model (Container)

```prisma
model Project {
  id          String    @id @default(cuid())
  name        String
  description String?

  // Relationships
  clientId    String
  client      Client    @relation(fields: [clientId], references: [id])

  // Child entities
  quotes      Quote[]
  invoices    Invoice[]
  contracts   Contract[]

  // Status
  isActive    Boolean   @default(true)

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([clientId])
}
```

---

## Analytics Query Requirements

### 1. Quote Conversion Rate
```sql
SELECT
  COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END)::float /
  NULLIF(COUNT(CASE WHEN status IN ('SENT', 'ACCEPTED', 'EXPIRED') THEN 1 END), 0) * 100
  AS conversion_rate
FROM quotes
WHERE created_at >= :start_date AND created_at <= :end_date;
```

### 2. Accounts Receivable Aging
```sql
SELECT
  CASE
    WHEN CURRENT_DATE - due_date <= 30 THEN '0-30'
    WHEN CURRENT_DATE - due_date <= 60 THEN '31-60'
    ELSE '60+'
  END AS aging_bucket,
  SUM(balance_due) AS total_outstanding
FROM invoices
WHERE status IN ('PENDING', 'OVERDUE', 'PARTIAL')
GROUP BY aging_bucket;
```

### 3. Revenue by Client
```sql
SELECT
  c.id,
  c.name,
  c.email,
  SUM(i.amount_paid) AS total_revenue
FROM clients c
JOIN invoices i ON i.client_id = c.id
WHERE i.status = 'PAID'
GROUP BY c.id
ORDER BY total_revenue DESC
LIMIT 10;
```

### 4. Average Days to Pay (by Client)
```sql
SELECT
  c.id,
  c.name,
  AVG(EXTRACT(DAY FROM i.paid_at - i.issued_at)) AS avg_days_to_pay
FROM clients c
JOIN invoices i ON i.client_id = c.id
WHERE i.status = 'PAID' AND i.paid_at IS NOT NULL
GROUP BY c.id;
```

### 5. Top Services/Products
```sql
SELECT
  item_name,
  COUNT(*) AS usage_count,
  SUM(amount) AS total_revenue
FROM (
  SELECT name AS item_name, amount FROM quote_items
  UNION ALL
  SELECT name AS item_name, amount FROM invoice_items
) items
GROUP BY item_name
ORDER BY usage_count DESC
LIMIT 10;
```

---

## Indexes for Performance

```prisma
// Add to Quote model
@@index([status, createdAt])        // For status filtering with date range
@@index([clientId, status])         // For client-specific quote queries

// Add to Invoice model
@@index([status, dueDate])          // For AR aging queries
@@index([clientId, paidAt])         // For client revenue queries
@@index([issuedAt])                 // For date range queries

// Add to QuoteItem/InvoiceItem
@@index([name])                     // For top services query
```

---

## Migration Considerations

1. **Existing Data**: If quotes/invoices exist without status, default to `DRAFT`/`PENDING`
2. **Quote Numbers**: Generate sequential format `QT-001`, `QT-002`, etc.
3. **Invoice Numbers**: Generate sequential format `INV-001`, `INV-002`, etc.
4. **Project Migration**: Existing quotes/invoices may need a default project created
