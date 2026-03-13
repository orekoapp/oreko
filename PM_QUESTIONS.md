# Questions for PM (Arunesh)

Updated: 2026-03-11

---

## 1. Webhook UI — Page Will CRASH

**Problem:** The webhooks settings page (`/settings/webhooks`) imports 2 components that don't exist:
- `components/settings/webhook-endpoint-form.tsx` — form to add/edit a webhook (URL + event selection)
- `components/settings/webhook-delivery-log.tsx` — table showing delivery history (event, status, timestamp)

**Backend is done** (you built it) — DB tables, server actions, event emitter, 12 event types. But these 2 UI files are missing.

**Question:** Should we design these UI components ourselves, or do you have a design in mind? The page will crash if anyone opens it right now.

---

## 2. OAuth — Google & GitHub Login

**Problem:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` are all empty in `.env.local`. The "Continue with Google" and "Continue with GitHub" buttons on login/register won't work.

**Question:** Do we need to set up OAuth apps for development? If yes, can you share the credentials or should I create test apps on Google Cloud Console and GitHub?

---

## 3. SMTP — Email Not Working

**Problem:** No SMTP credentials configured. This affects:
- **Email verification** after registration (you added Bug #17 — blocks login until email is verified)
- Password reset emails
- Invoice/quote email sending
- Any notification emails

Currently I've bypassed email verification in dev mode so we can test, but production will need real SMTP.

**Question:** Which email service should we use? Options:
- Resend (already in package.json as dependency)
- Mailpit (already in Docker Compose for local dev — port 8025 for UI, port 1025 for SMTP)
- Something else?

Should I configure Mailpit for local development so we can test email flows?

---

## 4. Terms & Conditions Checkbox

**Problem:** You added `termsAccepted: z.literal(true)` to the backend register route, but the frontend register form has no terms checkbox. I removed the backend check for now so registration works.

**Question:** Should we add a terms checkbox to the register form? If yes, do we have actual Terms of Service / Privacy Policy pages to link to?

---

## 5. Custom Fields — Needs DB Design

**Status:** Fully stubbed — returns `[]`, create/update/delete just console.log.
**Page:** `/settings/custom-fields`

**Question:** Should we build this for v1? If yes, I need:
- A `custom_fields` table in the Prisma schema
- Decision on which entities support custom fields (quotes, invoices, clients, projects?)
- The FE design also doesn't have `currency` and `textarea` field types that the ALL types define — which set of field types do we support?

---

## 6. Integrations — QuickBooks, Xero, Slack

**Status:** Fully stubbed — shows 3 fake integration cards, all marked "Coming Soon".
**Page:** `/settings/integrations`

**Question:** Is this planned for v1 or can we leave it as "Coming Soon"? Real OAuth integration flows would be a big feature.

---

## 7. Billing Page — Fully Mocked

**Status:** Shows fake plan info (Pro plan, $29/mo) and fake billing history. No real Stripe subscription.
**Page:** `/settings/billing`

**Question:** Is this relevant for a self-hosted open-source tool? Should we remove this page, or is there a SaaS hosted version planned that needs billing?

---

## 8. Invoice Templates — Fake Data

**Status:** Two pages are fully fake:
- **`/templates/invoices`** — Shows 4 hardcoded templates (Standard Invoice, Rush Service, etc.) from `getInvoiceTemplates()` which has a `// TODO: Wire up to database` comment. No DB table, no real CRUD.
- **`/templates/invoice-items`** — Shows 15 hardcoded items (Project Fee, Web Design, etc.). Save/delete/duplicate do nothing. **No "Create Item" button** — users can't even add new items.

**Question:** Should we build real template storage for both? If yes, I need:
- `invoice_templates` table (name, description, payment terms, currency, default flag)
- `invoice_item_templates` table (name, description, duration, price, taxable)
- Or should these be combined / use an existing table?

---

## 9. Contract Settings — Hardcoded

**Status:** Returns `{ autoCountersign: false }` always. No DB persistence.
**Page:** `/settings/contracts`

**Question:** Should we store this in the workspace settings JSON column, or create a separate table? This one is quick to fix once you decide.

---

## 10. Invoice Items Page — Fully Fake + No Create Button

**Status:** Page at `/templates/invoice-items` shows 15 hardcoded fake items (Project Fee, Web Design, etc.). Nothing comes from the database.
**Problems:**
- All data is mock — save, delete, duplicate just show a toast but do nothing
- There is **no way to create a new item** — no "Create" or "New Item" button in the UI
- No DB table, no server actions

**Question:** Should we build this for v1? If yes, I need:
- A new `invoice_items` (or `line_item_templates`) table in the Prisma schema
- Fields: name, description, duration, price, taxable, workspaceId
- I'll add the CRUD server actions + a "Create Item" button

---

## Summary — What I Need From You

| # | Topic | What I Need |
|---|-------|-------------|
| 1 | Webhook UI | Design decision or approval to build 2 components |
| 2 | OAuth | Credentials or permission to create test apps |
| 3 | SMTP | Which service + should I configure Mailpit for dev? |
| 4 | Terms checkbox | Add to register form? Do we have T&C pages? |
| 5 | Custom Fields | Build for v1? DB schema decision |
| 6 | Integrations | v1 or leave as Coming Soon? |
| 7 | Billing | Remove or build for SaaS version? |
| 8 | Invoice Templates | Real DB or keep static? |
| 9 | Contract Settings | Workspace JSON or new table? |
| 10 | Invoice Items | Build real CRUD + create button? DB table needed |
