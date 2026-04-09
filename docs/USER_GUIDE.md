# Oreko User Guide

Oreko is an open-source, self-hosted visual quote and invoice management tool built for freelancers, agencies, and small businesses. It lets you create stunning, block-based visual quotes, get them signed electronically, convert accepted quotes to invoices with one click, and collect payments through Stripe -- all without expensive subscriptions or vendor lock-in.

This guide walks you through every feature in the application.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Managing Clients](#managing-clients)
4. [Creating Quotes](#creating-quotes)
5. [Managing Invoices](#managing-invoices)
6. [Client Portal](#client-portal)
7. [Rate Cards](#rate-cards)
8. [Projects](#projects)
9. [Contracts](#contracts)
10. [Analytics](#analytics)
11. [Settings](#settings)
12. [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### What is Oreko?

Oreko replaces the patchwork of spreadsheets, PDF editors, and invoicing tools that many freelancers and agencies rely on. The core workflow is simple:

1. **Create a beautiful quote** using the visual drag-and-drop builder.
2. **Send it for e-signature** -- your client receives a portal link by email.
3. **Convert to an invoice** with one click once the quote is accepted.
4. **Get paid** via Stripe, bank transfer, or other methods.

All of your data stays in one place, with full audit trails, PDF downloads, analytics, and a branded client portal.

### Creating Your Account

1. Navigate to the Oreko landing page and click **Get Started Free**.
2. Fill in your name, email address, and a password on the registration page. Alternatively, sign in with Google or GitHub using the OAuth buttons.
3. After registration you will be redirected to the onboarding wizard.

### Onboarding Wizard

The onboarding wizard guides you through four setup steps. You can skip any step and complete it later from the Settings pages.

**Step 1 -- Business Profile**
Enter your company or business name, address, phone number, website, default currency, and timezone. This information appears on your quotes and invoices.

**Step 2 -- Branding**
Choose your primary, secondary, and accent colors. Upload your logo. Select a font family. These settings control the visual appearance of client-facing documents and your client portal.

**Step 3 -- Payments**
Connect your Stripe account using Stripe Connect to accept online payments directly from invoices. This step is optional and can be configured later.

**Step 4 -- Complete**
Review your setup and click **Go to Dashboard** to start using Oreko.

---

## Dashboard

The dashboard is your home base. It gives you an at-a-glance overview of your business health every time you log in.

### Navigation

The left sidebar organizes your workspace into three groups:

- **Platform** -- Dashboard, Analytics, Clients, Projects, Quotes, Invoices, Contracts
- **Resources** -- Rate Cards, Templates
- **Settings** -- Settings, Help and Support

Quick-action buttons at the top of the sidebar let you create a new quote or invoice from anywhere.

### KPI Cards

At the top of the dashboard, six summary cards display your key performance indicators:

| Card | What It Shows |
|------|---------------|
| Total Revenue | Cumulative paid invoice revenue |
| Outstanding | Total unpaid invoice amounts |
| Overdue | Total overdue invoice amounts |
| Quotes This Month | Number of quotes created in the current month |
| Invoices This Month | Number of invoices created in the current month |
| Conversion Rate | Percentage of sent quotes that converted to invoices |

### Analytics Charts

Below the KPI cards, the dashboard includes:

- **Revenue Chart** -- A line chart showing revenue over time. Use the period selector to switch between weekly, monthly, quarterly, and yearly views.
- **Quote Status Distribution** -- A breakdown of how many quotes are in each status (draft, sent, viewed, accepted, declined, expired, converted).
- **Invoice Status Distribution** -- The same breakdown for invoices (draft, sent, viewed, partial, paid, overdue, voided).
- **Conversion Funnel** -- A visual funnel showing how quotes progress from sent through viewed, accepted, invoiced, and finally paid.
- **Payment Aging** -- An accounts receivable aging chart showing current, 1-30 day, 31-60 day, 61-90 day, and 90+ day outstanding amounts.

### Recent Items and Activity

The bottom section of the dashboard is split into three columns:

- **Recent Quotes** -- Your latest quotes with status badges, client names, amounts, and dates.
- **Recent Invoices** -- Your latest invoices with the same summary information.
- **Activity Feed** -- A chronological feed of events across your workspace: quotes sent, invoices paid, clients created, and so on.

Click any item to navigate directly to its detail page.

---

## Managing Clients

### Client List

Navigate to **Clients** in the sidebar to see all of your clients. The page displays summary statistics at the top:

- Total clients
- Individuals
- Companies
- Clients with active quotes
- Clients with unpaid invoices

Below the stats, the clients data table supports:

- **Search** -- Type a name, email, or company name in the search field.
- **Filter by Type** -- Use the type dropdown to show only individuals or only companies.
- **Sort** -- Click column headers to sort by name, email, created date, or revenue.
- **Pagination** -- Navigate pages if you have many clients.

### Creating a Client

Click **Add Client** in the top right corner of the clients page.

Fill in the client form:

- **Name** (required) -- The contact person's full name.
- **Email** (required) -- Primary email address.
- **Phone** -- Phone number.
- **Company** -- Company name. If provided, the client will appear as a company type; otherwise as an individual.
- **Address** -- Street, city, state/province, postal code, and country.
- **Type** -- Individual or company (auto-detected from the company field, or set manually).
- **Tags** -- Add tags to categorize clients (e.g., "VIP", "Referral", "Enterprise").
- **Contacts** -- Add additional contact people associated with this client.
- **Notes** -- Internal notes about the client (not visible to the client).

Click **Save** to create the client.

### Client Detail Page

Click any client in the list to open their detail page, which includes:

- **Overview** -- Contact information, address, tags, and metadata.
- **Financial Summary** -- Total revenue, outstanding balance, and number of quotes and invoices.
- **Quotes Tab** -- All quotes associated with this client.
- **Invoices Tab** -- All invoices for this client.
- **Activity Timeline** -- A chronological record of all events (quotes sent, invoices paid, status changes) involving this client.

From the detail page you can edit the client, create a new quote or invoice for them, or delete them.

### Importing Clients from CSV

To bulk-import clients:

1. Navigate to the Clients page.
2. Use the import function to upload a CSV file.
3. Oreko will detect duplicate emails and skip already-existing records.
4. Review the import results and confirm.

### Bulk Operations

Select multiple clients using the checkboxes in the data table to perform bulk delete operations.

---

## Creating Quotes

Oreko offers two ways to create quotes: the **Quote Editor** (form-based, split-view) and the **Visual Builder** (block-based, drag-and-drop).

### Starting a New Quote

1. Click **New Quote** from the sidebar or dashboard.
2. You will be prompted to select a client. Search for an existing client or click **Create New Client** to add one.
3. You can also click **Skip for now** to create a quote without a client and assign one later.
4. Click **Continue to Editor** to open the quote editor.

### Quote Editor (Split-View)

The quote editor uses a split-view layout: the editing form is on the left, and a live preview of the quote appears on the right.

The editor is organized into collapsible sections:

**Details Section**
- **Title** -- A descriptive title for the quote (e.g., "Website Redesign Proposal").
- **Client** -- Select or change the client.
- **Project** -- Optionally link the quote to a project.
- **Issue Date** -- The date the quote is issued (defaults to today).
- **Expiration Date** -- When the quote expires. After this date the quote will automatically show as expired.

**Items Section**
Add line items that make up the quote's pricing:

- **Name** -- Description of the service or product.
- **Quantity** -- Number of units.
- **Rate** -- Price per unit.
- **Tax** -- Optionally apply a tax rate from your configured tax rates.
- **Amount** -- Automatically calculated as quantity times rate, plus tax.

Click **Add Item** to add more line items. Drag items to reorder them. You can also click the rate card icon to insert items from your rate card library.

Totals (subtotal, discount, tax, and grand total) are calculated and displayed automatically.

**Terms Section**
A rich text editor where you can write the terms and conditions that appear on the quote. Use the formatting toolbar for headings, bold, italic, lists, and links.

**Notes Section**
Two note fields:
- **Client Notes** -- Visible to the client on the quote and in the client portal.
- **Internal Notes** -- Visible only to you and your team, never shown to the client.

### Visual Builder (Block-Based)

For more visually rich quotes, switch to the visual builder. The builder workspace consists of:

- **Document Canvas** (center) -- The live document where you arrange blocks.
- **Blocks Panel** (left sidebar) -- A palette of available block types you can drag onto the canvas.
- **Properties Panel** (right sidebar) -- Edit the selected block's settings and content.
- **Builder Toolbar** (top) -- Toggle preview mode, undo/redo, save, and access the blocks and properties panels.

**Available Block Types:**

| Block | Description |
|-------|-------------|
| Header | Title and subtitle for sections of your quote |
| Text | Rich text content with formatting |
| Divider | A horizontal line to separate sections |
| Spacer | Adjustable vertical space between blocks |
| Image | Upload or reference an image |
| Service Item | A single priced line item (name, description, quantity, rate) |
| Service Group | A group of related service items with a subtotal |
| Signature | An e-signature capture area for the client |
| Columns | Side-by-side column layout |
| Table | Tabular data display |

To add a block, drag it from the blocks panel onto the canvas, or click the "+" button between existing blocks. Select a block to edit its properties in the right panel.

**Rate Card Picker:** Click the rate card icon in the toolbar or properties panel to browse your rate card library and insert pre-configured service items with saved pricing.

### Saving and Sending

- **Save Draft** -- Click the save button to save your work. Quotes start in "draft" status and can be edited freely.
- **Send Quote** -- When you are ready, click **Send** on the quote detail page. Oreko will email the client a link to the client portal where they can view, accept or decline, and sign the quote. The status changes to "sent."

### Quote Status Lifecycle

| Status | Meaning |
|--------|---------|
| Draft | Work in progress; fully editable |
| Sent | Emailed to the client; waiting for response |
| Viewed | The client has opened the portal link |
| Accepted | The client accepted and signed the quote |
| Declined | The client declined the quote |
| Expired | The expiration date has passed without a response |
| Converted | The quote has been converted to an invoice |

### Quote Detail Page

The quote detail page shows:

- **Quote Preview** -- A rendered view of the quote with all line items, totals, notes, and terms.
- **Quote Details Card** -- Total value, status, and line item count.
- **Client Card** -- The assigned client's name, company, and email with a link to their profile.
- **Linked Invoice** -- If the quote has been converted, a link to the resulting invoice.
- **Activity Timeline** -- Every event that has occurred on this quote (created, sent, viewed, accepted, etc.) with timestamps.

**Actions available from the detail page:**

- **Download PDF** -- Generate and download a PDF of the quote.
- **Edit** -- Open the builder to make changes (draft quotes only).
- **Send** -- Send or resend the quote to the client (draft quotes only).
- **Convert to Invoice** -- Convert an accepted quote into an invoice with one click.
- **Duplicate** -- Create a copy of the quote as a new draft.

---

## Managing Invoices

### Invoice List

Navigate to **Invoices** in the sidebar to see all your invoices. The data table supports search by invoice number, client name, or title, and can be filtered by status.

### Creating an Invoice

Click **New Invoice** from the sidebar, dashboard, or invoices page.

The invoice form includes:

- **Client** -- Select the client.
- **Issue Date** -- When the invoice is dated.
- **Due Date** -- When payment is expected (auto-populated based on your default payment terms).
- **Line Items** -- Add items with name, quantity, rate, and tax.
- **Notes** -- Notes displayed on the invoice.
- **Terms** -- Payment terms and conditions.

Default notes and terms are pre-filled from your invoice settings.

### Converting a Quote to an Invoice

This is one of Oreko's core features -- zero data re-entry:

1. Navigate to an accepted quote's detail page.
2. Click **Convert to Invoice**.
3. All line items, client information, and totals are copied to a new invoice automatically.
4. The quote status changes to "converted" and a link appears connecting the quote and invoice.

### Sending Invoices

Click **Send** on the invoice detail page. The client receives an email with a link to the invoice portal, where they can view the invoice and pay online (if Stripe is connected).

### Recording Payments

To record a payment manually:

1. Open the invoice detail page.
2. Click **Record Payment**.
3. Enter the payment amount, method (bank transfer, check, cash, etc.), and an optional reference number.
4. The invoice's paid amount and balance due update automatically.
5. If the payment covers the full balance, the invoice status changes to "paid." If it is a partial payment, the status changes to "partial."

### Invoice Status Lifecycle

| Status | Meaning |
|--------|---------|
| Draft | Work in progress; editable |
| Sent | Emailed to the client |
| Viewed | The client has opened the portal link |
| Partial | Some payment has been received |
| Paid | Fully paid |
| Overdue | The due date has passed without full payment |
| Voided | The invoice has been cancelled |

Note: "Overdue" is computed at runtime. An unpaid or partially paid invoice with a due date in the past is automatically shown as overdue.

### Other Invoice Actions

- **Download PDF** -- Generate and download a PDF of the invoice.
- **Duplicate** -- Create a copy of the invoice as a new draft with a fresh due date.
- **Edit** -- Modify the invoice (draft status only).
- **Void** -- Cancel a sent invoice. This is recommended instead of deleting a sent invoice to maintain audit records.

---

## Client Portal

The client portal is a set of public, branded pages where your clients interact with quotes, invoices, and contracts -- no login required.

### How It Works

When you send a quote, invoice, or contract, the client receives an email containing a unique link (e.g., `yourapp.com/q/abc123`). This link opens the client portal for that specific document.

Each portal link includes a secure, unique access token. No authentication is needed -- anyone with the link can view the document. Views are tracked automatically.

### Quote Portal

When a client opens a quote portal link, they see:

- **Quote Header** -- Your business branding (logo, colors), the quote title, and quote number.
- **Quote Content** -- All blocks or line items, terms, and notes as you designed them.
- **Totals** -- Subtotal, discounts, taxes, and grand total.
- **Accept / Decline Buttons** -- The client can accept the quote (with an optional message) or decline it (with a reason).
- **E-Signature Pad** -- If your quote includes a signature block, the client can sign directly in the browser using their mouse or touchscreen.

Once accepted, the signature data, timestamp, IP address, and user agent are recorded for audit purposes.

### Invoice Portal

When a client opens an invoice portal link, they see:

- **Invoice Header** -- Your business branding, invoice number, and dates.
- **Line Items** -- All items with quantities, rates, and amounts.
- **Payment Summary** -- Amount due, amount paid, and balance remaining.
- **Pay Now Button** -- If Stripe is connected, the client can pay online immediately. Clicking the button creates a Stripe Checkout session.

### Contract Portal

When a client opens a contract portal link, they see:

- The full contract content with all variables filled in.
- An e-signature pad to sign the contract.
- The signature is recorded with full audit data.

---

## Rate Cards

Rate cards are reusable pricing templates for your services and products. They save time and ensure consistent pricing across all your quotes.

### Managing Categories

Rate cards are organized into categories (e.g., "Design Services", "Development", "Consulting").

1. Navigate to **Rate Cards** in the sidebar.
2. Click **Manage Categories** in the top-right corner.
3. Add, edit, or delete categories. Each category has a name, color, and sort order.

### Creating a Rate Card

1. Click **New Rate Card** on the rate cards page.
2. Fill in the form:
   - **Name** -- The service or product name (e.g., "Logo Design", "Senior Developer Hour").
   - **Category** -- Assign it to a category.
   - **Pricing Type** -- Choose "Fixed" for a flat price or "Hourly" for a per-hour rate.
   - **Rate** -- The dollar amount.
   - **Unit** -- The unit label (e.g., "hour", "page", "project").
   - **Tax Rate** -- Optionally associate a default tax rate.
   - **Description** -- A description that will appear on quotes when this rate card is used.
3. Click **Save**.

### Using Rate Cards in the Quote Builder

When adding items to a quote (either in the editor or the visual builder):

1. Click the rate card picker icon.
2. Browse categories or search by name.
3. Click a rate card to insert it as a line item with the pre-filled name, rate, and description.
4. Adjust the quantity as needed.

### Rate Card Statistics

The rate cards page shows summary statistics:

- Total rate cards
- Active rate cards
- Categories count

You can filter rate cards by category, pricing type (fixed/hourly), or active status using the toolbar filters.

---

## Projects

Projects help you organize quotes and invoices under a single umbrella for a client engagement.

### Project List

Navigate to **Projects** in the sidebar to see all projects. Summary statistics are shown at the top:

- Total projects
- Active projects
- Total quotes across all projects
- Total invoices across all projects

### Creating a Project

1. Click **New Project**.
2. Fill in:
   - **Name** -- A descriptive project name.
   - **Client** -- The client this project belongs to.
   - **Description** -- Optional details about the project scope.
3. Click **Save**.

### Project Detail Page

The project detail page shows:

- Project overview with name, client, and description.
- All quotes linked to this project.
- All invoices linked to this project.
- Financial summary (total quoted, total invoiced, total paid).

You can deactivate a project when work is complete, and reactivate it later if needed. Deactivated projects still appear in lists but are marked as inactive.

### Linking Quotes and Invoices to Projects

When creating or editing a quote, use the **Project** dropdown in the details section to link it to an existing project. Invoices created from that quote inherit the project link.

---

## Contracts

Contracts let you create legally formatted documents with e-signature support.

### Contract Templates

Templates are reusable contract documents with variable placeholders:

1. Navigate to **Templates** in the sidebar under Resources.
2. Click **New Template**.
3. Write your contract content using the rich text editor.
4. Insert **variables** using the variable manager. Variables are placeholders like `{{client_name}}`, `{{project_name}}`, `{{start_date}}` that get replaced with actual values when you create a contract instance.
5. Save the template for reuse.

### Creating a Contract Instance

1. Navigate to **Contracts** in the sidebar.
2. Click **New Contract**.
3. Select a template.
4. Fill in the variable values (client name, dates, amounts, etc.).
5. Assign the contract to a client.
6. Save the contract.

### Sending Contracts for Signature

1. Open the contract detail page.
2. Click **Send**. The client receives an email with a portal link.
3. The client can review the full contract and sign electronically in the portal.

### E-Signature Capture

Contract signatures record:

- The drawn signature image.
- Timestamp of signing.
- Signer's IP address.
- Signer's browser user agent.

This audit trail provides evidence of when and how the contract was signed.

---

## Analytics

The Analytics page provides advanced business intelligence beyond what is shown on the dashboard.

Navigate to **Analytics** in the sidebar to access the full analytics dashboard.

### Analytics KPIs

Summary cards at the top show:

- Total revenue
- Average deal value
- Outstanding balance
- Conversion rate
- Month-over-month comparison percentages

### Conversion Funnel

A visual funnel chart tracks how quotes move through each stage:

1. Quotes sent
2. Quotes viewed
3. Quotes accepted
4. Invoices created
5. Invoices paid

This helps you identify where potential revenue is being lost in your sales process.

### Payment Aging

An accounts receivable aging chart categorizes outstanding invoices by how overdue they are:

- Current (not yet due)
- 1-30 days overdue
- 31-60 days overdue
- 61-90 days overdue
- 90+ days overdue

### Monthly Comparison

A 12-month trend chart showing revenue, quotes, and invoices month by month. Use this to identify seasonal patterns and growth trends.

### Revenue Forecast

A forward-looking forecast based on historical data, using linear regression analysis. The chart shows projected revenue for the next several months with confidence intervals.

### Top Clients

Two rankings:

- **Top Clients by Revenue** -- Your highest-paying clients ranked by total paid invoice amount.
- **Client Lifetime Value (LTV)** -- Clients ranked by their total historical value.

---

## Settings

The Settings page is organized as a grid of cards, each leading to a specific configuration area. Navigate to **Settings** in the sidebar to see all options.

### Account

**Path:** Settings > Account

Manage your personal profile:

- **Name** -- Update your display name.
- **Email** -- Your login email (displayed but may not be editable).
- **Avatar** -- Upload a profile photo.
- **Password** -- Change your password by entering your current password and a new one.

### Workspace

**Path:** Settings > Workspace

Configure your workspace:

- **Workspace Name** -- The name of your workspace, visible in the sidebar and workspace switcher.
- **Workspace Slug** -- The URL-friendly identifier for your workspace.
- **Danger Zone** -- Delete the workspace (this action is irreversible and removes all data).

### Business Profile

**Path:** Settings > Business Profile

Your company information that appears on quotes, invoices, and the client portal:

- Company name
- Address (street, city, state, postal code, country)
- Phone number
- Website
- Default currency (e.g., USD, EUR, GBP)
- Timezone
- Logo upload

### Branding

**Path:** Settings > Branding

Visual customization for client-facing documents:

- **Primary Color** -- The main accent color used in your documents.
- **Secondary Color** -- A complementary color.
- **Accent Color** -- Used for highlights and call-to-action elements.
- **Logo** -- Upload your company logo.
- **Font Family** -- Select the font used in your documents.
- **Custom CSS** -- Advanced users can add custom CSS to further style their documents.

### Appearance

**Path:** Settings > Appearance

Control how Oreko looks for you:

- **Theme** -- Switch between light mode, dark mode, or system default.
- **Font Size** -- Adjust the base font size for the application interface.
- **Sidebar Style** -- Customize sidebar appearance preferences.

### Team Members

**Path:** Settings > Team

Manage who has access to your workspace:

- **View Members** -- See all current team members with their names, emails, and roles.
- **Invite Member** -- Send an invitation by email. The invited person receives a link to join your workspace.
- **Roles** -- Assign roles:
  - **Owner** -- Full access to everything including billing and workspace deletion.
  - **Member** -- Access to create and manage quotes, invoices, clients, and projects.
- **Remove Member** -- Revoke a member's access to the workspace.

### Tax Rates

**Path:** Settings > Tax Rates

Configure tax rates that can be applied to quote and invoice line items:

- **Name** -- A label for the tax rate (e.g., "Sales Tax", "VAT", "GST").
- **Rate** -- The percentage (e.g., 8.5 for 8.5%).
- **Inclusive** -- Whether the tax is included in the line item price or added on top.
- **Default** -- Mark a tax rate as the default to auto-apply it to new line items.
- **Active** -- Enable or disable tax rates without deleting them.

### Quote Settings

**Path:** Settings > Quotes

Configure quote numbering:

- **Prefix** -- A prefix for quote numbers (e.g., "QT-", "Q-").
- **Suffix** -- An optional suffix.
- **Current Value** -- The next sequential number.
- **Padding** -- Zero-padding for the number (e.g., padding of 4 produces "0001").

Example: Prefix "QT-", current value 42, padding 4 produces "QT-0042".

### Invoice Settings

**Path:** Settings > Invoices

Configure invoice numbering and defaults:

- **Number Sequence** -- Same prefix/suffix/padding system as quotes.
- **Default Payment Terms** -- Set the default number of days until an invoice is due (e.g., 30 days).
- **Default Notes** -- Pre-filled notes that appear on new invoices.
- **Default Terms** -- Pre-filled payment terms and conditions.

### Email Templates

**Path:** Settings > Emails

Customize the emails Oreko sends to your clients:

- **Template Types** -- Quote sent, invoice sent, payment received, quote accepted, invoice reminder, and others.
- **Subject** -- The email subject line.
- **Body** -- The email body with support for variables like `{{client_name}}`, `{{quote_number}}`, `{{amount}}`.
- **Active/Inactive** -- Enable or disable specific templates.
- **Default** -- Mark one template per type as the default.

You can create multiple templates for each type and select which one to use when sending.

### Payment Settings

**Path:** Settings > Payments

Set up Stripe Connect to accept online payments:

1. Click **Connect with Stripe** to begin the Stripe Connect onboarding flow.
2. Follow the Stripe setup process to link your bank account.
3. Once connected, your clients can pay invoices directly from the invoice portal using credit cards, debit cards, and other Stripe-supported payment methods.

Configuration options:

- **Enabled Payment Methods** -- Choose which payment methods to accept.
- **Pass Processing Fees** -- Optionally pass Stripe processing fees to your clients.
- **Disconnect** -- Remove the Stripe connection if needed.

### Billing and Subscription

**Path:** Settings > Billing

Manage your Oreko plan and payment methods (applicable for hosted/cloud deployments).

---

## Tips and Best Practices

### Use Rate Cards for Consistent Pricing

Create rate cards for all of your standard services and products. This ensures consistent pricing across quotes, eliminates manual entry errors, and speeds up quote creation.

### Set Up Number Sequences Early

Configure your quote and invoice number sequences in Settings before creating your first documents. Professional numbering (e.g., "INV-0001") makes your business look established and helps with record-keeping.

### Customize Your Branding

Upload your logo and set your brand colors in Settings > Branding before sending any client-facing documents. The client portal, PDFs, and emails will all use your branding.

### Use the Visual Builder for High-Value Proposals

For important proposals, use the block-based visual builder to create visually rich quotes with headers, images, detailed service descriptions, and signature blocks. Clients are more likely to accept polished, professional-looking proposals.

### Link Quotes to Projects

Use projects to group related quotes and invoices together. This keeps your workspace organized and makes it easy to see the full financial picture for each client engagement.

### Set Expiration Dates on Quotes

Always set an expiration date on quotes. This creates urgency for the client and protects you from honoring outdated pricing. Expired quotes are clearly marked in the system.

### Track Activity Timelines

Use the activity timelines on quote and invoice detail pages to see exactly when documents were sent, viewed, accepted, and paid. If a client claims they did not receive a quote, you can verify the send and view timestamps.

### Record All Payments

Even if you are not using Stripe, record manual payments (checks, bank transfers, cash) in Oreko. This keeps your outstanding balance and revenue metrics accurate.

### Review Analytics Regularly

Check the Analytics page periodically to monitor your conversion funnel, payment aging, and revenue trends. If your quote-to-acceptance rate drops, consider revising your pricing or proposal quality. If payment aging increases, tighten your follow-up process.

### Use Tags to Organize Clients

Apply tags to clients (e.g., "Enterprise", "Startup", "Referral", "Priority") to categorize and filter them. This is especially useful as your client base grows.

### Leverage the Global Search

Use the search functionality (accessible from the header) to quickly find quotes, invoices, or clients by name, number, or email without navigating through menus.

### Back Up Your Data (Self-Hosted)

If you are running a self-hosted deployment, set up regular PostgreSQL database backups. Oreko uses soft deletes for important records, but a database backup is still essential for disaster recovery.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + Z | Undo (in the visual builder) |
| Ctrl/Cmd + Shift + Z | Redo (in the visual builder) |
| Delete/Backspace | Delete selected block (in the visual builder) |
| Ctrl/Cmd + S | Save current document |

---

## Getting Help

If you need assistance:

- Navigate to **Help & Support** in the sidebar for in-app help resources.
- For self-hosted deployments, consult the project documentation or open an issue on GitHub.
- For cloud-hosted users, contact support through the Help page.

---

*Oreko is open source. Contributions, bug reports, and feature requests are welcome on GitHub.*
