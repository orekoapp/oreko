# QuoteCraft Code Capability Index

> Generated: 2026-01-30
>
> This document provides a comprehensive index of all code capabilities in the QuoteCraft codebase, including components, server actions, API routes, database models, hooks, and utilities.

---

## Table of Contents

1. [Components](#components)
2. [Server Actions](#server-actions)
3. [API Routes](#api-routes)
4. [Database Models](#database-models)
5. [Hooks](#hooks)
6. [Utilities](#utilities)
7. [Type Definitions](#type-definitions)

---

## Components

### UI Components (Shadcn/UI)

| Component | Location | Description |
|-----------|----------|-------------|
| `Accordion` | `components/ui/accordion.tsx` | Collapsible content sections |
| `AlertDialog` | `components/ui/alert-dialog.tsx` | Confirmation dialogs with actions |
| `Avatar` | `components/ui/avatar.tsx` | User avatar display with fallback |
| `Badge` | `components/ui/badge.tsx` | Status labels and tags |
| `Breadcrumb` | `components/ui/breadcrumb.tsx` | Navigation breadcrumbs |
| `Button` | `components/ui/button.tsx` | Primary interactive element |
| `Calendar` | `components/ui/calendar.tsx` | Date picker calendar component |
| `Card` | `components/ui/card.tsx` | Content container with header/footer |
| `Carousel` | `components/ui/carousel.tsx` | Image/content carousel slider |
| `Checkbox` | `components/ui/checkbox.tsx` | Boolean input control |
| `Collapsible` | `components/ui/collapsible.tsx` | Expandable/collapsible container |
| `Command` | `components/ui/command.tsx` | Command palette / search interface |
| `ContextMenu` | `components/ui/context-menu.tsx` | Right-click context menus |
| `DataTable` | `components/ui/data-table.tsx` | Advanced data table with sorting/filtering |
| `Dialog` | `components/ui/dialog.tsx` | Modal dialog windows |
| `Drawer` | `components/ui/drawer.tsx` | Side panel drawer |
| `DropdownMenu` | `components/ui/dropdown-menu.tsx` | Dropdown action menus |
| `Form` | `components/ui/form.tsx` | Form wrapper with react-hook-form integration |
| `HoverCard` | `components/ui/hover-card.tsx` | Hover-triggered popover |
| `Input` | `components/ui/input.tsx` | Text input field |
| `Label` | `components/ui/label.tsx` | Form field labels |
| `Menubar` | `components/ui/menubar.tsx` | Horizontal menu bar |
| `NavigationMenu` | `components/ui/navigation-menu.tsx` | Complex navigation menus |
| `Pagination` | `components/ui/pagination.tsx` | Page navigation controls |
| `Popover` | `components/ui/popover.tsx` | Click-triggered popover |
| `Progress` | `components/ui/progress.tsx` | Progress bar indicator |
| `RadioGroup` | `components/ui/radio-group.tsx` | Single-select radio options |
| `ResizablePanel` | `components/ui/resizable.tsx` | Resizable panel layouts |
| `ScrollArea` | `components/ui/scroll-area.tsx` | Custom scrollable container |
| `Select` | `components/ui/select.tsx` | Dropdown select input |
| `Separator` | `components/ui/separator.tsx` | Visual divider |
| `Sheet` | `components/ui/sheet.tsx` | Slide-out panel |
| `Skeleton` | `components/ui/skeleton.tsx` | Loading placeholder |
| `Slider` | `components/ui/slider.tsx` | Range slider input |
| `Sonner` | `components/ui/sonner.tsx` | Toast notification system |
| `Switch` | `components/ui/switch.tsx` | Toggle switch control |
| `Table` | `components/ui/table.tsx` | Data table display |
| `Tabs` | `components/ui/tabs.tsx` | Tabbed content navigation |
| `Textarea` | `components/ui/textarea.tsx` | Multi-line text input |
| `Toast` | `components/ui/toast.tsx` | Notification toasts |
| `Toggle` | `components/ui/toggle.tsx` | Toggle button |
| `ToggleGroup` | `components/ui/toggle-group.tsx` | Group of toggle buttons |
| `Tooltip` | `components/ui/tooltip.tsx` | Hover tooltips |

### Quote Builder Components

| Component | Location | Description |
|-----------|----------|-------------|
| `QuoteBuilder` | `components/quotes/builder/QuoteBuilder.tsx` | Main visual quote builder interface |
| `QuoteBlockRenderer` | `components/quotes/builder/QuoteBlockRenderer.tsx` | Renders individual quote blocks |
| `QuoteBlockToolbar` | `components/quotes/builder/QuoteBlockToolbar.tsx` | Block editing toolbar |
| `QuoteDragHandle` | `components/quotes/builder/QuoteDragHandle.tsx` | Drag-and-drop handle for blocks |
| `QuotePreview` | `components/quotes/builder/QuotePreview.tsx` | Quote document preview |
| `TextBlock` | `components/quotes/blocks/TextBlock.tsx` | Rich text content block |
| `LineItemsBlock` | `components/quotes/blocks/LineItemsBlock.tsx` | Services/products line items |
| `ImageBlock` | `components/quotes/blocks/ImageBlock.tsx` | Image content block |
| `DividerBlock` | `components/quotes/blocks/DividerBlock.tsx` | Visual separator block |
| `SignatureBlock` | `components/quotes/blocks/SignatureBlock.tsx` | E-signature capture block |

### Quote Management Components

| Component | Location | Description |
|-----------|----------|-------------|
| `QuoteList` | `components/quotes/QuoteList.tsx` | Quote listing with filters |
| `QuoteCard` | `components/quotes/QuoteCard.tsx` | Quote summary card |
| `QuoteStatusBadge` | `components/quotes/QuoteStatusBadge.tsx` | Quote status indicator |
| `QuoteFilters` | `components/quotes/QuoteFilters.tsx` | Quote filtering controls |
| `QuoteActions` | `components/quotes/QuoteActions.tsx` | Quote action buttons (send, duplicate, etc.) |
| `QuoteSendDialog` | `components/quotes/QuoteSendDialog.tsx` | Send quote to client dialog |

### Invoice Components

| Component | Location | Description |
|-----------|----------|-------------|
| `InvoiceList` | `components/invoices/InvoiceList.tsx` | Invoice listing with filters |
| `InvoiceCard` | `components/invoices/InvoiceCard.tsx` | Invoice summary card |
| `InvoiceStatusBadge` | `components/invoices/InvoiceStatusBadge.tsx` | Invoice status indicator |
| `InvoiceFilters` | `components/invoices/InvoiceFilters.tsx` | Invoice filtering controls |
| `InvoiceActions` | `components/invoices/InvoiceActions.tsx` | Invoice action buttons |
| `InvoiceSendDialog` | `components/invoices/InvoiceSendDialog.tsx` | Send invoice to client dialog |
| `PaymentHistory` | `components/invoices/PaymentHistory.tsx` | Payment history table |

### Client Components

| Component | Location | Description |
|-----------|----------|-------------|
| `ClientList` | `components/clients/ClientList.tsx` | Client listing with search |
| `ClientCard` | `components/clients/ClientCard.tsx` | Client summary card |
| `ClientForm` | `components/clients/ClientForm.tsx` | Client create/edit form |
| `ClientSelector` | `components/clients/ClientSelector.tsx` | Client dropdown selector |
| `ClientDetails` | `components/clients/ClientDetails.tsx` | Full client details view |

### Rate Card Components

| Component | Location | Description |
|-----------|----------|-------------|
| `RateCardList` | `components/rate-cards/RateCardList.tsx` | Rate card listing |
| `RateCardForm` | `components/rate-cards/RateCardForm.tsx` | Rate card create/edit form |
| `RateCardSelector` | `components/rate-cards/RateCardSelector.tsx` | Rate card dropdown selector |
| `CategoryManager` | `components/rate-cards/CategoryManager.tsx` | Rate card category management |

### Contract Components

| Component | Location | Description |
|-----------|----------|-------------|
| `ContractTemplateList` | `components/contracts/ContractTemplateList.tsx` | Contract template listing |
| `ContractEditor` | `components/contracts/ContractEditor.tsx` | Contract content editor |
| `ContractPreview` | `components/contracts/ContractPreview.tsx` | Contract document preview |
| `ContractSignature` | `components/contracts/ContractSignature.tsx` | Contract e-signature component |

### Dashboard Components

| Component | Location | Description |
|-----------|----------|-------------|
| `DashboardStats` | `components/dashboard/DashboardStats.tsx` | Key metrics cards |
| `RevenueChart` | `components/dashboard/RevenueChart.tsx` | Revenue over time chart |
| `QuoteStatusChart` | `components/dashboard/QuoteStatusChart.tsx` | Quote status distribution |
| `RecentActivity` | `components/dashboard/RecentActivity.tsx` | Activity feed |
| `QuickActions` | `components/dashboard/QuickActions.tsx` | Quick action buttons |

### Settings Components

| Component | Location | Description |
|-----------|----------|-------------|
| `BusinessProfileForm` | `components/settings/BusinessProfileForm.tsx` | Business profile settings |
| `BrandingSettings` | `components/settings/BrandingSettings.tsx` | Logo, colors configuration |
| `EmailTemplateEditor` | `components/settings/EmailTemplateEditor.tsx` | Email template customization |
| `PaymentSettings` | `components/settings/PaymentSettings.tsx` | Stripe Connect setup |
| `TaxRateManager` | `components/settings/TaxRateManager.tsx` | Tax rate configuration |

### Shared Components

| Component | Location | Description |
|-----------|----------|-------------|
| `PageHeader` | `components/shared/PageHeader.tsx` | Page title and actions header |
| `EmptyState` | `components/shared/EmptyState.tsx` | Empty data placeholder |
| `LoadingSpinner` | `components/shared/LoadingSpinner.tsx` | Loading indicator |
| `ErrorBoundary` | `components/shared/ErrorBoundary.tsx` | Error handling wrapper |
| `Sidebar` | `components/shared/Sidebar.tsx` | Main navigation sidebar |
| `UserNav` | `components/shared/UserNav.tsx` | User account dropdown |
| `SearchCommand` | `components/shared/SearchCommand.tsx` | Global search command palette |
| `ThemeToggle` | `components/shared/ThemeToggle.tsx` | Dark/light mode toggle |

### Client Portal Components

| Component | Location | Description |
|-----------|----------|-------------|
| `QuoteViewer` | `components/portal/QuoteViewer.tsx` | Public quote viewing page |
| `InvoiceViewer` | `components/portal/InvoiceViewer.tsx` | Public invoice viewing page |
| `ContractViewer` | `components/portal/ContractViewer.tsx` | Public contract viewing page |
| `SignaturePad` | `components/portal/SignaturePad.tsx` | E-signature drawing pad |
| `PaymentForm` | `components/portal/PaymentForm.tsx` | Stripe payment form |
| `DeclineQuoteDialog` | `components/portal/DeclineQuoteDialog.tsx` | Quote decline with reason |

---

## Server Actions

### Quote Actions (`lib/quotes/actions.ts`)

| Function | Description |
|----------|-------------|
| `getQuotes(filter)` | Get paginated quotes with filtering |
| `getQuoteById(id)` | Get single quote by ID |
| `createQuote(input)` | Create a new quote |
| `updateQuote(id, input)` | Update an existing quote |
| `deleteQuote(id)` | Soft delete a quote |
| `duplicateQuote(id)` | Create a copy of a quote |
| `sendQuote(id)` | Send quote to client via email |
| `convertToInvoice(id)` | Convert accepted quote to invoice |
| `getQuoteNumber(workspaceId)` | Generate next quote number |

### Quote Portal Actions (`lib/quotes/portal-actions.ts`)

| Function | Description |
|----------|-------------|
| `getQuoteByAccessToken(token)` | Get public quote data by access token |
| `trackQuoteView(token)` | Track client viewing a quote |
| `acceptQuote(data)` | Accept quote with signature |
| `declineQuote(data)` | Decline quote with optional reason |

### Invoice Actions (`lib/invoices/actions.ts`)

| Function | Description |
|----------|-------------|
| `getInvoices(filter)` | Get paginated invoices with filtering |
| `getInvoiceById(id)` | Get single invoice by ID |
| `createInvoice(input)` | Create a new invoice |
| `updateInvoice(id, input)` | Update an existing invoice |
| `deleteInvoice(id)` | Soft delete an invoice |
| `duplicateInvoice(id)` | Create a copy of an invoice |
| `sendInvoice(id)` | Send invoice to client via email |
| `markAsPaid(id, paymentData)` | Record manual payment |
| `voidInvoice(id)` | Void an invoice |
| `getInvoiceNumber(workspaceId)` | Generate next invoice number |

### Invoice Portal Actions (`lib/invoices/portal-actions.ts`)

| Function | Description |
|----------|-------------|
| `getInvoiceByAccessToken(token)` | Get public invoice data by access token |
| `trackInvoiceView(token)` | Track client viewing an invoice |

### Client Actions (`lib/clients/actions.ts`)

| Function | Description |
|----------|-------------|
| `getClients(filter)` | Get paginated clients with search |
| `getClientById(id)` | Get single client by ID |
| `createClient(input)` | Create a new client |
| `updateClient(id, input)` | Update client details |
| `deleteClient(id)` | Soft delete a client |
| `getClientStats(id)` | Get client's quote/invoice statistics |

### Rate Card Actions (`lib/rate-cards/actions.ts`)

| Function | Description |
|----------|-------------|
| `getRateCards(filter)` | Get rate cards with filtering |
| `getRateCardById(id)` | Get single rate card by ID |
| `createRateCard(input)` | Create a new rate card |
| `updateRateCard(id, input)` | Update rate card details |
| `deleteRateCard(id)` | Soft delete a rate card |
| `getCategories()` | Get rate card categories |
| `createCategory(input)` | Create a new category |
| `updateCategory(id, input)` | Update category details |
| `deleteCategory(id)` | Delete a category |

### Contract Actions (`lib/contracts/actions.ts`)

| Function | Description |
|----------|-------------|
| `getContractTemplates(filter)` | Get contract templates |
| `getContractTemplateById(id)` | Get single template by ID |
| `createContractTemplate(input)` | Create a new contract template |
| `updateContractTemplate(input)` | Update contract template |
| `deleteContractTemplate(id)` | Soft delete contract template |
| `duplicateContractTemplate(id)` | Duplicate a contract template |
| `getContractInstances(filter)` | Get contract instances |
| `getContractInstanceById(id)` | Get single instance by ID |
| `getContractInstanceByToken(token)` | Get contract by public token |
| `createContractInstance(input)` | Create contract from template |
| `sendContractInstance(id)` | Send contract to client |
| `signContract(input, ipAddress)` | Sign a contract (public) |
| `deleteContractInstance(id)` | Delete contract instance |

### Dashboard Actions (`lib/dashboard/actions.ts`)

| Function | Description |
|----------|-------------|
| `getDashboardData()` | Get all dashboard data |
| `getDashboardStats()` | Get key business metrics |
| `getQuoteStatusCounts()` | Get quote status distribution |
| `getInvoiceStatusCounts()` | Get invoice status distribution |
| `getRevenueData(period)` | Get revenue over time data |
| `getRecentQuotes(limit)` | Get recent quotes |
| `getRecentInvoices(limit)` | Get recent invoices |
| `getRecentActivity(limit)` | Get recent activity feed |

### Settings Actions (`lib/settings/actions.ts`)

| Function | Description |
|----------|-------------|
| `getBusinessProfile()` | Get workspace business profile |
| `updateBusinessProfile(input)` | Update business profile |
| `getBrandingSettings()` | Get branding configuration |
| `updateBrandingSettings(input)` | Update branding settings |
| `getTaxRates()` | Get tax rates |
| `createTaxRate(input)` | Create a new tax rate |
| `updateTaxRate(id, input)` | Update tax rate |
| `deleteTaxRate(id)` | Delete tax rate |
| `getDefaultTerms()` | Get default quote/invoice terms |
| `updateDefaultTerms(input)` | Update default terms |

### Email Actions (`lib/email/actions.ts`)

| Function | Description |
|----------|-------------|
| `getEmailTemplates(filter)` | Get email templates |
| `getEmailTemplateById(id)` | Get single template by ID |
| `getActiveTemplateByType(type)` | Get active template for type |
| `createEmailTemplate(input)` | Create email template |
| `updateEmailTemplate(input)` | Update email template |
| `deleteEmailTemplate(id)` | Delete email template |
| `sendTemplatedEmail(params)` | Send email using template |
| `getScheduledEmails(filter)` | Get scheduled emails |
| `cancelScheduledEmail(id)` | Cancel a scheduled email |
| `sendContractSentEmail(params)` | Send contract sent notification |
| `sendContractSignedEmail(params)` | Send contract signed notification |

### Payment Actions (`lib/payments/actions.ts`)

| Function | Description |
|----------|-------------|
| `getPaymentSettings()` | Get workspace payment settings |
| `updatePaymentSettings(data)` | Update payment configuration |
| `createStripeOnboardingLink()` | Create Stripe Connect onboarding URL |
| `checkStripeAccountStatus()` | Check Stripe Connect status |
| `createInvoicePaymentIntent(invoiceId, amount)` | Create Stripe payment intent |
| `getPayments(filter)` | Get payment records |
| `getPaymentById(id)` | Get single payment by ID |
| `processPaymentWebhook(paymentIntentId, status, chargeId, receiptUrl)` | Process Stripe webhook |

### PDF Actions (`lib/pdf/actions.ts`)

| Function | Description |
|----------|-------------|
| `getQuotePdfData(quoteId)` | Get quote data for PDF generation |
| `getQuotePdfDataByToken(token)` | Get quote PDF data by public token |
| `getInvoicePdfData(invoiceId)` | Get invoice data for PDF generation |
| `getInvoicePdfDataByToken(token)` | Get invoice PDF data by public token |

### Onboarding Actions (`lib/onboarding/actions.ts`)

| Function | Description |
|----------|-------------|
| `getOnboardingProgress()` | Get user's onboarding progress |
| `completeOnboarding()` | Mark onboarding as complete |
| `skipOnboardingStep(step)` | Skip a specific onboarding step |
| `needsOnboarding()` | Check if user needs onboarding |

---

## API Routes

### Authentication Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]/route.ts` | GET, POST | NextAuth.js authentication handlers |
| `/api/auth/register` | POST | User registration endpoint |

### Webhook Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/webhooks/stripe` | POST | Stripe payment webhook handler |

### PDF Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/pdf/quote/[quoteId]` | GET | Generate quote PDF HTML |
| `/api/pdf/invoice/[invoiceId]` | GET | Generate invoice PDF HTML |

### Checkout Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/checkout/invoice/[invoiceId]` | POST | Create invoice payment intent |

---

## Database Models

### User & Authentication

| Model | Description | Key Relationships |
|-------|-------------|-------------------|
| `User` | User accounts | has many WorkspaceMembers |
| `Account` | OAuth accounts (NextAuth) | belongs to User |
| `Session` | User sessions (NextAuth) | belongs to User |
| `VerificationToken` | Email verification tokens | - |

### Workspace & Organization

| Model | Description | Key Relationships |
|-------|-------------|-------------------|
| `Workspace` | Business workspace/organization | has one BusinessProfile, BrandingSettings, PaymentSettings |
| `WorkspaceMember` | User-workspace membership | belongs to User, Workspace |
| `BusinessProfile` | Business details (name, logo, contact) | belongs to Workspace |
| `BrandingSettings` | Visual branding (colors, logo) | belongs to Workspace |
| `PaymentSettings` | Stripe Connect configuration | belongs to Workspace |

### Clients

| Model | Description | Key Relationships |
|-------|-------------|-------------------|
| `Client` | Client/customer records | belongs to Workspace, has many Quotes, Invoices |

### Rate Cards & Pricing

| Model | Description | Key Relationships |
|-------|-------------|-------------------|
| `RateCardCategory` | Rate card categories | belongs to Workspace, has many RateCards |
| `RateCard` | Reusable pricing items | belongs to Workspace, Category, TaxRate |
| `TaxRate` | Tax rate definitions | belongs to Workspace |

### Quotes

| Model | Description | Key Relationships |
|-------|-------------|-------------------|
| `Quote` | Quote documents | belongs to Client, Workspace, has many QuoteLineItems, QuoteEvents |
| `QuoteLineItem` | Quote line items/services | belongs to Quote, RateCard |
| `QuoteEvent` | Quote activity log | belongs to Quote |

### Invoices & Payments

| Model | Description | Key Relationships |
|-------|-------------|-------------------|
| `Invoice` | Invoice documents | belongs to Client, Workspace, Quote (optional), has many InvoiceLineItems, Payments, InvoiceEvents |
| `InvoiceLineItem` | Invoice line items | belongs to Invoice, RateCard |
| `InvoiceEvent` | Invoice activity log | belongs to Invoice |
| `Payment` | Payment records | belongs to Invoice |

### Contracts

| Model | Description | Key Relationships |
|-------|-------------|-------------------|
| `Contract` | Contract templates | belongs to Workspace, has many ContractInstances |
| `ContractInstance` | Signed contract instances | belongs to Contract, Client, Workspace, Quote (optional) |

### Email

| Model | Description | Key Relationships |
|-------|-------------|-------------------|
| `EmailTemplate` | Customizable email templates | belongs to Workspace |
| `ScheduledEmail` | Scheduled email queue | belongs to Workspace |

---

## Hooks

### Quote Hooks (`lib/quotes/hooks.ts`)

| Hook | Description |
|------|-------------|
| `useAutoSave(quoteId, debounceMs)` | Auto-saves quote document with debouncing |
| `useBuilderKeyboardShortcuts()` | Handles keyboard shortcuts in quote builder (undo, redo, delete, duplicate, preview) |

### Toast Hook (`hooks/use-toast.ts`)

| Hook | Description |
|------|-------------|
| `useToast()` | Toast notification state and methods (toast, dismiss) |
| `toast(props)` | Show a toast notification |

---

## Utilities

### Core Utilities (`lib/utils.ts`)

| Function | Description |
|----------|-------------|
| `cn(...inputs)` | Tailwind class name merger |
| `formatCurrency(amount, currency, locale)` | Format number as currency |
| `formatDate(date, formatStr)` | Format date with custom format |
| `formatDateTime(date)` | Format date with time |
| `formatRelativeTime(date)` | Format as relative time (e.g., "2 days ago") |
| `formatNumber(value, options)` | Format number with locale |
| `formatPercentage(value, decimals)` | Format as percentage |
| `slugify(text)` | Convert text to URL-safe slug |
| `truncate(text, maxLength)` | Truncate text with ellipsis |
| `generateInitials(name)` | Generate initials from name |
| `isValidEmail(email)` | Validate email format |
| `delay(ms)` | Promise-based delay |
| `capitalizeFirst(text)` | Capitalize first letter |

### Package Utilities (`packages/utils/src/format.ts`)

| Function | Description |
|----------|-------------|
| `formatCurrency(amount, currency, locale)` | Format number as currency |
| `formatNumber(value, locale)` | Format with thousand separators |
| `formatDate(date, formatString)` | Format date string or object |
| `formatRelativeTime(date)` | Format as relative time |
| `formatPercentage(value, decimals)` | Format as percentage |
| `formatFileSize(bytes)` | Format bytes as human-readable size |
| `formatPhoneNumber(phone)` | Format US phone number |
| `formatDocumentNumber(value, prefix, suffix, padding)` | Generate padded document number |

### Validation Utilities (`packages/utils/src/validation.ts`)

| Schema/Function | Description |
|-----------------|-------------|
| `emailSchema` | Zod email validation schema |
| `passwordSchema` | Password validation (8+ chars, uppercase, lowercase, number) |
| `phoneSchema` | Phone number validation |
| `urlSchema` | URL validation |
| `slugSchema` | URL-safe slug validation |
| `currencyCodeSchema` | ISO 4217 currency code validation |
| `moneySchema` | Positive decimal money amount validation |
| `percentageSchema` | 0-100 percentage validation |
| `uuidSchema` | UUID format validation |
| `addressSchema` | Address object validation |
| `isValidEmail(email)` | Check if email is valid |
| `isValidUrl(url)` | Check if URL is valid |
| `isValidUuid(uuid)` | Check if UUID is valid |

---

## Type Definitions

### Core Types (`packages/types/src/models.ts`)

| Type | Description |
|------|-------------|
| `BaseModel` | Base interface with id, createdAt, updatedAt |
| `SoftDeletable` | Interface for soft-deletable models |
| `Address` | Address structure (line1, line2, city, state, postalCode, country) |
| `User` | User account type |
| `Workspace` | Workspace/organization type |
| `WorkspaceSettings` | Workspace configuration options |
| `WorkspaceMember` | User-workspace membership |
| `BusinessProfile` | Business details type |
| `Client` | Client record type |
| `RateCard` | Rate card type |
| `QuoteStatus` | Quote status enum |
| `Quote` | Quote document type |
| `QuoteSettings` | Quote configuration options |
| `QuoteLineItem` | Quote line item type |
| `SignatureData` | E-signature capture data |
| `InvoiceStatus` | Invoice status enum |
| `Invoice` | Invoice document type |
| `InvoiceSettings` | Invoice configuration options |
| `InvoiceLineItem` | Invoice line item type |
| `PaymentStatus` | Payment status enum |
| `Payment` | Payment record type |
| `TaxRate` | Tax rate configuration |

### Quote Types (`lib/quotes/types.ts`)

- `QuoteBlock`, `QuoteDocument` - Visual builder block types
- `QuoteListItem`, `QuoteDetail` - API response types
- `CreateQuoteInput`, `UpdateQuoteInput` - Form input types
- `QuoteFilter` - Filter/search parameters

### Invoice Types (`lib/invoices/types.ts`)

- `InvoiceLineItem`, `InvoiceListItem`, `InvoiceDetail`
- `CreateInvoiceInput`, `UpdateInvoiceInput`
- `InvoiceFilter`

### Dashboard Types (`lib/dashboard/types.ts`)

- `DashboardStats`, `QuoteStatusCounts`, `InvoiceStatusCounts`
- `RevenueDataPoint`, `ActivityItem`
- `RecentQuote`, `RecentInvoice`
- `DashboardData`, `DashboardPeriod`

### Portal Types

- `PublicQuoteData` - Public-facing quote data
- `PublicInvoiceData` - Public-facing invoice data

---

## File Organization

```
apps/web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── clients/              # Client management
│   │   ├── contracts/            # Contract management
│   │   ├── invoices/             # Invoice management
│   │   ├── quotes/               # Quote management
│   │   ├── rate-cards/           # Rate card management
│   │   ├── settings/             # Settings pages
│   │   └── templates/            # Contract templates
│   ├── api/                      # API routes
│   ├── c/[token]/                # Public contract view
│   ├── i/[token]/                # Public invoice view
│   └── q/[token]/                # Public quote view
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── quotes/                   # Quote components
│   ├── invoices/                 # Invoice components
│   ├── clients/                  # Client components
│   ├── contracts/                # Contract components
│   ├── dashboard/                # Dashboard components
│   ├── settings/                 # Settings components
│   ├── portal/                   # Client portal components
│   └── shared/                   # Shared components
├── hooks/                        # React hooks
└── lib/
    ├── auth/                     # Authentication utilities
    ├── clients/                  # Client actions and types
    ├── contracts/                # Contract actions and types
    ├── dashboard/                # Dashboard actions and types
    ├── email/                    # Email actions and types
    ├── invoices/                 # Invoice actions and types
    ├── onboarding/               # Onboarding actions and types
    ├── payments/                 # Payment actions and types
    ├── pdf/                      # PDF generation
    ├── quotes/                   # Quote actions, types, hooks
    ├── rate-cards/               # Rate card actions and types
    ├── services/                 # External service integrations
    ├── settings/                 # Settings actions and types
    ├── stores/                   # Zustand stores
    └── utils.ts                  # Core utilities

packages/
├── database/                     # Prisma schema and client
├── types/                        # Shared TypeScript types
├── utils/                        # Shared utilities
└── email-templates/              # Email templates (React Email)
```

---

*Last updated: 2026-01-30*
