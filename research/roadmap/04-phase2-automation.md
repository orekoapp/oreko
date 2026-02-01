# Phase 2: Intelligent Automation Specification

## Overview

**Duration:** Months 4-8 (parallel with AI Native)
**Goal:** Automate routine tasks with intelligent triggers and actions
**Dependencies:** Webhook system from Phase 1

---

## 1. Automation Framework

### 1.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Event Sources                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │
│  │ Quotes  │ │Invoices │ │ Clients │ │ Scheduled/Time  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────────┬────────┘   │
└───────┼──────────┼──────────┼─────────────────┼─────────────┘
        │          │          │                 │
        └──────────┴──────────┴─────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Automation Engine                          │
│  ┌────────────────┐  ┌──────────────────────────────────┐   │
│  │ Trigger        │  │ Condition Evaluator               │   │
│  │ Matcher        │→ │ - Field conditions                │   │
│  └────────────────┘  │ - Time conditions                 │   │
│                      │ - Comparison operators            │   │
│                      └──────────────┬───────────────────┘   │
│                                     │                        │
│                                     ▼                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Action Executor                     │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐          │   │
│  │  │ Email     │ │ Update    │ │ Webhook   │ ...      │   │
│  │  │ Actions   │ │ Actions   │ │ Actions   │          │   │
│  │  └───────────┘ └───────────┘ └───────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Execution Log                             │
│  - Automation ID, trigger, actions taken, results           │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Model

```typescript
// Automation Rule Schema
interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  organization_id: string;

  // Trigger
  trigger: AutomationTrigger;

  // Conditions (AND logic)
  conditions: AutomationCondition[];

  // Actions (sequential execution)
  actions: AutomationAction[];

  // Rate limiting
  rate_limit?: {
    max_executions: number;
    window_seconds: number;
  };

  // Metadata
  created_at: string;
  updated_at: string;
  last_triggered_at?: string;
  execution_count: number;
}

type AutomationTrigger =
  | EventTrigger
  | ScheduleTrigger
  | ManualTrigger;

interface EventTrigger {
  type: "event";
  event: string;  // "quote.sent", "invoice.overdue", etc.
  filter?: {
    field: string;
    operator: ComparisonOperator;
    value: any;
  };
}

interface ScheduleTrigger {
  type: "schedule";
  cron: string;        // "0 9 * * 1" (Mon 9am)
  timezone: string;    // "America/New_York"
}

interface ManualTrigger {
  type: "manual";
  // Triggered via API or UI
}

interface AutomationCondition {
  field: string;       // "quote.total", "client.tags", "days_since_sent"
  operator: ComparisonOperator;
  value: any;
}

type ComparisonOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "contains"
  | "not_contains"
  | "is_empty"
  | "is_not_empty"
  | "in"
  | "not_in";

interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, any>;
  delay_seconds?: number;  // Delay before this action
}

type AutomationActionType =
  | "send_email"
  | "send_reminder"
  | "update_status"
  | "add_tag"
  | "remove_tag"
  | "create_task"
  | "send_webhook"
  | "send_slack"
  | "assign_to"
  | "create_follow_up";
```

---

## 2. Built-in Automation Templates

### 2.1 Invoice Follow-Up Sequence

```yaml
name: "Invoice Payment Reminders"
description: "Automated reminder sequence for unpaid invoices"
trigger:
  type: event
  event: invoice.sent

actions:
  # Reminder 1: 3 days before due
  - type: send_email
    delay_days: -3  # Relative to due_date
    condition:
      field: status
      operator: not_in
      value: ["paid", "void"]
    config:
      template: "payment_reminder_friendly"
      subject: "Friendly reminder: Invoice {{invoice.number}} due soon"

  # Reminder 2: On due date
  - type: send_email
    delay_days: 0
    condition:
      field: status
      operator: not_in
      value: ["paid", "void"]
    config:
      template: "payment_reminder_due"
      subject: "Invoice {{invoice.number}} is due today"

  # Reminder 3: 7 days overdue
  - type: send_email
    delay_days: 7
    condition:
      field: status
      operator: equals
      value: "overdue"
    config:
      template: "payment_reminder_overdue"
      subject: "Action required: Invoice {{invoice.number}} is overdue"
      urgency: "firm"

  # Reminder 4: 14 days overdue
  - type: send_email
    delay_days: 14
    condition:
      field: status
      operator: equals
      value: "overdue"
    config:
      template: "payment_reminder_final"
      subject: "Final notice: Invoice {{invoice.number}}"
      urgency: "urgent"

  # Internal notification: 21 days overdue
  - type: send_slack
    delay_days: 21
    condition:
      field: status
      operator: equals
      value: "overdue"
    config:
      channel: "#billing"
      message: "🚨 Invoice {{invoice.number}} for {{client.name}} is 21 days overdue (${{invoice.amount_due}})"
```

### 2.2 Quote Expiry Warning

```yaml
name: "Quote Expiry Notifications"
description: "Notify when quotes are about to expire"
trigger:
  type: schedule
  cron: "0 9 * * *"  # Daily at 9am
  timezone: "organization.timezone"

conditions:
  - field: status
    operator: in
    value: ["sent", "viewed"]

actions:
  # 3 days before expiry
  - type: send_email
    condition:
      field: days_until_expiry
      operator: equals
      value: 3
    config:
      template: "quote_expiring_soon"
      to: "{{client.email}}"
      subject: "Your quote expires in 3 days"

  # On expiry day
  - type: send_email
    condition:
      field: days_until_expiry
      operator: equals
      value: 0
    config:
      template: "quote_expires_today"
      to: "{{client.email}}"
      subject: "Last chance: Your quote expires today"

  # Internal notification
  - type: create_task
    condition:
      field: days_until_expiry
      operator: equals
      value: 3
    config:
      title: "Follow up on quote {{quote.number}}"
      description: "Quote for {{client.name}} expires in 3 days"
      due_in_days: 2
```

### 2.3 New Client Welcome

```yaml
name: "New Client Onboarding"
description: "Welcome sequence for new clients"
trigger:
  type: event
  event: client.created

actions:
  # Immediate welcome email
  - type: send_email
    delay_seconds: 0
    config:
      template: "welcome_new_client"
      subject: "Welcome to {{organization.name}}!"

  # Add to CRM segment
  - type: add_tag
    delay_seconds: 0
    config:
      tag: "new_client"

  # Schedule follow-up task
  - type: create_task
    delay_seconds: 0
    config:
      title: "Schedule intro call with {{client.name}}"
      due_in_days: 3
      assignee: "owner"

  # Remove new client tag after 30 days
  - type: remove_tag
    delay_days: 30
    config:
      tag: "new_client"
```

### 2.4 Quote Accepted Workflow

```yaml
name: "Quote Acceptance Workflow"
description: "Actions when a quote is accepted"
trigger:
  type: event
  event: quote.accepted

actions:
  # Notify team
  - type: send_slack
    config:
      channel: "#sales"
      message: "🎉 Quote {{quote.number}} accepted by {{client.name}} for ${{quote.total}}"

  # Create invoice
  - type: create_invoice
    condition:
      field: quote.settings.auto_invoice
      operator: equals
      value: true
    config:
      due_days: 30
      include_deposit: true
      deposit_percentage: 50

  # Update CRM
  - type: send_webhook
    config:
      url: "{{integrations.crm.webhook_url}}"
      payload:
        event: "deal_won"
        deal_id: "{{quote.crm_deal_id}}"
        amount: "{{quote.total}}"

  # Schedule kickoff
  - type: create_task
    config:
      title: "Schedule project kickoff with {{client.name}}"
      description: "Project: {{quote.title}}\nValue: ${{quote.total}}"
      due_in_days: 5
      assignee: "project_manager"
```

---

## 3. Intelligent Follow-Up System

### 3.1 AI-Powered Timing

```typescript
// lib/automation/smart-timing.ts

interface FollowUpTiming {
  optimal_time: Date;
  confidence: number;
  factors: TimingFactor[];
}

interface TimingFactor {
  name: string;
  impact: "positive" | "negative";
  weight: number;
  reason: string;
}

async function calculateOptimalFollowUpTime(
  invoice: Invoice,
  client: Client,
  context: FollowUpContext
): Promise<FollowUpTiming> {
  const factors: TimingFactor[] = [];

  // Client payment history
  const avgPaymentDays = client.stats.average_payment_days;
  if (avgPaymentDays > 0) {
    factors.push({
      name: "payment_history",
      impact: avgPaymentDays > 30 ? "negative" : "positive",
      weight: 0.3,
      reason: `Client typically pays in ${avgPaymentDays} days`
    });
  }

  // Day of week optimization
  // Data shows Tuesdays and Wednesdays have highest response rates
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 2 || dayOfWeek === 3) {
    factors.push({
      name: "day_of_week",
      impact: "positive",
      weight: 0.15,
      reason: "Mid-week emails have 23% higher response rate"
    });
  }

  // Time of day optimization
  // Best times: 9-10am or 2-3pm in client's timezone
  factors.push({
    name: "time_of_day",
    impact: "positive",
    weight: 0.1,
    reason: "Scheduling for optimal engagement hours"
  });

  // Invoice size factor
  if (invoice.total > 5000) {
    factors.push({
      name: "invoice_size",
      impact: "negative",
      weight: 0.2,
      reason: "Large invoices may need more processing time"
    });
  }

  // Previous interaction recency
  const lastInteraction = await getLastClientInteraction(client.id);
  const daysSinceInteraction = daysBetween(lastInteraction.date, new Date());
  if (daysSinceInteraction < 7) {
    factors.push({
      name: "recent_interaction",
      impact: "positive",
      weight: 0.15,
      reason: "Recent communication suggests active engagement"
    });
  }

  // Calculate optimal time based on factors
  const optimalTime = calculateTimeFromFactors(factors, invoice.due_date);

  return {
    optimal_time: optimalTime,
    confidence: calculateConfidence(factors),
    factors
  };
}
```

### 3.2 Message Personalization

```typescript
// lib/automation/message-generator.ts

interface MessageContext {
  invoice: Invoice;
  client: Client;
  history: ClientHistory;
  attempt: number;  // Which reminder this is
  urgency: "gentle" | "firm" | "urgent";
}

async function generateFollowUpMessage(
  context: MessageContext
): Promise<GeneratedMessage> {
  const { invoice, client, history, attempt, urgency } = context;

  // Build personalization context
  const personalization = {
    relationship_length: getRelationshipLength(history),
    total_business: history.total_paid,
    previous_reminder_count: attempt - 1,
    days_overdue: getDaysOverdue(invoice),
    has_payment_portal: true
  };

  // Select tone based on factors
  let tone: MessageTone;
  if (attempt === 1) {
    tone = "friendly_reminder";
  } else if (history.total_paid > 10000) {
    tone = "valued_client";  // More lenient for high-value clients
  } else if (personalization.days_overdue > 30) {
    tone = "final_notice";
  } else {
    tone = "professional";
  }

  // Generate message using LLM
  const message = await generateWithLLM({
    template: "payment_reminder",
    tone,
    variables: {
      client_name: client.name,
      invoice_number: invoice.number,
      amount_due: formatCurrency(invoice.amount_due),
      days_overdue: personalization.days_overdue,
      payment_link: invoice.payment_link,
      relationship_months: personalization.relationship_length
    }
  });

  return {
    subject: message.subject,
    body: message.body,
    tone,
    personalization_score: message.personalization_score
  };
}

// Example generated messages by tone:

const MESSAGE_EXAMPLES = {
  friendly_reminder: `
Hi {{client_name}},

Just a quick heads up - invoice {{invoice_number}} for {{amount_due}} is coming due soon.

You can pay securely here: {{payment_link}}

Let me know if you have any questions!

Best,
{{sender_name}}
  `,

  valued_client: `
Hi {{client_name}},

I hope this finds you well! I wanted to reach out regarding invoice {{invoice_number}}.

We really value our {{relationship_months}}-month partnership and wanted to check in to make sure everything is on track for payment.

If there's anything holding things up on your end, I'm happy to discuss options.

Pay here when ready: {{payment_link}}

Thanks as always,
{{sender_name}}
  `,

  professional: `
Dear {{client_name}},

This is a reminder that invoice {{invoice_number}} for {{amount_due}} is now {{days_overdue}} days past due.

Please arrange payment at your earliest convenience: {{payment_link}}

If you have any questions about this invoice, please don't hesitate to reach out.

Best regards,
{{sender_name}}
  `,

  final_notice: `
Dear {{client_name}},

This is a final notice regarding invoice {{invoice_number}} for {{amount_due}}, which is now {{days_overdue}} days overdue.

Please process payment immediately: {{payment_link}}

If we do not receive payment within 7 days, we will need to take further action.

If you're experiencing difficulties, please contact us to discuss payment arrangements.

Regards,
{{sender_name}}
  `
};
```

### 3.3 Acceptance Probability Scoring

```typescript
// lib/automation/probability-scorer.ts

interface AcceptanceProbability {
  score: number;          // 0-100
  confidence: number;     // 0-1
  factors: ScoringFactor[];
  recommendations: string[];
}

interface ScoringFactor {
  name: string;
  score_impact: number;   // -20 to +20
  description: string;
}

async function calculateAcceptanceProbability(
  quote: Quote,
  client: Client
): Promise<AcceptanceProbability> {
  const factors: ScoringFactor[] = [];
  let baseScore = 50;

  // Client history factor
  const clientQuotes = await getClientQuotes(client.id);
  const acceptanceRate = calculateAcceptanceRate(clientQuotes);
  if (acceptanceRate > 0) {
    const impact = (acceptanceRate - 0.5) * 40;  // -20 to +20
    factors.push({
      name: "client_history",
      score_impact: impact,
      description: `Client has ${Math.round(acceptanceRate * 100)}% historical acceptance rate`
    });
    baseScore += impact;
  }

  // Quote size vs client average
  const avgQuoteSize = calculateAverageQuoteSize(clientQuotes);
  if (avgQuoteSize > 0) {
    const sizeRatio = quote.total / avgQuoteSize;
    if (sizeRatio > 1.5) {
      factors.push({
        name: "quote_size",
        score_impact: -15,
        description: `Quote is ${Math.round((sizeRatio - 1) * 100)}% larger than client's average`
      });
      baseScore -= 15;
    } else if (sizeRatio < 0.7) {
      factors.push({
        name: "quote_size",
        score_impact: 10,
        description: "Quote is below client's average size"
      });
      baseScore += 10;
    }
  }

  // Response time factor
  const lastViewed = quote.viewed_at;
  if (lastViewed) {
    const viewToNow = daysBetween(new Date(lastViewed), new Date());
    if (viewToNow < 2) {
      factors.push({
        name: "engagement",
        score_impact: 15,
        description: "Client viewed quote recently"
      });
      baseScore += 15;
    } else if (viewToNow > 7) {
      factors.push({
        name: "engagement",
        score_impact: -10,
        description: "No client activity for 7+ days"
      });
      baseScore -= 10;
    }
  }

  // Item count factor
  if (quote.items.length > 10) {
    factors.push({
      name: "complexity",
      score_impact: -10,
      description: "Complex quotes (10+ items) have lower acceptance"
    });
    baseScore -= 10;
  }

  // Expiry urgency
  const daysToExpiry = getDaysUntilExpiry(quote);
  if (daysToExpiry <= 3 && daysToExpiry > 0) {
    factors.push({
      name: "urgency",
      score_impact: 5,
      description: "Impending expiry may drive decision"
    });
    baseScore += 5;
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (baseScore < 40) {
    recommendations.push("Consider following up with a call");
    recommendations.push("Offer to discuss scope or pricing adjustments");
  }
  if (!quote.viewed_at) {
    recommendations.push("Client hasn't viewed - verify email delivery");
  }

  return {
    score: Math.max(0, Math.min(100, baseScore)),
    confidence: factors.length > 3 ? 0.8 : 0.5,
    factors,
    recommendations
  };
}
```

---

## 4. Automation Management API

```yaml
# List automations
GET /api/v1/automations
  Response: ApiResponse<AutomationRule[]>

# Create automation
POST /api/v1/automations
  Body:
    name: string
    trigger: AutomationTrigger
    conditions?: AutomationCondition[]
    actions: AutomationAction[]
  Response: ApiResponse<AutomationRule>

# Get automation
GET /api/v1/automations/:id
  Response: ApiResponse<AutomationRule>

# Update automation
PATCH /api/v1/automations/:id
  Body: Partial<AutomationRule>
  Response: ApiResponse<AutomationRule>

# Delete automation
DELETE /api/v1/automations/:id

# Enable/disable automation
POST /api/v1/automations/:id/enable
POST /api/v1/automations/:id/disable

# Test automation (dry run)
POST /api/v1/automations/:id/test
  Body:
    sample_data?: object
  Response: ApiResponse<{
    would_trigger: boolean
    conditions_met: boolean[]
    actions_preview: ActionPreview[]
  }>

# Get automation execution history
GET /api/v1/automations/:id/executions
  Query: { cursor, limit, status }
  Response: ApiResponse<AutomationExecution[]>

# List automation templates
GET /api/v1/automations/templates
  Response: ApiResponse<AutomationTemplate[]>

# Create from template
POST /api/v1/automations/from-template
  Body:
    template_id: string
    customizations?: object
  Response: ApiResponse<AutomationRule>
```

---

## 5. UI Components

### 5.1 Automation Builder

```typescript
// components/automations/AutomationBuilder.tsx

export function AutomationBuilder({
  automation,
  onSave
}: AutomationBuilderProps) {
  const [trigger, setTrigger] = useState(automation?.trigger);
  const [conditions, setConditions] = useState(automation?.conditions || []);
  const [actions, setActions] = useState(automation?.actions || []);

  return (
    <div className="space-y-8">
      {/* Trigger Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            When this happens...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TriggerSelector
            value={trigger}
            onChange={setTrigger}
          />
        </CardContent>
      </Card>

      {/* Conditions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Only if...
          </CardTitle>
          <CardDescription>
            Optional conditions that must be met
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConditionBuilder
            conditions={conditions}
            onChange={setConditions}
            triggerContext={trigger}
          />
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Do this...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActionBuilder
            actions={actions}
            onChange={setActions}
          />
        </CardContent>
      </Card>

      {/* Preview & Test */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleTest}>
          <TestTube className="w-4 h-4 mr-2" />
          Test Automation
        </Button>
        <Button onClick={() => onSave({ trigger, conditions, actions })}>
          Save Automation
        </Button>
      </div>
    </div>
  );
}
```

### 5.2 Execution Log Viewer

```typescript
// components/automations/ExecutionLog.tsx

export function ExecutionLog({ automationId }: { automationId: string }) {
  const { data: executions } = useAutomationExecutions(automationId);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Trigger</TableHead>
          <TableHead>Actions</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {executions?.map((exec) => (
          <TableRow key={exec.id}>
            <TableCell>
              {formatDistanceToNow(new Date(exec.executed_at))} ago
            </TableCell>
            <TableCell>
              <TriggerBadge trigger={exec.trigger_data} />
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {exec.actions.map((action, i) => (
                  <ActionResult key={i} action={action} />
                ))}
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={exec.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 6. Implementation Timeline

### Week 1-2: Core Framework
- [ ] Automation data model and migrations
- [ ] Trigger matcher implementation
- [ ] Condition evaluator
- [ ] Action executor framework

### Week 3-4: Built-in Actions
- [ ] Email action (with templates)
- [ ] Update status action
- [ ] Tag management actions
- [ ] Webhook action
- [ ] Task creation action

### Week 5-6: Templates & UI
- [ ] Built-in automation templates
- [ ] Automation builder UI
- [ ] Execution log viewer
- [ ] Test/dry-run functionality

### Week 7-8: Intelligence Layer
- [ ] Smart timing calculations
- [ ] Message personalization
- [ ] Acceptance probability scoring
- [ ] Integration with AI features

---

## 7. Success Criteria

| Metric | Target |
|--------|--------|
| Automation adoption | 40% of orgs with 1+ active |
| Follow-up email open rate | > 35% |
| Invoice payment improvement | 15% faster collection |
| Manual follow-up reduction | 50% less manual reminders |
| Automation reliability | > 99.5% successful executions |
