# QuoteCraft Landing Page Specification

**Version:** 1.0.0
**Status:** Production-Ready for Development
**Last Updated:** January 2026
**Document Owner:** Marketing & Product Team

---

## Table of Contents

1. [Overview](#1-overview)
2. [Page Structure & Sections](#2-page-structure--sections)
3. [Content Strategy](#3-content-strategy)
4. [Design System Integration](#4-design-system-integration)
5. [Component Specifications](#5-component-specifications)
6. [SEO Requirements](#6-seo-requirements)
7. [Performance Requirements](#7-performance-requirements)
8. [Conversion Optimization](#8-conversion-optimization)
9. [Analytics & Tracking](#9-analytics--tracking)
10. [Responsive Design](#10-responsive-design)
11. [Accessibility Requirements](#11-accessibility-requirements)
12. [Content Guidelines](#12-content-guidelines)
13. [Technical Implementation](#13-technical-implementation)
14. [Launch Checklist](#14-launch-checklist)

---

## 1. Overview

### 1.1 Purpose

This specification defines the complete requirements for QuoteCraft's marketing landing page - a high-converting, SEO-optimized page that communicates our value proposition and drives user acquisition for both the open-source self-hosted product and cloud subscription tiers.

### 1.2 Strategic Goals

| Goal | Target Metric | Timeline |
|------|---------------|----------|
| Conversion to signup | 3-5% visitor-to-signup | Launch |
| GitHub repository traffic | 500+ clicks/month | Month 1 |
| Organic search ranking | Top 10 for "open source invoice software" | Month 6 |
| Page load time | < 3 seconds (LCP) | Launch |
| Mobile conversion parity | Within 20% of desktop | Launch |

### 1.3 Target Audience

**Primary:**
- Freelance designers, developers, consultants
- Small agency owners (2-10 employees)
- Home service contractors
- Solopreneurs and coaches

**Secondary:**
- Tech-savvy users seeking self-hosted solutions
- Price-conscious professionals leaving expensive tools
- Open source enthusiasts

### 1.4 Key Messaging Framework

```
Primary Message:
"Beautiful Invoices. No Expensive Subscription."

Supporting Messages:
1. Open-source and self-hosted - your data, your control
2. Visual builder - not another spreadsheet
3. One-click quote-to-invoice conversion
4. Free forever (self-hosted) or $9/mo cloud
```

---

## 2. Page Structure & Sections

### 2.1 Navigation Header

**Fixed/Sticky:** Yes (transforms on scroll)
**Height:** 64px desktop, 56px mobile

#### Elements

```
+------------------------------------------------------------------+
| [Logo]    Features  Pricing  Docs  GitHub    [Sign In] [Get Started] |
+------------------------------------------------------------------+
```

| Element | Behavior |
|---------|----------|
| Logo | Links to homepage, 140x32px max |
| Features | Smooth scroll to features section |
| Pricing | Smooth scroll to pricing section |
| Docs | Links to /docs (external) |
| GitHub | Links to GitHub repo (opens new tab) with star count badge |
| Sign In | Links to /login |
| Get Started | Primary CTA button, links to /signup |

**Scroll Behavior:**
- Background: Transparent at top, white/blur backdrop after 50px scroll
- Shadow: None at top, subtle shadow after scroll
- Logo: Full color always

**Mobile Navigation:**
- Hamburger menu on right
- Full-screen overlay with all links
- Primary CTA always visible

---

### 2.2 Hero Section

**Purpose:** Immediate value proposition communication and primary conversion point

**Layout:** Split or centered, depending on visual asset availability

#### Content Structure

```
+------------------------------------------------------------------+
|                                                                    |
|   Beautiful Invoices.                                              |
|   No Expensive Subscription.                                       |
|                                                                    |
|   The open-source alternative to Bloom and Bonsai.                |
|   Create stunning quotes, get them signed, convert to invoices    |
|   with one click. Self-hosted or cloud - your choice.             |
|                                                                    |
|   [Get Started Free]  [View on GitHub *]                          |
|                                                                    |
|   Trusted by 5,000+ freelancers  |  [GitHub Stars Badge]          |
|                                                                    |
|   +------------------------------------------------------+        |
|   |                                                      |        |
|   |           [Hero Visual - Quote Builder]              |        |
|   |                                                      |        |
|   +------------------------------------------------------+        |
|                                                                    |
+------------------------------------------------------------------+
```

#### Specifications

| Element | Specification |
|---------|---------------|
| Headline | H1, 48-64px desktop, 32-40px mobile |
| Subheadline | 20-24px desktop, 16-18px mobile, muted color |
| Primary CTA | "Get Started Free" - Primary button, large size |
| Secondary CTA | "View on GitHub" - Outline button with GitHub icon and live star count |
| Social Proof | GitHub stars, user count (update dynamically via API) |
| Hero Visual | Animated screenshot/video of quote builder, max-width 1200px |

#### Hero Visual Options (Priority Order)

1. **Animated Demo:** 15-30 second loop showing quote creation flow
2. **Interactive Demo:** Embedded mini quote builder (complex but high-impact)
3. **Static Screenshot:** High-quality screenshot with subtle floating animation
4. **Illustration:** Custom illustration showing the workflow

#### Micro-Copy Variants for A/B Testing

| Variant | Headline | Subheadline |
|---------|----------|-------------|
| A (Default) | Beautiful Invoices. No Expensive Subscription. | The open-source alternative to Bloom and Bonsai |
| B | Stop Paying $20/month for Invoices | Self-hosted, open source, free forever |
| C | Invoices as Beautiful as Your Work | The visual invoice builder that's actually free |

---

### 2.3 Social Proof Bar

**Purpose:** Build immediate credibility

**Layout:** Horizontal scroll on mobile, centered on desktop

```
+------------------------------------------------------------------+
|  [GitHub Stars: 2.5k]  |  [Downloads: 10k+]  |  "Best invoice     |
|                        |                     |   tool I've used"  |
|                        |                     |   - @user          |
+------------------------------------------------------------------+
```

#### Elements

| Metric | Source | Update Frequency |
|--------|--------|------------------|
| GitHub Stars | GitHub API | Real-time/cached 1hr |
| Downloads | Docker Hub + npm | Daily |
| Featured Quote | Curated testimonial | Static |

---

### 2.4 Problem/Pain Section

**Purpose:** Create emotional resonance with target audience frustrations

**Headline:** "Sound Familiar?"

#### Content Blocks

**Block 1: The Spreadsheet Problem**
```
+-----------------------------------------+
|  [Icon: Table/Grid]                     |
|                                         |
|  "Your invoices look like tax forms"    |
|                                         |
|  You're using Zoho, Wave, or Excel.     |
|  Your quotes are functional but         |
|  forgettable. Clients see spreadsheets, |
|  not professionalism.                   |
+-----------------------------------------+
```

**Block 2: The No-Records Problem**
```
+-----------------------------------------+
|  [Icon: File Missing]                   |
|                                         |
|  "Pretty but no paper trail"            |
|                                         |
|  You're using Canva for quotes.         |
|  They look great but you're copying     |
|  data manually into invoices. No        |
|  tracking, no automation, no records.   |
+-----------------------------------------+
```

**Block 3: The Price Problem**
```
+-----------------------------------------+
|  [Icon: Dollar/Money]                   |
|                                         |
|  "Bloom costs $20/month for WHAT?"      |
|                                         |
|  You've seen Bloom, Bonsai, HoneyBook.  |
|  They're beautiful but $20-50/month     |
|  for invoicing feels excessive when     |
|  you're just starting out.              |
+-----------------------------------------+
```

#### Visual Treatment

- 3-column grid on desktop, single column on mobile
- Subtle red/orange tint to icons (pain association)
- Light background with slight texture
- Transition animation when section enters viewport

---

### 2.5 Solution/Features Section

**Purpose:** Showcase product capabilities with visual evidence

**Headline:** "QuoteCraft is Different"
**Subheadline:** "A visual builder that's open source and actually free"

#### Feature Showcase Format

Each feature block follows this structure:

```
+------------------------------------------------------------------+
|                                                                    |
|  +---------------------------+  +-----------------------------+   |
|  |                           |  |                             |   |
|  |    [Feature Screenshot]   |  |  [Icon] Visual Quote Builder|   |
|  |                           |  |                             |   |
|  |                           |  |  Drag-and-drop blocks, not  |   |
|  |                           |  |  spreadsheet rows. Create   |   |
|  |                           |  |  quotes your clients will   |   |
|  |                           |  |  remember.                  |   |
|  |                           |  |                             |   |
|  +---------------------------+  |  * Block-based editor       |   |
|                                 |  * Real-time preview        |   |
|                                 |  * Professional templates   |   |
|                                 +-----------------------------+   |
|                                                                    |
+------------------------------------------------------------------+
```

#### Features to Showcase

| # | Feature | Headline | Key Points | Visual |
|---|---------|----------|------------|--------|
| 1 | Visual Quote Builder | "Build Beautiful Quotes" | Block-based editor, WYSIWYG, templates | Screenshot of editor |
| 2 | One-Click Conversion | "Quote to Invoice in One Click" | Zero re-entry, automatic data transfer | Animation of conversion |
| 3 | E-Signatures | "Get Signed Instantly" | Built-in signatures, legally binding, mobile-friendly | Signature flow demo |
| 4 | Payment Scheduling | "Flexible Payment Terms" | Deposits, milestones, auto-reminders | Payment schedule UI |
| 5 | Rate Card System | "Consistent Pricing" | Reusable services, automatic calculations | Rate card management |
| 6 | Self-Hosted | "Your Data, Your Server" | Docker deployment, full control, no vendor lock-in | Docker logo + terminal |

#### Layout Pattern

- Alternating left-right image/text blocks
- Odd features: Image left, text right
- Even features: Text left, image right
- Full-bleed backgrounds alternating subtle gray/white

---

### 2.6 How It Works Section

**Purpose:** Simplify the product workflow into digestible steps

**Headline:** "From Quote to Paid in 4 Steps"

```
+------------------------------------------------------------------+
|                                                                    |
|   [1]              [2]              [3]              [4]          |
|    |                |                |                |           |
|    v                v                v                v           |
|  Create          Get It           Convert          Get           |
|  Beautiful       Signed           to Invoice       Paid          |
|  Quote                                                            |
|                                                                    |
|  Use the visual    Send for         One click.       Accept       |
|  builder to craft  e-signature.     No data          payments     |
|  a quote your      Track when       re-entry.        via Stripe,  |
|  clients will      it's viewed      Automatic.       PayPal, or   |
|  remember.         and signed.                       bank.        |
|                                                                    |
|  [Illustration]    [Illustration]   [Illustration]  [Illustration]|
|                                                                    |
+------------------------------------------------------------------+
```

#### Specifications

| Element | Style |
|---------|-------|
| Step Numbers | Circular badges, primary color, 48px |
| Icons | Custom illustrations or Lucide icons, 64px |
| Connector Line | Dotted line connecting steps, secondary color |
| Step Titles | H4, bold, 18px |
| Step Descriptions | Body text, muted, 14-16px |

#### Animation

- Steps reveal sequentially on scroll
- Connection line draws as steps reveal
- Subtle bounce on step badges

---

### 2.7 Pricing Section

**Purpose:** Clear pricing communication with competitor comparison

**Headline:** "Pricing That Makes Sense"
**Subheadline:** "Open source and free, or let us host it for less than a coffee a week"

#### Pricing Tiers

```
+------------------------------------------------------------------+
|                                                                    |
|  +----------------+  +----------------+  +----------------+        |
|  |  OPEN SOURCE   |  |  CLOUD         |  |  CLOUD PRO     |        |
|  |                |  |  STARTER       |  |                |        |
|  |   FREE         |  |   $9/mo        |  |   $19/mo       |        |
|  |   forever      |  |   billed yearly|  |   billed yearly|        |
|  |                |  |                |  |                |        |
|  | Self-hosted    |  | We host it     |  | Everything in  |        |
|  | Full features  |  | for you        |  | Starter plus:  |        |
|  |                |  |                |  |                |        |
|  | * All features |  | * All features |  | * Priority     |        |
|  | * Unlimited    |  | * 100 quotes/mo|  |   support      |        |
|  |   usage        |  | * Email support|  | * Unlimited    |        |
|  | * Docker deploy|  | * Auto backups |  |   quotes       |        |
|  | * Community    |  | * SSL included |  | * Custom domain|        |
|  |   support      |  |                |  | * API access   |        |
|  |                |  |                |  |                |        |
|  | [Get Started]  |  | [Start Trial]  |  | [Start Trial]  |        |
|  |    outline     |  |    primary     |  |    primary     |        |
|  +----------------+  +----------------+  +----------------+        |
|                                                                    |
|  +----------------+                                                |
|  |  CLOUD TEAM    |  "Need more? Contact us for enterprise        |
|  |                |   pricing with team features, SSO, and        |
|  |   $39/mo       |   dedicated support."                         |
|  |   per user     |                                                |
|  |                |   [Contact Sales]                              |
|  +----------------+                                                |
|                                                                    |
+------------------------------------------------------------------+
```

#### Pricing Details

| Tier | Price | Billing | Highlight |
|------|-------|---------|-----------|
| Open Source | FREE | N/A | "Most Popular" badge |
| Cloud Starter | $9/mo | Annual ($108/yr) or $12/mo monthly | "Best Value" badge |
| Cloud Pro | $19/mo | Annual ($228/yr) or $24/mo monthly | For growing businesses |
| Cloud Team | $39/mo/user | Annual only | Minimum 3 users |

#### Feature Comparison Table

```
+------------------------------------------------------------------+
|                    | Open Source | Starter | Pro    | Team       |
|--------------------|-------------|---------|--------|------------|
| Visual Builder     |     *       |    *    |   *    |    *       |
| Quote to Invoice   |     *       |    *    |   *    |    *       |
| E-Signatures       |     *       |    *    |   *    |    *       |
| Payment Tracking   |     *       |    *    |   *    |    *       |
| Rate Cards         |     *       |    *    |   *    |    *       |
| Hosting            | Self-hosted | Managed | Managed| Managed    |
| Quotes/month       | Unlimited   |   100   |Unlimited|Unlimited  |
| Custom Domain      |     *       |    -    |   *    |    *       |
| API Access         |     *       |    -    |   *    |    *       |
| Team Members       |     1       |    1    |   3    | Unlimited  |
| Support            | Community   | Email   |Priority| Dedicated  |
+------------------------------------------------------------------+
```

#### Competitor Comparison

**Headline:** "Compare and Save"

| Feature | QuoteCraft | Bloom | Bonsai | HoneyBook |
|---------|------------|-------|--------|-----------|
| Starting Price | FREE | $19/mo | $21/mo | $19/mo |
| Visual Builder | Yes | Yes | Limited | Limited |
| Self-Hosted Option | Yes | No | No | No |
| E-Signatures | Included | Included | Included | Extra |
| Payment Processing | Stripe/PayPal | Built-in | Built-in | Built-in |
| Open Source | Yes | No | No | No |

**Disclaimer:** "Prices compared as of January 2026. Competitor pricing may vary."

---

### 2.8 Testimonials Section

**Purpose:** Build trust through social proof from target personas

**Headline:** "Loved by Freelancers and Agencies"

#### Testimonial Cards

```
+------------------------------------------------------------------+
|                                                                    |
|  +---------------------------+  +---------------------------+      |
|  |                           |  |                           |      |
|  | "Finally, invoices I'm   |  | "Switched from Bloom and  |      |
|  |  proud to send to        |  |  saving $200/year. Same   |      |
|  |  clients. The visual     |  |  features, better         |      |
|  |  builder is incredible." |  |  experience."             |      |
|  |                           |  |                           |      |
|  | [Avatar]                  |  | [Avatar]                  |      |
|  | Sarah Chen               |  | Marcus Rivera             |      |
|  | Freelance Designer       |  | Marketing Consultant      |      |
|  | @sarahchendesigns        |  | @marcusrivera             |      |
|  |                           |  |                           |      |
|  +---------------------------+  +---------------------------+      |
|                                                                    |
|  +---------------------------+  +---------------------------+      |
|  |                           |  |                           |      |
|  | "Self-hosting was a      |  | "My clients actually      |      |
|  |  breeze. Docker compose  |  |  comment on how           |      |
|  |  up and done. Total      |  |  professional my quotes   |      |
|  |  data ownership."        |  |  look now."               |      |
|  |                           |  |                           |      |
|  | [Avatar]                  |  | [Avatar]                  |      |
|  | David Kim               |  | Jennifer Walsh            |      |
|  | Software Developer       |  | Interior Designer         |      |
|  | @devdavidkim             |  | Walsh Interiors           |      |
|  |                           |  |                           |      |
|  +---------------------------+  +---------------------------+      |
|                                                                    |
+------------------------------------------------------------------+
```

#### Testimonial Requirements

| Attribute | Requirement |
|-----------|-------------|
| Quantity | 4-6 testimonials minimum |
| Format | Quote (2-3 sentences), Name, Role, Company/Handle |
| Avatar | Real photos preferred, illustrated avatars as fallback |
| Diversity | Mix of freelancers, agencies, industries |
| Verification | Twitter/LinkedIn link for authenticity (optional) |

#### Persona Coverage

- 1-2 Designers/Creatives
- 1-2 Consultants/Coaches
- 1 Developer (self-hosting angle)
- 1 Agency owner

---

### 2.9 Open Source Section

**Purpose:** Highlight open source benefits and build developer community

**Headline:** "Open Source. Open Future."
**Subheadline:** "Your data. Your server. Your rules."

```
+------------------------------------------------------------------+
|                                                                    |
|  +---------------------------+  +-----------------------------+   |
|  |                           |  |                             |   |
|  |  $ docker compose up     |  |  Why Open Source?          |   |
|  |                           |  |                             |   |
|  |  That's it. QuoteCraft   |  |  * No vendor lock-in       |   |
|  |  running on your server. |  |  * Inspect the code        |   |
|  |                           |  |  * Self-host anywhere      |   |
|  |  [View on GitHub]        |  |  * Community-driven        |   |
|  |  [Read the Docs]         |  |  * Modify and extend       |   |
|  |  [Docker Hub]            |  |                             |   |
|  |                           |  |                             |   |
|  +---------------------------+  +-----------------------------+   |
|                                                                    |
|  +----------------------------------------------------------+     |
|  |                                                          |     |
|  |  [Star on GitHub]   [Join Discord]   [Contribute]       |     |
|  |                                                          |     |
|  +----------------------------------------------------------+     |
|                                                                    |
+------------------------------------------------------------------+
```

#### Content Blocks

**Self-Hosting Benefits:**
- Complete data ownership
- No monthly fees ever
- Run on your infrastructure
- GDPR/compliance friendly
- Air-gapped deployment possible

**Community Benefits:**
- Transparent development
- Feature requests welcomed
- Bug bounty program
- Contributor recognition
- Regular release cycle

#### CTAs

| CTA | Link | Icon |
|-----|------|------|
| Star on GitHub | github.com/quotecraft/quotecraft | GitHub icon |
| Join Discord | discord.gg/quotecraft | Discord icon |
| Contribute | Contributing guide | Code icon |
| Docker Hub | hub.docker.com/r/quotecraft | Docker icon |

---

### 2.10 FAQ Section

**Purpose:** Address common objections and questions

**Headline:** "Questions? We've Got Answers."

#### FAQ Items

**Q1: Is QuoteCraft really free?**
> Yes! The self-hosted version is 100% free and includes all features. You only pay if you want us to host it for you with our cloud plans starting at $9/month.

**Q2: What's the difference between self-hosted and cloud?**
> Self-hosted means you run QuoteCraft on your own server using Docker. You're responsible for hosting, backups, and updates. Cloud means we handle all of that for you - just sign up and start creating quotes.

**Q3: How does QuoteCraft compare to Bloom or Bonsai?**
> QuoteCraft offers the same visual builder experience but with two key differences: it's open source (so you can self-host for free) and our cloud plans are 50% cheaper. We focus specifically on quotes and invoices rather than being an all-in-one platform.

**Q4: Is my data safe?**
> For self-hosted: Your data never leaves your server. For cloud: We use industry-standard encryption, regular backups, and you can export your data anytime. We never sell or share your data.

**Q5: Can I migrate from another tool?**
> Yes! We offer import tools for common formats including CSV, and specific importers for Bloom, Bonsai, and Wave. Your existing clients and invoice history can be brought over.

**Q6: Do you take a percentage of payments?**
> No. We never touch your money. You connect your own Stripe or PayPal account and receive payments directly. We just help you create beautiful invoices.

**Q7: What payment processors are supported?**
> We integrate with Stripe, PayPal, and manual bank transfers. More payment processors are on our roadmap based on community requests.

**Q8: Can I use my own domain?**
> Self-hosted: Absolutely, it's your server. Cloud Pro and Team: Yes, you can connect your custom domain. Cloud Starter: Uses a quotecraft.app subdomain.

**Q9: Is there a mobile app?**
> The web app is fully responsive and works great on mobile browsers. Native iOS and Android apps are on our roadmap for future releases.

**Q10: How do I get support?**
> Self-hosted: Community support via GitHub discussions and Discord. Cloud: Email support for Starter, priority support for Pro, dedicated support for Team plans.

#### FAQ UX Pattern

- Accordion style (one open at a time)
- Expand/collapse animation
- Search/filter for longer FAQ lists
- "Still have questions? Contact us" link at bottom

---

### 2.11 Final CTA Section

**Purpose:** Strong closing conversion opportunity

**Headline:** "Ready to Create Beautiful Invoices?"
**Subheadline:** "Join thousands of freelancers who've upgraded their invoicing game."

```
+------------------------------------------------------------------+
|                                                                    |
|   +------------------------------------------------------------+  |
|   |                                                            |  |
|   |  Ready to Create Beautiful Invoices?                       |  |
|   |                                                            |  |
|   |  Join thousands of freelancers who've upgraded their       |  |
|   |  invoicing game.                                           |  |
|   |                                                            |  |
|   |  +--------------------------------------------------+      |  |
|   |  | [email@example.com              ] [Get Started]  |      |  |
|   |  +--------------------------------------------------+      |  |
|   |                                                            |  |
|   |  or                                                        |  |
|   |                                                            |  |
|   |  [View on GitHub]  [Read the Docs]                        |  |
|   |                                                            |  |
|   |  No credit card required. Free forever for self-hosted.   |  |
|   |                                                            |  |
|   +------------------------------------------------------------+  |
|                                                                    |
+------------------------------------------------------------------+
```

#### Elements

| Element | Specification |
|---------|---------------|
| Background | Gradient using primary colors or subtle pattern |
| Headline | H2, white or contrasting color, centered |
| Email Input | Large input field, placeholder "Enter your email" |
| CTA Button | "Get Started Free" - Large, high contrast |
| Secondary Links | GitHub + Docs links for developers |
| Trust Indicator | "No credit card required" |

---

### 2.12 Footer

**Purpose:** Navigation, legal, and brand reinforcement

```
+------------------------------------------------------------------+
|                                                                    |
|  [Logo]                                                            |
|                                                                    |
|  The open-source quote and invoice                                 |
|  builder for freelancers and small                                 |
|  businesses.                                                       |
|                                                                    |
|  Product          Resources        Company        Legal            |
|  -------          ---------        -------        -----            |
|  Features         Documentation    About          Privacy Policy   |
|  Pricing          API Reference    Blog           Terms of Service |
|  Changelog        GitHub           Careers        Cookie Policy    |
|  Roadmap          Discord          Contact                         |
|                   Status Page                                      |
|                                                                    |
|  [Twitter] [GitHub] [Discord] [LinkedIn]                          |
|                                                                    |
|  -----------------------------------------------------------------|
|                                                                    |
|  (c) 2026 QuoteCraft. Open source under MIT License.              |
|  Made with [heart] by independent developers.                      |
|                                                                    |
+------------------------------------------------------------------+
```

#### Footer Columns

**Product:**
- Features (anchor to features section)
- Pricing (anchor to pricing section)
- Changelog (/changelog)
- Roadmap (GitHub projects or /roadmap)

**Resources:**
- Documentation (/docs)
- API Reference (/docs/api)
- GitHub (external)
- Discord (external)
- Status Page (/status or external)

**Company:**
- About (/about)
- Blog (/blog)
- Careers (/careers)
- Contact (/contact)

**Legal:**
- Privacy Policy (/privacy)
- Terms of Service (/terms)
- Cookie Policy (/cookies)

#### Social Links

| Platform | Priority | Icon |
|----------|----------|------|
| GitHub | High | GitHub icon |
| Twitter/X | High | X icon |
| Discord | High | Discord icon |
| LinkedIn | Medium | LinkedIn icon |
| YouTube | Low (future) | YouTube icon |

---

## 3. Content Strategy

### 3.1 Voice & Tone

#### Brand Voice Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| **Confident** | We know our product is good | "Beautiful invoices" not "hopefully nice invoices" |
| **Approachable** | Friendly, not corporate | "Let's get you paid" not "Facilitate payment collection" |
| **Direct** | No fluff, clear value | "$9/month" not "Starting at competitive pricing" |
| **Empathetic** | We understand the pain | "Chasing payments is awkward" |
| **Honest** | Transparent about capabilities | "We focus on quotes and invoices" not "all-in-one solution" |

#### Writing Guidelines

**Do:**
- Use "you" and "your" (customer-centric)
- Use active voice
- Be specific about features and pricing
- Acknowledge competitor strengths honestly
- Use numbers and specifics

**Don't:**
- Use jargon or buzzwords ("synergy", "leverage", "scalable")
- Overpromise or exaggerate
- Disparage competitors directly
- Use passive voice
- Be vague about pricing

### 3.2 Messaging Hierarchy

```
Level 1 (Headline):
"Beautiful Invoices. No Expensive Subscription."

Level 2 (Subheadline):
"The open-source alternative to Bloom and Bonsai"

Level 3 (Key Benefits):
- Visual builder (not spreadsheet)
- Open source / self-hosted
- One-click quote-to-invoice
- Free or $9/month

Level 4 (Feature Details):
- E-signatures
- Payment scheduling
- Rate cards
- Templates
- etc.
```

### 3.3 Competitor Mention Policy

**Approach:** Respectful comparison, not disparagement

**Do:**
- Mention competitors by name in comparison tables
- Acknowledge their strengths ("Bloom has a great visual builder")
- Compare factual metrics (pricing, features)
- Focus on our differentiation (open source, price)

**Don't:**
- Call competitors "bad" or "overpriced"
- Make unverifiable claims
- Use competitor trademarks improperly
- Imply competitors are dishonest

**Example Good:**
> "QuoteCraft offers a similar visual builder experience to Bloom, but with an open source option and cloud plans starting at $9/month."

**Example Bad:**
> "Unlike Bloom's ripoff pricing..." (Never use)

---

## 4. Design System Integration

### 4.1 Color Palette (From UI/UX Spec)

```css
/* Primary - Deep Blue */
--color-primary-500: #3B82F6;
--color-primary-600: #2563EB;
--color-primary-700: #1D4ED8;

/* Secondary - Violet */
--color-secondary-500: #8B5CF6;
--color-secondary-600: #7C3AED;

/* Accent - Amber */
--color-accent-500: #F59E0B;

/* Neutrals */
--color-neutral-50: #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-600: #475569;
--color-neutral-900: #0F172A;

/* Semantic */
--color-success-500: #22C55E;
--color-warning-500: #F59E0B;
--color-error-500: #EF4444;
```

### 4.2 Typography

```css
/* Font Family */
--font-family-sans: 'Inter', -apple-system, sans-serif;

/* Display Sizes (Landing Page) */
--text-display-xl: 4rem;    /* 64px - Hero headline desktop */
--text-display-lg: 3rem;    /* 48px - Hero headline mobile */
--text-display-md: 2.5rem;  /* 40px - Section headlines */
--text-display-sm: 2rem;    /* 32px - Sub-section headlines */

/* Body Sizes */
--text-xl: 1.25rem;   /* 20px - Large body / subheadlines */
--text-lg: 1.125rem;  /* 18px - Feature descriptions */
--text-base: 1rem;    /* 16px - Body text */
--text-sm: 0.875rem;  /* 14px - Small text / labels */

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 4.3 Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### 4.4 Section Spacing

| Section Type | Padding (Desktop) | Padding (Mobile) |
|--------------|-------------------|------------------|
| Hero | 96px top, 64px bottom | 64px top, 48px bottom |
| Standard Section | 80px vertical | 48px vertical |
| Compact Section | 48px vertical | 32px vertical |
| CTA Section | 64px vertical | 48px vertical |

### 4.5 Container Widths

```css
--container-sm: 640px;   /* Narrow content */
--container-md: 768px;   /* Medium content */
--container-lg: 1024px;  /* Default content */
--container-xl: 1280px;  /* Wide content */
--container-2xl: 1536px; /* Full-width sections */
```

---

## 5. Component Specifications

### 5.1 Buttons

#### Primary CTA Button

```tsx
// Shadcn Button with custom styling
<Button
  size="lg"
  className="px-8 py-4 text-lg font-semibold"
>
  Get Started Free
</Button>
```

**Specifications:**
- Background: Primary-600 (#2563EB)
- Text: White
- Padding: 16px 32px
- Border Radius: 8px
- Font Size: 18px
- Font Weight: 600
- Hover: Primary-700, slight scale (1.02)
- Active: Primary-800
- Shadow: Subtle shadow on hover

#### Secondary/Outline Button

```tsx
<Button
  variant="outline"
  size="lg"
  className="px-8 py-4 text-lg font-semibold"
>
  <GitHubIcon className="mr-2 h-5 w-5" />
  View on GitHub
</Button>
```

**Specifications:**
- Background: Transparent
- Border: 2px solid Primary-600
- Text: Primary-600
- Hover: Primary-50 background
- Same padding and sizing as primary

### 5.2 Cards

#### Feature Card

```tsx
<Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
  <div className="mb-4">
    <IconWrapper>
      <FeatureIcon />
    </IconWrapper>
  </div>
  <h3 className="text-xl font-semibold mb-2">{title}</h3>
  <p className="text-muted-foreground">{description}</p>
</Card>
```

#### Pricing Card

```tsx
<Card className={cn(
  "p-8 relative",
  isPopular && "border-2 border-primary shadow-xl"
)}>
  {isPopular && (
    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
      Most Popular
    </Badge>
  )}
  <div className="text-center mb-6">
    <h3 className="text-2xl font-bold">{tierName}</h3>
    <div className="mt-4">
      <span className="text-4xl font-bold">{price}</span>
      <span className="text-muted-foreground">/month</span>
    </div>
  </div>
  <ul className="space-y-3 mb-8">
    {features.map(f => (
      <li className="flex items-center gap-2">
        <CheckIcon className="text-green-500" />
        {f}
      </li>
    ))}
  </ul>
  <Button className="w-full">{cta}</Button>
</Card>
```

#### Testimonial Card

```tsx
<Card className="p-6 bg-muted/30">
  <blockquote className="text-lg mb-4">
    "{quote}"
  </blockquote>
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src={avatar} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
    <div>
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-muted-foreground">{role}</p>
    </div>
  </div>
</Card>
```

### 5.3 Navigation

```tsx
<header className={cn(
  "fixed top-0 w-full z-50 transition-all duration-300",
  isScrolled
    ? "bg-white/80 backdrop-blur-md shadow-sm"
    : "bg-transparent"
)}>
  <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
    <Logo />
    <NavLinks />
    <CTAButtons />
  </nav>
</header>
```

### 5.4 FAQ Accordion

```tsx
<Accordion type="single" collapsible className="w-full">
  {faqs.map((faq, i) => (
    <AccordionItem value={`item-${i}`} key={i}>
      <AccordionTrigger className="text-left text-lg font-medium">
        {faq.question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        {faq.answer}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

### 5.5 GitHub Stars Badge

```tsx
// Real-time GitHub stars fetched via API
<a
  href="https://github.com/quotecraft/quotecraft"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
>
  <GitHubIcon className="h-4 w-4" />
  <span className="font-medium">{formatNumber(stars)}</span>
  <StarIcon className="h-4 w-4 text-amber-500" />
</a>
```

---

## 6. SEO Requirements

### 6.1 Meta Tags

```html
<!-- Primary Meta Tags -->
<title>QuoteCraft - Beautiful Invoices. No Expensive Subscription.</title>
<meta name="title" content="QuoteCraft - Beautiful Invoices. No Expensive Subscription.">
<meta name="description" content="The open-source alternative to Bloom and Bonsai. Create stunning quotes, get them signed, convert to invoices with one click. Self-hosted free or cloud from $9/mo.">
<meta name="keywords" content="invoice software, quote builder, open source invoicing, freelancer invoices, invoice generator, quote to invoice, e-signature invoices, self-hosted invoicing">
<meta name="robots" content="index, follow">
<meta name="language" content="English">
<meta name="author" content="QuoteCraft">

<!-- Canonical -->
<link rel="canonical" href="https://quotecraft.app/">
```

### 6.2 Open Graph Tags

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://quotecraft.app/">
<meta property="og:title" content="QuoteCraft - Beautiful Invoices. No Expensive Subscription.">
<meta property="og:description" content="The open-source alternative to Bloom and Bonsai. Visual quote builder, e-signatures, one-click invoice conversion. Free self-hosted or $9/mo cloud.">
<meta property="og:image" content="https://quotecraft.app/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="QuoteCraft">
```

### 6.3 Twitter Card Tags

```html
<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://quotecraft.app/">
<meta property="twitter:title" content="QuoteCraft - Beautiful Invoices. No Expensive Subscription.">
<meta property="twitter:description" content="The open-source alternative to Bloom and Bonsai. Create stunning quotes and invoices for free.">
<meta property="twitter:image" content="https://quotecraft.app/twitter-card.png">
<meta property="twitter:creator" content="@quotecraft">
```

### 6.4 JSON-LD Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "QuoteCraft",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, Docker",
  "description": "Open-source visual quote and invoice builder for freelancers and small businesses",
  "url": "https://quotecraft.app",
  "downloadUrl": "https://github.com/quotecraft/quotecraft",
  "offers": [
    {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "name": "Open Source",
      "description": "Self-hosted, all features included"
    },
    {
      "@type": "Offer",
      "price": "9",
      "priceCurrency": "USD",
      "name": "Cloud Starter",
      "description": "Managed hosting, email support",
      "billingIncrement": "P1M"
    },
    {
      "@type": "Offer",
      "price": "19",
      "priceCurrency": "USD",
      "name": "Cloud Pro",
      "description": "Priority support, unlimited quotes",
      "billingIncrement": "P1M"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  },
  "author": {
    "@type": "Organization",
    "name": "QuoteCraft",
    "url": "https://quotecraft.app"
  }
}
```

### 6.5 Additional Structured Data - FAQ

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is QuoteCraft really free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! The self-hosted version is 100% free and includes all features. You only pay if you want us to host it for you with our cloud plans starting at $9/month."
      }
    },
    {
      "@type": "Question",
      "name": "How does QuoteCraft compare to Bloom or Bonsai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "QuoteCraft offers the same visual builder experience but with two key differences: it's open source (so you can self-host for free) and our cloud plans are 50% cheaper."
      }
    }
  ]
}
```

### 6.6 Target Keywords

**Primary Keywords:**
| Keyword | Search Volume | Difficulty | Priority |
|---------|---------------|------------|----------|
| open source invoice software | 500/mo | Medium | P0 |
| free invoice generator | 12,000/mo | High | P0 |
| invoice builder | 3,000/mo | Medium | P0 |
| quote to invoice software | 200/mo | Low | P0 |
| bloom alternative | 300/mo | Low | P0 |

**Secondary Keywords:**
| Keyword | Search Volume | Difficulty | Priority |
|---------|---------------|------------|----------|
| freelancer invoice software | 1,000/mo | Medium | P1 |
| self-hosted invoicing | 150/mo | Low | P1 |
| visual invoice builder | 100/mo | Low | P1 |
| bonsai alternative | 200/mo | Low | P1 |
| invoice software for contractors | 500/mo | Medium | P1 |

**Long-tail Keywords:**
- "how to create professional invoices for free"
- "best free invoice software for freelancers"
- "open source alternative to bloom invoicing"
- "self hosted invoice software docker"
- "quote to invoice conversion tool"

### 6.7 Technical SEO

```html
<!-- Performance hints -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://api.github.com">

<!-- Favicons -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#2563EB">
```

### 6.8 Sitemap Requirements

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://quotecraft.app/</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://quotecraft.app/pricing</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://quotecraft.app/docs</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 7. Performance Requirements

### 7.1 Core Web Vitals Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| LCP (Largest Contentful Paint) | < 2.5s | 4.0s |
| FID (First Input Delay) | < 100ms | 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.25 |
| TTFB (Time to First Byte) | < 600ms | 1800ms |
| FCP (First Contentful Paint) | < 1.8s | 3.0s |

### 7.2 Page Load Budget

| Resource Type | Budget | Strategy |
|---------------|--------|----------|
| HTML | < 50KB | Gzip compression |
| CSS | < 100KB | Critical CSS inline, rest deferred |
| JavaScript | < 200KB | Code splitting, lazy loading |
| Images | < 500KB | WebP/AVIF, lazy loading, srcset |
| Fonts | < 100KB | Subset, preload critical weights |
| **Total Initial Load** | **< 1MB** | |

### 7.3 Image Optimization

**Format Priority:**
1. AVIF (if supported)
2. WebP (fallback)
3. PNG/JPEG (legacy fallback)

**Responsive Images:**
```html
<picture>
  <source
    srcset="hero-800.avif 800w, hero-1200.avif 1200w, hero-1600.avif 1600w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
    type="image/avif"
  >
  <source
    srcset="hero-800.webp 800w, hero-1200.webp 1200w, hero-1600.webp 1600w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
    type="image/webp"
  >
  <img
    src="hero-1200.jpg"
    alt="QuoteCraft visual quote builder"
    loading="eager"
    width="1200"
    height="800"
  >
</picture>
```

**Image Specifications:**
| Image | Dimensions | Max Size | Loading |
|-------|------------|----------|---------|
| Hero image | 1200-1600px wide | 200KB | Eager (above fold) |
| Feature screenshots | 800px wide | 100KB | Lazy |
| Testimonial avatars | 80x80px | 10KB | Lazy |
| Logo | 140x32px | 5KB | Eager |
| Icons | SVG | 2KB each | Inline |

### 7.4 Critical Rendering Path

**Above-the-fold content (prioritized):**
1. Navigation header
2. Hero headline and CTAs
3. Hero visual (optimized)
4. Social proof bar

**Below-the-fold content (lazy loaded):**
1. Problem/Pain section
2. Features section (images lazy)
3. How it works
4. Pricing
5. Testimonials
6. FAQ
7. Footer

### 7.5 Caching Strategy

```
# Cache-Control headers

# Static assets (images, fonts, CSS, JS)
Cache-Control: public, max-age=31536000, immutable

# HTML
Cache-Control: public, max-age=0, must-revalidate

# API responses (GitHub stars, etc.)
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

### 7.6 Performance Monitoring

**Tools:**
- Lighthouse (CI integration)
- Web Vitals (real user monitoring)
- Vercel Analytics (if deployed on Vercel)

**Alerts:**
- LCP > 4s
- CLS > 0.25
- FID > 300ms

---

## 8. Conversion Optimization

### 8.1 CTA Placement Strategy

| Location | CTA | Type | Priority |
|----------|-----|------|----------|
| Header (always visible) | Get Started | Primary button | P0 |
| Hero section | Get Started Free | Primary large | P0 |
| Hero section | View on GitHub | Secondary | P1 |
| After features | Try It Free | Primary | P1 |
| Pricing section | Per-tier CTAs | Primary | P0 |
| After testimonials | Get Started Free | Primary | P1 |
| Final CTA section | Email + Get Started | Primary | P0 |
| Footer | Sign Up | Text link | P2 |

### 8.2 Conversion Goals

**Primary Conversion:**
- Cloud signup (email + create account)
- Target: 3-5% of visitors

**Secondary Conversions:**
- GitHub star
- GitHub visit
- Documentation visit
- Email newsletter signup

### 8.3 Trust Signals

| Signal | Location | Implementation |
|--------|----------|----------------|
| GitHub stars | Header, Hero | Live API fetch |
| User count | Hero | "Trusted by X freelancers" |
| Testimonials | Dedicated section | 4-6 real quotes |
| Open source badge | Multiple | MIT license mention |
| "No credit card" | Pricing, CTAs | Near signup buttons |
| Security indicators | Footer, FAQ | Encryption, data policy |

### 8.4 Friction Reduction

**Form Optimization:**
- Email-only signup (no password on landing page)
- Social signup options (GitHub, Google)
- No captcha (use honeypot)
- Progress indicators if multi-step

**Micro-copy:**
- "No credit card required"
- "Free forever for self-hosted"
- "Cancel anytime"
- "Your data stays yours"

### 8.5 A/B Testing Plan

**Phase 1 (Launch):**
| Test | Variants | Metric |
|------|----------|--------|
| Hero headline | 3 variants | Click-through rate |
| Primary CTA text | "Get Started Free" vs "Start Free Trial" | Conversion rate |
| Pricing layout | 3-column vs 4-column | Plan selection |

**Phase 2 (Month 2+):**
| Test | Variants | Metric |
|------|----------|--------|
| Hero visual | Screenshot vs Animation vs Interactive | Engagement time |
| Social proof placement | Above fold vs Below fold | Conversion rate |
| FAQ presence | With vs Without | Bounce rate |

### 8.6 Exit Intent Strategy

**Trigger:** Mouse moves to close tab/window

**Popup Content:**
```
+------------------------------------------+
|                                          |
|  Wait! Don't miss out.                   |
|                                          |
|  Get our free guide:                     |
|  "10 Ways to Get Paid Faster"            |
|                                          |
|  [email@example.com      ] [Get Guide]   |
|                                          |
|  (No spam. Unsubscribe anytime.)         |
|                                          |
+------------------------------------------+
```

**Rules:**
- Only show once per session
- Don't show to returning visitors
- Don't show on mobile
- Respect closed state for 7 days

---

## 9. Analytics & Tracking

### 9.1 Analytics Implementation

**Primary:** Google Analytics 4 (GA4)
**Secondary:** Plausible Analytics (privacy-focused alternative)
**Heatmaps:** Hotjar or Microsoft Clarity

### 9.2 Event Tracking Schema

```javascript
// Page view (automatic)
gtag('event', 'page_view', {
  page_title: 'Landing Page',
  page_location: 'https://quotecraft.app/'
});

// CTA clicks
gtag('event', 'click', {
  event_category: 'CTA',
  event_label: 'hero_get_started',
  value: 1
});

// Scroll depth
gtag('event', 'scroll', {
  event_category: 'Engagement',
  event_label: '50_percent',
  value: 50
});

// Section views (intersection observer)
gtag('event', 'view_section', {
  event_category: 'Engagement',
  event_label: 'pricing_section'
});

// External link clicks
gtag('event', 'click', {
  event_category: 'External Link',
  event_label: 'github_repo',
  transport_type: 'beacon'
});

// Form interactions
gtag('event', 'form_start', {
  event_category: 'Signup',
  event_label: 'email_form'
});

gtag('event', 'sign_up', {
  method: 'email'
});
```

### 9.3 Conversion Funnels

**Funnel 1: Landing to Signup**
1. Landing page view
2. Scroll past hero
3. Pricing section view
4. CTA click
5. Signup form start
6. Signup complete

**Funnel 2: Landing to GitHub**
1. Landing page view
2. GitHub CTA click
3. GitHub repo view (tracked via referrer)
4. GitHub star (tracked via API)

### 9.4 Key Metrics Dashboard

| Metric | Source | Target |
|--------|--------|--------|
| Unique visitors | GA4 | Track growth |
| Bounce rate | GA4 | < 60% |
| Avg. session duration | GA4 | > 2 minutes |
| Pages per session | GA4 | > 1.5 |
| Signup conversion rate | GA4 | 3-5% |
| GitHub click rate | GA4 | 5-10% |
| Scroll depth (50%) | GA4 | > 60% |
| Mobile vs Desktop | GA4 | Track ratio |

### 9.5 UTM Parameter Standards

```
https://quotecraft.app/?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN

Examples:
?utm_source=twitter&utm_medium=social&utm_campaign=launch
?utm_source=producthunt&utm_medium=referral&utm_campaign=launch_day
?utm_source=google&utm_medium=cpc&utm_campaign=brand_search
?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_digest
```

### 9.6 Privacy Compliance

**GDPR Requirements:**
- Cookie consent banner (required for EU visitors)
- Anonymize IP addresses in GA4
- Provide opt-out mechanism
- Link to privacy policy in consent banner

**Implementation:**
```javascript
// Load analytics only after consent
if (hasConsent('analytics')) {
  loadGoogleAnalytics();
}

// Respect Do Not Track
if (navigator.doNotTrack === '1') {
  // Don't load analytics
}
```

---

## 10. Responsive Design

### 10.1 Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets, large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

### 10.2 Layout Grid

**Desktop (>= 1024px):**
- 12-column grid
- Max container width: 1280px
- Gutter: 24px
- Margin: 48px

**Tablet (768px - 1023px):**
- 8-column grid
- Full-width container
- Gutter: 20px
- Margin: 32px

**Mobile (< 768px):**
- 4-column grid
- Full-width container
- Gutter: 16px
- Margin: 16px

### 10.3 Component Responsive Behavior

#### Navigation

| Breakpoint | Behavior |
|------------|----------|
| Desktop (>= 1024px) | Full horizontal nav, all links visible |
| Tablet (768-1023px) | Horizontal nav, some links in dropdown |
| Mobile (< 768px) | Hamburger menu, slide-out drawer |

#### Hero Section

| Breakpoint | Behavior |
|------------|----------|
| Desktop | Side-by-side text/image, 64px headline |
| Tablet | Stacked, centered, 48px headline |
| Mobile | Stacked, centered, 32px headline |

#### Features Section

| Breakpoint | Behavior |
|------------|----------|
| Desktop | Alternating image/text rows |
| Tablet | Stacked, centered |
| Mobile | Stacked, full-width images |

#### Pricing Cards

| Breakpoint | Behavior |
|------------|----------|
| Desktop | 3-4 cards in row |
| Tablet | 2 cards per row |
| Mobile | Single card, vertical scroll |

#### Testimonials

| Breakpoint | Behavior |
|------------|----------|
| Desktop | 2x2 grid |
| Tablet | 2-column grid |
| Mobile | Horizontal carousel |

### 10.4 Touch Targets

**Minimum sizes:**
- Buttons: 44x44px minimum
- Links: 44x44px touch area (can visually be smaller)
- Form inputs: 48px height
- Spacing between targets: 8px minimum

### 10.5 Mobile-Specific Considerations

**Navigation:**
- Sticky CTA button at bottom on scroll
- Easy thumb-zone access for primary actions

**Forms:**
- Single-column layout
- Large input fields
- Native keyboard types (email keyboard for email input)
- Auto-zoom prevention (16px+ font size)

**Images:**
- Full-width on mobile
- Aspect ratio maintained
- Touch-to-zoom disabled

**Performance:**
- Smaller image variants for mobile
- Reduce animation complexity
- Consider removing background videos

---

## 11. Accessibility Requirements

### 11.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | 4.5:1 for normal text, 3:1 for large text |
| Focus indicators | Visible focus ring on all interactive elements |
| Keyboard navigation | Full functionality without mouse |
| Screen reader support | Proper ARIA labels and semantic HTML |
| Text scaling | Content readable at 200% zoom |
| Motion preferences | Respect prefers-reduced-motion |

### 11.2 Semantic HTML Structure

```html
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    ...
  </nav>
</header>

<main role="main">
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">Beautiful Invoices...</h1>
  </section>

  <section aria-labelledby="features-heading">
    <h2 id="features-heading">Features</h2>
  </section>

  <!-- etc. -->
</main>

<footer role="contentinfo">
  ...
</footer>
```

### 11.3 Focus Management

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Remove default outline only when focus-visible is supported */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 11.4 ARIA Labels

```html
<!-- Navigation -->
<nav aria-label="Main navigation">

<!-- Mobile menu button -->
<button aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">

<!-- External links -->
<a href="https://github.com/..." target="_blank" rel="noopener noreferrer">
  View on GitHub
  <span class="sr-only">(opens in new tab)</span>
</a>

<!-- Pricing cards -->
<div role="list" aria-label="Pricing plans">
  <article role="listitem" aria-labelledby="plan-starter">

<!-- FAQ accordion -->
<div role="region" aria-labelledby="faq-heading">
  <h2 id="faq-heading">Frequently Asked Questions</h2>
```

### 11.5 Skip Links

```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:p-4">
  Skip to main content
</a>
```

### 11.6 Motion and Animation

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 11.7 Color Accessibility

**Don't rely on color alone:**
- Error states: Red color + error icon + error text
- Success states: Green color + checkmark icon + success text
- Links: Blue color + underline (on hover minimum)

**Color contrast ratios (minimum):**
| Element | Required Ratio |
|---------|----------------|
| Body text | 4.5:1 |
| Large text (>18px bold or >24px) | 3:1 |
| UI components | 3:1 |
| Focus indicators | 3:1 |

### 11.8 Form Accessibility

```html
<form>
  <div class="form-group">
    <label for="email" class="form-label">
      Email address
      <span class="required" aria-hidden="true">*</span>
    </label>
    <input
      type="email"
      id="email"
      name="email"
      required
      aria-required="true"
      aria-describedby="email-hint email-error"
      autocomplete="email"
    >
    <p id="email-hint" class="form-hint">
      We'll never share your email.
    </p>
    <p id="email-error" class="form-error" role="alert" aria-live="polite">
      <!-- Error message injected here -->
    </p>
  </div>
</form>
```

---

## 12. Content Guidelines

### 12.1 Headline Writing

**Characteristics:**
- Clear and specific (not clever or vague)
- Benefit-focused
- 5-10 words ideal
- Action-oriented when appropriate

**Examples:**
| Good | Bad |
|------|-----|
| "Beautiful Invoices. No Expensive Subscription." | "The Future of Invoicing is Here" |
| "Convert Quotes to Invoices in One Click" | "Seamless Workflow Integration" |
| "Self-Hosted: Your Data, Your Server" | "Take Control of Your Business" |

### 12.2 Body Copy

**Characteristics:**
- Short paragraphs (2-3 sentences max)
- Bullet points for features
- Active voice
- Second person ("you", "your")
- Specific numbers over vague claims

**Examples:**
| Good | Bad |
|------|-----|
| "Create your first quote in under 5 minutes." | "Quickly create quotes." |
| "Saves you $200/year compared to Bloom." | "More affordable than competitors." |
| "Used by 5,000+ freelancers worldwide." | "Trusted by many users." |

### 12.3 CTA Button Copy

**Primary CTAs:**
- "Get Started Free"
- "Start Free Trial"
- "Create Free Account"

**Secondary CTAs:**
- "View on GitHub"
- "Read Documentation"
- "See Pricing"
- "Learn More"

**Avoid:**
- "Submit"
- "Click Here"
- "Sign Up" (alone, without context)

### 12.4 Error Messages

```
Email field empty:
"Please enter your email address"

Invalid email:
"Please enter a valid email address (e.g., you@example.com)"

Server error:
"Something went wrong. Please try again, or contact support@quotecraft.app"

Success:
"Welcome to QuoteCraft! Check your email to confirm your account."
```

### 12.5 Legal Copy

**Footer disclaimer:**
"QuoteCraft is open source software under the MIT License. Cloud services are provided by [Company Name]. Prices shown are in USD and exclude applicable taxes."

**Privacy link text:**
"We respect your privacy. Read our Privacy Policy."

**Cookie consent:**
"We use cookies to improve your experience. Accept All | Manage Preferences | Reject"

---

## 13. Technical Implementation

### 13.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| UI Library | Shadcn UI |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Analytics | GA4 + Plausible |
| Hosting | Vercel (recommended) |

### 13.2 Project Structure

```
app/
├── (marketing)/
│   ├── page.tsx              # Landing page
│   ├── pricing/
│   │   └── page.tsx          # Dedicated pricing page (optional)
│   └── layout.tsx            # Marketing layout
├── components/
│   └── landing/
│       ├── hero.tsx
│       ├── problem-section.tsx
│       ├── features-section.tsx
│       ├── how-it-works.tsx
│       ├── pricing-section.tsx
│       ├── testimonials.tsx
│       ├── open-source-section.tsx
│       ├── faq-section.tsx
│       ├── final-cta.tsx
│       ├── marketing-header.tsx
│       └── marketing-footer.tsx
├── lib/
│   ├── github.ts             # GitHub API integration
│   └── analytics.ts          # Analytics helpers
└── public/
    ├── images/
    │   └── landing/
    └── fonts/
```

### 13.3 Key Implementation Details

#### GitHub Stars Integration

```typescript
// lib/github.ts
const GITHUB_REPO = 'quotecraft/quotecraft';
const CACHE_TTL = 3600; // 1 hour

export async function getGitHubStars(): Promise<number> {
  const cached = await redis.get(`github:stars:${GITHUB_REPO}`);
  if (cached) return Number(cached);

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      next: { revalidate: CACHE_TTL }
    }
  );

  const data = await response.json();
  const stars = data.stargazers_count;

  await redis.set(`github:stars:${GITHUB_REPO}`, stars, 'EX', CACHE_TTL);
  return stars;
}
```

#### Scroll-Based Navigation

```typescript
// components/landing/marketing-header.tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function MarketingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 w-full z-50 transition-all duration-300',
      isScrolled
        ? 'bg-white/80 backdrop-blur-md shadow-sm'
        : 'bg-transparent'
    )}>
      {/* ... */}
    </header>
  );
}
```

#### Section Animation (Scroll-triggered)

```typescript
// components/landing/animated-section.tsx
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
```

### 13.4 Performance Implementation

#### Critical CSS Inlining

```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
};
```

#### Image Optimization

```typescript
// Using Next.js Image component
import Image from 'next/image';

<Image
  src="/images/landing/hero.png"
  alt="QuoteCraft visual quote builder"
  width={1200}
  height={800}
  priority // For above-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### Font Loading

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### 13.5 Analytics Implementation

```typescript
// lib/analytics.ts
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Usage in component
import { trackEvent } from '@/lib/analytics';

function HeroCTA() {
  return (
    <Button
      onClick={() => {
        trackEvent('click', 'CTA', 'hero_get_started');
        router.push('/signup');
      }}
    >
      Get Started Free
    </Button>
  );
}
```

---

## 14. Launch Checklist

### 14.1 Pre-Launch Checklist

#### Content
- [ ] All copy written and reviewed
- [ ] Testimonials collected and verified
- [ ] Images optimized and alt text added
- [ ] Legal pages complete (Privacy, Terms)
- [ ] FAQ content finalized

#### Design
- [ ] All sections match specifications
- [ ] Responsive design tested on all breakpoints
- [ ] Dark mode support (if applicable)
- [ ] Animation performance verified
- [ ] Color contrast passes WCAG AA

#### SEO
- [ ] Meta tags implemented
- [ ] Open Graph images created (1200x630)
- [ ] JSON-LD structured data added
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Canonical URLs set

#### Performance
- [ ] Lighthouse score > 90 (all categories)
- [ ] Core Web Vitals passing
- [ ] Images lazy loaded (below fold)
- [ ] Fonts optimized
- [ ] JavaScript bundle analyzed

#### Analytics
- [ ] GA4 installed and events configured
- [ ] Conversion goals set up
- [ ] UTM parameters documented
- [ ] Cookie consent implemented

#### Accessibility
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (VoiceOver/NVDA)
- [ ] Color contrast verified
- [ ] Focus indicators visible
- [ ] Skip links functional

#### Technical
- [ ] Forms validated and tested
- [ ] Error states handled
- [ ] 404 page created
- [ ] SSL certificate active
- [ ] CDN configured
- [ ] Caching headers set

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Android Chrome

### 14.2 Launch Day Checklist

- [ ] DNS propagation verified
- [ ] SSL working correctly
- [ ] All forms submitting
- [ ] Analytics receiving data
- [ ] Social sharing working
- [ ] Email sequences triggered
- [ ] Team notified
- [ ] Social media posts scheduled

### 14.3 Post-Launch Checklist

#### Week 1
- [ ] Monitor error logs
- [ ] Review analytics data
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Index status in Google Search Console

#### Month 1
- [ ] A/B tests initiated
- [ ] Conversion funnel analyzed
- [ ] Heatmap data reviewed
- [ ] Content updates based on feedback
- [ ] SEO performance reviewed

---

## Appendix A: Asset Requirements

### Images

| Asset | Dimensions | Format | Priority |
|-------|------------|--------|----------|
| Logo (full) | 280x64px | SVG | P0 |
| Logo (icon) | 64x64px | SVG | P0 |
| Hero image | 1600x1200px | WebP/AVIF | P0 |
| Feature screenshots (6) | 800x600px | WebP | P0 |
| Testimonial avatars (6) | 160x160px | WebP | P1 |
| OG Image | 1200x630px | PNG | P0 |
| Twitter Card | 1200x600px | PNG | P0 |
| Favicon | 32x32, 16x16, 180x180 | PNG | P0 |

### Icons

Use Lucide React icons for consistency with Shadcn UI.

Required icons:
- CheckIcon (features, pricing)
- XIcon (pricing comparison)
- StarIcon (GitHub stars)
- ArrowRightIcon (CTAs)
- MenuIcon (mobile nav)
- ExternalLinkIcon (external links)
- Feature-specific icons (see section 2.5)

---

## Appendix B: Copy Document

Complete copy for all sections provided separately in `/specs/LANDING_PAGE_COPY.md`

---

## Appendix C: Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | January 2026 | Initial specification |

---

**Document Status:** Ready for Development
**Next Review:** After MVP landing page launch
**Owner:** Marketing & Product Team
