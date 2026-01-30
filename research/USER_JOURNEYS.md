# User Journeys: Invoices & Quotes Software

**Document Version:** 1.0
**Phase:** 8 - User Journey Mapping
**Last Updated:** January 2026
**Status:** Product Research

---

## Table of Contents

1. [Journey Mapping Overview](#1-journey-mapping-overview)
2. [Journey 1: First Quote to Getting Paid](#2-journey-1-first-quote-to-getting-paid)
3. [Journey 2: Repeat Client Quote](#3-journey-2-repeat-client-quote)
4. [Journey 3: Project with Payment Schedule](#4-journey-3-project-with-payment-schedule)
5. [Journey 4: Quote Revision & Negotiation](#5-journey-4-quote-revision--negotiation)
6. [Client-Side Journeys](#6-client-side-journeys)
7. [User Stories Backlog](#7-user-stories-backlog)
8. [Success Criteria per Journey](#8-success-criteria-per-journey)
9. [Pain Points Summary](#9-pain-points-summary)
10. [Opportunity Map](#10-opportunity-map)

---

## 1. Journey Mapping Overview

### Purpose

This document maps the complete user journeys for our Invoices & Quotes software, transforming persona research and value proposition into actionable user flows. These journeys guide product design, feature prioritization, and success measurement.

### Methodology

Our journey mapping follows a systematic approach:

1. **Journey Identification** - Define key workflows users complete
2. **Stage Mapping** - Break journeys into discrete stages
3. **Touchpoint Documentation** - Capture every interaction point
4. **Emotion Tracking** - Map feelings at each stage
5. **Pain Point Analysis** - Identify friction and problems
6. **Opportunity Finding** - Spot improvement chances
7. **User Story Generation** - Create actionable development stories

### Journey Components

Each journey map includes:

| Component | Description |
|-----------|-------------|
| **Persona** | Who is taking the journey |
| **Goal** | What they want to accomplish |
| **Trigger** | What starts the journey |
| **Stages** | Major phases of the journey |
| **Actions** | What the user does at each stage |
| **Thoughts** | What the user is thinking |
| **Emotions** | How they feel (scale: frustrated to delighted) |
| **Touchpoints** | Where they interact with the product |
| **Pain Points** | Where friction occurs |
| **Opportunities** | Where we can improve |

### Emotion Scale

```
1 - Frustrated    [negative]
2 - Anxious       [negative]
3 - Neutral       [neutral]
4 - Satisfied     [positive]
5 - Delighted     [positive]
```

### Key Personas

**Primary (P0):**
- **Creative Claire** - Freelance graphic designer, $120K/year, solo
- **Contractor Chris** - Renovation contractor, $850K/year, 4-7 person team

**Secondary (P1):**
- **Agency Amanda** - Digital marketing agency owner, $1.2M/year, 8 employees
- **Consultant Carlos** - Management consultant, $350K/year, solo

---

## 2. Journey 1: First Quote to Getting Paid

### Journey Overview

| Attribute | Details |
|-----------|---------|
| **Journey Name** | First Quote to Getting Paid |
| **Primary Persona** | Creative Claire (New User) |
| **Secondary Persona** | Contractor Chris (New User) |
| **Goal** | Successfully send first quote and receive payment |
| **Trigger** | Signs up for the platform after deciding to try it |
| **Success Metric** | Time from signup to first payment received |
| **Target Duration** | < 7 days from signup to first paid invoice |

### Journey Map

```
SIGNUP --> ONBOARD --> CREATE --> SEND --> ACCEPT --> INVOICE --> PAY --> SUCCESS
   |         |           |        |        |          |         |        |
  "Let's    "Show me   "Make    "Hope   "They     "Auto-    "Money   "This
   try       how this   it look  they    said      magic!"   came      was
   this"     works"     good"    like    yes!"               in!"      easy!"
```

### Detailed Stage Breakdown

---

#### Stage 1: Signup

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Clicks "Start Free Trial" from homepage | Clicks "Start Free Trial" from contractor landing page |
| **Touchpoint** | Marketing site, signup form | Marketing site, signup form |
| **Thought** | "I hope this doesn't take forever to set up" | "My competitor uses something like this - I need to keep up" |
| **Emotion** | 3 - Neutral (hopeful but skeptical) | 3 - Neutral (pragmatic) |
| **Pain Points** | Signup forms asking too many questions; email verification delays | Signup on mobile is frustrating; too many required fields |
| **Opportunities** | Single-field signup (email only); instant access | Mobile-optimized signup; skip optional fields |

**Touchpoint Details:**
- Homepage CTA button
- Signup modal/page
- Email verification (if required)
- Welcome screen

---

#### Stage 2: Onboarding

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Completes setup wizard: company name, logo, payment setup | Completes setup wizard: company name, default payment terms |
| **Touchpoint** | Setup wizard (3-5 steps) | Setup wizard (3-5 steps) |
| **Thought** | "Where do I upload my logo? This better look good" | "Just let me create a quote already" |
| **Emotion** | 3 - Neutral (slightly impatient) | 2 - Anxious (wants to skip) |
| **Pain Points** | Logo upload confusing; branding preview unclear | Too many steps before first quote; payment setup complex |
| **Opportunities** | Real-time branding preview; skip option with defaults | "Skip for now" on all non-essential steps; minimal viable setup |

**Touchpoint Details:**
- Welcome/getting started screen
- Company profile setup
- Branding/logo upload
- Payment processor connection (Stripe)
- First template selection

**Onboarding Flow:**
```
Step 1: Company basics (name, email) [REQUIRED]
   |
Step 2: Branding (logo, colors) [OPTIONAL - can skip]
   |
Step 3: Payment setup (Stripe connect) [OPTIONAL - can skip]
   |
Step 4: First template choice [REQUIRED]
   |
DONE --> Dashboard
```

---

#### Stage 3: Create First Quote

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Uses template, adds line items, customizes appearance | Uses template, adds detailed line items from estimate notes |
| **Touchpoint** | Quote editor (block-based), template library | Quote editor, saved item library |
| **Thought** | "Can I make this look as good as my Canva quotes?" | "I need to add all these line items - hope there's a quick way" |
| **Emotion** | 4 - Satisfied (editor is intuitive) | 3 - Neutral (learning curve acceptable) |
| **Pain Points** | Template customization options unclear; preview doesn't match output | Line item entry is tedious; can't duplicate/reorder easily |
| **Opportunities** | Real-time preview; drag-and-drop everything | Bulk line item import; item templates; quick-add favorites |

**Touchpoint Details:**
- "New Quote" button
- Template selection modal
- Block-based editor
- Line item entry
- Pricing/total calculation
- Preview mode
- Save draft function

**Quote Creation Flow (Claire):**
```
New Quote
   |
Select Template (Design Professional)
   |
Add Client Details
   |
Add/Edit Line Items:
   - Brand Identity Package: $2,500
   - Logo Variations: $500
   - Brand Guidelines: $750
   |
Customize Layout (blocks)
   |
Add Terms & Conditions
   |
Preview
   |
Ready to Send
```

**Quote Creation Flow (Chris):**
```
New Quote
   |
Select Template (Contractor Estimate)
   |
Add Client Details
   |
Add Line Items (detailed):
   - Demo & Removal: $3,500
   - Framing: $4,200
   - Electrical: $2,800
   - Plumbing: $3,100
   - Drywall: $2,400
   - Flooring: $4,500
   - Paint: $1,800
   - Fixtures: $2,200
   - Labor: $8,500
   |
Add Notes/Scope
   |
Set Payment Terms (deposit + milestones)
   |
Preview
   |
Ready to Send
```

---

#### Stage 4: Send Quote

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Enters client email, personalizes message, clicks send | Enters client email, sends with default message |
| **Touchpoint** | Send modal, email preview | Send modal |
| **Thought** | "I hope the email looks professional too" | "Did it send? When will they see it?" |
| **Emotion** | 4 - Satisfied (looks good) | 4 - Satisfied (it was fast) |
| **Pain Points** | Can't preview exact email client will receive; no confirmation it delivered | No read receipt indication; unclear when to follow up |
| **Opportunities** | Email preview; delivery confirmation; "viewed" notification | View tracking; suggested follow-up timing |

**Touchpoint Details:**
- Send button
- Send modal (client email, message)
- Email template preview
- Send confirmation
- Dashboard status update

---

#### Stage 5: Client Accepts Quote

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Receives notification that client accepted; reviews acceptance | Receives notification on phone at job site; checks details |
| **Touchpoint** | Email notification, dashboard, mobile notification | Push notification, dashboard |
| **Thought** | "Yes! They said yes! Now what?" | "Great - now I can order materials" |
| **Emotion** | 5 - Delighted (win!) | 5 - Delighted (deal closed) |
| **Pain Points** | Unclear what happens next; where is the signed version? | Hard to find accepted quote on mobile; next steps unclear |
| **Opportunities** | Clear next-step guidance; celebration moment; instant invoice option | Mobile-optimized acceptance view; one-tap "create invoice" |

**Touchpoint Details:**
- Email notification (acceptance)
- Dashboard notification
- Quote status change (Sent --> Accepted)
- Signed document storage
- Next action prompt

---

#### Stage 6: Convert to Invoice

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Clicks "Convert to Invoice" - all data transfers automatically | Clicks "Convert to Invoice" - sets up milestone schedule |
| **Touchpoint** | Quote detail page, conversion flow, invoice editor | Quote detail page, payment schedule builder |
| **Thought** | "Wait, that's it? I don't have to retype everything?" | "Now I need to set up the 30/30/40 payment split" |
| **Emotion** | 5 - Delighted (time saved!) | 4 - Satisfied (makes sense) |
| **Pain Points** | Wants to review before sending; some fields need adjustment | Milestone setup has learning curve; deposit amount unclear |
| **Opportunities** | Quick review screen before send; smart defaults | Milestone templates; suggested payment structures |

**Touchpoint Details:**
- "Convert to Invoice" button
- Conversion confirmation
- Invoice preview (with all data transferred)
- Edit option (if needed)
- Payment schedule setup (if applicable)
- Send invoice option

**Conversion Flow:**
```
Accepted Quote
      |
      v
[Convert to Invoice] button
      |
      v
Auto-populate:
- Client info (from quote)
- Line items (from quote)
- Pricing (from quote)
- Terms (from quote)
- Contract reference (linked)
      |
      v
Review Invoice
      |
      v
[Send Now] or [Schedule]
```

---

#### Stage 7: Client Pays Invoice

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Sees payment notification; checks bank/Stripe for deposit | Sees deposit payment notification; confirms amount |
| **Touchpoint** | Email notification, dashboard, payment confirmation | Push notification, dashboard |
| **Thought** | "Money! Finally!" | "Deposit is in - I can order materials now" |
| **Emotion** | 5 - Delighted (goal achieved!) | 5 - Delighted (cash flow secured) |
| **Pain Points** | Unclear when money hits bank account; reconciliation needed | Partial payment tracking is confusing; what's still owed? |
| **Opportunities** | Clear payment timeline; automatic reconciliation | Outstanding balance dashboard; next payment reminder preview |

**Touchpoint Details:**
- Payment email notification
- Dashboard payment badge
- Payment confirmation screen
- Bank deposit timing info
- Outstanding balance update

---

#### Stage 8: Success / Completion

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Archives completed project; reflects on experience | Marks project complete; plans to use for next quote |
| **Touchpoint** | Dashboard, completed projects view | Dashboard, template save option |
| **Thought** | "That was so much easier than my old process" | "I should save this as a template for similar jobs" |
| **Emotion** | 5 - Delighted (will continue using) | 5 - Delighted (time saved) |
| **Pain Points** | No prompt to save as template; limited celebration | No easy way to duplicate for similar projects |
| **Opportunities** | "Save as template" prompt; success celebration; NPS survey | One-click duplicate; template library; referral prompt |

---

### Journey 1: Visual Emotion Map

```
Emotion
Level
  5 |                                  *--------*--------*
    |                             *----'                  '----*
  4 |                        *---'
    |                   *---'
  3 |  *--------*------'
    |
  2 |
    |
  1 |
    +----+--------+--------+--------+--------+--------+--------+--------+
       Signup  Onboard  Create   Send   Accept  Invoice   Pay   Success

Claire's Journey: Generally positive, peaks at quote acceptance and payment
Chris's Journey: Starts more neutral, satisfaction grows as time savings evident
```

### Journey 1: Key Metrics

| Stage | Metric | Target | Measurement |
|-------|--------|--------|-------------|
| Signup | Completion rate | > 80% | Analytics |
| Onboard | Time to complete | < 5 min | Analytics |
| Create | Time to first quote | < 15 min | Analytics |
| Send | Quotes sent within 24hr of signup | > 40% | Analytics |
| Accept | Quote acceptance rate | > 60% (user's clients) | Analytics |
| Invoice | Auto-conversion usage | > 90% | Feature analytics |
| Pay | Days to payment | < 14 days | Payment data |
| Success | User returns within 7 days | > 70% | Retention |

---

## 3. Journey 2: Repeat Client Quote

### Journey Overview

| Attribute | Details |
|-----------|---------|
| **Journey Name** | Repeat Client Quote |
| **Primary Persona** | Creative Claire (Returning User) |
| **Secondary Persona** | Agency Amanda (Team User) |
| **Goal** | Quickly create and send quote to existing client |
| **Trigger** | Existing client requests new project/quote |
| **Success Metric** | Time from request to quote sent |
| **Target Duration** | < 10 minutes |

### Journey Map

```
REQUEST --> LOGIN --> SELECT --> CUSTOMIZE --> SEND --> TRACK --> PAID
    |         |         |           |          |        |        |
  "Client    "Let me   "Use      "Just a   "Sent!"  "Did    "Another
   wants      quote     their     few               they    one
   more"      this"     history"  tweaks"           view    done!"
                                                    it?"
```

### Detailed Stage Breakdown

---

#### Stage 1: Client Request

| Element | Details |
|---------|---------|
| **Action** | Receives email/call from existing client requesting new work |
| **Touchpoint** | External (email, phone) - triggers journey |
| **Thought** | "Great, repeat business! Let me quote this quickly" |
| **Emotion** | 4 - Satisfied (positive opportunity) |
| **Pain Points** | Need to find previous quote/project details; client expects quick turnaround |
| **Opportunities** | CRM integration to surface client history; quick-quote from notification |

---

#### Stage 2: Login & Dashboard

| Element | Claire | Amanda |
|---------|--------|--------|
| **Action** | Opens app, sees dashboard with recent activity | Opens app, navigates to client list |
| **Touchpoint** | Login, dashboard | Login, client management |
| **Thought** | "Where's the client's previous quote?" | "Is this client assigned to me or Sarah?" |
| **Emotion** | 3 - Neutral | 3 - Neutral |
| **Pain Points** | Search doesn't find client quickly; recent activity cluttered | Team visibility unclear; who quoted them last? |
| **Opportunities** | Smart search with client suggestions; "Recent Clients" section | Team activity log; client ownership display |

---

#### Stage 3: Select Client & Template

| Element | Claire | Amanda |
|---------|--------|--------|
| **Action** | Finds client, sees previous quote, clicks "New Quote for Client" | Selects client, chooses to duplicate previous quote |
| **Touchpoint** | Client profile, quote history, new quote flow | Client profile, team quotes, duplicate option |
| **Thought** | "Perfect, I can see what I quoted before" | "Sarah's quote had good line items, I'll use that as base" |
| **Emotion** | 4 - Satisfied | 4 - Satisfied |
| **Pain Points** | Can't see quote details without opening each one; no quick duplicate | Can't easily compare team member quotes; duplicate loses some formatting |
| **Opportunities** | Quote preview on hover; one-click duplicate; saved pricing | Side-by-side quote comparison; team template sharing |

**Client History View:**
```
CLIENT: Acme Corp
Contact: john@acme.com
Status: Active Client

Previous Quotes:
+------------------------------------------+
| Quote #1042 - Website Redesign           |
| Amount: $8,500 | Status: Paid            |
| Date: Oct 15, 2025                       |
| [Duplicate] [View]                       |
+------------------------------------------+
| Quote #987 - Brand Refresh               |
| Amount: $4,200 | Status: Paid            |
| Date: Jul 22, 2025                       |
| [Duplicate] [View]                       |
+------------------------------------------+

[+ New Quote for Client]
```

---

#### Stage 4: Customize Quote

| Element | Claire | Amanda |
|---------|--------|--------|
| **Action** | Adjusts line items for new project scope; updates pricing | Modifies duplicated quote; adds new deliverables |
| **Touchpoint** | Quote editor with pre-filled data | Quote editor, saved items library |
| **Thought** | "Just need to swap out a few things" | "Need to add the social media package" |
| **Emotion** | 4 - Satisfied (fast!) | 4 - Satisfied |
| **Pain Points** | Pricing from old quote may be outdated; need to recalculate | Saved items don't include most recent pricing changes |
| **Opportunities** | Price update suggestions; inflation adjustment prompts | Centralized pricing management; auto-sync saved items |

**Time Savings:**
```
Traditional Process:
- Find old quote file: 5 min
- Open new document: 2 min
- Copy/paste client info: 3 min
- Recreate line items: 10 min
- Adjust formatting: 5 min
TOTAL: 25 minutes

Our Platform:
- Search client: 30 sec
- Duplicate quote: 10 sec
- Modify line items: 5 min
- Review: 1 min
TOTAL: < 7 minutes

TIME SAVED: 18+ minutes per quote
```

---

#### Stage 5: Send Quote

| Element | Details |
|---------|---------|
| **Action** | Reviews quote, sends with personalized message |
| **Touchpoint** | Preview, send modal |
| **Thought** | "Let me add a personal note since they're a repeat client" |
| **Emotion** | 4 - Satisfied |
| **Pain Points** | Default message feels impersonal for existing relationship |
| **Opportunities** | Client-aware message suggestions; relationship-based templates |

---

#### Stage 6: Track Quote

| Element | Claire | Amanda |
|---------|--------|--------|
| **Action** | Checks if client viewed quote; wonders about follow-up timing | Checks status; considers reassigning to closer if no response |
| **Touchpoint** | Dashboard, quote status, notifications | Dashboard, team view, activity log |
| **Thought** | "They viewed it 3 times - are they comparing to others?" | "It's been 3 days, should I have Sarah follow up?" |
| **Emotion** | 3 - Neutral (waiting anxiety) | 3 - Neutral |
| **Pain Points** | View count is interesting but unclear what to do with it | No team follow-up coordination; might double-contact client |
| **Opportunities** | Smart follow-up suggestions based on view patterns | Team follow-up assignment; activity deduplication |

**Quote Tracking Dashboard:**
```
Quote #1089 - Acme Corp - Website Phase 2
+--------------------------------------------------+
| Status: SENT (Awaiting Response)                 |
|                                                  |
| Timeline:                                        |
| Jan 28, 9:15am - Quote created                  |
| Jan 28, 9:22am - Quote sent to john@acme.com    |
| Jan 28, 2:47pm - Opened by recipient            |
| Jan 29, 10:03am - Opened (2nd view)             |
| Jan 30, 8:41am - Opened (3rd view)              |
|                                                  |
| Engagement: HIGH (3 views in 2 days)            |
|                                                  |
| Suggested action: Consider following up -        |
| multiple views often indicate comparison         |
| shopping or internal discussion.                 |
|                                                  |
| [Send Follow-up] [Add Note] [Edit Quote]        |
+--------------------------------------------------+
```

---

#### Stage 7: Payment Received

| Element | Details |
|---------|---------|
| **Action** | Client accepts and pays; invoice auto-generated if needed |
| **Touchpoint** | Notifications, dashboard, payment confirmation |
| **Thought** | "Another one closed! They're becoming a great client" |
| **Emotion** | 5 - Delighted |
| **Pain Points** | Want to see lifetime value; track relationship health |
| **Opportunities** | Client lifetime value display; relationship scoring |

---

### Journey 2: Key Differentiator

**The "Repeat Client" advantage:**

| Capability | Time Savings | Accuracy Improvement |
|------------|--------------|---------------------|
| Pre-filled client info | 3 min | 100% (no typos) |
| Quote history access | 5 min | Reference previous scope |
| One-click duplicate | 10 min | Exact formatting preserved |
| Saved line items | 5 min | Consistent pricing |
| **Total per quote** | **23 min saved** | **Fewer errors** |

---

## 4. Journey 3: Project with Payment Schedule

### Journey Overview

| Attribute | Details |
|-----------|---------|
| **Journey Name** | Project with Payment Schedule |
| **Primary Persona** | Contractor Chris |
| **Secondary Persona** | Event Planner Elena |
| **Goal** | Set up and collect milestone payments for large project |
| **Trigger** | Large project opportunity requiring structured payments |
| **Success Metric** | All milestones paid on schedule |
| **Target Duration** | Project lifecycle (weeks to months) |

### Journey Map

```
ESTIMATE --> QUOTE --> DEPOSIT --> START --> MILESTONE --> MILESTONE --> FINAL
    |          |         |          |           |             |           |
  "Big       "Need     "Money    "Safe      "Invoice      "Keep it   "Project
   project    deposit   before    to         auto-        flowing"   complete,
   coming"    upfront"  I buy"    start!"    sent!"                  paid!"
```

### Payment Schedule Example (Kitchen Renovation - $33,000)

```
Project: Kitchen Renovation
Total: $33,000

Payment Schedule:
+----------------------------------------------------------+
| Payment 1: DEPOSIT (30%)                                  |
| Amount: $9,900                                            |
| Due: Upon quote acceptance                                |
| Status: PAID - Jan 15, 2026                              |
+----------------------------------------------------------+
| Payment 2: ROUGH-IN COMPLETE (30%)                        |
| Amount: $9,900                                            |
| Due: Upon completion of electrical/plumbing rough-in      |
| Status: PAID - Feb 1, 2026                               |
+----------------------------------------------------------+
| Payment 3: SUBSTANTIAL COMPLETION (30%)                   |
| Amount: $9,900                                            |
| Due: Upon cabinet installation and countertops            |
| Status: INVOICED - Due Feb 15, 2026                      |
+----------------------------------------------------------+
| Payment 4: FINAL (10%)                                    |
| Amount: $3,300                                            |
| Due: Upon project completion and walkthrough              |
| Status: SCHEDULED - Est. Feb 28, 2026                    |
+----------------------------------------------------------+
```

### Detailed Stage Breakdown

---

#### Stage 1: Estimate & Quote Creation

| Element | Chris | Elena |
|---------|-------|-------|
| **Action** | Creates detailed quote with all line items; sets up 30/30/30/10 payment schedule | Creates event proposal with 50% deposit, 50% pre-event |
| **Touchpoint** | Quote editor, payment schedule builder | Quote editor, payment terms |
| **Thought** | "Need to make sure the deposit covers my material costs" | "If they cancel, I need to keep the deposit" |
| **Emotion** | 4 - Satisfied (system supports his workflow) | 4 - Satisfied |
| **Pain Points** | Payment schedule builder has learning curve; milestone names not pre-defined | Cancellation terms need to be in contract too |
| **Opportunities** | Industry-specific milestone templates; suggested payment splits | Linked contract terms; deposit as non-refundable option |

**Payment Schedule Builder:**
```
PAYMENT SCHEDULE BUILDER
------------------------

Template: [Contractor - 4 Payments v]

Payment 1: DEPOSIT
   Amount: [30%] or [$9,900]
   Due: [Upon acceptance v]
   Notes: Covers initial materials and permits

Payment 2: PROGRESS
   Amount: [30%] or [$9,900]
   Due: [Upon milestone v]: [Rough-in complete]
   Notes: Electrical, plumbing, framing done

Payment 3: PROGRESS
   Amount: [30%] or [$9,900]
   Due: [Upon milestone v]: [Substantial completion]
   Notes: Cabinets, counters, fixtures installed

Payment 4: FINAL
   Amount: [10%] or [$3,300]
   Due: [Upon milestone v]: [Final walkthrough]
   Notes: Punch list complete, client sign-off

[+ Add Payment]  [Save as Template]
```

---

#### Stage 2: Quote Sent with Contract

| Element | Details |
|---------|---------|
| **Action** | Sends quote with attached contract; payment schedule clearly displayed |
| **Touchpoint** | Send flow, quote preview, contract attachment |
| **Thought** | "Client needs to see exactly when payments are due" |
| **Emotion** | 4 - Satisfied |
| **Pain Points** | Contract and quote feel like separate documents; client might miss payment terms |
| **Opportunities** | Unified quote-contract view; highlighted payment schedule in client view |

---

#### Stage 3: Deposit Collection

| Element | Chris | Elena |
|---------|-------|-------|
| **Action** | Client accepts quote, signs contract, pays deposit in single flow | Client accepts, signs, pays 50% deposit |
| **Touchpoint** | Acceptance notification, payment confirmation | Same |
| **Thought** | "Perfect - deposit covers materials. I can order tomorrow" | "Booking confirmed! Date is held" |
| **Emotion** | 5 - Delighted | 5 - Delighted |
| **Pain Points** | Deposit sometimes less than material cost; want to verify amount | Want confirmation that date is now blocked in calendar |
| **Opportunities** | Deposit amount validation; material cost warning | Calendar integration; auto-blocking |

**Client Acceptance Flow:**
```
CLIENT VIEW - QUOTE ACCEPTANCE

+--------------------------------------------------+
| QUOTE: Kitchen Renovation                        |
| From: Thompson Renovations                       |
| Amount: $33,000                                  |
+--------------------------------------------------+

Payment Schedule:
[x] I understand the payment schedule:
    - Deposit (30%): $9,900 due now
    - Progress (30%): $9,900 at rough-in
    - Progress (30%): $9,900 at substantial completion
    - Final (10%): $3,300 at project completion

Contract:
[x] I agree to the Terms & Conditions
    [View Full Contract]

Signature: [John Smith________________]
Date: January 15, 2026

+--------------------------------------------------+
| PAYMENT: $9,900.00 (Deposit)                     |
|                                                  |
| Pay with:                                        |
| [Credit Card]  [Bank Transfer (ACH)]  [Check]   |
+--------------------------------------------------+

[Complete & Pay $9,900]
```

---

#### Stage 4: Project Start

| Element | Details |
|---------|---------|
| **Action** | Project begins; contractor has cash flow confidence |
| **Touchpoint** | Project dashboard, upcoming payments view |
| **Thought** | "Deposit is in the bank. Time to get to work" |
| **Emotion** | 5 - Delighted (stress-free start) |
| **Pain Points** | Want to see project timeline alongside payment timeline |
| **Opportunities** | Project timeline view; integrated scheduling |

---

#### Stage 5: Milestone Invoice (Progress Payment)

| Element | Chris |
|---------|-------|
| **Action** | Marks milestone complete; system generates and sends invoice automatically |
| **Touchpoint** | Milestone completion button, auto-invoice, notification |
| **Thought** | "Rough-in is done. Let me trigger the next payment" |
| **Emotion** | 4 - Satisfied (simple process) |
| **Pain Points** | Client might dispute milestone completion; needs documentation |
| **Opportunities** | Milestone completion photos; client acknowledgment workflow |

**Milestone Completion Flow:**
```
MILESTONE: Rough-In Complete
Status: IN PROGRESS

Checklist:
[x] Electrical rough-in approved by inspector
[x] Plumbing rough-in approved by inspector
[x] Framing complete

Documentation:
[+ Add Photo]  [+ Add Note]

Photos attached: 3
Notes: "Inspector signed off on electrical Jan 30.
        Plumbing passed Jan 31. Ready for drywall."

+--------------------------------------------------+
| Marking complete will:                           |
| - Generate invoice for $9,900                    |
| - Send to client automatically                   |
| - Include completion documentation               |
+--------------------------------------------------+

[Mark Complete & Invoice Client]
```

---

#### Stage 6: Ongoing Milestone Management

| Element | Details |
|---------|---------|
| **Action** | Tracks multiple milestones; sees upcoming payments dashboard |
| **Touchpoint** | Project dashboard, payment timeline |
| **Thought** | "Two milestones paid, two to go. Cash flow is healthy" |
| **Emotion** | 4 - Satisfied |
| **Pain Points** | Hard to see all projects' payment status at once |
| **Opportunities** | Multi-project cash flow dashboard; payment forecasting |

**Project Payment Dashboard:**
```
PROJECT PAYMENTS OVERVIEW

+--------------------------------------------------+
| Kitchen Reno - Thompson (Total: $33,000)         |
| [========75%=====-----] $24,750 received         |
|                                                  |
| Deposit:    $9,900  PAID Jan 15                 |
| Progress 1: $9,900  PAID Feb 1                  |
| Progress 2: $9,900  DUE Feb 15 (INVOICED)       |
| Final:      $3,300  Feb 28 (SCHEDULED)          |
+--------------------------------------------------+
| Bathroom Reno - Garcia (Total: $18,000)          |
| [====33%===---------------] $6,000 received      |
|                                                  |
| Deposit:    $6,000  PAID Jan 22                 |
| Progress:   $6,000  DUE Feb 20 (NOT YET)        |
| Final:      $6,000  Mar 5 (SCHEDULED)           |
+--------------------------------------------------+

EXPECTED CASH FLOW (Next 30 Days):
+--------------------------------------------------+
| Feb 15: $9,900 (Thompson - Progress 2)           |
| Feb 20: $6,000 (Garcia - Progress)               |
| Feb 28: $3,300 (Thompson - Final)                |
|                                                  |
| TOTAL EXPECTED: $19,200                          |
+--------------------------------------------------+
```

---

#### Stage 7: Final Payment & Project Close

| Element | Chris | Elena |
|---------|-------|-------|
| **Action** | Conducts final walkthrough; marks complete; final invoice sent | Event completes; collects final payment next day |
| **Touchpoint** | Completion flow, final invoice, project archive | Same |
| **Thought** | "Project done, fully paid. Great client" | "Event was a success and I'm fully paid" |
| **Emotion** | 5 - Delighted | 5 - Delighted |
| **Pain Points** | Want client to sign off on completion; warranty terms |
| **Opportunities** | Completion sign-off workflow; warranty tracker; referral request |

---

### Journey 3: Payment Schedule Templates

| Industry | Template Name | Structure | Use Case |
|----------|--------------|-----------|----------|
| Construction | Standard 4-Pay | 30/30/30/10 | General renovation |
| Construction | Material-Heavy | 50/25/25 | High material cost projects |
| Events | Standard Event | 50/50 | Wedding, corporate event |
| Events | Premium Event | 25/25/25/25 | Large-scale production |
| Creative | Retainer + Project | Monthly + milestone | Ongoing relationship |
| Consulting | Monthly Retainer | Recurring | Advisory work |

---

## 5. Journey 4: Quote Revision & Negotiation

### Journey Overview

| Attribute | Details |
|-----------|---------|
| **Journey Name** | Quote Revision & Negotiation |
| **Primary Persona** | Creative Claire |
| **Secondary Persona** | Contractor Chris |
| **Goal** | Successfully navigate client change requests and close deal |
| **Trigger** | Client responds to quote with questions or change requests |
| **Success Metric** | Revision-to-acceptance conversion rate |
| **Target Duration** | < 24 hours from request to revised quote |

### Journey Map

```
SENT --> FEEDBACK --> ANALYZE --> REVISE --> RESEND --> NEGOTIATE --> ACCEPT
  |         |           |          |          |           |           |
"Quote    "They      "Can I    "Update   "Here's    "One      "Deal
 sent"    want       afford    the       the        more      done!"
          changes"   this?"    quote"    revision"  tweak"
```

### Detailed Stage Breakdown

---

#### Stage 1: Quote Sent & Waiting

| Element | Details |
|---------|---------|
| **Action** | Quote sent; user monitors for response |
| **Touchpoint** | Dashboard, view tracking |
| **Thought** | "They've viewed it twice. What are they thinking?" |
| **Emotion** | 3 - Neutral (anticipation) |

---

#### Stage 2: Client Feedback Received

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Receives email: "Can we remove X and add Y?" | Receives call: "This is higher than expected. Can we trim scope?" |
| **Touchpoint** | Email notification, quote comments (if client uses portal) | Phone (external), then dashboard |
| **Thought** | "Not exactly what I quoted, but doable" | "Let me see what I can adjust without hurting margin" |
| **Emotion** | 3 - Neutral (negotiation mode) | 2 - Anxious (don't want to lose the job) |
| **Pain Points** | Feedback is in email, not connected to quote; hard to track versions | Can't easily see margin impact of removing items |
| **Opportunities** | In-app quote comments; feedback linked to line items | Margin calculator; scope adjustment suggestions |

**Client Feedback Integration:**
```
QUOTE #1089 - Website Redesign

Client Comments (via email):
+--------------------------------------------------+
| From: john@acme.com                              |
| Date: Jan 29, 2026                               |
|                                                  |
| "Hi Claire,                                      |
|                                                  |
| Thanks for the quote. We love the approach but   |
| have a few questions:                            |
|                                                  |
| 1. Can we remove the blog redesign for now?      |
| 2. What would it cost to add a customer portal?  |
| 3. Is there flexibility on the timeline?         |
|                                                  |
| Best, John"                                      |
+--------------------------------------------------+

[Link to Quote] [Create Revision] [Reply]
```

---

#### Stage 3: Analyze & Plan Revision

| Element | Claire | Chris |
|---------|--------|-------|
| **Action** | Reviews original quote; determines what to change | Calculates new totals; considers what to cut vs. keep |
| **Touchpoint** | Quote detail, line item analysis | Quote detail, profit margin view |
| **Thought** | "If I remove blog, I can add portal for similar total" | "Removing the tile upgrade saves them $2,400 but I lose $400 profit" |
| **Emotion** | 4 - Satisfied (has a plan) | 3 - Neutral (crunching numbers) |
| **Pain Points** | Hard to model "what if" scenarios without creating new quote | No margin visibility on line items |
| **Opportunities** | Quote comparison/modeling tool; "what if" mode | Line item margin display; profit impact warnings |

---

#### Stage 4: Create Revision

| Element | Details |
|---------|---------|
| **Action** | Creates revised quote from original; makes requested changes |
| **Touchpoint** | Quote editor, revision history |
| **Thought** | "Need to track that this is version 2" |
| **Emotion** | 4 - Satisfied |
| **Pain Points** | Version tracking unclear; original quote status confusing |
| **Opportunities** | Clear versioning; comparison view; change summary |

**Quote Revision Flow:**
```
QUOTE REVISION

Original Quote: #1089 (v1)
Status: Superseded by revision

Creating: #1089 (v2)
+--------------------------------------------------+
| Changes from v1:                                 |
|                                                  |
| REMOVED:                                         |
| - Blog Redesign: -$2,500                         |
|                                                  |
| ADDED:                                           |
| + Customer Portal: +$3,200                       |
|                                                  |
| NET CHANGE: +$700                                |
|                                                  |
| Original Total: $8,500                           |
| Revised Total:  $9,200                           |
+--------------------------------------------------+

[Preview Revision] [Send to Client]
```

---

#### Stage 5: Send Revised Quote

| Element | Details |
|---------|---------|
| **Action** | Sends revision with cover message explaining changes |
| **Touchpoint** | Send modal, message template |
| **Thought** | "Let me explain what changed and why" |
| **Emotion** | 4 - Satisfied |
| **Pain Points** | Hard to articulate all changes in email; client might miss differences |
| **Opportunities** | Auto-generated change summary; visual diff for client |

**Client-Facing Change Summary:**
```
EMAIL TO CLIENT

Subject: Revised Quote - Website Redesign (Updated per your feedback)

Hi John,

Thanks for your feedback! I've updated the quote based on our discussion:

WHAT CHANGED:
- Removed: Blog Redesign (-$2,500)
+ Added: Customer Portal (+$3,200)

NEW TOTAL: $9,200 (was $8,500)

The customer portal includes user authentication, dashboard,
and document storage as discussed.

[View Updated Quote]

Let me know if you have any questions!

Best,
Claire
```

---

#### Stage 6: Further Negotiation (If Needed)

| Element | Details |
|---------|---------|
| **Action** | Client asks for one more adjustment; quick modification |
| **Touchpoint** | Quote editor, quick-edit mode |
| **Thought** | "Just a small tweak - don't need a whole new version" |
| **Emotion** | 3 - Neutral |
| **Pain Points** | Each small change creates new version; version fatigue |
| **Opportunities** | Minor adjustment mode (no new version for small changes); negotiation history |

---

#### Stage 7: Final Acceptance

| Element | Details |
|---------|---------|
| **Action** | Client accepts revised quote; deal closed |
| **Touchpoint** | Acceptance notification, dashboard |
| **Thought** | "Took some back-and-forth but we got there!" |
| **Emotion** | 5 - Delighted |
| **Pain Points** | Want to see negotiation history for future reference |
| **Opportunities** | Negotiation timeline; lessons learned capture; win analysis |

---

### Journey 4: Revision Best Practices

| Scenario | Best Practice | System Support |
|----------|---------------|----------------|
| Scope reduction | Show what's removed and new total clearly | Change summary |
| Scope addition | Explain value of additions | Line item descriptions |
| Price negotiation | Offer alternatives, not just discounts | Option packages |
| Timeline change | Adjust pricing if timeline impacts cost | Timeline-linked pricing |
| Multiple rounds | Keep all versions accessible | Version history |

---

## 6. Client-Side Journeys

### Overview

The client experience is critical to getting quotes accepted and invoices paid. These journeys map what the end client experiences.

---

### 6.1 Client Journey: Receiving and Reviewing a Quote

#### Journey Map

```
EMAIL --> OPEN --> REVIEW --> QUESTIONS --> DECIDE --> ACCEPT
   |        |        |           |           |          |
 "What's  "Let    "How      "Need to    "This     "Done,
  this?"   me      much?"    ask         works"    signed!"
           see"               about X"
```

#### Detailed Stages

| Stage | Client Action | Touchpoint | Thought | Emotion | Pain Points | Opportunities |
|-------|---------------|------------|---------|---------|-------------|---------------|
| **Email** | Receives quote notification | Email inbox | "Quote from Claire, let me look" | 3 - Neutral | Email might go to spam; unclear sender | Clear subject line; sender recognition |
| **Open** | Clicks link to view quote | Quote viewer (web) | "Hope this loads on my phone" | 3 - Neutral | Login required; slow loading | No login required; mobile-optimized |
| **Review** | Reads through quote details | Quote viewer | "Let me see what's included" | 3 - Neutral | Dense text; unclear scope | Clear sections; visual hierarchy |
| **Questions** | Wants clarification on item | Email (leaves platform) | "What exactly is this line item?" | 2 - Anxious | Can't ask questions in context | In-quote commenting |
| **Decide** | Considers accepting | Quote viewer | "This looks reasonable" | 4 - Satisfied | Can't compare to alternatives easily | Download/print option |
| **Accept** | Signs and accepts quote | Signature + payment | "Let me sign and pay deposit" | 4 - Satisfied | Too many steps; payment friction | One-flow acceptance |

#### Client Quote View Wireframe

```
+----------------------------------------------------------+
|  [LOGO] Thompson Renovations                              |
+----------------------------------------------------------+
|                                                           |
|  QUOTE FOR: Kitchen Renovation                            |
|  Prepared for: John Smith                                 |
|  Date: January 15, 2026                                   |
|  Valid until: February 15, 2026                          |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  PROJECT SCOPE                                            |
|  Complete kitchen renovation including cabinets,          |
|  countertops, flooring, and appliance installation.      |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  LINE ITEMS                                               |
|                                                           |
|  Demolition & Removal                         $3,500.00  |
|  Framing & Structural                         $4,200.00  |
|  Electrical                                   $2,800.00  |
|  Plumbing                                     $3,100.00  |
|  Drywall & Finishing                          $2,400.00  |
|  Flooring (LVP)                               $4,500.00  |
|  Painting                                     $1,800.00  |
|  Cabinets & Installation                      $6,200.00  |
|  Countertops (Quartz)                         $4,500.00  |
|                                               ----------  |
|                                     TOTAL    $33,000.00  |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  PAYMENT SCHEDULE                                         |
|                                                           |
|  [====|====|====|=]                                       |
|  30%  30%  30%  10%                                       |
|                                                           |
|  1. Deposit (30%): $9,900 - Due upon acceptance          |
|  2. Progress (30%): $9,900 - Due at rough-in             |
|  3. Progress (30%): $9,900 - Due at substantial          |
|  4. Final (10%): $3,300 - Due at completion              |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  TERMS & CONDITIONS                                       |
|  [View Full Terms]                                        |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  QUESTIONS?                                               |
|  [Ask a Question]  [Download PDF]  [Print]               |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  [ ] I agree to the terms and conditions                 |
|                                                           |
|  Signature: [________________________]                    |
|                                                           |
|  [Accept & Pay Deposit - $9,900.00]                      |
|                                                           |
+----------------------------------------------------------+
```

---

### 6.2 Client Journey: Signing a Contract

#### Journey Map

```
PROMPT --> READ --> UNDERSTAND --> CONCERN --> SIGN --> CONFIRM
   |         |          |            |         |        |
 "Need     "Legal    "Do I       "What      "OK,    "Contract
  to        stuff"    agree       if..."     done"   saved"
  sign"               to this?"
```

#### Detailed Stages

| Stage | Client Action | Touchpoint | Thought | Emotion | Pain Points | Opportunities |
|-------|---------------|------------|---------|---------|-------------|---------------|
| **Prompt** | Sees contract within quote acceptance | Integrated view | "There's a contract too" | 3 - Neutral | Surprise contract; not expecting it | Upfront communication about contract |
| **Read** | Scrolls through contract terms | Contract viewer | "Let me see what I'm agreeing to" | 3 - Neutral | Legal jargon; long document | Plain language summary |
| **Understand** | Tries to understand key terms | Contract viewer | "What does this termination clause mean?" | 2 - Anxious | Complex terms; no explanation | Term tooltips; FAQ section |
| **Concern** | Has specific concern about clause | Email to provider | "I want to change this payment term" | 2 - Anxious | Can't negotiate in context | In-contract commenting |
| **Sign** | Applies electronic signature | Signature capture | "Hope this is legally binding" | 3 - Neutral | Signature feels informal | Legal validity assurance |
| **Confirm** | Receives signed copy | Email, download | "Do I have a copy?" | 4 - Satisfied | Where's my copy? | Automatic copy delivery |

---

### 6.3 Client Journey: Making a Payment

#### Journey Map

```
INVOICE --> REVIEW --> SELECT --> ENTER --> CONFIRM --> RECEIPT
   |          |          |         |          |          |
 "Bill      "Is       "How      "Card     "Done,     "Got
  arrived"   this      should    or bank?   paid"     receipt"
             right?"   I pay?"
```

#### Detailed Stages

| Stage | Client Action | Touchpoint | Thought | Emotion | Pain Points | Opportunities |
|-------|---------------|------------|---------|---------|-------------|---------------|
| **Invoice** | Receives invoice email | Email inbox | "Payment due from Thompson" | 3 - Neutral | Unclear due date; urgent vs normal | Clear due date in subject |
| **Review** | Checks invoice matches expectations | Invoice viewer | "Is this the milestone we agreed to?" | 3 - Neutral | Can't reference original quote | Link to quote/contract |
| **Select** | Chooses payment method | Payment options | "Can I pay by ACH? Lower fees?" | 3 - Neutral | Limited options; unclear fees | Multiple methods; transparent fees |
| **Enter** | Inputs payment details | Payment form | "Is this secure?" | 2 - Anxious | Security concerns; data entry | Security badges; autofill support |
| **Confirm** | Confirms payment | Confirmation button | "One last check before I pay $9,900" | 3 - Neutral | Large amount anxiety; no edit option | Review before confirm; edit option |
| **Receipt** | Gets payment confirmation | Email, portal | "I need this for my records" | 4 - Satisfied | Receipt not PDF; hard to file | PDF receipt; auto-accounting |

#### Client Payment View Wireframe

```
+----------------------------------------------------------+
|  INVOICE #INV-2026-0089                                   |
|  From: Thompson Renovations                               |
+----------------------------------------------------------+
|                                                           |
|  Kitchen Renovation - Progress Payment 2                  |
|                                                           |
|  Amount Due: $9,900.00                                    |
|  Due Date: February 15, 2026                             |
|                                                           |
|  This payment is for: Substantial completion milestone    |
|  (cabinets, countertops, fixtures installed)             |
|                                                           |
|  [View Original Quote] [View Contract]                    |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  PAYMENT METHOD                                           |
|                                                           |
|  [ ] Credit Card                                          |
|      Visa, Mastercard, Amex accepted                     |
|      Processing fee: 2.9%                                |
|                                                           |
|  [*] Bank Transfer (ACH)        RECOMMENDED              |
|      No processing fee                                    |
|      Clears in 3-5 business days                         |
|                                                           |
|  [ ] Pay by Check                                         |
|      Mail to address below                                |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  ACH PAYMENT                                              |
|                                                           |
|  Bank: [Chase Bank___________________]                    |
|  Routing #: [021000021________________]                   |
|  Account #: [xxxxxxxxxxxx1234_________]                   |
|                                                           |
|  [Save payment method for future invoices]               |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  REVIEW                                                   |
|  Amount: $9,900.00                                        |
|  Method: Bank Transfer (ACH)                              |
|  Fee: $0.00                                               |
|  Total: $9,900.00                                         |
|                                                           |
|  [Pay $9,900.00]                                          |
|                                                           |
|  [lock icon] Secure payment powered by Stripe             |
|                                                           |
+----------------------------------------------------------+
```

---

## 7. User Stories Backlog

### Epic Overview

| Epic | Description | Primary Persona | Journey |
|------|-------------|-----------------|---------|
| **E1** | New User Onboarding | Claire, Chris | Journey 1 |
| **E2** | Quote Creation | All | Journey 1, 2 |
| **E3** | Quote Delivery & Tracking | All | Journey 1, 2 |
| **E4** | Payment Scheduling | Chris, Elena | Journey 3 |
| **E5** | Quote-to-Invoice Conversion | All | Journey 1, 3 |
| **E6** | Quote Revision | Claire, Chris | Journey 4 |
| **E7** | Client Experience | Clients | Client Journeys |
| **E8** | Payment Collection | All | Journey 1, 3 |

---

### E1: New User Onboarding

#### US-E1-001: Minimal Signup
```
As a new user,
I want to sign up with just my email,
So that I can start using the product immediately without a long form.

Acceptance Criteria:
- [ ] Signup requires only email address
- [ ] Optional fields can be skipped
- [ ] User reaches dashboard within 60 seconds
- [ ] Email verification is asynchronous (doesn't block usage)
```
**Priority:** P0 | **Story Points:** 3

#### US-E1-002: Skip-Friendly Onboarding
```
As a new user,
I want to skip optional setup steps,
So that I can create my first quote as quickly as possible.

Acceptance Criteria:
- [ ] Logo upload is optional with "Skip" button
- [ ] Payment setup can be deferred
- [ ] User can complete onboarding in < 3 minutes
- [ ] Skipped items show gentle reminders later
```
**Priority:** P0 | **Story Points:** 3

#### US-E1-003: Guided First Quote
```
As a new user,
I want a guided experience for my first quote,
So that I learn the system while creating something real.

Acceptance Criteria:
- [ ] Tooltip hints on first quote creation
- [ ] Sample content suggestions
- [ ] Progress indicator showing steps
- [ ] Celebration moment on first quote sent
```
**Priority:** P1 | **Story Points:** 5

#### US-E1-004: Template Selection
```
As a new user,
I want to choose from industry-specific templates,
So that my first quote looks professional immediately.

Acceptance Criteria:
- [ ] Templates categorized by industry
- [ ] Preview available before selection
- [ ] Templates pre-populate relevant line items
- [ ] At least 5 templates available at launch
```
**Priority:** P0 | **Story Points:** 5

---

### E2: Quote Creation

#### US-E2-001: Block-Based Editor
```
As a quote creator,
I want a drag-and-drop block editor,
So that I can design custom layouts without technical skills.

Acceptance Criteria:
- [ ] Text blocks with rich formatting
- [ ] Line item tables
- [ ] Image blocks
- [ ] Section dividers
- [ ] Drag to reorder blocks
- [ ] Real-time preview
```
**Priority:** P0 | **Story Points:** 13

#### US-E2-002: Line Item Management
```
As a quote creator,
I want to easily add, edit, and reorder line items,
So that I can build detailed quotes quickly.

Acceptance Criteria:
- [ ] Add line item with name, description, quantity, rate
- [ ] Auto-calculate line totals and grand total
- [ ] Drag to reorder items
- [ ] Duplicate line item
- [ ] Bulk actions (select multiple, delete)
```
**Priority:** P0 | **Story Points:** 8

#### US-E2-003: Saved Line Items Library
```
As a repeat quote creator,
I want to save common line items for reuse,
So that I don't have to type the same items repeatedly.

Acceptance Criteria:
- [ ] Save any line item to library
- [ ] Browse saved items when adding to quote
- [ ] Search saved items
- [ ] Edit saved item pricing (updates globally or per-use)
```
**Priority:** P1 | **Story Points:** 5

#### US-E2-004: Client Information
```
As a quote creator,
I want to add client details to quotes,
So that quotes are properly addressed and tracked.

Acceptance Criteria:
- [ ] Client name, email, company, address fields
- [ ] Save client for future quotes
- [ ] Search existing clients
- [ ] Auto-populate from client selection
```
**Priority:** P0 | **Story Points:** 5

#### US-E2-005: Quote Duplication
```
As a returning user,
I want to duplicate an existing quote,
So that I can quickly create similar quotes for the same or new clients.

Acceptance Criteria:
- [ ] "Duplicate" button on quote detail and list
- [ ] Prompts to change client (or keep same)
- [ ] All content copied including formatting
- [ ] Clear that it's a new quote (new number)
```
**Priority:** P1 | **Story Points:** 3

#### US-E2-006: Mobile Quote Creation
```
As a contractor on a job site,
I want to create quotes on my phone,
So that I can quote while the opportunity is fresh.

Acceptance Criteria:
- [ ] Full quote creation flow works on mobile
- [ ] Touch-friendly controls
- [ ] Quick line item entry
- [ ] Send quote from mobile
```
**Priority:** P0 | **Story Points:** 8

---

### E3: Quote Delivery & Tracking

#### US-E3-001: Quote Sending
```
As a quote creator,
I want to send quotes via email with one click,
So that clients receive professional-looking communications.

Acceptance Criteria:
- [ ] Enter client email (pre-filled if saved)
- [ ] Customize email message
- [ ] Preview email before sending
- [ ] Delivery confirmation
```
**Priority:** P0 | **Story Points:** 5

#### US-E3-002: Quote View Tracking
```
As a quote creator,
I want to know when clients view my quotes,
So that I can time my follow-ups appropriately.

Acceptance Criteria:
- [ ] Track quote opens
- [ ] Show view count and timestamps
- [ ] Notification on first view
- [ ] View history in quote detail
```
**Priority:** P1 | **Story Points:** 5

#### US-E3-003: Quote Status Dashboard
```
As a user,
I want a dashboard showing all quote statuses,
So that I can see my pipeline at a glance.

Acceptance Criteria:
- [ ] Filter by status (draft, sent, viewed, accepted, declined)
- [ ] Sort by date, amount, client
- [ ] Quick actions (send, edit, duplicate)
- [ ] Status badges clearly visible
```
**Priority:** P0 | **Story Points:** 5

#### US-E3-004: Quote Expiration
```
As a quote creator,
I want to set expiration dates on quotes,
So that clients are motivated to respond promptly.

Acceptance Criteria:
- [ ] Set expiration date when creating quote
- [ ] Expiration visible to client
- [ ] Warning before expiration
- [ ] Expired quotes marked but not deleted
```
**Priority:** P1 | **Story Points:** 3

---

### E4: Payment Scheduling

#### US-E4-001: Deposit Setup
```
As a contractor,
I want to require a deposit on quote acceptance,
So that I have cash flow to start the project.

Acceptance Criteria:
- [ ] Set deposit as % or fixed amount
- [ ] Deposit collected on acceptance
- [ ] Clear messaging to client about deposit
- [ ] Payment required to complete acceptance
```
**Priority:** P0 | **Story Points:** 5

#### US-E4-002: Milestone Payment Schedule
```
As a contractor,
I want to define milestone payments,
So that I get paid as the project progresses.

Acceptance Criteria:
- [ ] Add multiple milestones
- [ ] Set amount (% or fixed) for each
- [ ] Name/describe each milestone
- [ ] Visual payment schedule in quote
```
**Priority:** P0 | **Story Points:** 8

#### US-E4-003: Payment Schedule Templates
```
As a repeat user,
I want to save payment schedule templates,
So that I can quickly apply common structures.

Acceptance Criteria:
- [ ] Save current schedule as template
- [ ] Browse and apply templates
- [ ] Industry-specific default templates
- [ ] Edit template after applying
```
**Priority:** P1 | **Story Points:** 5

#### US-E4-004: Milestone Completion Trigger
```
As a contractor,
I want to mark milestones complete and auto-send invoices,
So that I get paid promptly when work is done.

Acceptance Criteria:
- [ ] "Mark Complete" button on milestone
- [ ] Optional: add completion notes/photos
- [ ] Auto-generates invoice for that milestone
- [ ] Auto-sends invoice (or prompts to send)
```
**Priority:** P0 | **Story Points:** 8

---

### E5: Quote-to-Invoice Conversion

#### US-E5-001: One-Click Conversion
```
As a user with an accepted quote,
I want to convert it to an invoice with one click,
So that I don't have to recreate all the information.

Acceptance Criteria:
- [ ] "Convert to Invoice" button on accepted quote
- [ ] All line items copied
- [ ] Client info copied
- [ ] Reference to original quote maintained
- [ ] Option to review before sending
```
**Priority:** P0 | **Story Points:** 5

#### US-E5-002: Partial Invoicing
```
As a user,
I want to invoice for part of an accepted quote,
So that I can bill for completed phases.

Acceptance Criteria:
- [ ] Select which line items to invoice
- [ ] Shows remaining un-invoiced amount
- [ ] Links back to original quote
- [ ] Prevents over-invoicing
```
**Priority:** P1 | **Story Points:** 5

#### US-E5-003: Invoice Editing
```
As a user,
I want to edit an invoice before sending,
So that I can make adjustments if needed.

Acceptance Criteria:
- [ ] Edit all fields after conversion
- [ ] Add/remove line items
- [ ] Adjust amounts
- [ ] Change payment terms
```
**Priority:** P0 | **Story Points:** 3

---

### E6: Quote Revision

#### US-E6-001: Create Revision
```
As a user,
I want to create a revised version of a sent quote,
So that I can respond to client change requests.

Acceptance Criteria:
- [ ] "Create Revision" from sent quote
- [ ] Original marked as superseded
- [ ] Version number incremented
- [ ] All content editable
```
**Priority:** P0 | **Story Points:** 5

#### US-E6-002: Change Summary
```
As a user,
I want to see what changed between quote versions,
So that I can communicate clearly with clients.

Acceptance Criteria:
- [ ] Auto-generated change summary
- [ ] Shows added, removed, modified items
- [ ] Net price change displayed
- [ ] Option to include in client email
```
**Priority:** P1 | **Story Points:** 5

#### US-E6-003: Version History
```
As a user,
I want to access all versions of a quote,
So that I can reference the negotiation history.

Acceptance Criteria:
- [ ] Version list on quote detail
- [ ] View any previous version
- [ ] Compare two versions
- [ ] Clear which version is current
```
**Priority:** P1 | **Story Points:** 5

---

### E7: Client Experience

#### US-E7-001: No-Login Quote View
```
As a client,
I want to view quotes without creating an account,
So that I can review proposals easily.

Acceptance Criteria:
- [ ] Quote accessible via secure link
- [ ] No login required to view
- [ ] Full quote visible on any device
- [ ] Can accept without account (email verification only)
```
**Priority:** P0 | **Story Points:** 5

#### US-E7-002: Mobile-Optimized Client View
```
As a client,
I want to view and accept quotes on my phone,
So that I can respond quickly from anywhere.

Acceptance Criteria:
- [ ] Fully responsive quote view
- [ ] Touch-friendly signature
- [ ] Mobile payment flow
- [ ] Fast loading (< 3 seconds)
```
**Priority:** P0 | **Story Points:** 5

#### US-E7-003: E-Signature Capture
```
As a client,
I want to sign quotes electronically,
So that I can accept without printing.

Acceptance Criteria:
- [ ] Draw signature with mouse/finger
- [ ] Type signature option
- [ ] Legal disclaimer displayed
- [ ] Timestamp and IP recorded
- [ ] Signed copy sent to both parties
```
**Priority:** P0 | **Story Points:** 8

#### US-E7-004: Client Payment Options
```
As a client,
I want multiple payment options,
So that I can choose what's convenient for me.

Acceptance Criteria:
- [ ] Credit card payment
- [ ] ACH/bank transfer
- [ ] Payment by check (instructions)
- [ ] Clear fee information (if any)
- [ ] Save payment method for future
```
**Priority:** P0 | **Story Points:** 8

#### US-E7-005: In-Quote Comments
```
As a client,
I want to ask questions about specific quote items,
So that I can get clarification without leaving the quote.

Acceptance Criteria:
- [ ] Comment icon on line items
- [ ] Thread-style conversation
- [ ] Notifications to quote creator
- [ ] Comments visible in context
```
**Priority:** P2 | **Story Points:** 8

---

### E8: Payment Collection

#### US-E8-001: Payment Reminders
```
As a user,
I want automated payment reminders,
So that I don't have to chase clients manually.

Acceptance Criteria:
- [ ] Configurable reminder schedule (before, on, after due)
- [ ] Professional reminder templates
- [ ] Customizable per client/invoice
- [ ] Enable/disable per invoice
```
**Priority:** P0 | **Story Points:** 8

#### US-E8-002: Payment Dashboard
```
As a user,
I want to see all expected payments,
So that I can forecast my cash flow.

Acceptance Criteria:
- [ ] List of upcoming payments
- [ ] Overdue payments highlighted
- [ ] Filter by date range
- [ ] Total expected by period
```
**Priority:** P1 | **Story Points:** 5

#### US-E8-003: Payment Confirmation
```
As a user,
I want to be notified when payments arrive,
So that I know immediately when I get paid.

Acceptance Criteria:
- [ ] Email notification on payment
- [ ] Push notification (if mobile)
- [ ] Dashboard update in real-time
- [ ] Payment details visible
```
**Priority:** P0 | **Story Points:** 3

---

### User Story Summary by Priority

| Priority | Stories | Total Points |
|----------|---------|--------------|
| P0 (Must Have) | 20 | ~110 points |
| P1 (Should Have) | 12 | ~55 points |
| P2 (Nice to Have) | 1 | ~8 points |

---

## 8. Success Criteria per Journey

### Journey 1: First Quote to Getting Paid

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Signup completion rate** | > 80% | Analytics: started vs completed |
| **Time to first quote** | < 15 minutes | Analytics: signup to quote created |
| **First quote sent within 24hr** | > 40% | Analytics: signup to quote sent |
| **Quote-to-invoice auto-conversion usage** | > 90% | Feature analytics |
| **Average days to payment** | < 14 days | Payment data |
| **New user retention (7-day)** | > 70% | Cohort analysis |
| **New user NPS** | > 40 | Survey |

### Journey 2: Repeat Client Quote

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Time to create repeat client quote** | < 10 minutes | Analytics |
| **Client duplication feature usage** | > 60% | Feature analytics |
| **Saved items library usage** | > 50% | Feature analytics |
| **Quote view tracking engagement** | > 70% | Feature analytics |
| **Repeat quote acceptance rate** | > 70% | Quote analytics |

### Journey 3: Project with Payment Schedule

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Deposit collection rate** | > 85% | Payment analytics |
| **Milestone payment on-time rate** | > 75% | Payment analytics |
| **Average time milestone-to-payment** | < 7 days | Payment analytics |
| **Payment schedule adoption** | > 40% of quotes | Feature analytics |
| **Milestone auto-invoice usage** | > 80% | Feature analytics |

### Journey 4: Quote Revision & Negotiation

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Time to create revision** | < 5 minutes | Analytics |
| **Revision-to-acceptance rate** | > 50% | Quote analytics |
| **Version history access rate** | > 30% | Feature analytics |
| **Change summary feature usage** | > 60% | Feature analytics |

### Client-Side Journeys

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Quote open rate** | > 80% | Email/view tracking |
| **Time from view to accept** | < 48 hours avg | Analytics |
| **Mobile acceptance rate** | > 40% | Device analytics |
| **E-signature completion rate** | > 95% | Signature analytics |
| **Payment completion rate** | > 98% | Payment analytics |
| **Client NPS (payment experience)** | > 50 | Survey |

---

## 9. Pain Points Summary

### Pain Points by Severity

#### Critical Pain Points

| Pain Point | Personas Affected | Journey | Impact | Solution Priority |
|------------|-------------------|---------|--------|-------------------|
| **Quote-to-invoice data re-entry** | All | 1, 2, 3 | 15-30 min wasted per project | P0 - Core feature |
| **Chasing payments manually** | All | 1, 3 | Relationship damage, cash flow stress | P0 - Automated reminders |
| **No deposit collection workflow** | Chris, Elena | 3 | Project risk, cash flow gaps | P0 - Payment scheduling |
| **Can't quote from job site** | Chris | 1, 2 | Lost deals to faster competitors | P0 - Mobile experience |

#### High Pain Points

| Pain Point | Personas Affected | Journey | Impact | Solution Priority |
|------------|-------------------|---------|--------|-------------------|
| **Unprofessional document appearance** | Claire, Carlos | 1, 2 | Lost deals, brand damage | P0 - Block editor |
| **Contract-quote disconnect** | Chris, Claire | 1, 3 | Multiple tools, workflow friction | P0 - Integrated contracts |
| **No payment visibility/tracking** | All | 1, 3 | Cash flow uncertainty | P1 - Payment dashboard |
| **Version confusion on revisions** | Claire, Chris | 4 | Client confusion, deal delays | P1 - Version history |
| **Complex milestone tracking** | Chris, Elena | 3 | Manual tracking, missed payments | P0 - Milestone system |

#### Medium Pain Points

| Pain Point | Personas Affected | Journey | Impact | Solution Priority |
|------------|-------------------|---------|--------|-------------------|
| **Onboarding takes too long** | All | 1 | Abandonment, poor first impression | P1 - Streamlined onboarding |
| **Can't preview client experience** | Claire | 1, 2 | Uncertainty about appearance | P1 - Preview mode |
| **Saved items get outdated** | Claire, Amanda | 2 | Wrong pricing, time waste | P2 - Item management |
| **Team coordination on quotes** | Amanda | 2 | Duplicate effort, confusion | P1 - Team features |

### Pain Points by Persona

#### Creative Claire
1. Quote-to-invoice friction (Critical)
2. Documents don't reflect design quality (High)
3. Chasing payments is awkward (High)
4. Tool fragmentation (Medium)
5. Version control on revisions (Medium)

#### Contractor Chris
1. Can't quote on-site (Critical)
2. No deposit workflow (Critical)
3. Scope creep without documentation (High)
4. Milestone payment confusion (High)
5. Documents look unprofessional (High)

#### Agency Amanda
1. Team bottleneck on quotes (High)
2. Retainer billing complexity (High)
3. Multiple tool subscriptions (Medium)
4. No quote pipeline visibility (Medium)

---

## 10. Opportunity Map

### Opportunity Prioritization Matrix

```
                    HIGH VALUE
                        |
   QUICK WINS      |   BIG BETS
   [Implement Now]  |   [Invest Heavily]
                    |
                    |
   - Auto reminders |   - Block editor
   - One-click      |   - Payment scheduling
     conversion     |   - E-signatures
   - Mobile quoting |   - Client portal
   - Template       |
     library        |
                    |
LOW ----------------+----------------- HIGH
EFFORT              |                   EFFORT
                    |
   FILL-INS         |   STRATEGIC
   [Consider Later] |   [Plan Carefully]
                    |
   - In-quote       |   - Team features
     comments       |   - API platform
   - Calendar sync  |   - White-label
   - Expense        |   - AI features
     pass-through   |
                    |
                    LOW VALUE
```

### Opportunity Details

#### Quick Wins (Low Effort, High Value)

| Opportunity | User Story | Impact | Effort | Timeline |
|-------------|------------|--------|--------|----------|
| Automated payment reminders | US-E8-001 | Reduces 73% overdue | 8 pts | Q1 |
| One-click quote-to-invoice | US-E5-001 | Saves 15+ min/project | 5 pts | Q1 |
| Mobile quote creation | US-E2-006 | Win deals from job site | 8 pts | Q1 |
| Industry templates | US-E1-004 | Faster first quote | 5 pts | Q1 |
| Quote duplication | US-E2-005 | Saves 10+ min/repeat quote | 3 pts | Q1 |

#### Big Bets (High Effort, High Value)

| Opportunity | User Stories | Impact | Effort | Timeline |
|-------------|--------------|--------|--------|----------|
| Block-based editor | US-E2-001 | Key differentiator | 13 pts | Q1-Q2 |
| Payment scheduling | US-E4-001, 002, 004 | Enables milestone billing | 21 pts | Q1 |
| E-signature integration | US-E7-003 | Replaces $15-25/mo tool | 8 pts | Q1 |
| Client portal | US-E7-001, 002 | Professional client exp | 10 pts | Q2 |
| Milestone auto-invoicing | US-E4-004 | Automates billing cycle | 8 pts | Q1 |

#### Strategic Investments (High Effort, Varies)

| Opportunity | Description | Impact | Effort | Timeline |
|-------------|-------------|--------|--------|----------|
| Team features | Multi-user, permissions | Agency expansion | 20+ pts | Q3-Q4 |
| API platform | Public API, integrations | Ecosystem lock-in | 30+ pts | Year 2 |
| White-label | Embed in other platforms | New revenue stream | 40+ pts | Year 2-3 |
| AI features | Smart pricing, predictions | Differentiation | 25+ pts | Year 2 |

### Journey-to-Opportunity Mapping

| Journey | Primary Opportunities | Secondary Opportunities |
|---------|----------------------|------------------------|
| Journey 1: First Quote to Paid | Templates, Mobile, Auto-convert | Onboarding, Reminders |
| Journey 2: Repeat Client | Duplication, Saved Items, Client History | View Tracking, Follow-up |
| Journey 3: Payment Schedule | Milestones, Auto-invoicing, Deposits | Payment Dashboard, Forecasting |
| Journey 4: Revision | Version History, Change Summary | Client Comments, Comparison |
| Client Journeys | No-Login View, Mobile, E-signatures | Payment Options, Portal |

### Implementation Roadmap

#### Q1 2026 (MVP Launch)

**Focus:** Core quote-to-payment workflow

| Week | Deliverable | Stories |
|------|-------------|---------|
| 1-2 | Signup & Onboarding | US-E1-001, 002 |
| 3-4 | Quote Editor (basic) | US-E2-002, 004 |
| 5-6 | Templates & Send | US-E1-004, US-E3-001 |
| 7-8 | Client View & E-sign | US-E7-001, 002, 003 |
| 9-10 | Payment Collection | US-E7-004, US-E8-003 |
| 11-12 | Quote-to-Invoice | US-E5-001, 003 |

#### Q2 2026 (Enhancement)

**Focus:** Payment scheduling, mobile, block editor

| Month | Deliverable | Stories |
|-------|-------------|---------|
| Apr | Payment Scheduling | US-E4-001, 002 |
| May | Block Editor | US-E2-001 |
| Jun | Mobile Experience | US-E2-006 |

#### Q3-Q4 2026 (Growth)

**Focus:** Automation, team features, integrations

| Quarter | Deliverable | Stories |
|---------|-------------|---------|
| Q3 | Automation (reminders, milestones) | US-E8-001, US-E4-004 |
| Q4 | Team Features | Multi-user, permissions |

---

## Appendix A: Journey Map Templates

### Template: User Journey Stage

```
#### Stage N: [Stage Name]

| Element | [Persona 1] | [Persona 2] |
|---------|-------------|-------------|
| **Action** | What user does | What user does |
| **Touchpoint** | Product interaction point | Product interaction point |
| **Thought** | Internal monologue | Internal monologue |
| **Emotion** | 1-5 scale with label | 1-5 scale with label |
| **Pain Points** | Frustrations | Frustrations |
| **Opportunities** | Improvement ideas | Improvement ideas |
```

### Template: User Story

```
#### US-[EPIC]-[NUMBER]: [Story Name]

As a [persona],
I want [goal],
So that [benefit].

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Priority:** P0/P1/P2 | **Story Points:** N
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Journey Mapper Agent | Initial document creation |

---

*This User Journeys document serves as the foundation for product design and development prioritization. It should be updated as user research reveals new insights and as the product evolves.*

---

**Next Steps:**
1. Validate journeys with real users (5-10 interviews)
2. Create wireframes based on journey touchpoints
3. Prioritize user story backlog for sprint planning
4. Define success metrics tracking implementation
5. Schedule journey review after beta launch
