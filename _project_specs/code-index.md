# QuoteCraft Code Capability Index

> Auto-generated: 2026-02-13
> Total Files: 414 TypeScript/TSX | LOC: ~72,125 | React Components: 228

---

## Table of Contents

1. [Server Actions](#server-actions)
2. [React Components](#react-components)
3. [API Routes](#api-routes)
4. [Custom Hooks](#custom-hooks)
5. [Stores (Zustand)](#stores)
6. [Validation Schemas (Zod)](#validation-schemas)
7. [Types & Models](#types--models)
8. [Utility Functions](#utility-functions)
9. [Services](#services)
10. [Database Models (Prisma)](#database-models)
11. [Page Routes](#page-routes)

---

## Server Actions

### Quotes (`/apps/web/lib/quotes/actions.ts`)

| Action | Description | Parameters |
|--------|-------------|------------|
| `getQuotes` | Get paginated quotes with filters | `filter?: QuoteFilter` |
| `getQuoteById` | Get single quote by ID | `id: string` |
| `createQuote` | Create new quote | `input: CreateQuoteInput` |
| `updateQuote` | Update existing quote | `input: UpdateQuoteInput` |
| `deleteQuote` | Soft delete quote | `id: string` |
| `duplicateQuote` | Duplicate existing quote | `id: string, newTitle?: string` |
| `sendQuote` | Send quote to client | `id: string` |
| `markQuoteViewed` | Mark quote as viewed | `token: string` |
| `acceptQuote` | Client accepts quote | `token: string, signatureData?: SignatureData` |
| `declineQuote` | Client declines quote | `token: string, reason?: string` |
| `getQuoteByToken` | Get quote for client portal | `token: string` |
| `getQuoteStats` | Get quote statistics | `void` |

### Invoices (`/apps/web/lib/invoices/actions.ts`)

| Action | Description | Parameters |
|--------|-------------|------------|
| `getInvoices` | Get paginated invoices with filters | `filter?: InvoiceFilter` |
| `getInvoiceById` | Get single invoice by ID | `id: string` |
| `createInvoice` | Create new invoice | `input: CreateInvoiceInput` |
| `updateInvoice` | Update existing invoice | `input: UpdateInvoiceInput` |
| `deleteInvoice` | Soft delete invoice | `id: string` |
| `sendInvoice` | Send invoice to client | `id: string` |
| `recordPayment` | Record payment on invoice | `input: RecordPaymentInput` |
| `voidInvoice` | Void an invoice | `id: string` |
| `convertQuoteToInvoice` | Convert accepted quote to invoice | `quoteId: string, options?: ConvertOptions` |
| `getInvoiceByToken` | Get invoice for client portal | `token: string` |
| `getInvoiceStats` | Get invoice statistics | `void` |

### Clients (`/apps/web/lib/clients/actions.ts`)

| Action | Description | Parameters |
|--------|-------------|------------|
| `getClients` | Get paginated clients with filters | `filter?: ClientFilter` |
| `getClientById` | Get single client by ID | `id: string` |
| `createClient` | Create new client | `input: CreateClientInput` |
| `updateClient` | Update existing client | `input: UpdateClientInput` |
| `deleteClient` | Soft delete client | `id: string` |
| `getClientQuotes` | Get quotes for a client | `clientId: string` |
| `getClientInvoices` | Get invoices for a client | `clientId: string` |
| `getClientStats` | Get client statistics | `void` |

### Rate Cards (`/apps/web/lib/rate-cards/actions.ts`)

| Action | Description | Parameters |
|--------|-------------|------------|
| `getRateCards` | Get paginated rate cards | `filter?: RateCardFilter` |
| `getRateCardById` | Get single rate card | `id: string` |
| `createRateCard` | Create new rate card | `input: CreateRateCardInput` |
| `updateRateCard` | Update existing rate card | `input: UpdateRateCardInput` |
| `deleteRateCard` | Soft delete rate card | `id: string` |
| `bulkDeleteRateCards` | Bulk delete rate cards | `ids: string[]` |
| `toggleRateCardActive` | Toggle active status | `id: string` |
| `duplicateRateCard` | Duplicate rate card | `id: string, newName?: string` |
| `getRateCardsForSelection` | Get active rate cards for picker | `categoryId?: string` |
| `getRateCardStats` | Get rate card statistics | `void` |
| `getCategories` | Get all categories | `void` |
| `createCategory` | Create category | `input: CreateCategoryInput` |
| `updateCategory` | Update category | `input: UpdateCategoryInput` |
| `deleteCategory` | Delete category | `id: string` |
| `reorderCategories` | Reorder categories | `categoryIds: string[]` |
| `importRateCards` | Import from CSV | `data: RateCardImportData[], options?: ImportOptions` |

### Contracts (`/apps/web/lib/contracts/actions.ts`)

| Action | Description | Parameters |
|--------|-------------|------------|
| `getContractTemplates` | Get contract templates | `filter?: ContractFilter` |
| `getContractTemplateById` | Get template by ID | `id: string` |
| `createContractTemplate` | Create template | `input: CreateContractTemplateInput` |
| `updateContractTemplate` | Update template | `input: UpdateContractTemplateInput` |
| `deleteContractTemplate` | Delete template | `id: string` |
| `duplicateContractTemplate` | Duplicate template | `id: string` |
| `getContractInstances` | Get contract instances | `filter?: ContractInstanceFilter` |
| `getContractInstanceById` | Get instance by ID | `id: string` |
| `getContractInstanceByToken` | Get instance for client portal | `token: string` |
| `createContractInstance` | Create instance from template | `input: CreateContractInstanceInput` |
| `sendContractInstance` | Send contract to client | `id: string` |
| `signContract` | Client signs contract | `input: SignContractInput, ipAddress?: string` |
| `deleteContractInstance` | Delete instance | `id: string` |

### Dashboard (`/apps/web/lib/dashboard/actions.ts`)

| Action | Description | Parameters |
|--------|-------------|------------|
| `getDashboardStats` | Get dashboard statistics | `void` |
| `getQuoteStatusCounts` | Get quote status breakdown | `void` |
| `getInvoiceStatusCounts` | Get invoice status breakdown | `void` |
| `getRevenueData` | Get revenue over time | `period?: DashboardPeriod` |
| `getRecentQuotes` | Get recent quotes | `limit?: number` |
| `getRecentInvoices` | Get recent invoices | `limit?: number` |
| `getRecentActivity` | Get activity feed | `limit?: number` |
| `getDashboardData` | Get all dashboard data | `void` |
| `getConversionFunnelData` | Get conversion funnel | `dateRange?: AnalyticsDateRange` |
| `getPaymentAgingData` | Get payment aging report | `void` |
| `getClientDistributionData` | Get client distribution | `limit?: number` |
| `getMonthlyComparisonData` | Get monthly comparison | `months?: number` |
| `getRevenueForecast` | Get revenue forecast | `historicalMonths?: number, forecastMonths?: number` |

### Settings (`/apps/web/lib/settings/actions.ts`)

| Action | Description | Parameters |
|--------|-------------|------------|
| `getWorkspace` | Get workspace data | `void` |
| `updateWorkspaceName` | Update workspace name | `name: string` |
| `getBusinessProfile` | Get business profile | `void` |
| `updateBusinessProfile` | Update business profile | `input: UpdateBusinessProfileInput` |
| `updateBusinessLogo` | Update logo | `logoUrl: string \| null` |
| `getBrandingSettings` | Get branding settings | `void` |
| `updateBrandingSettings` | Update branding | `input: UpdateBrandingSettingsInput` |
| `getPaymentSettings` | Get payment settings | `void` |
| `updatePaymentSettings` | Update payment settings | `input: UpdatePaymentSettingsInput` |
| `getTaxRates` | Get all tax rates | `void` |
| `createTaxRate` | Create tax rate | `input: CreateTaxRateInput` |
| `updateTaxRate` | Update tax rate | `input: UpdateTaxRateInput` |
| `deleteTaxRate` | Delete tax rate | `id: string` |
| `getNumberSequences` | Get number sequences | `void` |
| `updateNumberSequence` | Update number sequence | `input: UpdateNumberSequenceInput` |
| `getWorkspaceMembers` | Get team members | `void` |
| `getCurrentUserRole` | Get current user role | `void` |
| `updateMemberRole` | Update member role | `memberId: string, newRole: WorkspaceMemberRole` |
| `inviteMember` | Invite team member | `email: string, role?: WorkspaceMemberRole` |
| `removeMember` | Remove team member | `memberId: string` |
| `getBillingInfo` | Get billing info | `void` |
| `getWorkspaceSettings` | Get workspace settings | `void` |
| `updateWorkspaceSettings` | Update workspace settings | `input: { name?: string; slug?: string }` |
| `deleteWorkspace` | Delete workspace | `void` |
| `getAllSettings` | Get all settings | `void` |

---

## React Components

### UI Components (`/apps/web/components/ui/`) - 34 components

| Component | File | Description |
|-----------|------|-------------|
| `Accordion` | `accordion.tsx` | Collapsible content sections |
| `Alert` | `alert.tsx` | Alert messages |
| `AlertDialog` | `alert-dialog.tsx` | Confirmation dialogs |
| `Avatar` | `avatar.tsx` | User avatars |
| `Badge` | `badge.tsx` | Status badges |
| `Breadcrumb` | `breadcrumb.tsx` | Navigation breadcrumbs |
| `Button` | `button.tsx` | Button variants |
| `Calendar` | `calendar.tsx` | Date picker calendar |
| `Card` | `card.tsx` | Card container |
| `Checkbox` | `checkbox.tsx` | Checkbox input |
| `ColorPicker` | `color-picker.tsx` | Color selection |
| `DatePicker` | `date-picker.tsx` | Date picker |
| `Dialog` | `dialog.tsx` | Modal dialogs |
| `DropdownMenu` | `dropdown-menu.tsx` | Dropdown menus |
| `FileUpload` | `file-upload.tsx` | File upload component |
| `Input` | `input.tsx` | Text input |
| `Label` | `label.tsx` | Form labels |
| `Pagination` | `pagination.tsx` | Pagination controls |
| `Popover` | `popover.tsx` | Popover tooltips |
| `Progress` | `progress.tsx` | Progress bars |
| `ScrollArea` | `scroll-area.tsx` | Scrollable containers |
| `Select` | `select.tsx` | Select dropdowns |
| `Separator` | `separator.tsx` | Visual separators |
| `Sheet` | `sheet.tsx` | Side sheets |
| `Sidebar` | `sidebar.tsx` | Navigation sidebar |
| `Skeleton` | `skeleton.tsx` | Loading skeletons |
| `Slider` | `slider.tsx` | Range sliders |
| `Switch` | `switch.tsx` | Toggle switches |
| `Table` | `table.tsx` | Data tables |
| `Tabs` | `tabs.tsx` | Tab navigation |
| `Textarea` | `textarea.tsx` | Textarea input |
| `Toast` | `toast.tsx` | Toast notifications |
| `Toaster` | `toaster.tsx` | Toast container |
| `Tooltip` | `tooltip.tsx` | Tooltips |

### Dashboard Components (`/apps/web/components/dashboard/`)

| Component | File | Description |
|-----------|------|-------------|
| `AppHeader` | `app-header.tsx` | Main app header with user menu |
| `AppSidebar` | `app-sidebar.tsx` | Main navigation sidebar |
| `Header` | `header.tsx` | Dashboard header |
| `Nav` | `nav.tsx` | Navigation menu |
| `MobileNav` | `mobile-nav.tsx` | Mobile navigation |
| `StatsCards` | `stats-cards.tsx` | Statistics cards |
| `RecentActivity` | `recent-activity.tsx` | Activity feed |
| `RecentItems` | `recent-items.tsx` | Recent quotes/invoices |
| `AnalyticsSection` | `analytics-section.tsx` | Analytics wrapper |

### Quote Builder Components (`/apps/web/components/quotes/builder/`)

| Component | File | Description |
|-----------|------|-------------|
| `BlockRenderer` | `block-renderer.tsx` | Renders quote blocks |
| `BlocksPanel` | `blocks-panel.tsx` | Block type selector |
| `BuilderToolbar` | `builder-toolbar.tsx` | Builder toolbar |
| `DocumentCanvas` | `document-canvas.tsx` | Main canvas area |
| `PropertiesPanel` | `properties-panel.tsx` | Block properties editor |
| `RateCardPanel` | `rate-card-panel.tsx` | Rate card picker |

### Quote Block Components (`/apps/web/components/quotes/blocks/`)

| Component | File | Description |
|-----------|------|-------------|
| `ColumnsBlock` | `columns-block.tsx` | Two-column layout |
| `DividerBlock` | `divider-block.tsx` | Horizontal divider |
| `HeaderBlock` | `header-block.tsx` | Header/title block |
| `ImageBlock` | `image-block.tsx` | Image block |
| `ServiceGroupBlock` | `service-group-block.tsx` | Grouped services |
| `ServiceItemBlock` | `service-item-block.tsx` | Service line item |
| `SignatureBlock` | `signature-block.tsx` | Signature capture |
| `SpacerBlock` | `spacer-block.tsx` | Vertical spacing |
| `TableBlock` | `table-block.tsx` | Data table |
| `TextBlock` | `text-block.tsx` | Rich text |

### Quote Editor Components (`/apps/web/components/quotes/editor/`)

| Component | File | Description |
|-----------|------|-------------|
| `QuoteEditor` | `QuoteEditor.tsx` | Form-based quote editor |
| `DetailsSection` | `sections/DetailsSection.tsx` | Quote details form |
| `ItemsSection` | `sections/ItemsSection.tsx` | Line items editor |
| `NotesSection` | `sections/NotesSection.tsx` | Notes editor |
| `TermsSection` | `sections/TermsSection.tsx` | Terms editor |

### Client Components (`/apps/web/components/clients/`)

| Component | File | Description |
|-----------|------|-------------|
| `ClientList` | `client-list.tsx` | Client list with search/filter |
| `ClientDetail` | `client-detail.tsx` | Client detail view |
| `ClientForm` | `client-form.tsx` | Client create/edit form |

### Invoice Components (`/apps/web/components/invoices/`)

| Component | File | Description |
|-----------|------|-------------|
| `InvoiceActions` | `invoice-actions.tsx` | Invoice action buttons |
| `RecordPaymentDialog` | `record-payment-dialog.tsx` | Payment recording |

### Rate Card Components (`/apps/web/components/rate-cards/`)

| Component | File | Description |
|-----------|------|-------------|
| `RateCardList` | `rate-card-list.tsx` | Rate card list |
| `RateCardForm` | `rate-card-form.tsx` | Rate card form |
| `RateCardPicker` | `rate-card-picker.tsx` | Rate card selector |
| `CategoryManager` | `category-manager.tsx` | Category management |

### Contract Components (`/apps/web/components/contracts/`)

| Component | File | Description |
|-----------|------|-------------|
| `ContractEditor` | `contract-editor.tsx` | Contract content editor |
| `ContractTemplateList` | `contract-template-list.tsx` | Template list |
| `ContractTemplateForm` | `contract-template-form.tsx` | Template form |
| `ContractInstanceList` | `contract-instance-list.tsx` | Instance list |
| `CreateContractForm` | `create-contract-form.tsx` | Create instance form |
| `VariableManager` | `variable-manager.tsx` | Template variables |
| `SignaturePad` | `signature-pad.tsx` | Signature capture |

### Settings Components (`/apps/web/components/settings/`)

| Component | File | Description |
|-----------|------|-------------|
| `BusinessProfileForm` | `business-profile-form.tsx` | Business profile |
| `BrandingSettingsForm` | `branding-settings-form.tsx` | Branding settings |
| `TaxRatesManager` | `tax-rates-manager.tsx` | Tax rate management |
| `NumberSequenceForm` | `number-sequence-form.tsx` | Number sequences |
| `TeamMemberList` | `team-member-list.tsx` | Team members |
| `InviteMemberButton` | `invite-member-button.tsx` | Invite modal |
| `WorkspaceSettingsForm` | `workspace-settings-form.tsx` | Workspace settings |
| `DangerZone` | `danger-zone.tsx` | Destructive actions |

### Client Portal Components (`/apps/web/components/client-portal/`)

| Component | File | Description |
|-----------|------|-------------|
| `QuotePortalView` | `quote-portal-view.tsx` | Client quote view |
| `QuotePortalHeader` | `quote-portal-header.tsx` | Portal header |
| `QuotePortalSkeleton` | `quote-portal-skeleton.tsx` | Loading state |
| `QuoteBlockRenderer` | `quote-block-renderer.tsx` | Block rendering |
| `AcceptQuoteDialog` | `accept-quote-dialog.tsx` | Accept modal |
| `DeclineQuoteDialog` | `decline-quote-dialog.tsx` | Decline modal |
| `InvoicePortalView` | `invoice-portal-view.tsx` | Client invoice view |
| `InvoicePortalHeader` | `invoice-portal-header.tsx` | Portal header |
| `InvoicePortalSkeleton` | `invoice-portal-skeleton.tsx` | Loading state |
| `SignaturePad` | `signature-pad.tsx` | Signature capture |

### Landing Page Components (`/apps/web/components/landing/`)

| Component | File | Description |
|-----------|------|-------------|
| `HeroSection` | `hero-section.tsx` | Landing hero |
| `FeaturesSection` | `features-section.tsx` | Features showcase |
| `ProblemSection` | `problem-section.tsx` | Problem statement |
| `HowItWorks` | `how-it-works.tsx` | How it works |
| `PricingSection` | `pricing-section.tsx` | Pricing plans |
| `TestimonialsSection` | `testimonials-section.tsx` | Testimonials |
| `OpenSourceSection` | `open-source-section.tsx` | OSS benefits |
| `FaqSection` | `faq-section.tsx` | FAQ accordion |
| `FinalCtaSection` | `final-cta-section.tsx` | Final CTA |
| `MarketingHeader` | `marketing-header.tsx` | Marketing nav |
| `MarketingFooter` | `marketing-footer.tsx` | Marketing footer |

### Onboarding Components (`/apps/web/components/onboarding/`)

| Component | File | Description |
|-----------|------|-------------|
| `OnboardingWizard` | `onboarding-wizard.tsx` | Multi-step wizard |
| `BusinessStep` | `steps/business-step.tsx` | Business info step |
| `BrandingStep` | `steps/branding-step.tsx` | Branding step |
| `PaymentStep` | `steps/payment-step.tsx` | Payment setup |
| `CompleteStep` | `steps/complete-step.tsx` | Completion step |

### Email Components (`/apps/web/components/email/`)

| Component | File | Description |
|-----------|------|-------------|
| `EmailTemplateList` | `email-template-list.tsx` | Template list |
| `EmailTemplateForm` | `email-template-form.tsx` | Template editor |
| `ScheduledEmailList` | `scheduled-email-list.tsx` | Scheduled emails |

### Shared Components (`/apps/web/components/shared/`)

| Component | File | Description |
|-----------|------|-------------|
| `EmptyState` | `empty-state.tsx` | Empty state display |
| `ErrorBoundary` | `error-boundary.tsx` | Error boundary |
| `LoadingSkeletons` | `loading-skeletons.tsx` | Loading states |
| `PageContainer` | `page-container.tsx` | Page wrapper |
| `PageHeader` | `page-header.tsx` | Page headers |
| `SkipToContent` | `skip-to-content.tsx` | Accessibility |
| `ThemeToggle` | `theme-toggle.tsx` | Dark/light mode |

### Payment Components (`/apps/web/components/payments/`)

| Component | File | Description |
|-----------|------|-------------|
| `PaymentSettingsForm` | `payment-settings-form.tsx` | Stripe Connect settings |

---

## API Routes

### Authentication (`/apps/web/app/api/auth/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js handlers |
| `/api/auth/register` | POST | User registration |
| `/api/auth/forgot-password` | POST | Password reset request |
| `/api/auth/reset-password` | POST | Password reset |

### Resources

| Route | Method | Description |
|-------|--------|-------------|
| `/api/quotes` | GET/POST | List/create quotes |
| `/api/invoices` | GET/POST | List/create invoices |
| `/api/clients` | GET/POST | List/create clients |

### PDF Generation

| Route | Method | Description |
|-------|--------|-------------|
| `/api/pdf/quote/[quoteId]` | GET | Generate quote PDF |
| `/api/pdf/invoice/[invoiceId]` | GET | Generate invoice PDF |

### Downloads

| Route | Method | Description |
|-------|--------|-------------|
| `/api/download/quote/[quoteId]` | GET | Download quote PDF |
| `/api/download/invoice/[invoiceId]` | GET | Download invoice PDF |

### Payments

| Route | Method | Description |
|-------|--------|-------------|
| `/api/checkout/invoice/[invoiceId]` | POST | Create checkout session |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |

### System

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/cron/reset-demo` | POST | Reset demo data |

---

## Custom Hooks

### Toast Hook (`/apps/web/hooks/use-toast.ts`)

```typescript
function useToast(): {
  toasts: ToasterToast[];
  toast: (props: Toast) => { id: string; dismiss: () => void; update: (props: ToasterToast) => void };
  dismiss: (toastId?: string) => void;
}
```

---

## Stores

### Quote Builder Store (`/apps/web/lib/stores/quote-builder-store.ts`)

**State:**

| Property | Type | Description |
|----------|------|-------------|
| `document` | `QuoteDocument \| null` | Current document |
| `isDirty` | `boolean` | Unsaved changes |
| `isSaving` | `boolean` | Save in progress |
| `lastSavedAt` | `string \| null` | Last save timestamp |
| `selectedBlockId` | `string \| null` | Selected block |
| `hoveredBlockId` | `string \| null` | Hovered block |
| `showBlocksPanel` | `boolean` | Panel visibility |
| `showPropertiesPanel` | `boolean` | Panel visibility |
| `showRateCardPanel` | `boolean` | Panel visibility |
| `previewMode` | `boolean` | Preview mode |
| `zoom` | `number` | Canvas zoom level |
| `history` | `QuoteBlock[][]` | Undo history |
| `historyIndex` | `number` | Current history position |

**Actions:**

| Action | Description |
|--------|-------------|
| `initDocument` | Initialize document |
| `resetDocument` | Reset to empty document |
| `updateTitle` | Update document title |
| `updateNotes` | Update notes |
| `updateTerms` | Update terms |
| `updateSettings` | Update settings |
| `addBlock` | Add new block |
| `addBlockAfter` | Add block after specific block |
| `updateBlock` | Update block content |
| `removeBlock` | Remove block |
| `moveBlock` | Reorder block |
| `duplicateBlock` | Duplicate block |
| `selectBlock` | Select block |
| `setHoveredBlock` | Set hovered block |
| `toggleBlocksPanel` | Toggle blocks panel |
| `togglePropertiesPanel` | Toggle properties panel |
| `toggleRateCardPanel` | Toggle rate card panel |
| `togglePreviewMode` | Toggle preview mode |
| `setZoom` | Set zoom level |
| `setSaving` | Set saving state |
| `markSaved` | Mark as saved |
| `markDirty` | Mark as dirty |
| `undo` | Undo last change |
| `redo` | Redo last change |
| `pushHistory` | Push to history |
| `recalculateTotals` | Recalculate totals |

---

## Validation Schemas

### Common (`/apps/web/lib/validations/common.ts`)

| Schema | Description |
|--------|-------------|
| `idSchema` | UUID validation |
| `moneySchema` | Currency amount |
| `percentageSchema` | Percentage value |
| `listQuerySchema` | Pagination params |

### Auth (`/apps/web/lib/validations/auth.ts`)

| Schema | Description |
|--------|-------------|
| `loginSchema` | Login credentials |
| `registerSchema` | Registration data |
| `forgotPasswordSchema` | Password reset request |
| `resetPasswordSchema` | Password reset |

### Quote (`/apps/web/lib/validations/quote.ts`)

| Schema | Description |
|--------|-------------|
| `quoteStatusSchema` | Status enum |
| `quoteBlockTypeSchema` | Block type enum |
| `lineItemSchema` | Line item data |
| `quoteBlockSchema` | Block structure |
| `createQuoteSchema` | Create input |
| `updateQuoteSchema` | Update input |
| `quoteFilterSchema` | Filter params |
| `sendQuoteSchema` | Send input |
| `acceptQuoteSchema` | Accept input |
| `declineQuoteSchema` | Decline input |
| `convertToInvoiceSchema` | Convert input |
| `duplicateQuoteSchema` | Duplicate input |

### Invoice (`/apps/web/lib/validations/invoice.ts`)

| Schema | Description |
|--------|-------------|
| `invoiceStatusSchema` | Status enum |
| `createInvoiceSchema` | Create input |
| `updateInvoiceSchema` | Update input |
| `invoiceFilterSchema` | Filter params |
| `recordPaymentSchema` | Payment input |

### Client (`/apps/web/lib/validations/client.ts`)

| Schema | Description |
|--------|-------------|
| `addressSchema` | Address data |
| `createClientSchema` | Create input |
| `updateClientSchema` | Update input |
| `clientFilterSchema` | Filter params |

### Rate Card (`/apps/web/lib/validations/rate-card.ts`)

| Schema | Description |
|--------|-------------|
| `pricingTypeSchema` | Pricing type enum |
| `createRateCardSchema` | Create input |
| `updateRateCardSchema` | Update input |
| `rateCardFilterSchema` | Filter params |

### Settings (`/apps/web/lib/validations/settings.ts`)

| Schema | Description |
|--------|-------------|
| `businessProfileSchema` | Business profile |
| `brandingSettingsSchema` | Branding settings |
| `taxRateSchema` | Tax rate data |
| `numberSequenceSchema` | Number sequence |

---

## Types & Models

### Package Types (`/packages/types/src/models.ts`)

| Type | Description |
|------|-------------|
| `BaseModel` | Common fields (id, createdAt, updatedAt) |
| `SoftDeletable` | Soft delete mixin |
| `Address` | Address structure |
| `User` | User model |
| `Workspace` | Workspace model |
| `WorkspaceSettings` | Workspace configuration |
| `WorkspaceMember` | Team member |
| `BusinessProfile` | Business information |
| `Client` | Client model |
| `RateCard` | Rate card model |
| `Quote` | Quote model |
| `QuoteStatus` | Quote status enum |
| `QuoteSettings` | Quote configuration |
| `QuoteLineItem` | Quote line item |
| `SignatureData` | E-signature data |
| `Invoice` | Invoice model |
| `InvoiceStatus` | Invoice status enum |
| `InvoiceSettings` | Invoice configuration |
| `InvoiceLineItem` | Invoice line item |
| `Payment` | Payment model |
| `PaymentStatus` | Payment status enum |
| `TaxRate` | Tax rate model |

### Quote Block Types (`/apps/web/lib/quotes/types.ts`)

| Type | Description |
|------|-------------|
| `BlockType` | Block type enum (header, text, service-item, etc.) |
| `BaseBlock` | Base block structure |
| `HeaderBlock` | Header/title block |
| `TextBlock` | Rich text block |
| `ServiceItemBlock` | Line item block |
| `ServiceGroupBlock` | Grouped services |
| `ImageBlock` | Image block |
| `DividerBlock` | Divider block |
| `SpacerBlock` | Spacer block |
| `ColumnsBlock` | Two-column layout |
| `TableBlock` | Table block |
| `SignatureBlock` | Signature block |
| `QuoteBlock` | Union of all blocks |
| `QuoteDocument` | Document structure |
| `QuoteSettings` | Quote settings |
| `QuoteTotals` | Calculated totals |
| `BlockTemplate` | Block template |
| `BLOCK_TEMPLATES` | Available templates constant |

---

## Utility Functions

### Package Utils (`/packages/utils/src/`)

#### Format (`format.ts`)

| Function | Description |
|----------|-------------|
| `formatCurrency` | Format currency values |
| `formatDate` | Format dates |
| `formatNumber` | Format numbers |
| `formatPercentage` | Format percentages |

#### Validation (`validation.ts`)

| Function | Description |
|----------|-------------|
| `isValidEmail` | Validate email |
| `isValidUrl` | Validate URL |
| `isValidPhone` | Validate phone |

#### Helpers (`helpers.ts`)

| Function | Description |
|----------|-------------|
| `generateSlug` | Generate URL slug |
| `generateToken` | Generate random token |
| `truncate` | Truncate string |
| `debounce` | Debounce function |
| `groupBy` | Group array by key |

#### Constants (`constants.ts`)

| Constant | Description |
|----------|-------------|
| `CURRENCIES` | Supported currencies |
| `TIMEZONES` | Supported timezones |
| `DATE_FORMATS` | Date format options |

---

## Services

### Stripe Service (`/apps/web/lib/services/stripe.ts`)

| Function | Description |
|----------|-------------|
| `getStripeClient` | Get Stripe instance |
| `isStripeEnabled` | Check if Stripe configured |
| `createPaymentIntent` | Create payment intent |
| `getOrCreateCustomer` | Get/create customer |
| `retrievePaymentIntent` | Retrieve payment intent |
| `createRefund` | Create refund |
| `constructWebhookEvent` | Verify webhook |
| `getPublicKey` | Get publishable key |

### Auth Service (`/apps/web/lib/auth/`)

| File | Description |
|------|-------------|
| `config.ts` | NextAuth configuration |
| `credentials.ts` | Credentials verification |
| `index.ts` | Auth exports |

---

## Database Models

### Prisma Schema (`/packages/database/prisma/schema.prisma`)

| Model | Description |
|-------|-------------|
| `User` | User accounts |
| `Account` | OAuth accounts |
| `Session` | Auth sessions |
| `Workspace` | Workspaces/organizations |
| `WorkspaceMember` | Team members |
| `BusinessProfile` | Business information |
| `BrandingSettings` | Branding configuration |
| `PaymentSettings` | Payment configuration |
| `Client` | Clients/customers |
| `RateCard` | Service rate cards |
| `RateCardCategory` | Rate card categories |
| `TaxRate` | Tax rates |
| `NumberSequence` | Quote/invoice numbering |
| `Quote` | Quotes |
| `QuoteLineItem` | Quote line items |
| `QuoteBlock` | Quote visual blocks |
| `QuoteEvent` | Quote audit trail |
| `Invoice` | Invoices |
| `InvoiceLineItem` | Invoice line items |
| `InvoiceEvent` | Invoice audit trail |
| `Payment` | Payments |
| `Contract` | Contract templates |
| `ContractInstance` | Signed contracts |
| `EmailTemplate` | Email templates |
| `ScheduledEmail` | Scheduled emails |

---

## Page Routes

### Auth Routes (`/apps/web/app/(auth)/`)

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/register` | Registration page |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset |

### Dashboard Routes (`/apps/web/app/(dashboard)/`)

| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard |
| `/dashboard/analytics` | Analytics page |
| `/quotes` | Quotes list |
| `/quotes/new` | New quote selection |
| `/quotes/new/builder` | Visual builder |
| `/quotes/new/editor` | Form editor |
| `/quotes/[id]` | Quote detail |
| `/quotes/[id]/builder` | Edit in builder |
| `/invoices` | Invoices list |
| `/clients` | Clients list |
| `/clients/new` | New client |
| `/clients/[id]` | Client detail |
| `/clients/[id]/edit` | Edit client |
| `/rate-cards` | Rate cards list |
| `/rate-cards/new` | New rate card |
| `/rate-cards/[id]/edit` | Edit rate card |
| `/templates` | Contract templates |
| `/templates/new` | New template |
| `/templates/[id]` | Template detail |
| `/templates/[id]/edit` | Edit template |
| `/settings` | Settings overview |
| `/settings/business` | Business profile |
| `/settings/branding` | Branding settings |
| `/settings/payments` | Payment settings |
| `/settings/tax-rates` | Tax rates |
| `/settings/quotes` | Quote settings |
| `/settings/invoices` | Invoice settings |
| `/settings/emails` | Email templates |
| `/settings/emails/new` | New email template |
| `/settings/emails/[id]` | Edit email template |
| `/settings/team` | Team members |
| `/settings/workspace` | Workspace settings |
| `/settings/billing` | Billing |
| `/settings/account` | Account settings |

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/q/[token]` | Client quote portal |
| `/i/[token]` | Client invoice portal |
| `/c/[token]` | Client contract portal |
| `/onboarding` | User onboarding |

---

*Last updated: 2026-02-13*
