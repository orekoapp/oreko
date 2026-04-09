# Oreko Specification Clarifications

## Document Purpose

This document captures ambiguities, gaps, and clarifications identified during specification review. Items are categorized by resolution status and impact level.

---

## Clarifications Required

### High Priority (Blocks MVP Development)

#### C-001: Quote Status Workflow
**Source:** PRODUCT_SPEC.md Section 4.1.1
**Question:** What triggers the transition from "Sent" to "Viewed"? Is it tracked via email open or page access?
**Resolution:** Page access tracking via access token URL. The `viewedAt` timestamp in the Quote model tracks when the client first opens the quote page.
**Impact:** Quote events tracking, client portal implementation

#### C-002: E-Signature Legal Compliance
**Source:** PRODUCT_SPEC.md Section 4.1.3, DATABASE_SCHEMA.md
**Question:** What specific legal requirements must the e-signature capture meet for E-SIGN Act and UETA compliance?
**Resolution:** Per industry standards, we must capture:
- Timestamp (UTC)
- IP address
- User agent string
- Intent to sign (checkbox agreement)
- Signature image or typed name
- Document hash at time of signing
This is reflected in the QuoteSignature and ContractInstance models.
**Impact:** Signature capture UI, audit logging

#### C-003: Stripe Connect Account Type
**Source:** TECHNICAL_SPEC.md, PRODUCT_SPEC.md
**Question:** Which Stripe Connect account type should be used - Standard, Express, or Custom?
**Resolution:** Use **Stripe Connect Express** accounts:
- Balance between ease of setup and customization
- Stripe handles KYC/compliance
- Users can customize payout schedule
- Lower implementation complexity than Custom
**Impact:** Payment settings, onboarding flow, Stripe integration

#### C-004: PDF Generation Approach
**Source:** TECHNICAL_SPEC.md mentions both Puppeteer and react-pdf
**Question:** Which PDF generation approach should be used?
**Resolution:** Use **Puppeteer** for server-side PDF generation:
- More accurate rendering of styled documents
- Better handling of complex layouts
- Same rendering as browser preview (WYSIWYG)
- react-pdf for client-side preview only
**Impact:** PDF generation service, infrastructure requirements

#### C-005: File Storage for Self-Hosted
**Source:** TECHNICAL_SPEC.md
**Question:** How should file attachments work in self-hosted mode vs cloud?
**Resolution:**
- Self-hosted: Local filesystem storage (configurable path)
- Cloud: S3-compatible storage (AWS S3, DigitalOcean Spaces, MinIO)
- Storage adapter pattern to abstract both
- Maximum file size: 10MB per file, 5 files per entity
**Impact:** Storage module architecture, upload handling

---

### Medium Priority (Important for v1.0)

#### C-006: Multi-Currency Support
**Source:** PRODUCT_SPEC.md Section 6 (Out of Scope)
**Question:** Is basic currency display (not conversion) in scope for MVP?
**Resolution:** Yes, single-currency per workspace is in scope:
- Workspace settings include currency selection (USD, EUR, GBP, etc.)
- Display currency symbol formatting
- No real-time conversion or multi-currency per document
**Impact:** Currency formatting utilities, settings page

#### C-007: Quote Expiration Behavior
**Source:** PRODUCT_SPEC.md Section 4.1.2
**Question:** What happens when a quote expires? Can clients still view it?
**Resolution:**
- Expired quotes can still be viewed
- Accept/Pay buttons are disabled
- Message displayed: "This quote has expired"
- Business owner can manually extend or create new quote
**Impact:** Client portal conditional rendering, quote status logic

#### C-008: Deposit + Milestone Interaction
**Source:** PRODUCT_SPEC.md Section 4.2.2
**Question:** How do deposits interact with milestone payments?
**Resolution:**
- Deposit is collected on quote acceptance (before work begins)
- Milestones are additional payments during/after work
- Invoice can have: Deposit only, Milestones only, or both
- Total must equal quote total
**Impact:** Payment schedule builder UI, validation logic

#### C-009: Rate Card Pricing Tiers
**Source:** PRODUCT_SPEC.md Section 4.3
**Question:** How many pricing tiers per rate card item? Are tiers required?
**Resolution:**
- Minimum: 1 tier (the base rate)
- Maximum: 5 tiers (prevent UI clutter)
- Tiers are optional (default to base rate)
- Tier example: Standard, Rush (+25%), Premium (+50%)
**Impact:** Rate card editor UI, database schema (already supports via JSON)

#### C-010: Email Template Variables
**Source:** PRODUCT_SPEC.md Section 4.8, DATABASE_SCHEMA.md
**Question:** What template variables are available for email templates?
**Resolution:** Standard variables:
```
{{business_name}} - User's business name
{{client_name}} - Client's display name
{{client_email}} - Client's email
{{quote_number}} - Quote identifier
{{invoice_number}} - Invoice identifier
{{amount}} - Formatted amount
{{due_date}} - Formatted due date
{{expiration_date}} - Quote expiration
{{view_link}} - Public view URL
{{pay_link}} - Payment URL
{{custom_message}} - User's custom message
```
**Impact:** Email template editor, template rendering

---

### Low Priority (Can Be Deferred)

#### C-011: Dashboard Metrics Calculation Period
**Source:** PRODUCT_SPEC.md Section 4.7
**Question:** What date ranges are used for dashboard metrics?
**Resolution:**
- "This Month": Calendar month (1st to current date)
- "Previous Period": Same period length in previous month
- Default view: Current month with previous month comparison
- Future: Add date range selector (P1)
**Impact:** Dashboard queries, date utilities

#### C-012: Quote/Invoice Number Format
**Source:** PRODUCT_SPEC.md mentions "customizable format"
**Question:** What customization options for document numbers?
**Resolution:** Via NumberSequence model:
- Prefix: Up to 10 characters (e.g., "QT-", "INV-2024-")
- Padding: 1-6 digits (default 4)
- Suffix: Up to 10 characters (optional)
- Example: QT-0001, INV-2024-0001
**Impact:** Number generation service, settings UI

#### C-013: Client Portal Branding Level
**Source:** PRODUCT_SPEC.md, UI_UX_SPEC.md
**Question:** What level of branding customization for client-facing pages?
**Resolution:**
- MVP (P0): Logo, primary color, company name
- P1: Secondary color, custom footer text
- P2: Custom domain, full CSS override
**Impact:** Client portal theming, branding settings

#### C-014: Activity Feed Retention
**Source:** PRODUCT_SPEC.md Section 4.7
**Question:** How long is activity history retained?
**Resolution:**
- Display: 50 most recent events per entity
- Storage: Indefinite (soft delete never applied)
- Future: Add archival strategy for high-volume workspaces
**Impact:** Activity queries, potential future cleanup job

---

## Assumptions Made

### A-001: Browser Support
Following modern browser support only:
- Chrome, Firefox, Safari, Edge: Last 2 versions
- No IE11 support
- Mobile: iOS Safari 14+, Chrome Android latest

### A-002: Language Support
MVP is English-only for:
- Application UI
- Email templates
- Error messages
- Documentation

### A-003: Timezone Handling
- All dates stored as UTC in database
- Display converted to workspace timezone
- Client portal uses browser timezone

### A-004: Tax Calculation
- Tax is calculated per line item
- Tax can be inclusive or exclusive
- Single tax rate per workspace (MVP)
- Multiple tax rates (P1)

### A-005: Concurrent Editing
- No real-time collaboration for MVP
- Last save wins for quote/invoice edits
- Conflict detection deferred to P1

---

## Specification Gaps Identified

### G-001: Webhook Events
**Missing:** List of webhook events for future API
**Recommendation:** Document when building API (P1)

### G-002: Import/Export Formats
**Missing:** Specific CSV/Excel format for rate card import
**Recommendation:** Define schema when implementing (P1)

### G-003: Search Implementation
**Missing:** Full-text search requirements
**Recommendation:** Start with ILIKE queries, add full-text later if needed

### G-004: Audit Log Access
**Missing:** How users access full audit logs
**Recommendation:** Add activity tab to quote/invoice detail pages

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 30, 2026 | Development Team | Initial clarifications |
