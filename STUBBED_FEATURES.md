# Stubbed Features — Needs PM Decision

These features currently show UI but have **no real backend/database** backing them.
They need PM input on priority and whether to implement for v1 or defer.

---

## 1. Custom Fields (`/settings/custom-fields`)
- **Current state:** UI exists, all CRUD operations are stubs (`console.log` only)
- **Missing:** `custom_fields` table in Prisma schema
- **Missing field types:** `currency` and `textarea` not in `CustomFieldType`
- **Files:** `lib/settings/actions.ts` (getCustomFields, createCustomField, updateCustomField, deleteCustomField)
- **Effort:** Medium — need DB migration + wire up CRUD

## 2. Integrations (`/settings/integrations`)
- **Current state:** Shows 3 hardcoded cards (QuickBooks, Xero, Slack), all marked "unavailable"
- **Connect/disconnect buttons** call stubs (`console.log` only)
- **Files:** `lib/settings/actions.ts` (getIntegrations, connectIntegration, disconnectIntegration)
- **Effort:** Large — requires real OAuth flows for each provider

## 3. Webhooks Settings Stubs
- **Note:** PM already built real webhook backend in `lib/webhooks/actions.ts` with DB tables
- **Old stubs** in `lib/settings/actions.ts` are dead code (getWebhooks, createWebhook, updateWebhook, deleteWebhook)
- **Action needed:** Delete old stubs, fix UI to use real webhook actions
- **Also missing:** 2 UI components (`webhook-endpoint-form.tsx`, `webhook-delivery-log.tsx`) — page crashes without them

## 4. Contract Settings (`/settings/contracts`)
- **Current state:** Returns hardcoded `{ autoCountersign: false }`
- **Save button** is a stub (`console.log` only)
- **Files:** `lib/contracts/actions.ts` (getContractSettings, updateContractSettings)
- **Effort:** Small — add settings to workspace JSON or create table

## 5. Billing Page (`/settings/billing`)
- **Current state:** Entire page is mock data
- **Mock invoice history** (3 hardcoded entries: Trial, Pro Plan $9/mo)
- **Buttons with no handlers:** "Add Payment Method", "Update" payment, "More" actions on invoices
- **Files:** `app/(dashboard)/settings/billing/page.tsx`
- **Effort:** Large — requires Stripe subscription integration

## 6. Countersign Dialog (Contracts)
- **Current state:** Shows "coming soon" message (was previously showing fake success)
- **Missing:** Server action to store countersignature in DB
- **Files:** `components/contracts/countersign-dialog.tsx`
- **Effort:** Medium — need countersign server action + signature storage

## 7. Invoice Templates
- **Current state:** Returns empty list (was previously returning 4 fake templates)
- **All CRUD stubs** return `{ success: false, error: 'not yet implemented' }`
- **Files:** `lib/invoices/actions.ts` (getInvoiceTemplates, deleteInvoiceTemplate, duplicateInvoiceTemplate, updateInvoiceTemplate)
- **Effort:** Medium — need `invoice_templates` table + CRUD

## 8. Recurring Invoices
- **Current state:** Settings save to localStorage only, not to DB
- **Shows info toast** explaining settings are local-only
- **Files:** `components/invoices/recurring-settings-dialog.tsx`
- **Effort:** Large — need scheduled job system (BullMQ), recurring table, auto-generation logic

## 9. Email Settings (Signature/Footer/Verification)
- **Current state:** Shows "coming soon" toast on save, verify button disabled
- **No persistence** — signature/footer lost on page reload
- **Files:** `components/email/email-settings-form.tsx`
- **Effort:** Small — add email_settings columns to workspace table

## 10. Invoice Payment (Client Portal)
- **Current state:** Client portal shows invoice but **no "Pay" button** — Stripe not configured
- **Missing:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` in env
- **Effort:** Large — requires Stripe Connect setup, payment intent creation, webhook handling

---

## Summary by Effort

| Effort | Features |
|--------|----------|
| **Small** | Contract Settings, Email Settings |
| **Medium** | Custom Fields, Countersign, Invoice Templates |
| **Large** | Integrations (OAuth), Billing (Stripe), Recurring Invoices (BullMQ), Invoice Payment (Stripe) |

**Recommendation:** Small items can be done quickly. Large items are v2+ features. Medium items should be prioritized based on user demand.
