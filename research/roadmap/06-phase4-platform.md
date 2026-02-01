# Phase 4: Platform & Data Products Specification

## Overview

**Duration:** Months 12-18
**Goal:** Build network effects and platform value
**Dependencies:** Phase 1-3 complete

---

## 1. Pricing Intelligence System

### 1.1 Data Collection & Aggregation

```
┌─────────────────────────────────────────────────────────────┐
│                  Anonymous Data Collection                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │ Quote Data  │ │ Invoice     │ │ Outcome Data        │    │
│  │ - Services  │ │ - Amounts   │ │ - Accept/Decline    │    │
│  │ - Pricing   │ │ - Payment   │ │ - Time to decision  │    │
│  │ - Structure │ │   timing    │ │ - Revisions needed  │    │
│  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘    │
└─────────┼──────────────┼─────────────────────┼──────────────┘
          │              │                     │
          └──────────────┴─────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Aggregation Pipeline                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Privacy Preservation                                  │   │
│  │ - Differential privacy (ε = 1.0)                     │   │
│  │ - K-anonymity (k ≥ 50)                               │   │
│  │ - Data minimization                                   │   │
│  │ - No PII in aggregates                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Aggregate Metrics                                     │   │
│  │ - Rate benchmarks by service category                │   │
│  │ - Acceptance rates by price point                    │   │
│  │ - Industry/region patterns                           │   │
│  │ - Timing optimization data                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Pricing Insights API

```typescript
// lib/pricing-intelligence/insights.ts

interface PricingBenchmark {
  service_category: string;
  region?: string;
  industry?: string;

  pricing: {
    percentile_25: number;
    percentile_50: number;  // median
    percentile_75: number;
    percentile_90: number;
  };

  unit: string;
  sample_size: number;
  last_updated: string;
  confidence: number;
}

interface AcceptanceInsight {
  price_range: {
    min: number;
    max: number;
  };
  acceptance_rate: number;
  avg_decision_days: number;
  sample_size: number;
}

interface TimingInsight {
  day_of_week: number;
  hour_of_day: number;
  relative_acceptance_rate: number;  // vs. baseline
  sample_size: number;
}

// API Endpoints
// GET /api/v1/insights/pricing/benchmarks
interface BenchmarkRequest {
  service_category: string;
  region?: string;
  industry?: string;
}

// GET /api/v1/insights/pricing/position
interface PositionRequest {
  service_category: string;
  your_rate: number;
  unit: string;
}

interface PositionResponse {
  percentile: number;          // Where you fall in the market
  comparison: "below" | "at" | "above";
  recommendation?: string;
  market_data: PricingBenchmark;
}

// GET /api/v1/insights/acceptance
interface AcceptanceRequest {
  total_amount: number;
  client_industry?: string;
  item_count?: number;
}

interface AcceptanceResponse {
  predicted_acceptance_rate: number;
  confidence: number;
  factors: {
    name: string;
    impact: "positive" | "negative" | "neutral";
    suggestion?: string;
  }[];
  similar_quotes: {
    acceptance_rate: number;
    sample_size: number;
  };
}
```

### 1.3 Dashboard Integration

```typescript
// components/insights/PricingInsightsCard.tsx

export function PricingInsightsCard({ quoteId }: { quoteId: string }) {
  const { data: quote } = useQuote(quoteId);
  const { data: insights } = usePricingInsights(quote);

  if (!insights) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Pricing Insights
          <Badge variant="secondary">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Position */}
        <div>
          <h4 className="font-medium mb-2">Market Position</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <PricingGauge
                value={insights.position.percentile}
                segments={[
                  { label: "Below Market", range: [0, 25], color: "yellow" },
                  { label: "At Market", range: [25, 75], color: "green" },
                  { label: "Premium", range: [75, 100], color: "blue" }
                ]}
              />
            </div>
            <div className="text-sm">
              <p className="font-medium">
                {insights.position.percentile}th percentile
              </p>
              <p className="text-muted-foreground">
                {insights.position.comparison === "above"
                  ? "Above market average"
                  : insights.position.comparison === "below"
                  ? "Below market average"
                  : "At market rate"}
              </p>
            </div>
          </div>
        </div>

        {/* Acceptance Prediction */}
        <div>
          <h4 className="font-medium mb-2">Acceptance Likelihood</h4>
          <div className="flex items-center gap-4">
            <CircularProgress
              value={insights.acceptance.predicted_rate * 100}
              size="lg"
              color={
                insights.acceptance.predicted_rate > 0.6
                  ? "green"
                  : insights.acceptance.predicted_rate > 0.3
                  ? "yellow"
                  : "red"
              }
            />
            <div className="space-y-1">
              {insights.acceptance.factors.map((factor, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {factor.impact === "positive" ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : factor.impact === "negative" ? (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <span>{factor.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {insights.suggestions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Suggestions</h4>
            <ul className="space-y-2">
              {insights.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 mt-0.5 text-amber-500" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 1.4 Privacy Implementation

```typescript
// lib/pricing-intelligence/privacy.ts

import { createNoise } from "differential-privacy";

interface PrivacyConfig {
  epsilon: number;          // Privacy budget
  delta: number;            // Failure probability
  minGroupSize: number;     // K-anonymity threshold
}

const DEFAULT_CONFIG: PrivacyConfig = {
  epsilon: 1.0,
  delta: 1e-5,
  minGroupSize: 50
};

class PrivacyPreservingAggregator {
  private config: PrivacyConfig;

  constructor(config: PrivacyConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  async aggregatePricingData(
    category: string,
    filters: AggregationFilters
  ): Promise<PricingBenchmark | null> {
    // Get raw data matching filters
    const rawData = await this.fetchRawData(category, filters);

    // Check k-anonymity
    if (rawData.length < this.config.minGroupSize) {
      return null;  // Insufficient data for privacy
    }

    // Calculate base statistics
    const prices = rawData.map(d => d.unit_price);
    const sorted = prices.sort((a, b) => a - b);

    // Add Laplacian noise for differential privacy
    const noise = createNoise(this.config.epsilon);

    const percentiles = {
      percentile_25: this.addNoise(
        sorted[Math.floor(sorted.length * 0.25)],
        noise
      ),
      percentile_50: this.addNoise(
        sorted[Math.floor(sorted.length * 0.5)],
        noise
      ),
      percentile_75: this.addNoise(
        sorted[Math.floor(sorted.length * 0.75)],
        noise
      ),
      percentile_90: this.addNoise(
        sorted[Math.floor(sorted.length * 0.9)],
        noise
      )
    };

    // Round to reduce precision (further privacy)
    return {
      service_category: category,
      region: filters.region,
      industry: filters.industry,
      pricing: this.roundPercentiles(percentiles),
      unit: this.getMostCommonUnit(rawData),
      sample_size: this.roundSampleSize(rawData.length),
      last_updated: new Date().toISOString(),
      confidence: this.calculateConfidence(rawData.length)
    };
  }

  private addNoise(value: number, noise: NoiseGenerator): number {
    const sensitivity = value * 0.1;  // 10% sensitivity
    return value + noise.sample() * sensitivity;
  }

  private roundPercentiles(percentiles: Record<string, number>) {
    // Round to nearest $5 or 5%
    return Object.fromEntries(
      Object.entries(percentiles).map(([k, v]) => [
        k,
        Math.round(v / 5) * 5
      ])
    );
  }

  private roundSampleSize(size: number): number {
    // Report in ranges for privacy
    if (size < 100) return 50;   // "50+"
    if (size < 500) return 100;  // "100+"
    if (size < 1000) return 500; // "500+"
    return 1000;                 // "1000+"
  }
}

// Opt-in/opt-out management
interface DataSharingPreferences {
  organization_id: string;
  share_pricing_data: boolean;
  share_acceptance_data: boolean;
  share_timing_data: boolean;
  receive_insights: boolean;
}

async function updateDataSharingPreferences(
  orgId: string,
  preferences: Partial<DataSharingPreferences>
) {
  // Users must opt-in for data to be included
  // They get insights even without sharing (from aggregate)
  await db.organization.update({
    where: { id: orgId },
    data: {
      data_sharing_preferences: preferences
    }
  });
}
```

---

## 2. Template Marketplace

### 2.1 Template Schema

```typescript
interface MarketplaceTemplate {
  id: string;
  type: "quote" | "invoice" | "contract" | "email";

  // Metadata
  name: string;
  description: string;
  preview_image: string;
  screenshots: string[];

  // Categorization
  category: string;           // "consulting", "creative", "construction"
  industry: string[];
  tags: string[];

  // Author
  author: {
    id: string;
    name: string;
    is_verified: boolean;
    template_count: number;
    avg_rating: number;
  };

  // Pricing
  pricing: {
    type: "free" | "paid" | "subscription";
    price?: number;
    currency?: string;
  };

  // Stats
  stats: {
    downloads: number;
    rating: number;
    reviews_count: number;
    last_updated: string;
  };

  // Content
  content: TemplateContent;
  customization_options: CustomizationOption[];

  // Compatibility
  min_version?: string;
  required_features?: string[];
}

interface TemplateContent {
  // For quote/invoice templates
  structure?: {
    sections: TemplateSection[];
    default_items?: TemplateItem[];
    terms_template?: string;
    notes_template?: string;
  };

  // For email templates
  email?: {
    subject: string;
    body: string;
    variables: string[];
  };

  // For contract templates
  contract?: {
    clauses: ContractClause[];
    signature_positions: SignaturePosition[];
  };

  // Styling
  styles?: {
    colors: Record<string, string>;
    fonts: Record<string, string>;
    layout: "classic" | "modern" | "minimal";
  };
}

interface CustomizationOption {
  id: string;
  label: string;
  type: "text" | "color" | "select" | "toggle";
  default_value: any;
  options?: { label: string; value: any }[];
}
```

### 2.2 Marketplace API

```yaml
# Browse templates
GET /api/v1/marketplace/templates
  Query:
    type: quote | invoice | contract | email
    category: string
    industry: string
    pricing: free | paid
    sort: popular | newest | rating
    cursor: string
    limit: number
  Response: ApiResponse<MarketplaceTemplate[]>

# Get template details
GET /api/v1/marketplace/templates/:id
  Response: ApiResponse<MarketplaceTemplate>

# Install template
POST /api/v1/marketplace/templates/:id/install
  Body:
    customizations?: Record<string, any>
  Response: ApiResponse<InstalledTemplate>

# Preview template
POST /api/v1/marketplace/templates/:id/preview
  Body:
    sample_data?: object
  Response: ApiResponse<{ preview_url: string }>

# Rate/review template
POST /api/v1/marketplace/templates/:id/reviews
  Body:
    rating: number (1-5)
    review?: string
  Response: ApiResponse<Review>

# List installed templates
GET /api/v1/templates/installed
  Response: ApiResponse<InstalledTemplate[]>

# Submit template to marketplace
POST /api/v1/marketplace/templates/submit
  Body: MarketplaceTemplateSubmission
  Response: ApiResponse<{ submission_id: string, status: "pending" }>

# My published templates (for authors)
GET /api/v1/marketplace/my-templates
  Response: ApiResponse<MarketplaceTemplate[]>
```

### 2.3 Marketplace UI

```typescript
// components/marketplace/TemplateMarketplace.tsx

export function TemplateMarketplace() {
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [sort, setSort] = useState<SortOption>("popular");

  const { data: templates, isLoading } = useMarketplaceTemplates({
    ...filters,
    sort
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Template Marketplace</h1>
          <p className="text-muted-foreground">
            Professional templates created by the community
          </p>
        </div>
        <Button onClick={() => navigate("/marketplace/submit")}>
          <Upload className="w-4 h-4 mr-2" />
          Submit Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={filters.type}
          onValueChange={(v) => setFilters({ ...filters, type: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quote">Quotes</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
            <SelectItem value="email">Emails</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(v) => setFilters({ ...filters, category: v })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consulting">Consulting</SelectItem>
            <SelectItem value="creative">Creative Agency</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="construction">Construction</SelectItem>
            <SelectItem value="events">Events</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.pricing}
          onValueChange={(v) => setFilters({ ...filters, pricing: v })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <TemplateGridSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => previewTemplate(template.id)}
              onInstall={() => installTemplate(template.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, onPreview, onInstall }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Preview Image */}
      <div className="aspect-[4/3] relative bg-muted">
        <img
          src={template.preview_image}
          alt={template.name}
          className="object-cover w-full h-full"
        />
        {template.pricing.type === "free" && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            Free
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title & Author */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-muted-foreground">
              by {template.author.name}
              {template.author.is_verified && (
                <BadgeCheck className="w-4 h-4 inline ml-1 text-blue-500" />
              )}
            </p>
          </div>
          {template.pricing.type === "paid" && (
            <span className="font-semibold">
              ${template.pricing.price}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {template.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {template.stats.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            {formatNumber(template.stats.downloads)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onPreview}>
            Preview
          </Button>
          <Button className="flex-1" onClick={onInstall}>
            {template.pricing.type === "free" ? "Install" : "Buy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 3. Developer API Portal

### 3.1 Portal Features

```
┌─────────────────────────────────────────────────────────────┐
│                   Developer Portal                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Documentation                                        │    │
│  │ - Interactive API explorer                          │    │
│  │ - Code examples (JS, Python, PHP, Ruby, Go)        │    │
│  │ - Webhook reference                                 │    │
│  │ - MCP server guide                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Developer Dashboard                                  │    │
│  │ - API key management                                │    │
│  │ - Usage analytics                                   │    │
│  │ - Webhook logs                                      │    │
│  │ - Rate limit status                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ App Marketplace (for integrations)                   │    │
│  │ - Submit apps for listing                           │    │
│  │ - OAuth app management                              │    │
│  │ - App analytics                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ SDKs & Tools                                         │    │
│  │ - Official SDKs                                     │    │
│  │ - CLI tool                                          │    │
│  │ - Postman collection                                │    │
│  │ - OpenAPI spec download                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 SDK Implementation

```typescript
// packages/sdk-js/src/index.ts

import { QuoteCraftClient } from "./client";

export { QuoteCraftClient };

// Usage example:
/*
import { QuoteCraftClient } from "@quotecraft/sdk";

const client = new QuoteCraftClient({
  apiKey: "qc_live_xxxx",
  baseUrl: "https://api.quotecraft.io"  // or self-hosted URL
});

// Create a quote
const quote = await client.quotes.create({
  client_id: "cli_123",
  title: "Website Redesign",
  items: [
    { name: "Design", quantity: 40, unit: "hours", unit_price: 150 },
    { name: "Development", quantity: 80, unit: "hours", unit_price: 125 }
  ]
});

// Send the quote
await client.quotes.send(quote.id, {
  message: "Please review the attached quote"
});

// List invoices
const invoices = await client.invoices.list({
  status: "overdue"
});

// Subscribe to webhooks
client.webhooks.on("quote.accepted", async (event) => {
  console.log(`Quote ${event.data.number} was accepted!`);
  // Create invoice automatically
  await client.quotes.convertToInvoice(event.data.id);
});
*/

export class QuoteCraftClient {
  private apiKey: string;
  private baseUrl: string;

  quotes: QuotesResource;
  invoices: InvoicesResource;
  clients: ClientsResource;
  rateCards: RateCardsResource;
  contracts: ContractsResource;
  webhooks: WebhooksResource;
  templates: TemplatesResource;

  constructor(config: ClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.quotecraft.io";

    const httpClient = new HttpClient(this.apiKey, this.baseUrl);

    this.quotes = new QuotesResource(httpClient);
    this.invoices = new InvoicesResource(httpClient);
    this.clients = new ClientsResource(httpClient);
    this.rateCards = new RateCardsResource(httpClient);
    this.contracts = new ContractsResource(httpClient);
    this.webhooks = new WebhooksResource(httpClient);
    this.templates = new TemplatesResource(httpClient);
  }
}

// Resource implementations
class QuotesResource {
  constructor(private http: HttpClient) {}

  async create(data: CreateQuoteInput): Promise<Quote> {
    return this.http.post("/v1/quotes", data);
  }

  async get(id: string): Promise<Quote> {
    return this.http.get(`/v1/quotes/${id}`);
  }

  async list(params?: ListQuotesParams): Promise<PaginatedResponse<Quote>> {
    return this.http.get("/v1/quotes", { params });
  }

  async update(id: string, data: UpdateQuoteInput): Promise<Quote> {
    return this.http.patch(`/v1/quotes/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`/v1/quotes/${id}`);
  }

  async send(id: string, options?: SendQuoteOptions): Promise<void> {
    return this.http.post(`/v1/quotes/${id}/send`, options);
  }

  async convertToInvoice(
    id: string,
    options?: ConvertOptions
  ): Promise<Invoice> {
    return this.http.post(`/v1/quotes/${id}/convert-to-invoice`, options);
  }

  async duplicate(id: string): Promise<Quote> {
    return this.http.post(`/v1/quotes/${id}/duplicate`);
  }

  // Natural language creation
  async generateFromDescription(
    description: string,
    options?: GenerateOptions
  ): Promise<Quote> {
    return this.http.post("/v1/quotes/generate", {
      prompt: description,
      ...options
    });
  }
}
```

### 3.3 CLI Tool

```typescript
// packages/cli/src/index.ts

#!/usr/bin/env node

import { Command } from "commander";
import { QuoteCraftClient } from "@quotecraft/sdk";

const program = new Command();

program
  .name("quotecraft")
  .description("QuoteCraft CLI")
  .version("1.0.0");

// Authentication
program
  .command("login")
  .description("Authenticate with QuoteCraft")
  .action(async () => {
    const apiKey = await promptForApiKey();
    await saveCredentials(apiKey);
    console.log("✅ Logged in successfully");
  });

// Quotes
program
  .command("quotes")
  .description("Manage quotes")
  .addCommand(
    new Command("list")
      .description("List quotes")
      .option("-s, --status <status>", "Filter by status")
      .option("-l, --limit <number>", "Limit results", "10")
      .action(async (options) => {
        const client = await getClient();
        const quotes = await client.quotes.list(options);
        console.table(quotes.data.map(q => ({
          Number: q.number,
          Client: q.client.name,
          Total: formatCurrency(q.total),
          Status: q.status
        })));
      })
  )
  .addCommand(
    new Command("create")
      .description("Create a quote")
      .option("-c, --client <id>", "Client ID")
      .option("-t, --title <title>", "Quote title")
      .option("-d, --description <desc>", "Natural language description")
      .action(async (options) => {
        const client = await getClient();
        let quote;

        if (options.description) {
          quote = await client.quotes.generateFromDescription(
            options.description,
            { client_id: options.client }
          );
        } else {
          // Interactive mode
          const answers = await promptQuoteDetails();
          quote = await client.quotes.create(answers);
        }

        console.log(`✅ Created quote ${quote.number}`);
        console.log(`   Total: ${formatCurrency(quote.total)}`);
        console.log(`   URL: ${quote.url}`);
      })
  )
  .addCommand(
    new Command("send")
      .description("Send a quote")
      .argument("<quote-id>", "Quote ID or number")
      .option("-m, --message <message>", "Custom message")
      .action(async (quoteId, options) => {
        const client = await getClient();
        await client.quotes.send(quoteId, options);
        console.log("✅ Quote sent");
      })
  );

// Invoices
program
  .command("invoices")
  .description("Manage invoices")
  .addCommand(
    new Command("overdue")
      .description("List overdue invoices")
      .action(async () => {
        const client = await getClient();
        const invoices = await client.invoices.list({ status: "overdue" });
        console.table(invoices.data.map(i => ({
          Number: i.number,
          Client: i.client.name,
          Amount: formatCurrency(i.amount_due),
          "Days Overdue": getDaysOverdue(i.due_date)
        })));
      })
  );

// Quick summary
program
  .command("status")
  .description("Show business status")
  .action(async () => {
    const client = await getClient();
    const stats = await client.analytics.overview({ period: "30d" });

    console.log("\n📊 Last 30 Days\n");
    console.log(`  Quotes Sent:      ${stats.quotes_sent}`);
    console.log(`  Quotes Accepted:  ${stats.quotes_accepted}`);
    console.log(`  Acceptance Rate:  ${(stats.acceptance_rate * 100).toFixed(1)}%`);
    console.log(`  Revenue Quoted:   ${formatCurrency(stats.revenue_quoted)}`);
    console.log(`  Revenue Invoiced: ${formatCurrency(stats.revenue_invoiced)}`);
    console.log(`  Revenue Collected: ${formatCurrency(stats.revenue_collected)}`);
  });

program.parse();
```

---

## 4. Embedded Quote Widget

### 4.1 Widget Implementation

```typescript
// packages/embed/src/widget.ts

interface WidgetConfig {
  organizationId: string;
  containerId: string;
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  services?: string[];        // Filter to specific rate card items
  onQuoteSubmitted?: (quote: QuoteRequest) => void;
  onError?: (error: Error) => void;
}

class QuoteCraftWidget {
  private config: WidgetConfig;
  private iframe: HTMLIFrameElement;

  constructor(config: WidgetConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      throw new Error(`Container ${this.config.containerId} not found`);
    }

    // Create iframe
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.buildWidgetUrl();
    this.iframe.style.width = "100%";
    this.iframe.style.border = "none";
    this.iframe.style.minHeight = "500px";

    // Listen for messages from iframe
    window.addEventListener("message", this.handleMessage.bind(this));

    // Auto-resize iframe based on content
    this.setupResizeObserver();

    container.appendChild(this.iframe);
  }

  private buildWidgetUrl(): string {
    const params = new URLSearchParams({
      org: this.config.organizationId,
      theme: this.config.theme || "auto",
      ...(this.config.primaryColor && { color: this.config.primaryColor }),
      ...(this.config.services && { services: this.config.services.join(",") })
    });

    return `https://embed.quotecraft.io/request-quote?${params}`;
  }

  private handleMessage(event: MessageEvent) {
    if (event.origin !== "https://embed.quotecraft.io") return;

    switch (event.data.type) {
      case "quote_submitted":
        this.config.onQuoteSubmitted?.(event.data.quote);
        break;
      case "error":
        this.config.onError?.(new Error(event.data.message));
        break;
      case "resize":
        this.iframe.style.height = `${event.data.height}px`;
        break;
    }
  }

  destroy() {
    window.removeEventListener("message", this.handleMessage);
    this.iframe.remove();
  }
}

// Usage:
/*
<div id="quote-widget"></div>
<script src="https://embed.quotecraft.io/widget.js"></script>
<script>
  new QuoteCraftWidget({
    organizationId: "org_xxx",
    containerId: "quote-widget",
    theme: "light",
    services: ["web-design", "development"],
    onQuoteSubmitted: (quote) => {
      console.log("Quote request submitted:", quote);
      // Track conversion, show thank you message, etc.
    }
  });
</script>
*/
```

---

## 5. White-Label Infrastructure

### 5.1 White-Label Configuration

```typescript
interface WhiteLabelConfig {
  // Branding
  branding: {
    logo_url: string;
    favicon_url: string;
    app_name: string;
    primary_color: string;
    secondary_color: string;
  };

  // Domain
  custom_domain?: {
    app_domain: string;           // app.clientbrand.com
    portal_domain: string;        // portal.clientbrand.com
    api_domain?: string;          // api.clientbrand.com
  };

  // Email
  email: {
    from_name: string;
    from_email: string;
    reply_to?: string;
    custom_smtp?: SMTPConfig;
  };

  // Features
  features: {
    hide_powered_by: boolean;
    custom_login_page: boolean;
    custom_email_templates: boolean;
  };

  // Pricing
  pricing_tier: "standard" | "premium" | "enterprise";
}

// API for white-label partners
interface WhiteLabelAPI {
  // Provision new organization
  createOrganization(data: {
    name: string;
    owner_email: string;
    plan: string;
  }): Promise<Organization>;

  // Manage organizations
  listOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization>;
  updateOrganization(id: string, data: Partial<Organization>): Promise<Organization>;
  suspendOrganization(id: string): Promise<void>;

  // Usage & billing
  getUsageReport(orgId: string, period: string): Promise<UsageReport>;
  getBillingOverview(): Promise<BillingOverview>;
}
```

---

## 6. Industry Vertical Packages

### 6.1 Vertical Package Structure

```typescript
interface IndustryVerticalPackage {
  id: string;
  name: string;
  industry: string;
  description: string;

  // Pre-configured content
  includes: {
    rate_cards: RateCardTemplate[];
    quote_templates: QuoteTemplate[];
    invoice_templates: InvoiceTemplate[];
    contract_templates: ContractTemplate[];
    email_templates: EmailTemplate[];
    automations: AutomationRule[];
  };

  // Industry-specific features
  features: {
    custom_fields: CustomFieldDefinition[];
    integrations: string[];            // Recommended integrations
    compliance: ComplianceConfig[];    // Industry compliance settings
  };

  // Onboarding
  onboarding: {
    checklist: OnboardingStep[];
    sample_data: boolean;
    guided_tour: boolean;
  };
}

// Example: Creative Agency Package
const creativeAgencyPackage: IndustryVerticalPackage = {
  id: "creative-agency",
  name: "Creative Agency Package",
  industry: "Creative & Design",
  description: "Tailored for creative agencies, design studios, and marketing firms",

  includes: {
    rate_cards: [
      {
        name: "Creative Services",
        items: [
          { name: "Brand Strategy", unit: "project", unit_price: 5000 },
          { name: "Logo Design", unit: "project", unit_price: 2500 },
          { name: "Brand Guidelines", unit: "project", unit_price: 3500 },
          { name: "Art Direction", unit: "hour", unit_price: 175 },
          { name: "Graphic Design", unit: "hour", unit_price: 125 },
          { name: "Illustration", unit: "hour", unit_price: 150 }
        ]
      },
      {
        name: "Digital Services",
        items: [
          { name: "Website Design", unit: "page", unit_price: 500 },
          { name: "UI/UX Design", unit: "hour", unit_price: 150 },
          { name: "Motion Graphics", unit: "hour", unit_price: 175 },
          { name: "Video Editing", unit: "hour", unit_price: 100 }
        ]
      }
    ],

    quote_templates: [
      {
        name: "Branding Project",
        sections: ["Discovery", "Strategy", "Design", "Deliverables", "Timeline"],
        default_terms: "50% deposit required. Revisions included: 2 rounds."
      },
      {
        name: "Retainer Agreement",
        sections: ["Scope", "Monthly Hours", "Rollover Policy", "Rate Card"]
      }
    ],

    contract_templates: [
      {
        name: "Creative Services Agreement",
        clauses: [
          "Scope of Work",
          "Intellectual Property Rights",
          "Usage Rights",
          "Revisions & Changes",
          "Kill Fee"
        ]
      }
    ],

    automations: [
      {
        name: "Project Kickoff",
        trigger: { type: "event", event: "quote.accepted" },
        actions: [
          { type: "send_email", config: { template: "project_kickoff" } },
          { type: "create_task", config: { title: "Schedule kickoff call" } }
        ]
      }
    ]
  },

  features: {
    custom_fields: [
      { name: "project_type", label: "Project Type", type: "select",
        options: ["Branding", "Web", "Print", "Video", "Campaign"] },
      { name: "usage_rights", label: "Usage Rights", type: "select",
        options: ["Limited", "Unlimited", "Exclusive"] }
    ],
    integrations: ["figma", "asana", "slack", "dropbox"],
    compliance: []
  },

  onboarding: {
    checklist: [
      { step: "Import existing clients", action: "import_clients" },
      { step: "Customize rate card", action: "edit_rate_card" },
      { step: "Set up branding", action: "branding_settings" },
      { step: "Create first quote", action: "create_quote" }
    ],
    sample_data: true,
    guided_tour: true
  }
};
```

---

## 7. Implementation Timeline

### Weeks 1-4: Pricing Intelligence
- [ ] Data aggregation pipeline
- [ ] Privacy-preserving algorithms
- [ ] Benchmark API endpoints
- [ ] Dashboard integration

### Weeks 5-8: Template Marketplace
- [ ] Marketplace data model
- [ ] Browse and search UI
- [ ] Template installation flow
- [ ] Author submission portal

### Weeks 9-12: Developer Platform
- [ ] Developer portal UI
- [ ] JavaScript SDK
- [ ] Python SDK
- [ ] CLI tool
- [ ] Postman collection

### Weeks 13-16: Embedded & White-Label
- [ ] Embedded widget
- [ ] White-label configuration
- [ ] Custom domain support
- [ ] Partner API

### Weeks 17-20: Industry Verticals
- [ ] Package framework
- [ ] Creative agency package
- [ ] Consulting package
- [ ] Construction package
- [ ] Package installation flow

---

## 8. Success Criteria

| Metric | Target |
|--------|--------|
| Pricing insights adoption | 25% of users |
| Marketplace templates | 500+ |
| Template installs/month | 1,000+ |
| Registered API developers | 100+ |
| SDK downloads/month | 500+ |
| Embedded widget installs | 50+ |
| White-label partners | 5+ |
| Revenue from platform | 10% of total |
