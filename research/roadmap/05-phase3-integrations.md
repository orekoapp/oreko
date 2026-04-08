# Phase 3: Ecosystem Integrations Specification

## Overview

**Duration:** Months 8-12
**Goal:** Become essential infrastructure through deep integrations
**Dependencies:** Phase 1 API + Webhooks complete

---

## 1. Integration Architecture

### 1.1 Unified Integration Framework

```
┌─────────────────────────────────────────────────────────────┐
│                    Oreko Core                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               Integration Manager                    │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │    │
│  │  │ OAuth     │ │ Sync      │ │ Event             │  │    │
│  │  │ Manager   │ │ Engine    │ │ Router            │  │    │
│  │  └───────────┘ └───────────┘ └───────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │  Accounting   │ │     CRM       │ │ Communication │
    │  Connectors   │ │  Connectors   │ │  Connectors   │
    ├───────────────┤ ├───────────────┤ ├───────────────┤
    │ • QuickBooks  │ │ • HubSpot     │ │ • Slack       │
    │ • Xero        │ │ • Salesforce  │ │ • Email       │
    │ • FreshBooks  │ │ • Pipedrive   │ │ • Teams       │
    └───────────────┘ └───────────────┘ └───────────────┘
```

### 1.2 Base Connector Interface

```typescript
// lib/integrations/base-connector.ts

interface IntegrationConnector {
  id: string;
  name: string;
  category: "accounting" | "crm" | "communication" | "storage" | "other";

  // Authentication
  authType: "oauth2" | "api_key" | "basic";
  authConfig: OAuthConfig | ApiKeyConfig;

  // Capabilities
  capabilities: IntegrationCapability[];

  // Lifecycle
  connect(credentials: any): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;

  // Sync operations
  sync(direction: "push" | "pull" | "bidirectional"): Promise<SyncResult>;
  getLastSyncTime(): Promise<Date | null>;

  // Entity mappings
  mapToExternal<T>(entity: OrekoEntity, type: string): T;
  mapFromExternal<T>(data: T, type: string): OrekoEntity;
}

type IntegrationCapability =
  | "sync_clients"
  | "sync_invoices"
  | "sync_payments"
  | "sync_products"
  | "create_invoice"
  | "receive_webhooks"
  | "send_notifications";

interface SyncResult {
  success: boolean;
  created: number;
  updated: number;
  deleted: number;
  errors: SyncError[];
  duration_ms: number;
}
```

---

## 2. Accounting Integrations

### 2.1 QuickBooks Online

```typescript
// lib/integrations/quickbooks/connector.ts

export class QuickBooksConnector implements IntegrationConnector {
  id = "quickbooks";
  name = "QuickBooks Online";
  category = "accounting" as const;
  authType = "oauth2" as const;

  capabilities = [
    "sync_clients",
    "sync_invoices",
    "sync_payments",
    "sync_products"
  ];

  authConfig: OAuthConfig = {
    authorizationUrl: "https://appcenter.intuit.com/connect/oauth2",
    tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    scopes: ["com.intuit.quickbooks.accounting"],
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!
  };

  // Entity mappings
  private entityMappings = {
    client: {
      toQuickBooks: (client: Client): QBCustomer => ({
        DisplayName: client.company || client.name,
        PrimaryEmailAddr: { Address: client.email },
        PrimaryPhone: client.phone ? { FreeFormNumber: client.phone } : undefined,
        BillAddr: client.address ? {
          Line1: client.address.line1,
          City: client.address.city,
          CountrySubDivisionCode: client.address.state,
          PostalCode: client.address.postal_code,
          Country: client.address.country
        } : undefined
      }),
      fromQuickBooks: (customer: QBCustomer): Partial<Client> => ({
        name: customer.DisplayName,
        email: customer.PrimaryEmailAddr?.Address,
        phone: customer.PrimaryPhone?.FreeFormNumber,
        company: customer.CompanyName,
        external_ids: { quickbooks: customer.Id }
      })
    },

    invoice: {
      toQuickBooks: (invoice: Invoice, customerRef: string): QBInvoice => ({
        CustomerRef: { value: customerRef },
        TxnDate: invoice.issue_date,
        DueDate: invoice.due_date,
        Line: invoice.items.map((item, i) => ({
          LineNum: i + 1,
          Amount: item.amount,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: item.external_ids?.quickbooks
              ? { value: item.external_ids.quickbooks }
              : undefined,
            Qty: item.quantity,
            UnitPrice: item.unit_price
          },
          Description: item.description || item.name
        })),
        DocNumber: invoice.number,
        PrivateNote: invoice.notes
      }),
      fromQuickBooks: (qbInvoice: QBInvoice): Partial<Invoice> => ({
        external_ids: { quickbooks: qbInvoice.Id },
        issue_date: qbInvoice.TxnDate,
        due_date: qbInvoice.DueDate,
        total: qbInvoice.TotalAmt,
        amount_paid: qbInvoice.TotalAmt - qbInvoice.Balance,
        status: qbInvoice.Balance === 0 ? "paid" : "sent"
      })
    }
  };

  async syncClients(direction: "push" | "pull" | "bidirectional") {
    if (direction === "push" || direction === "bidirectional") {
      // Push Oreko clients to QuickBooks
      const clients = await getClientsToSync("quickbooks");
      for (const client of clients) {
        if (client.external_ids?.quickbooks) {
          await this.updateCustomer(client);
        } else {
          const qbCustomer = await this.createCustomer(client);
          await updateClientExternalId(client.id, "quickbooks", qbCustomer.Id);
        }
      }
    }

    if (direction === "pull" || direction === "bidirectional") {
      // Pull QuickBooks customers to Oreko
      const customers = await this.getCustomers({ since: this.lastSyncTime });
      for (const customer of customers) {
        const existing = await findClientByExternalId("quickbooks", customer.Id);
        if (existing) {
          await updateClient(existing.id, this.mapFromExternal(customer, "client"));
        } else {
          await createClient(this.mapFromExternal(customer, "client"));
        }
      }
    }
  }

  async syncInvoices(direction: "push" | "pull" | "bidirectional") {
    if (direction === "push" || direction === "bidirectional") {
      const invoices = await getInvoicesToSync("quickbooks");
      for (const invoice of invoices) {
        // Ensure client is synced first
        const customerRef = await this.ensureCustomerExists(invoice.client);

        if (invoice.external_ids?.quickbooks) {
          await this.updateInvoice(invoice, customerRef);
        } else {
          const qbInvoice = await this.createInvoice(invoice, customerRef);
          await updateInvoiceExternalId(invoice.id, "quickbooks", qbInvoice.Id);
        }
      }
    }

    if (direction === "pull" || direction === "bidirectional") {
      // Sync payments from QuickBooks
      const payments = await this.getPayments({ since: this.lastSyncTime });
      for (const payment of payments) {
        await this.processIncomingPayment(payment);
      }
    }
  }

  // Webhook handler for real-time updates
  async handleWebhook(payload: QBWebhookPayload) {
    for (const event of payload.eventNotifications) {
      switch (event.dataChangeEvent.entities[0].name) {
        case "Customer":
          await this.handleCustomerChange(event);
          break;
        case "Invoice":
          await this.handleInvoiceChange(event);
          break;
        case "Payment":
          await this.handlePaymentChange(event);
          break;
      }
    }
  }
}
```

### 2.2 Xero

```typescript
// lib/integrations/xero/connector.ts

export class XeroConnector implements IntegrationConnector {
  id = "xero";
  name = "Xero";
  category = "accounting" as const;

  authConfig: OAuthConfig = {
    authorizationUrl: "https://login.xero.com/identity/connect/authorize",
    tokenUrl: "https://identity.xero.com/connect/token",
    scopes: [
      "openid",
      "profile",
      "email",
      "accounting.contacts",
      "accounting.transactions"
    ]
  };

  capabilities = [
    "sync_clients",
    "sync_invoices",
    "sync_payments",
    "receive_webhooks"
  ];

  private entityMappings = {
    client: {
      toXero: (client: Client): XeroContact => ({
        Name: client.company || client.name,
        FirstName: client.name.split(" ")[0],
        LastName: client.name.split(" ").slice(1).join(" "),
        EmailAddress: client.email,
        Phones: client.phone ? [{
          PhoneType: "DEFAULT",
          PhoneNumber: client.phone
        }] : [],
        Addresses: client.address ? [{
          AddressType: "POBOX",
          AddressLine1: client.address.line1,
          City: client.address.city,
          Region: client.address.state,
          PostalCode: client.address.postal_code,
          Country: client.address.country
        }] : []
      }),
      fromXero: (contact: XeroContact): Partial<Client> => ({
        name: `${contact.FirstName} ${contact.LastName}`.trim() || contact.Name,
        email: contact.EmailAddress,
        company: contact.Name,
        external_ids: { xero: contact.ContactID }
      })
    },

    invoice: {
      toXero: (invoice: Invoice, contactId: string): XeroInvoice => ({
        Type: "ACCREC",
        Contact: { ContactID: contactId },
        Date: invoice.issue_date,
        DueDate: invoice.due_date,
        LineItems: invoice.items.map(item => ({
          Description: item.name,
          Quantity: item.quantity,
          UnitAmount: item.unit_price,
          AccountCode: "200"  // Sales account - configurable
        })),
        Reference: invoice.number,
        Status: invoice.status === "draft" ? "DRAFT" : "AUTHORISED"
      })
    }
  };

  async syncInvoices(direction: "push" | "pull" | "bidirectional") {
    // Implementation similar to QuickBooks
  }

  async handleWebhook(payload: XeroWebhookPayload) {
    // Xero webhook handling
    const signature = payload.headers["x-xero-signature"];
    if (!this.verifyWebhookSignature(payload.body, signature)) {
      throw new Error("Invalid webhook signature");
    }

    for (const event of payload.events) {
      switch (event.eventType) {
        case "CREATE":
        case "UPDATE":
          await this.handleEntityChange(event);
          break;
      }
    }
  }
}
```

### 2.3 Accounting Sync Configuration

```typescript
// Sync configuration UI model
interface AccountingSyncConfig {
  integration_id: string;
  enabled: boolean;

  // What to sync
  sync_clients: boolean;
  sync_invoices: boolean;
  sync_payments: boolean;

  // Direction
  sync_direction: "push" | "pull" | "bidirectional";

  // Conflict resolution
  conflict_resolution: "oreko_wins" | "external_wins" | "newest_wins";

  // Automation
  auto_sync_enabled: boolean;
  auto_sync_interval_minutes: number;

  // Mappings
  account_mappings: {
    sales_account: string;
    tax_account?: string;
  };

  // Filters
  sync_filters?: {
    invoice_status?: string[];
    client_tags?: string[];
    date_from?: string;
  };
}
```

---

## 3. CRM Integrations

### 3.1 HubSpot

```typescript
// lib/integrations/hubspot/connector.ts

export class HubSpotConnector implements IntegrationConnector {
  id = "hubspot";
  name = "HubSpot CRM";
  category = "crm" as const;

  capabilities = [
    "sync_clients",
    "sync_deals",
    "receive_webhooks",
    "create_activities"
  ];

  // Sync deals ↔ quotes
  async syncDeals() {
    // Pull new deals from HubSpot → Create quote drafts
    const deals = await this.getDeals({
      stage: ["proposalquote", "negotiation"],
      since: this.lastSyncTime
    });

    for (const deal of deals) {
      const existingQuote = await findQuoteByExternalId("hubspot", deal.id);

      if (!existingQuote) {
        // Create quote draft from deal
        const client = await this.ensureClientFromCompany(deal.company);
        const quote = await createQuote({
          client_id: client.id,
          title: deal.dealname,
          total: deal.amount,
          external_ids: { hubspot_deal: deal.id },
          notes: `Imported from HubSpot deal: ${deal.dealname}`,
          items: await this.estimateLineItems(deal)
        });

        // Update deal with quote link
        await this.updateDeal(deal.id, {
          properties: {
            quote_link: `${process.env.APP_URL}/quotes/${quote.id}`,
            quote_status: "draft"
          }
        });
      }
    }
  }

  // Push quote updates → HubSpot deal updates
  async onQuoteStatusChange(quote: Quote, previousStatus: string) {
    const dealId = quote.external_ids?.hubspot_deal;
    if (!dealId) return;

    const dealUpdates: Partial<HubSpotDeal> = {
      amount: quote.total
    };

    // Map quote status to deal stage
    switch (quote.status) {
      case "sent":
        dealUpdates.dealstage = "proposalquote";
        break;
      case "accepted":
        dealUpdates.dealstage = "closedwon";
        dealUpdates.closedate = quote.accepted_at;
        break;
      case "declined":
        dealUpdates.dealstage = "closedlost";
        dealUpdates.closedate = quote.declined_at;
        break;
    }

    await this.updateDeal(dealId, { properties: dealUpdates });

    // Create activity for timeline
    await this.createEngagement(dealId, {
      type: "NOTE",
      body: `Quote ${quote.number} status changed from ${previousStatus} to ${quote.status}`,
      timestamp: Date.now()
    });
  }

  // Create contacts from clients
  async syncClients() {
    const clients = await getClientsToSync("hubspot");

    for (const client of clients) {
      const contact = this.mapClientToContact(client);

      if (client.external_ids?.hubspot) {
        await this.updateContact(client.external_ids.hubspot, contact);
      } else {
        const created = await this.createContact(contact);
        await updateClientExternalId(client.id, "hubspot", created.id);
      }

      // Also sync to company if applicable
      if (client.company) {
        await this.ensureCompanyExists(client);
      }
    }
  }

  private mapClientToContact(client: Client): HubSpotContact {
    return {
      email: client.email,
      firstname: client.name.split(" ")[0],
      lastname: client.name.split(" ").slice(1).join(" "),
      phone: client.phone,
      company: client.company,
      // Custom properties
      oreko_client_id: client.id,
      total_quoted: client.stats.total_quoted,
      total_invoiced: client.stats.total_invoiced
    };
  }
}
```

### 3.2 Salesforce

```typescript
// lib/integrations/salesforce/connector.ts

export class SalesforceConnector implements IntegrationConnector {
  id = "salesforce";
  name = "Salesforce";
  category = "crm" as const;

  capabilities = [
    "sync_clients",
    "sync_opportunities",
    "sync_products",
    "receive_webhooks"
  ];

  // Sync Opportunities ↔ Quotes
  async syncOpportunities() {
    // Query opportunities in quoting stages
    const query = `
      SELECT Id, Name, Amount, CloseDate, StageName,
             Account.Name, Account.Id,
             (SELECT Id, Product2.Name, Quantity, UnitPrice
              FROM OpportunityLineItems)
      FROM Opportunity
      WHERE StageName IN ('Proposal/Price Quote', 'Negotiation/Review')
      AND LastModifiedDate > ${this.lastSyncTime}
    `;

    const opportunities = await this.query(query);

    for (const opp of opportunities) {
      await this.syncOpportunityToQuote(opp);
    }
  }

  private async syncOpportunityToQuote(opp: SalesforceOpportunity) {
    let quote = await findQuoteByExternalId("salesforce", opp.Id);

    if (!quote) {
      // Create new quote
      const client = await this.ensureClientFromAccount(opp.Account);

      quote = await createQuote({
        client_id: client.id,
        title: opp.Name,
        external_ids: { salesforce_opportunity: opp.Id },
        items: opp.OpportunityLineItems?.map(item => ({
          name: item.Product2?.Name || "Service",
          quantity: item.Quantity,
          unit_price: item.UnitPrice,
          amount: item.Quantity * item.UnitPrice
        })) || [],
        valid_until: opp.CloseDate
      });
    } else {
      // Update existing
      await updateQuote(quote.id, {
        title: opp.Name,
        items: this.mapLineItems(opp.OpportunityLineItems)
      });
    }

    return quote;
  }

  // Push quote acceptance → Close opportunity
  async onQuoteAccepted(quote: Quote) {
    const oppId = quote.external_ids?.salesforce_opportunity;
    if (!oppId) return;

    await this.update("Opportunity", oppId, {
      StageName: "Closed Won",
      Amount: quote.total,
      CloseDate: quote.accepted_at
    });

    // Create quote record in Salesforce
    await this.create("Quote", {
      OpportunityId: oppId,
      Name: quote.number,
      Status: "Accepted",
      TotalPrice: quote.total,
      ExpirationDate: quote.valid_until
    });
  }

  // Sync products ↔ rate card items
  async syncProducts() {
    const products = await this.query(`
      SELECT Id, Name, Description, Family,
             (SELECT UnitPrice, Pricebook2.Name
              FROM PricebookEntries
              WHERE IsActive = true)
      FROM Product2
      WHERE IsActive = true
    `);

    // Import to rate cards organized by product family
    const rateCardsByFamily = new Map<string, RateCardItem[]>();

    for (const product of products) {
      const family = product.Family || "General";
      const items = rateCardsByFamily.get(family) || [];

      items.push({
        name: product.Name,
        description: product.Description,
        unit_price: product.PricebookEntries?.[0]?.UnitPrice || 0,
        external_ids: { salesforce: product.Id }
      });

      rateCardsByFamily.set(family, items);
    }

    // Create/update rate cards
    for (const [family, items] of rateCardsByFamily) {
      await upsertRateCard({
        name: `Salesforce: ${family}`,
        items,
        external_ids: { salesforce_family: family }
      });
    }
  }
}
```

---

## 4. Communication Integrations

### 4.1 Slack

```typescript
// lib/integrations/slack/connector.ts

export class SlackConnector implements IntegrationConnector {
  id = "slack";
  name = "Slack";
  category = "communication" as const;

  capabilities = [
    "send_notifications",
    "receive_commands"
  ];

  // Notification templates
  private templates = {
    quote_accepted: (quote: Quote) => ({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🎉 Quote Accepted!"
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Quote:*\n${quote.number}` },
            { type: "mrkdwn", text: `*Client:*\n${quote.client.name}` },
            { type: "mrkdwn", text: `*Amount:*\n${formatCurrency(quote.total)}` },
            { type: "mrkdwn", text: `*Accepted:*\n${formatDate(quote.accepted_at)}` }
          ]
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "View Quote" },
              url: `${process.env.APP_URL}/quotes/${quote.id}`
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Create Invoice" },
              action_id: "create_invoice",
              value: quote.id
            }
          ]
        }
      ]
    }),

    invoice_paid: (invoice: Invoice) => ({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "💰 Invoice Paid!"
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Invoice:*\n${invoice.number}` },
            { type: "mrkdwn", text: `*Client:*\n${invoice.client.name}` },
            { type: "mrkdwn", text: `*Amount:*\n${formatCurrency(invoice.total)}` }
          ]
        }
      ]
    }),

    invoice_overdue: (invoice: Invoice, daysOverdue: number) => ({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "⚠️ Invoice Overdue"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Invoice *${invoice.number}* for *${invoice.client.name}* is *${daysOverdue} days overdue*.\nAmount: ${formatCurrency(invoice.amount_due)}`
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Send Reminder" },
              action_id: "send_reminder",
              value: invoice.id,
              style: "primary"
            },
            {
              type: "button",
              text: { type: "plain_text", text: "View Invoice" },
              url: `${process.env.APP_URL}/invoices/${invoice.id}`
            }
          ]
        }
      ]
    })
  };

  async sendNotification(
    channel: string,
    type: keyof typeof this.templates,
    data: any
  ) {
    const message = this.templates[type](data);

    await this.client.chat.postMessage({
      channel,
      ...message
    });
  }

  // Handle interactive actions
  async handleInteraction(payload: SlackInteractionPayload) {
    const { action_id, value } = payload.actions[0];

    switch (action_id) {
      case "create_invoice":
        const quote = await getQuote(value);
        const invoice = await convertQuoteToInvoice(quote.id);
        await this.sendNotification(
          payload.channel.id,
          "invoice_created",
          invoice
        );
        break;

      case "send_reminder":
        await sendInvoiceReminder(value);
        await this.client.chat.postEphemeral({
          channel: payload.channel.id,
          user: payload.user.id,
          text: "✅ Reminder sent!"
        });
        break;
    }
  }

  // Slash command handler: /oreko
  async handleSlashCommand(command: SlackSlashCommand) {
    const [action, ...args] = command.text.split(" ");

    switch (action) {
      case "status":
        return this.getStatusSummary();

      case "overdue":
        return this.getOverdueInvoices();

      case "quote":
        // /oreko quote "Client Name" "Project Title"
        return this.quickQuoteFlow(args, command);

      default:
        return {
          text: "Available commands: status, overdue, quote"
        };
    }
  }

  private async getStatusSummary() {
    const stats = await getDashboardStats("7d");

    return {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*📊 Oreko Status (Last 7 Days)*"
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Quotes Sent:* ${stats.quotes_sent}` },
            { type: "mrkdwn", text: `*Quotes Accepted:* ${stats.quotes_accepted}` },
            { type: "mrkdwn", text: `*Revenue Invoiced:* ${formatCurrency(stats.revenue_invoiced)}` },
            { type: "mrkdwn", text: `*Revenue Collected:* ${formatCurrency(stats.revenue_collected)}` }
          ]
        }
      ]
    };
  }
}
```

### 4.2 Google Workspace Add-on

```typescript
// lib/integrations/google/workspace-addon.ts

// Google Apps Script deployment for Gmail/Calendar integration

const ADDON_CONFIG = {
  // Gmail contextual add-on
  gmail: {
    contextualTriggers: [
      {
        unconditional: {},
        onTriggerFunction: "onGmailMessageOpen"
      }
    ]
  },

  // Calendar event add-on
  calendar: {
    eventOpenTrigger: {
      runFunction: "onCalendarEventOpen"
    }
  }
};

// When opening an email, show relevant Oreko data
function onGmailMessageOpen(e: GoogleAppsScript.Gmail.Schema.Message) {
  const email = e.gmail.messageMetadata.message;
  const senderEmail = extractEmail(email.from);

  // Look up client in Oreko
  const client = callOrekoAPI(`/clients?email=${senderEmail}`);

  if (!client) {
    return createCard({
      header: "Oreko",
      sections: [{
        widgets: [{
          textParagraph: {
            text: "No client found for this email."
          }
        }, {
          buttonList: {
            buttons: [{
              text: "Create Client",
              onClick: {
                openLink: {
                  url: `${OREKO_URL}/clients/new?email=${senderEmail}`
                }
              }
            }]
          }
        }]
      }]
    });
  }

  // Show client info and recent activity
  const quotes = callOrekoAPI(`/clients/${client.id}/quotes?limit=3`);
  const invoices = callOrekoAPI(`/clients/${client.id}/invoices?limit=3`);

  return createCard({
    header: `Oreko: ${client.name}`,
    sections: [
      {
        header: "Client Overview",
        widgets: [
          { decoratedText: { text: `Total Quoted: ${client.stats.total_quoted}` } },
          { decoratedText: { text: `Total Paid: ${client.stats.total_paid}` } }
        ]
      },
      {
        header: "Recent Quotes",
        widgets: quotes.map(q => ({
          decoratedText: {
            text: `${q.number} - ${q.title}`,
            bottomLabel: `${q.status} • ${formatCurrency(q.total)}`
          }
        }))
      },
      {
        widgets: [{
          buttonList: {
            buttons: [
              {
                text: "New Quote",
                onClick: {
                  openLink: {
                    url: `${OREKO_URL}/quotes/new?client=${client.id}`
                  }
                }
              },
              {
                text: "View Client",
                onClick: {
                  openLink: {
                    url: `${OREKO_URL}/clients/${client.id}`
                  }
                }
              }
            ]
          }
        }]
      }
    ]
  });
}

// After a meeting, prompt to create a quote
function onCalendarEventOpen(e: GoogleAppsScript.Calendar.Schema.Event) {
  const event = e.calendar.calendarEvent;
  const attendees = event.attendees?.map(a => a.email) || [];

  // Find matching clients
  const clients = attendees
    .map(email => callOrekoAPI(`/clients?email=${email}`))
    .filter(Boolean);

  if (clients.length === 0) {
    return createCard({
      sections: [{
        widgets: [{
          textParagraph: {
            text: "No Oreko clients found among attendees."
          }
        }]
      }]
    });
  }

  return createCard({
    header: "Create Quote from Meeting",
    sections: [
      {
        widgets: [{
          textParagraph: {
            text: `Meeting: ${event.summary}`
          }
        }]
      },
      {
        header: "Select Client",
        widgets: clients.map(client => ({
          decoratedText: {
            text: client.name,
            button: {
              text: "Create Quote",
              onClick: {
                openLink: {
                  url: `${OREKO_URL}/quotes/new?client=${client.id}&title=${encodeURIComponent(event.summary)}`
                }
              }
            }
          }
        }))
      }
    ]
  });
}
```

---

## 5. Zapier / Make Integration

### 5.1 Zapier App Definition

```javascript
// zapier/index.js

const App = {
  version: require("./package.json").version,
  platformVersion: require("zapier-platform-core").version,

  authentication: require("./authentication"),

  triggers: {
    quote_created: require("./triggers/quote_created"),
    quote_accepted: require("./triggers/quote_accepted"),
    quote_declined: require("./triggers/quote_declined"),
    invoice_created: require("./triggers/invoice_created"),
    invoice_paid: require("./triggers/invoice_paid"),
    invoice_overdue: require("./triggers/invoice_overdue"),
    client_created: require("./triggers/client_created"),
    payment_received: require("./triggers/payment_received")
  },

  creates: {
    create_quote: require("./creates/create_quote"),
    create_invoice: require("./creates/create_invoice"),
    create_client: require("./creates/create_client"),
    send_quote: require("./creates/send_quote"),
    send_invoice: require("./creates/send_invoice"),
    send_reminder: require("./creates/send_reminder")
  },

  searches: {
    find_client: require("./searches/find_client"),
    find_quote: require("./searches/find_quote"),
    find_invoice: require("./searches/find_invoice")
  }
};

module.exports = App;

// Example trigger: quote_accepted.js
module.exports = {
  key: "quote_accepted",
  noun: "Quote",
  display: {
    label: "Quote Accepted",
    description: "Triggers when a client accepts a quote."
  },
  operation: {
    type: "hook",
    performSubscribe: async (z, bundle) => {
      const response = await z.request({
        url: `${bundle.authData.api_url}/api/v1/webhooks`,
        method: "POST",
        body: {
          url: bundle.targetUrl,
          events: ["quote.accepted"]
        }
      });
      return response.data;
    },
    performUnsubscribe: async (z, bundle) => {
      await z.request({
        url: `${bundle.authData.api_url}/api/v1/webhooks/${bundle.subscribeData.id}`,
        method: "DELETE"
      });
    },
    perform: async (z, bundle) => {
      return [bundle.cleanedRequest.data.object];
    },
    sample: {
      id: "quo_sample123",
      number: "Q-2025-0001",
      status: "accepted",
      client: { name: "Acme Corp", email: "contact@acme.com" },
      total: 5000,
      accepted_at: "2025-01-15T10:30:00Z"
    }
  }
};
```

---

## 6. Integration Management UI

```typescript
// components/integrations/IntegrationHub.tsx

export function IntegrationHub() {
  const { data: integrations } = useIntegrations();
  const { data: connections } = useConnections();

  const categories = [
    { id: "accounting", label: "Accounting", icon: Calculator },
    { id: "crm", label: "CRM", icon: Users },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "automation", label: "Automation", icon: Zap }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect Oreko with your favorite tools
        </p>
      </div>

      {/* Connected integrations */}
      {connections?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connections.map(conn => (
                <ConnectedIntegrationCard
                  key={conn.id}
                  connection={conn}
                  onSync={() => syncIntegration(conn.id)}
                  onDisconnect={() => disconnectIntegration(conn.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available integrations by category */}
      {categories.map(category => {
        const categoryIntegrations = integrations?.filter(
          i => i.category === category.id && !isConnected(i.id, connections)
        );

        if (!categoryIntegrations?.length) return null;

        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="w-5 h-5" />
                {category.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryIntegrations.map(integration => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={() => startConnection(integration.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

---

## 7. Implementation Timeline

### Weeks 1-4: Accounting Integrations
- [ ] QuickBooks connector (OAuth, sync, webhooks)
- [ ] Xero connector
- [ ] Account mapping configuration UI

### Weeks 5-8: CRM Integrations
- [ ] HubSpot connector (contacts, deals, activities)
- [ ] Salesforce connector (contacts, opportunities, products)
- [ ] Bidirectional sync logic

### Weeks 9-10: Communication Integrations
- [ ] Slack app (notifications, slash commands, interactions)
- [ ] Google Workspace add-on

### Weeks 11-12: Automation Platform Integrations
- [ ] Zapier app submission
- [ ] Make (Integromat) integration
- [ ] Integration Hub UI

---

## 8. Success Criteria

| Metric | Target |
|--------|--------|
| Users with 1+ integration | 40% |
| Sync accuracy | > 99.5% |
| Integration setup time | < 5 minutes |
| Churn reduction (integrated users) | 20% lower |
| Support tickets (integration issues) | < 5% of total |
