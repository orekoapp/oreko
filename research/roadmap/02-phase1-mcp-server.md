# Phase 1: MCP Server Specification

## Overview

**MCP (Model Context Protocol)** enables AI assistants like Claude to directly interact with Oreko. This document specifies the MCP server implementation that allows AI agents to create quotes, manage invoices, and handle client relationships.

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Assistant (Claude)                    │
└─────────────────────────────┬───────────────────────────────┘
                              │ MCP Protocol
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Oreko MCP Server                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Tools     │  │  Resources  │  │     Prompts         │  │
│  │ (Actions)   │  │ (Read-only) │  │ (Templates)         │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┴─────────────────────┘             │
│                          │                                   │
│                    ┌─────┴─────┐                            │
│                    │ API Client │                            │
│                    └─────┬─────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Oreko API Server                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Package Structure

```
packages/mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # MCP server setup
│   ├── tools/
│   │   ├── index.ts
│   │   ├── quotes.ts         # Quote tools
│   │   ├── invoices.ts       # Invoice tools
│   │   ├── clients.ts        # Client tools
│   │   ├── rate-cards.ts     # Rate card tools
│   │   └── analytics.ts      # Analytics tools
│   ├── resources/
│   │   ├── index.ts
│   │   ├── quotes.ts
│   │   ├── invoices.ts
│   │   └── clients.ts
│   ├── prompts/
│   │   ├── index.ts
│   │   └── templates.ts
│   ├── api/
│   │   └── client.ts         # API client wrapper
│   └── utils/
│       ├── formatting.ts
│       └── validation.ts
├── tests/
│   └── *.test.ts
└── README.md
```

---

## 3. Tool Definitions

### 3.1 Quote Tools

```typescript
// tools/quotes.ts

export const quoteTools = {
  // Create a new quote
  create_quote: {
    name: "create_quote",
    description: `Create a professional quote for a client.
    Supports natural language item descriptions that will be
    converted to structured line items.`,
    inputSchema: {
      type: "object",
      properties: {
        client_id: {
          type: "string",
          description: "Client ID. Use search_clients to find if unknown."
        },
        client_name: {
          type: "string",
          description: "Client name for lookup if client_id not provided."
        },
        title: {
          type: "string",
          description: "Quote title/project name"
        },
        description: {
          type: "string",
          description: "Natural language description of the work. Will be parsed into line items."
        },
        items: {
          type: "array",
          description: "Explicit line items (optional if description provided)",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              quantity: { type: "number" },
              unit: { type: "string" },
              unit_price: { type: "number" }
            }
          }
        },
        valid_days: {
          type: "number",
          description: "Number of days quote is valid. Default: 30"
        },
        use_rate_card: {
          type: "string",
          description: "Rate card ID to use for pricing"
        },
        notes: {
          type: "string",
          description: "Additional notes for the client"
        }
      },
      required: ["title"]
    }
  },

  // Get quote details
  get_quote: {
    name: "get_quote",
    description: "Retrieve detailed information about a specific quote",
    inputSchema: {
      type: "object",
      properties: {
        quote_id: {
          type: "string",
          description: "Quote ID or quote number (e.g., Q-2025-0042)"
        }
      },
      required: ["quote_id"]
    }
  },

  // List quotes
  list_quotes: {
    name: "list_quotes",
    description: "List quotes with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["draft", "sent", "viewed", "accepted", "declined", "expired"],
          description: "Filter by status"
        },
        client_id: {
          type: "string",
          description: "Filter by client"
        },
        limit: {
          type: "number",
          description: "Maximum results (default: 10)"
        }
      }
    }
  },

  // Update quote
  update_quote: {
    name: "update_quote",
    description: "Update an existing quote",
    inputSchema: {
      type: "object",
      properties: {
        quote_id: { type: "string" },
        title: { type: "string" },
        notes: { type: "string" },
        valid_until: { type: "string" },
        add_items: {
          type: "array",
          items: { type: "object" }
        },
        remove_items: {
          type: "array",
          items: { type: "string" }
        },
        update_items: {
          type: "array",
          items: { type: "object" }
        }
      },
      required: ["quote_id"]
    }
  },

  // Send quote
  send_quote: {
    name: "send_quote",
    description: "Send a quote to the client via email",
    inputSchema: {
      type: "object",
      properties: {
        quote_id: { type: "string" },
        message: {
          type: "string",
          description: "Custom message to include in email"
        },
        cc: {
          type: "array",
          items: { type: "string" },
          description: "CC email addresses"
        }
      },
      required: ["quote_id"]
    }
  },

  // Convert quote to invoice
  convert_to_invoice: {
    name: "convert_to_invoice",
    description: "Convert an accepted quote to an invoice",
    inputSchema: {
      type: "object",
      properties: {
        quote_id: { type: "string" },
        due_days: {
          type: "number",
          description: "Days until payment due. Default: 30"
        },
        deposit_percentage: {
          type: "number",
          description: "If set, creates deposit invoice for this percentage"
        }
      },
      required: ["quote_id"]
    }
  },

  // Duplicate quote
  duplicate_quote: {
    name: "duplicate_quote",
    description: "Create a copy of an existing quote",
    inputSchema: {
      type: "object",
      properties: {
        quote_id: { type: "string" },
        new_client_id: {
          type: "string",
          description: "Assign to different client (optional)"
        },
        new_title: { type: "string" }
      },
      required: ["quote_id"]
    }
  }
};
```

### 3.2 Invoice Tools

```typescript
// tools/invoices.ts

export const invoiceTools = {
  create_invoice: {
    name: "create_invoice",
    description: "Create a new invoice for a client",
    inputSchema: {
      type: "object",
      properties: {
        client_id: { type: "string" },
        client_name: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              quantity: { type: "number" },
              unit_price: { type: "number" }
            }
          }
        },
        due_days: { type: "number" },
        notes: { type: "string" }
      }
    }
  },

  get_invoice: {
    name: "get_invoice",
    description: "Get invoice details",
    inputSchema: {
      type: "object",
      properties: {
        invoice_id: { type: "string" }
      },
      required: ["invoice_id"]
    }
  },

  list_invoices: {
    name: "list_invoices",
    description: "List invoices with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["draft", "sent", "viewed", "paid", "partial", "overdue", "void"]
        },
        client_id: { type: "string" },
        overdue_only: { type: "boolean" },
        limit: { type: "number" }
      }
    }
  },

  send_invoice: {
    name: "send_invoice",
    description: "Send invoice to client",
    inputSchema: {
      type: "object",
      properties: {
        invoice_id: { type: "string" },
        message: { type: "string" }
      },
      required: ["invoice_id"]
    }
  },

  send_reminder: {
    name: "send_reminder",
    description: "Send payment reminder for an invoice",
    inputSchema: {
      type: "object",
      properties: {
        invoice_id: { type: "string" },
        message: { type: "string" },
        urgency: {
          type: "string",
          enum: ["gentle", "firm", "urgent"]
        }
      },
      required: ["invoice_id"]
    }
  },

  record_payment: {
    name: "record_payment",
    description: "Record a payment received for an invoice",
    inputSchema: {
      type: "object",
      properties: {
        invoice_id: { type: "string" },
        amount: { type: "number" },
        method: {
          type: "string",
          enum: ["stripe", "bank", "cash", "check", "other"]
        },
        reference: { type: "string" },
        paid_at: { type: "string" }
      },
      required: ["invoice_id", "amount", "method"]
    }
  },

  get_payment_link: {
    name: "get_payment_link",
    description: "Get the payment link for an invoice",
    inputSchema: {
      type: "object",
      properties: {
        invoice_id: { type: "string" }
      },
      required: ["invoice_id"]
    }
  }
};
```

### 3.3 Client Tools

```typescript
// tools/clients.ts

export const clientTools = {
  search_clients: {
    name: "search_clients",
    description: "Search for clients by name, email, or company",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        },
        limit: { type: "number" }
      },
      required: ["query"]
    }
  },

  get_client: {
    name: "get_client",
    description: "Get detailed client information including history",
    inputSchema: {
      type: "object",
      properties: {
        client_id: { type: "string" }
      },
      required: ["client_id"]
    }
  },

  create_client: {
    name: "create_client",
    description: "Create a new client",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        company: { type: "string" },
        phone: { type: "string" },
        address: {
          type: "object",
          properties: {
            line1: { type: "string" },
            line2: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            postal_code: { type: "string" },
            country: { type: "string" }
          }
        },
        notes: { type: "string" }
      },
      required: ["name", "email"]
    }
  },

  update_client: {
    name: "update_client",
    description: "Update client information",
    inputSchema: {
      type: "object",
      properties: {
        client_id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        company: { type: "string" },
        phone: { type: "string" },
        notes: { type: "string" }
      },
      required: ["client_id"]
    }
  },

  get_client_history: {
    name: "get_client_history",
    description: "Get full commercial history with a client",
    inputSchema: {
      type: "object",
      properties: {
        client_id: { type: "string" },
        include: {
          type: "array",
          items: {
            type: "string",
            enum: ["quotes", "invoices", "contracts", "payments"]
          }
        }
      },
      required: ["client_id"]
    }
  }
};
```

### 3.4 Rate Card Tools

```typescript
// tools/rate-cards.ts

export const rateCardTools = {
  list_rate_cards: {
    name: "list_rate_cards",
    description: "List all rate cards",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },

  get_rate_card: {
    name: "get_rate_card",
    description: "Get rate card details with all items",
    inputSchema: {
      type: "object",
      properties: {
        rate_card_id: { type: "string" }
      },
      required: ["rate_card_id"]
    }
  },

  search_rates: {
    name: "search_rates",
    description: "Search for specific rates/services across rate cards",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Service or item to search for"
        },
        category: { type: "string" }
      },
      required: ["query"]
    }
  }
};
```

### 3.5 Analytics Tools

```typescript
// tools/analytics.ts

export const analyticsTools = {
  get_dashboard: {
    name: "get_dashboard",
    description: "Get overview dashboard metrics",
    inputSchema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["7d", "30d", "90d", "12m"],
          description: "Time period for metrics"
        }
      }
    }
  },

  get_outstanding_invoices: {
    name: "get_outstanding_invoices",
    description: "Get summary of unpaid and overdue invoices",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },

  get_pending_quotes: {
    name: "get_pending_quotes",
    description: "Get quotes awaiting response",
    inputSchema: {
      type: "object",
      properties: {
        expiring_within_days: {
          type: "number",
          description: "Show quotes expiring within N days"
        }
      }
    }
  },

  get_revenue_report: {
    name: "get_revenue_report",
    description: "Get revenue analytics",
    inputSchema: {
      type: "object",
      properties: {
        period: { type: "string" },
        group_by: {
          type: "string",
          enum: ["day", "week", "month", "client"]
        }
      }
    }
  }
};
```

---

## 4. Resource Definitions

Resources provide read-only access to Oreko data.

```typescript
// resources/index.ts

export const resources = {
  // Quote resources
  "quote://{quote_id}": {
    name: "Quote",
    description: "A specific quote document",
    mimeType: "application/json"
  },

  "quote://{quote_id}/pdf": {
    name: "Quote PDF",
    description: "PDF version of the quote",
    mimeType: "application/pdf"
  },

  // Invoice resources
  "invoice://{invoice_id}": {
    name: "Invoice",
    description: "A specific invoice document",
    mimeType: "application/json"
  },

  // Client resources
  "client://{client_id}": {
    name: "Client",
    description: "Client information and history",
    mimeType: "application/json"
  },

  // Rate card resources
  "rate-card://{rate_card_id}": {
    name: "Rate Card",
    description: "Rate card with all items",
    mimeType: "application/json"
  },

  // Analytics resources
  "analytics://dashboard": {
    name: "Dashboard",
    description: "Current dashboard metrics",
    mimeType: "application/json"
  },

  "analytics://outstanding": {
    name: "Outstanding Invoices",
    description: "Summary of unpaid invoices",
    mimeType: "application/json"
  }
};
```

---

## 5. Prompt Templates

```typescript
// prompts/templates.ts

export const prompts = {
  create_quote_from_description: {
    name: "create_quote_from_description",
    description: "Generate a structured quote from a natural language description",
    arguments: [
      {
        name: "description",
        description: "Natural language description of the project/work",
        required: true
      },
      {
        name: "client_context",
        description: "Client name or ID for context",
        required: false
      }
    ]
  },

  summarize_client_relationship: {
    name: "summarize_client_relationship",
    description: "Generate a summary of the relationship with a client",
    arguments: [
      {
        name: "client_id",
        description: "Client ID",
        required: true
      }
    ]
  },

  draft_follow_up_message: {
    name: "draft_follow_up_message",
    description: "Draft a follow-up message for an unpaid invoice or pending quote",
    arguments: [
      {
        name: "document_type",
        description: "quote or invoice",
        required: true
      },
      {
        name: "document_id",
        description: "ID of the quote or invoice",
        required: true
      },
      {
        name: "tone",
        description: "gentle, professional, or firm",
        required: false
      }
    ]
  },

  weekly_summary: {
    name: "weekly_summary",
    description: "Generate a weekly business summary",
    arguments: []
  }
};
```

---

## 6. Implementation

### 6.1 Server Setup

```typescript
// src/server.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { quoteTools, invoiceTools, clientTools, rateCardTools, analyticsTools } from "./tools";
import { resources } from "./resources";
import { prompts } from "./prompts";
import { ApiClient } from "./api/client";

export class OrekoMCPServer {
  private server: Server;
  private apiClient: ApiClient;

  constructor(apiKey: string, baseUrl: string) {
    this.apiClient = new ApiClient(apiKey, baseUrl);

    this.server = new Server(
      {
        name: "oreko-mcp",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );

    this.setupTools();
    this.setupResources();
    this.setupPrompts();
  }

  private setupTools() {
    const allTools = {
      ...quoteTools,
      ...invoiceTools,
      ...clientTools,
      ...rateCardTools,
      ...analyticsTools
    };

    this.server.setRequestHandler("tools/list", async () => ({
      tools: Object.values(allTools)
    }));

    this.server.setRequestHandler("tools/call", async (request) => {
      const { name, arguments: args } = request.params;
      return this.handleToolCall(name, args);
    });
  }

  private setupResources() {
    this.server.setRequestHandler("resources/list", async () => ({
      resources: Object.entries(resources).map(([uri, resource]) => ({
        uri,
        ...resource
      }))
    }));

    this.server.setRequestHandler("resources/read", async (request) => {
      const { uri } = request.params;
      return this.handleResourceRead(uri);
    });
  }

  private setupPrompts() {
    this.server.setRequestHandler("prompts/list", async () => ({
      prompts: Object.values(prompts)
    }));

    this.server.setRequestHandler("prompts/get", async (request) => {
      const { name, arguments: args } = request.params;
      return this.handlePromptGet(name, args);
    });
  }

  private async handleToolCall(name: string, args: any) {
    // Implementation for each tool
    switch (name) {
      case "create_quote":
        return this.createQuote(args);
      case "get_quote":
        return this.getQuote(args);
      case "list_quotes":
        return this.listQuotes(args);
      // ... etc
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async createQuote(args: any) {
    // If natural language description provided, parse it
    if (args.description && !args.items) {
      args.items = await this.parseQuoteDescription(args.description);
    }

    // Resolve client if name provided
    if (args.client_name && !args.client_id) {
      const clients = await this.apiClient.searchClients(args.client_name);
      if (clients.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No client found matching "${args.client_name}". Would you like to create a new client?`
          }]
        };
      }
      args.client_id = clients[0].id;
    }

    const quote = await this.apiClient.createQuote(args);

    return {
      content: [{
        type: "text",
        text: `Created quote ${quote.number} for ${quote.client.name}\n` +
              `Total: ${this.formatCurrency(quote.total, quote.currency)}\n` +
              `Valid until: ${this.formatDate(quote.valid_until)}\n\n` +
              `Items:\n${this.formatItems(quote.items)}`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
```

### 6.2 API Client

```typescript
// src/api/client.ts

export class ApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  }

  // Quotes
  async createQuote(input: CreateQuoteInput) {
    return this.request<Quote>("POST", "/api/v1/quotes", input);
  }

  async getQuote(id: string) {
    return this.request<Quote>("GET", `/api/v1/quotes/${id}`);
  }

  async listQuotes(params?: ListQuotesParams) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Quote[]>("GET", `/api/v1/quotes?${query}`);
  }

  async sendQuote(id: string, input: SendQuoteInput) {
    return this.request<void>("POST", `/api/v1/quotes/${id}/send`, input);
  }

  async convertToInvoice(id: string, input?: ConvertInput) {
    return this.request<Invoice>(
      "POST",
      `/api/v1/quotes/${id}/convert-to-invoice`,
      input
    );
  }

  // Clients
  async searchClients(query: string) {
    return this.request<Client[]>(
      "GET",
      `/api/v1/clients?search=${encodeURIComponent(query)}`
    );
  }

  async getClient(id: string) {
    return this.request<Client>("GET", `/api/v1/clients/${id}`);
  }

  async getClientHistory(id: string) {
    return this.request<ClientHistory>(
      "GET",
      `/api/v1/clients/${id}/activity`
    );
  }

  // Invoices
  async listInvoices(params?: ListInvoicesParams) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Invoice[]>("GET", `/api/v1/invoices?${query}`);
  }

  async sendReminder(id: string, input: ReminderInput) {
    return this.request<void>("POST", `/api/v1/invoices/${id}/remind`, input);
  }

  // Analytics
  async getDashboard(period: string = "30d") {
    return this.request<DashboardData>(
      "GET",
      `/api/v1/analytics/overview?period=${period}`
    );
  }
}
```

### 6.3 Entry Point

```typescript
// src/index.ts

import { OrekoMCPServer } from "./server";

const apiKey = process.env.OREKO_API_KEY;
const baseUrl = process.env.OREKO_API_URL || "https://app.oreko.io";

if (!apiKey) {
  console.error("OREKO_API_KEY environment variable required");
  process.exit(1);
}

const server = new OrekoMCPServer(apiKey, baseUrl);
server.run().catch(console.error);
```

---

## 7. Configuration

### 7.1 Claude Desktop Configuration

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "oreko": {
      "command": "npx",
      "args": ["-y", "@oreko/mcp-server"],
      "env": {
        "OREKO_API_KEY": "qc_live_xxxxxxxxxxxx",
        "OREKO_API_URL": "https://app.oreko.io"
      }
    }
  }
}
```

### 7.2 Self-Hosted Configuration

```json
{
  "mcpServers": {
    "oreko": {
      "command": "npx",
      "args": ["-y", "@oreko/mcp-server"],
      "env": {
        "OREKO_API_KEY": "qc_live_xxxxxxxxxxxx",
        "OREKO_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

---

## 8. Usage Examples

### 8.1 Creating a Quote via Claude

```
User: Create a quote for Acme Corp for a 3-month website redesign project

Claude: [Uses create_quote tool]
I've created quote Q-2025-0087 for Acme Corp:

**Website Redesign Project**
- Discovery & Research: $2,500
- UX Design (40 hours): $4,000
- Visual Design (60 hours): $6,000
- Development (120 hours): $12,000
- Testing & QA (20 hours): $2,000
- Project Management: $1,500

**Total: $28,000**
Valid until: March 15, 2025

Would you like me to send this to the client?
```

### 8.2 Following Up on Invoices

```
User: What invoices are overdue?

Claude: [Uses get_outstanding_invoices tool]
You have 3 overdue invoices totaling $12,500:

1. INV-2025-0034 - Acme Corp - $5,000 (15 days overdue)
2. INV-2025-0041 - Beta LLC - $4,500 (8 days overdue)
3. INV-2025-0045 - Gamma Inc - $3,000 (3 days overdue)

Would you like me to send payment reminders?

User: Yes, send a gentle reminder to Acme and a firm one to Beta

Claude: [Uses send_reminder tool twice]
Done. I've sent:
- A gentle reminder to john@acmecorp.com for INV-2025-0034
- A firm reminder to billing@betallc.com for INV-2025-0041
```

---

## 9. Testing

```typescript
// tests/tools.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import { OrekoMCPServer } from "../src/server";

describe("Quote Tools", () => {
  let server: OrekoMCPServer;

  beforeAll(() => {
    server = new OrekoMCPServer(
      process.env.TEST_API_KEY!,
      process.env.TEST_API_URL!
    );
  });

  it("should create a quote from natural language", async () => {
    const result = await server.handleToolCall("create_quote", {
      client_name: "Test Client",
      title: "Test Project",
      description: "Website design for 40 hours at $100/hour"
    });

    expect(result.content[0].text).toContain("Created quote");
    expect(result.content[0].text).toContain("$4,000");
  });

  it("should list quotes with filtering", async () => {
    const result = await server.handleToolCall("list_quotes", {
      status: "sent",
      limit: 5
    });

    expect(result.content[0].text).toBeDefined();
  });
});
```

---

## 10. Success Criteria

| Metric | Target |
|--------|--------|
| Tool coverage | 100% of core actions |
| Response time | < 2s for all tools |
| Error handling | Graceful errors with actionable messages |
| Documentation | README with all examples |
| Test coverage | > 80% |
| Claude compatibility | Tested with Claude Desktop |
