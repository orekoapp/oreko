# Phase 2: AI Native - Natural Language & Conversational UI

## Overview

**Duration:** Months 4-8
**Goal:** Embed AI capabilities directly into Oreko
**Dependencies:** Phase 1 API complete

---

## 1. Natural Language Quote Engine

### 1.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Natural Language Input                    │
│  "Create a quote for 3 months of social media management    │
│   for Acme Corp, monthly retainer of $2000 plus $500        │
│   setup fee"                                                 │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     NL Processing Pipeline                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐     │
│  │ Intent       │→ │ Entity       │→ │ Rate Card      │     │
│  │ Classification│  │ Extraction   │  │ Matching       │     │
│  └──────────────┘  └──────────────┘  └────────────────┘     │
│                                              │               │
│  ┌──────────────┐  ┌──────────────┐         │               │
│  │ Pricing      │← │ Structure    │←────────┘               │
│  │ Calculation  │  │ Generation   │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Structured Quote Output                   │
│  {                                                          │
│    "client": "Acme Corp",                                   │
│    "items": [                                               │
│      { "name": "Setup Fee", "amount": 500 },                │
│      { "name": "Monthly Retainer", "qty": 3, "rate": 2000 } │
│    ],                                                       │
│    "total": 6500                                            │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Intent Classification

```typescript
// lib/ai/intent-classifier.ts

type QuoteIntent =
  | "create_quote"           // New quote creation
  | "modify_quote"           // Update existing quote
  | "duplicate_quote"        // Copy existing quote
  | "query_quote"           // Get info about quote
  | "send_quote"            // Send to client
  | "convert_to_invoice"    // Quote to invoice
  | "create_invoice"        // Direct invoice
  | "query_invoice"         // Invoice info
  | "client_lookup"         // Find client
  | "rate_lookup"           // Check rates
  | "unclear";              // Need clarification

interface IntentResult {
  intent: QuoteIntent;
  confidence: number;
  entities: ExtractedEntities;
  clarifications_needed?: string[];
}

const INTENT_EXAMPLES = {
  create_quote: [
    "Create a quote for...",
    "I need to quote...",
    "Make a proposal for...",
    "Put together a quote...",
    "Draft an estimate for..."
  ],
  modify_quote: [
    "Update quote Q-2025-0042...",
    "Add a line item to...",
    "Change the price on...",
    "Remove the discount from..."
  ],
  // ... more examples
};
```

### 1.3 Entity Extraction

```typescript
// lib/ai/entity-extractor.ts

interface ExtractedEntities {
  client?: {
    name?: string;
    email?: string;
    company?: string;
    confidence: number;
  };
  items: ExtractedItem[];
  pricing?: {
    type: "fixed" | "hourly" | "monthly" | "per_unit";
    value?: number;
    currency?: string;
  };
  duration?: {
    value: number;
    unit: "hours" | "days" | "weeks" | "months";
  };
  deadline?: {
    type: "specific" | "relative";
    value: string | number;
  };
  discount?: {
    type: "percentage" | "fixed";
    value: number;
  };
  references?: {
    quote_id?: string;
    rate_card?: string;
    template?: string;
  };
}

interface ExtractedItem {
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total?: number;
  confidence: number;
  source: "explicit" | "rate_card" | "inferred";
}

// Example extractions:
const EXTRACTION_EXAMPLES = [
  {
    input: "Quote for 40 hours of web development at $150/hour",
    output: {
      items: [{
        name: "Web Development",
        quantity: 40,
        unit: "hours",
        unit_price: 150,
        confidence: 0.95,
        source: "explicit"
      }]
    }
  },
  {
    input: "3 months of social media management for Acme",
    output: {
      client: { name: "Acme", confidence: 0.9 },
      items: [{
        name: "Social Media Management",
        quantity: 3,
        unit: "months",
        confidence: 0.85,
        source: "inferred"  // Price from rate card
      }],
      duration: { value: 3, unit: "months" }
    }
  }
];
```

### 1.4 Rate Card Matching

```typescript
// lib/ai/rate-card-matcher.ts

interface RateCardMatch {
  rate_card_item_id: string;
  name: string;
  unit_price: number;
  unit: string;
  confidence: number;
  match_type: "exact" | "semantic" | "category";
}

async function matchToRateCard(
  extractedItem: ExtractedItem,
  rateCards: RateCard[]
): Promise<RateCardMatch | null> {
  // 1. Try exact name match
  const exactMatch = findExactMatch(extractedItem.name, rateCards);
  if (exactMatch) {
    return { ...exactMatch, confidence: 1.0, match_type: "exact" };
  }

  // 2. Try semantic similarity
  const semanticMatches = await findSemanticMatches(
    extractedItem.name,
    rateCards,
    { threshold: 0.8 }
  );
  if (semanticMatches.length > 0) {
    return {
      ...semanticMatches[0],
      confidence: semanticMatches[0].similarity,
      match_type: "semantic"
    };
  }

  // 3. Try category matching
  const categoryMatch = matchByCategory(extractedItem, rateCards);
  if (categoryMatch) {
    return { ...categoryMatch, confidence: 0.6, match_type: "category" };
  }

  return null;
}

// Semantic matching using embeddings
async function findSemanticMatches(
  query: string,
  rateCards: RateCard[],
  options: { threshold: number }
): Promise<Array<RateCardItem & { similarity: number }>> {
  const queryEmbedding = await getEmbedding(query);

  const matches = [];
  for (const card of rateCards) {
    for (const item of card.items) {
      const similarity = cosineSimilarity(
        queryEmbedding,
        item.embedding  // Pre-computed
      );
      if (similarity >= options.threshold) {
        matches.push({ ...item, similarity });
      }
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}
```

### 1.5 LLM Integration

```typescript
// lib/ai/llm-client.ts

interface LLMConfig {
  provider: "anthropic" | "openai" | "local";
  model: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: LLMConfig = {
  provider: "anthropic",
  model: "claude-3-haiku-20240307",  // Fast + cheap for parsing
  temperature: 0.1,
  maxTokens: 1000
};

async function parseQuoteRequest(
  input: string,
  context: {
    clients: ClientSummary[];
    rateCards: RateCardSummary[];
    recentQuotes: QuoteSummary[];
  }
): Promise<ParsedQuoteRequest> {
  const prompt = buildParsingPrompt(input, context);

  const response = await callLLM(prompt, {
    ...DEFAULT_CONFIG,
    responseFormat: { type: "json_object" }
  });

  return validateAndEnrich(JSON.parse(response));
}

function buildParsingPrompt(
  input: string,
  context: any
): string {
  return `
You are a quote parsing assistant. Parse the following request into structured data.

## Available Clients
${context.clients.map(c => `- ${c.name} (${c.company || 'No company'})`).join('\n')}

## Rate Card Items
${context.rateCards.flatMap(rc =>
  rc.items.map(i => `- ${i.name}: ${i.unit_price}/${i.unit}`)
).join('\n')}

## User Request
${input}

## Output Format
Return JSON with this structure:
{
  "client": { "name": string, "id": string | null },
  "title": string,
  "items": [
    {
      "name": string,
      "description": string | null,
      "quantity": number,
      "unit": string,
      "unit_price": number | null,
      "rate_card_match": string | null
    }
  ],
  "valid_days": number,
  "notes": string | null,
  "clarifications_needed": string[]
}

If any required information is missing or ambiguous, add to clarifications_needed.
`;
}
```

### 1.6 API Endpoints

```yaml
# Natural Language Quote Creation
POST /api/v1/quotes/generate
  Body:
    prompt: string            # Natural language request
    client_id?: string        # Optional client context
    rate_card_id?: string     # Optional rate card preference
    auto_match_rates: boolean # Default: true
  Response:
    success: true
    data:
      quote: Quote            # Generated quote (draft)
      parsing_details:
        entities_extracted: object
        rate_card_matches: array
        confidence: number
      clarifications?: string[]

# Natural Language Quote Update
POST /api/v1/quotes/:id/update-from-prompt
  Body:
    prompt: string            # "Add 10 hours of QA at $75/hour"
  Response:
    success: true
    data:
      quote: Quote
      changes_made: array

# Suggest Quote Content
POST /api/v1/quotes/suggest
  Body:
    client_id: string
    project_type?: string
    budget_hint?: string
  Response:
    success: true
    data:
      suggestions: [
        {
          title: string
          items: array
          estimated_total: number
          rationale: string
        }
      ]
```

---

## 2. AI Quote Assistant (Chat Interface)

### 2.1 UI Components

```typescript
// components/ai/QuoteAssistant.tsx

interface QuoteAssistantProps {
  onQuoteCreated?: (quote: Quote) => void;
  onClose?: () => void;
  initialContext?: {
    client?: Client;
    template?: Template;
  };
}

export function QuoteAssistant({
  onQuoteCreated,
  onClose,
  initialContext
}: QuoteAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftQuote, setDraftQuote] = useState<Partial<Quote> | null>(null);

  return (
    <Sheet>
      <SheetContent side="right" className="w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Quote Assistant
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Message History */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isProcessing && <TypingIndicator />}
          </div>

          {/* Draft Preview */}
          {draftQuote && (
            <QuoteDraftPreview
              quote={draftQuote}
              onEdit={(field) => handleEditField(field)}
              onConfirm={() => handleConfirmQuote()}
              onDiscard={() => setDraftQuote(null)}
            />
          )}

          {/* Input */}
          <div className="border-t pt-4">
            <ChatInput
              onSubmit={handleMessage}
              disabled={isProcessing}
              placeholder="Describe the quote you want to create..."
              suggestions={[
                "Create a quote for website redesign",
                "What's my standard rate for consulting?",
                "Quote Acme Corp for 3 months of support"
              ]}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### 2.2 Conversation Flow

```typescript
// lib/ai/conversation-manager.ts

interface ConversationState {
  id: string;
  messages: Message[];
  context: {
    intent?: QuoteIntent;
    entities: ExtractedEntities;
    draftQuote?: Partial<Quote>;
    pendingClarifications: string[];
  };
  status: "gathering" | "confirming" | "complete" | "cancelled";
}

class ConversationManager {
  private state: ConversationState;

  async processMessage(userMessage: string): Promise<AssistantResponse> {
    // Add to history
    this.state.messages.push({
      role: "user",
      content: userMessage
    });

    // Classify intent
    const intent = await classifyIntent(userMessage, this.state.context);

    // Handle based on current state
    switch (this.state.status) {
      case "gathering":
        return this.handleGathering(userMessage, intent);
      case "confirming":
        return this.handleConfirming(userMessage, intent);
      default:
        return this.handleFreshRequest(userMessage, intent);
    }
  }

  private async handleGathering(
    message: string,
    intent: IntentResult
  ): Promise<AssistantResponse> {
    // Extract new entities
    const newEntities = await extractEntities(message);

    // Merge with existing
    this.state.context.entities = mergeEntities(
      this.state.context.entities,
      newEntities
    );

    // Check if we have enough info
    const validation = validateForQuote(this.state.context.entities);

    if (validation.complete) {
      // Generate draft quote
      this.state.context.draftQuote = await generateDraftQuote(
        this.state.context.entities
      );
      this.state.status = "confirming";

      return {
        message: "I've put together a draft quote. Please review:",
        draftQuote: this.state.context.draftQuote,
        actions: [
          { label: "Looks good, create it", action: "confirm" },
          { label: "Make changes", action: "edit" },
          { label: "Start over", action: "cancel" }
        ]
      };
    } else {
      // Ask for missing info
      const question = generateClarifyingQuestion(validation.missing);
      return {
        message: question,
        suggestions: validation.suggestions
      };
    }
  }

  private async handleConfirming(
    message: string,
    intent: IntentResult
  ): Promise<AssistantResponse> {
    // Check for confirmation or edits
    if (isConfirmation(message)) {
      const quote = await createQuote(this.state.context.draftQuote!);
      this.state.status = "complete";
      return {
        message: `Quote ${quote.number} has been created.`,
        quote,
        actions: [
          { label: "Send to client", action: "send" },
          { label: "View quote", action: "view" },
          { label: "Create another", action: "new" }
        ]
      };
    }

    if (isEditRequest(message)) {
      // Parse edit and apply
      const edits = await parseEditRequest(message);
      this.state.context.draftQuote = applyEdits(
        this.state.context.draftQuote!,
        edits
      );
      return {
        message: "I've updated the draft:",
        draftQuote: this.state.context.draftQuote,
        actions: [
          { label: "Confirm", action: "confirm" },
          { label: "More changes", action: "edit" }
        ]
      };
    }

    // Unclear response
    return {
      message: "Would you like me to create this quote, or would you like to make changes?",
      draftQuote: this.state.context.draftQuote
    };
  }
}
```

### 2.3 Smart Suggestions

```typescript
// lib/ai/suggestions.ts

interface SuggestionContext {
  client?: Client;
  clientHistory?: ClientHistory;
  currentTime: Date;
  userPatterns?: UserPatterns;
}

async function generateSuggestions(
  context: SuggestionContext
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];

  // Client-specific suggestions
  if (context.client && context.clientHistory) {
    // Suggest based on past work
    const recentQuotes = context.clientHistory.quotes.slice(0, 5);
    if (recentQuotes.length > 0) {
      suggestions.push({
        type: "client_based",
        title: `Similar to previous work with ${context.client.name}`,
        description: `Based on ${recentQuotes[0].title}`,
        action: "duplicate_with_updates",
        data: { quote_id: recentQuotes[0].id }
      });
    }

    // Suggest follow-up if recent quote accepted
    const recentAccepted = recentQuotes.find(q => q.status === "accepted");
    if (recentAccepted) {
      suggestions.push({
        type: "follow_up",
        title: "Create follow-up quote",
        description: `Follow-up to ${recentAccepted.title}`,
        action: "create_follow_up"
      });
    }
  }

  // Time-based suggestions
  const dayOfWeek = context.currentTime.getDay();
  if (dayOfWeek === 1) { // Monday
    suggestions.push({
      type: "time_based",
      title: "Weekly retainer invoice",
      description: "Create invoices for weekly retainer clients",
      action: "batch_invoice"
    });
  }

  // Pattern-based suggestions
  if (context.userPatterns) {
    const frequentItems = context.userPatterns.frequentLineItems.slice(0, 3);
    suggestions.push({
      type: "pattern_based",
      title: "Quick quote from common items",
      description: `${frequentItems.map(i => i.name).join(', ')}`,
      action: "quick_quote",
      data: { items: frequentItems }
    });
  }

  return suggestions;
}
```

---

## 3. Voice Input Support

### 3.1 Voice Capture Component

```typescript
// components/ai/VoiceInput.tsx

export function VoiceInput({
  onTranscript,
  onProcessing
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      onProcessing(true);

      // Send to transcription API
      const transcript = await transcribeAudio(blob);
      setTranscript(transcript);
      onTranscript(transcript);
      onProcessing(false);
    };

    recorder.start();
    mediaRecorder.current = recorder;
    setIsRecording(true);
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  }

  return (
    <div className="relative">
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <Square className="w-4 h-4 animate-pulse" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>

      {isRecording && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}

      {transcript && (
        <div className="mt-2 p-2 bg-muted rounded text-sm">
          {transcript}
        </div>
      )}
    </div>
  );
}
```

### 3.2 Transcription API

```typescript
// lib/ai/transcription.ts

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const response = await fetch("/api/v1/ai/transcribe", {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  return data.transcript;
}

// API Route
// app/api/v1/ai/transcribe/route.ts

import { Anthropic } from "@anthropic-ai/sdk";
import OpenAI from "openai";

export async function POST(request: Request) {
  const formData = await request.formData();
  const audio = formData.get("audio") as Blob;

  // Use Whisper for transcription
  const openai = new OpenAI();
  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model: "whisper-1",
    language: "en",
    prompt: "Quote, invoice, client, rate card, proposal, estimate"
  });

  return Response.json({
    transcript: transcription.text
  });
}
```

---

## 4. Implementation Timeline

### Week 1-2: LLM Integration Foundation
- [ ] Set up LLM client abstraction
- [ ] Implement intent classification
- [ ] Create entity extraction pipeline
- [ ] Build rate card matching

### Week 3-4: NL Quote Creation
- [ ] Build parsing prompt templates
- [ ] Implement quote generation from parsed data
- [ ] Create API endpoints
- [ ] Add validation and error handling

### Week 5-6: Chat Interface
- [ ] Build QuoteAssistant component
- [ ] Implement conversation manager
- [ ] Create draft preview component
- [ ] Add edit/confirm flow

### Week 7-8: Voice & Polish
- [ ] Implement voice input component
- [ ] Add transcription API
- [ ] Build suggestion system
- [ ] Testing and refinement

---

## 5. Success Criteria

| Metric | Target |
|--------|--------|
| NL parsing accuracy | > 85% for standard requests |
| Quote creation time (via NL) | < 30 seconds |
| Voice transcription accuracy | > 90% |
| User adoption of AI features | 30% of quotes |
| User satisfaction | > 4.0/5 rating |
