# Research Summary: Invoices & Quotes Software

**Document Type:** Executive Research Overview
**Last Updated:** January 2026
**Status:** Research Complete - Ready for Project Kickoff
**Recommendation:** GO
**Strategy:** Open Source First

---

## 1. Executive Summary

### The Opportunity

The Invoices & Quotes software product targets a validated $5.43B global billing and invoicing software market growing at 12.51% CAGR. A clear market gap exists for a modern, open-source, self-hosted quote-to-payment solution serving freelancers, small business owners, solopreneurs, and small agencies who are underserved by expensive SaaS tools (Bloom, Bonsai) and overwhelmed by accounting-heavy platforms (QuickBooks).

**The window of opportunity is NOW:**
- **70+ million US gig workers** (36% of workforce) need simple, professional billing tools
- **Fiverr Workspace shuts down March 1, 2026**, displacing 50,000+ users seeking alternatives
- **No open-source competitor** offers Bloom-quality UX with self-hosted deployment
- Price-conscious users want beautiful documents without $18-20/month SaaS subscriptions
- Post-pandemic digital transformation has normalized online payments and e-signatures

### The Solution

**"The open-source alternative to Bloom and Bonsai"**

A visual quotation and invoice builder that delivers Bloom-quality UX as a free, self-hosted solution:

- **Beautiful, professional documents** (Bloom-quality visual design, not spreadsheet-like)
- **Self-hosted with Docker deployment** (own your data, no vendor lock-in)
- **Modular architecture** (users choose which features they need)
- **Advanced Rate Card feature** (manage pricing across services)
- **One-click quote-to-invoice conversion** (no more data re-entry)
- **Built-in e-signatures** (replaces $15-25/month tools)
- **Flexible payment scheduling** (deposits, milestones, recurring)

### Go-to-Market: Open Source First

| Strategy | Details |
|----------|---------|
| **Launch Model** | Open source to get feedback without marketing spend |
| **Value First** | Build trust by providing value, then iterate |
| **Marketing Spend** | Zero paid marketing initially |
| **Community Growth** | Leverage developer communities, word-of-mouth |
| **Revenue Path** | Cloud-hosted SaaS for those who don't want to self-host |

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **UI Framework** | Shadcn UI / Minimals Design System | Modern, customizable, professional |
| **Deployment** | Docker (self-hosted) | Easy setup, portable, scalable |
| **Architecture** | Modular | Users choose features they need |

### The Business Case

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Open Source Users** | 5,000+ | 20,000+ | 50,000+ |
| **Paid Cloud Customers** | 500 | 2,500 | 8,000 |
| **Cloud ARR** | $54K | $270K | $864K |
| **Total ARR (incl. support)** | $100K | $400K | $1.2M |

**Revenue Streams:**
- Open source core: FREE (community growth, brand building)
- Cloud-hosted SaaS: Starting at $9/mo (undercutting Bloom's $18-20)
- Priority support for self-hosted: Enterprise pricing
- Premium add-ons: Marketplace revenue

### The Ask

- **Investment Phase (Year 1):** Community building, product refinement
- **Break-even:** When cloud conversion reaches 10% of user base
- **Long-term ROI:** Large open-source community creates sustainable conversion pipeline

---

## 2. Market Opportunity

### Market Size

| Metric | Value | Source |
|--------|-------|--------|
| **TAM** (Global Billing Software) | $5.43B (2025) | Market research |
| **TAM Growth** | $13.94B by 2033 (12.51% CAGR) | Straits Research |
| **SAM** (SMB Cloud Invoicing, NA/EU) | $2.4-3.0B | Segment analysis |
| **SOM** (3-Year Target) | $1-2M ARR (cloud) + community | Conservative capture |

### Target Segment: Price-Conscious Quality Seekers

| Segment | Characteristics | Pain Point |
|---------|-----------------|------------|
| **Small Business Owners** | 1-10 employees, service-based | Bloom/Bonsai too expensive |
| **Freelancers** | Solo operators, creative/technical | Want pro tools, limited budget |
| **Solopreneurs** | One-person businesses | Need beautiful docs, not spreadsheets |
| **Small Agencies** | 2-5 person teams | Team features without enterprise pricing |

### Growth Drivers

1. **Gig Economy Expansion**
   - 70M+ US gig workers today, 48.5% of workforce by late 2026
   - 71% experience late payments averaging 21-day delays
   - Users with dedicated invoicing tools earn 65% more annually

2. **Open Source Adoption**
   - Businesses increasingly prefer self-hosted for data sovereignty
   - Docker deployment has become mainstream
   - Developer communities drive B2B SaaS adoption

3. **Price Sensitivity in Down Economy**
   - SMBs cutting SaaS expenses
   - Free alternatives with professional quality gaining traction
   - Self-hosted reduces recurring costs

### Timing Opportunity: Fiverr Workspace Shutdown

**Critical Window:** Fiverr Workspace (AND.CO) shuts down March 1, 2026

| Opportunity | Details |
|-------------|---------|
| Displaced users | 50,000+ active users |
| Timeline | Users seeking alternatives now (Jan-Feb 2026) |
| Our advantage | Free, self-hosted, no vendor lock-in |
| Target capture | 2,000+ users through open-source migration tools |

---

## 3. Target Customer

### Primary Personas (P0)

#### Budget-Conscious Bella - Small Agency Owner

| Attribute | Details |
|-----------|---------|
| **Profile** | 35, Chicago IL, 3-person design agency |
| **Revenue** | $350K/year agency revenue |
| **Current Tools** | Trying Bloom, frustrated by $18-20/month per seat |
| **Pain Point** | Loves Bloom's UX but costs add up quickly |

**Key Quote:**
> "I need my quotes and invoices to look as good as my design work, but I can't justify $60/month for my small team."

#### Privacy-First Patrick - Freelance Developer

| Attribute | Details |
|-----------|---------|
| **Profile** | 40, remote, solo consultant |
| **Revenue** | $180K/year from consulting |
| **Current Tools** | Self-built spreadsheets, manual invoicing |
| **Pain Point** | Won't use SaaS for client financial data |

**Key Quote:**
> "I don't want my client data on someone else's servers. Give me a Docker image and I'll run it myself."

#### Creative Claire - Freelance Designer

| Attribute | Details |
|-----------|---------|
| **Profile** | 32, Austin TX, solo LLC, 4 years freelancing |
| **Revenue** | $120K/year from freelance work |
| **Current Tools** | Canva (quotes) + Wave (invoices) + HelloSign (contracts) |
| **Pain Point** | Tools don't reflect her design quality |

**Key Quote:**
> "Bloom makes beautiful invoices but $20/month feels steep when I'm just starting out."

### Secondary Personas (P1)

| Persona | Profile | Key Need |
|---------|---------|----------|
| **Contractor Chris** | Renovation business, 4-7 employees | On-site quoting, deposit collection |
| **Agency Amanda** | Digital marketing agency, $1.2M revenue | Team billing, retainer automation |

### Anti-Personas (NOT Our Target)

| Persona | Why Excluded |
|---------|--------------|
| Enterprise Emily | Complex procurement, SOC2, multi-level approvals |
| Feature-Rich Frank | Wants all-in-one CRM/accounting (use HoneyBook) |
| Hobbyist Henry | <$5K revenue, extreme price sensitivity |

---

## 4. Competitive Landscape

### Market Positioning

```
                    BEAUTIFUL UX
                         |
                         |
        Bloom            |              Bonsai
        ($18-20/mo)      |              ($21/mo)
                         |
                    [OUR POSITION]
                    Open-Source Alternative
                    Bloom-Quality UX, FREE
                         |
        Invoice Ninja    |     Wave
        (Open-source)    |     (Free)
                         |
        Zoho Invoice     |
        (Ecosystem)      |
                         |
                    BASIC/FUNCTIONAL
```

### Direct Competitors

| Competitor | Position | Pricing | Our Advantage |
|------------|----------|---------|---------------|
| **Bloom** | Beautiful invoicing | $18-20/mo | FREE core, same quality UX |
| **Bonsai** | Freelancer suite | $21/mo | Self-hosted, lower cost |
| **HoneyBook** | CRM for creatives | $29-109/mo | No CRM bloat, much cheaper |
| **Invoice Ninja** | Open-source | $14/mo hosted | Better UX, modern design system |
| **Wave** | Free basic invoicing | Free + fees | Beautiful documents, not basic |
| **FreshBooks** | Accounting + invoicing | $17-55/mo | Not accounting-focused |

### Competitive Differentiation

| Us (Open Source) | Bloom/Bonsai (SaaS) |
|------------------|---------------------|
| FREE self-hosted | $18-21/month |
| Own your data | Data on their servers |
| Docker deployment | Vendor-dependent |
| Modular features | All-or-nothing |
| Community-driven | Company roadmap |
| Shadcn/Minimals design | Proprietary design |

### Key Differentiator: Architecture

| Aspect | Traditional SaaS | Our Approach |
|--------|------------------|--------------|
| **Deployment** | Cloud-only | Docker self-hosted + optional cloud |
| **Data Ownership** | Vendor controls | User controls |
| **Customization** | Limited | Full source access |
| **Pricing** | Per-seat SaaS | Free core, optional cloud |
| **Visual Language** | Custom/proprietary | Shadcn UI / Minimals |

---

## 5. Value Proposition

### Core Value Proposition

> **Bloom-quality quotes and invoices, completely free and self-hosted. Beautiful documents that impress clients, deployed with a single Docker command, with optional cloud hosting for $9/month.**

### Simplified (15 Words)

> **The open-source alternative to Bloom. Beautiful invoices. Self-hosted. Free forever.**

### Key Differentiators

| Differentiator | Uniqueness | User Impact |
|----------------|------------|-------------|
| **Bloom-Quality UX** | Open-source with professional design | Documents as good as paid tools |
| **Self-Hosted Option** | Docker deployment, data sovereignty | Own your client data |
| **Modular Architecture** | Choose what you need | No bloat, fast performance |
| **Advanced Rate Cards** | Manage service pricing centrally | Consistent quoting across projects |
| **$9/mo Cloud Option** | 50% cheaper than Bloom | Premium experience, budget price |
| **Built on Shadcn/Minimals** | Modern, customizable design system | Developers can extend and theme |

### Value Proof Points

| Claim | Target Metric |
|-------|---------------|
| Cost savings vs Bloom/Bonsai | $108-252/year per user |
| Time saved per project | 45+ minutes |
| Docker deployment time | <5 minutes |
| Modules available | 8+ (quotes, invoices, contracts, etc.) |
| Community contributors | 50+ by Year 1 |

### Tagline

**"Beautiful invoices. Self-hosted. Free."**

Alternative: **"Bloom quality. Open source. Your servers."**

---

## 6. Product Strategy

### Vision Statement

> **A world where every freelancer and small business can create stunning, professional financial documents without expensive subscriptions or vendor lock-in.**

### Mission Statement

> **We give freelancers, solopreneurs, and small agencies Bloom-quality quote and invoice tools as free, open-source software they can self-host or use in the cloud for a fraction of competitors' prices.**

### Product Principles

1. **Beauty by Default** - Bloom-quality design, not spreadsheet aesthetics
2. **Self-Hosted First** - Docker deployment as primary, cloud as option
3. **Modular Freedom** - Users pick modules they need
4. **Open Source Core** - Community-driven development
5. **Simple Deployment** - One command to run
6. **Shadcn/Minimals Foundation** - Modern, extensible design system
7. **Rate Card Intelligence** - Centralized pricing management

### Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Design System** | Shadcn UI + Minimals | Modern, accessible, themeable |
| **Deployment** | Docker Compose | Universal, simple, scalable |
| **Architecture** | Modular monolith | Easy to deploy, modules can be enabled/disabled |
| **License** | MIT or Apache 2.0 | Business-friendly open source |

### Module Architecture

| Module | Description | Core/Optional |
|--------|-------------|---------------|
| **Quotes** | Visual quote builder with rate cards | Core |
| **Invoices** | Invoice creation and management | Core |
| **Payments** | Stripe/payment integration | Core |
| **Contracts** | E-signatures and agreements | Optional |
| **Client Portal** | Client-facing view and payment | Core |
| **Rate Cards** | Centralized service pricing | Core |
| **Recurring** | Subscription/retainer billing | Optional |
| **Reports** | Financial dashboards | Optional |

### Strategic Roadmap (3 Years)

| Phase | Timeline | Theme | Key Outcomes |
|-------|----------|-------|--------------|
| **Launch** | Year 1 | Open Source Release | 5,000+ self-hosted users, 500 cloud customers |
| **Growth** | Year 2 | Community & Ecosystem | 20,000+ users, plugin marketplace, integrations |
| **Scale** | Year 3 | Enterprise & Revenue | 50,000+ users, enterprise support tier, $1M+ ARR |

---

## 7. Business Model

### Revenue Streams

| Stream | Model | Year 1 | Year 2 | Year 3 |
|--------|-------|--------|--------|--------|
| **Open Source Core** | FREE | $0 | $0 | $0 |
| **Cloud Hosted** | $9/mo starting | $54K | $270K | $864K |
| **Priority Support** | Enterprise pricing | $20K | $60K | $150K |
| **Premium Add-ons** | Marketplace | $10K | $40K | $100K |
| **White-label** | Agency licensing | $16K | $30K | $86K |
| **Total** | - | $100K | $400K | $1.2M |

### Pricing Strategy

| Tier | Price | Target | Features |
|------|-------|--------|----------|
| **Self-Hosted** | FREE | Developers, privacy-conscious | Full features, community support |
| **Cloud Starter** | $9/mo | Solo freelancers | Hosted, basic support |
| **Cloud Pro** | $19/mo | Growing businesses | Priority support, advanced features |
| **Cloud Team** | $39/mo | Small agencies | Multi-user, team features |
| **Enterprise** | Custom | Large organizations | SLA, dedicated support, white-label |

### Competitive Pricing Comparison

| Product | Entry Price | Our Equivalent |
|---------|-------------|----------------|
| Bloom | $18-20/mo | FREE (self-hosted) or $9/mo (cloud) |
| Bonsai | $21/mo | FREE (self-hosted) or $9/mo (cloud) |
| HoneyBook | $29/mo | FREE (self-hosted) or $9/mo (cloud) |
| Invoice Ninja (hosted) | $14/mo | FREE (self-hosted) or $9/mo (cloud) |

### Unit Economics (Cloud Customers)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **CAC** | $20 | $25 | $30 |
| **LTV** | $180 | $240 | $320 |
| **LTV:CAC** | 9:1 | 9.6:1 | 10.7:1 |
| **Gross Margin** | 85% | 87% | 88% |
| **Monthly Churn** | 4% | 3% | 2.5% |

### Revenue Projections

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Open Source Users** | 5,000 | 20,000 | 50,000 |
| **Cloud Customers** | 500 | 2,500 | 8,000 |
| **Cloud Conversion Rate** | 10% | 12.5% | 16% |
| **Total ARR** | $100K | $400K | $1.2M |

---

## 8. Go-to-Market

### Launch Strategy: Open Source First

| Phase | Timing | Activities |
|-------|--------|------------|
| **Pre-Launch** | Weeks -4 to 0 | GitHub repo setup, documentation, Docker images |
| **Soft Launch** | Week 0 | Release v1.0, Hacker News post, dev community outreach |
| **Community Growth** | Weeks 1-12 | GitHub stars, contributor onboarding, tutorial content |
| **Cloud Launch** | Week 8+ | Announce cloud option for non-technical users |

### Channel Mix (Year 1) - Zero Paid Marketing

| Channel | % of Users | Strategy |
|---------|------------|----------|
| **Hacker News / Reddit** | 30% | Launch posts, community engagement |
| **GitHub Discovery** | 25% | SEO, awesome lists, topic tags |
| **Developer Content** | 20% | Blog posts, tutorials, YouTube |
| **Word of Mouth** | 15% | Happy users sharing |
| **Fiverr Migration** | 10% | Migration tools, guides |

### Community Building Strategy

| Activity | Goal | Metric |
|----------|------|--------|
| **GitHub Stars** | Social proof | 2,000+ Year 1 |
| **Contributors** | Community engagement | 50+ contributors |
| **Discord/Slack** | Support community | 1,000+ members |
| **Documentation** | Self-service | <5 min to deploy |
| **Tutorials** | Adoption | 10+ video tutorials |

### Fiverr Workspace Migration Campaign

**Timing:** January - March 2026 (before March 1 shutdown)

| Component | Details |
|-----------|---------|
| Landing page | "Switching from Fiverr Workspace? Here's a free alternative." |
| Import tool | Open-source data migration script |
| Community support | Dedicated Discord channel for migrants |
| Tutorial | Step-by-step migration guide |
| Target | 2,000+ users through free offering |

### Why No Paid Marketing Initially

| Reason | Explanation |
|--------|-------------|
| **Build Trust First** | Prove value before asking for money |
| **Gather Feedback** | Real users guide product direction |
| **Community Moat** | Organic users become advocates |
| **Capital Efficient** | No marketing spend until PMF validated |
| **SaaS Norm** | Most successful OS projects start this way |

---

## 9. Success Criteria

### North Star Metric

**Monthly Active Self-Hosted Deployments + Cloud Active Users**

| Milestone | Target | Timeline |
|-----------|--------|----------|
| Open Source Launch | 500 GitHub stars | Month 1 |
| Community Traction | 2,000 stars, 1,000 deployments | Month 6 |
| Cloud Viable | 500 paying cloud customers | Month 12 |
| Growth Phase | 20,000+ total users | Month 24 |

### Year 1 Success Criteria

| Criteria | Target | Measurement |
|----------|--------|-------------|
| **GitHub Stars** | 2,000+ | GitHub |
| **Self-Hosted Deployments** | 5,000+ | Opt-in telemetry |
| **Cloud Customers** | 500+ | Stripe |
| **Contributors** | 50+ | GitHub |
| **Community Members** | 1,000+ | Discord |
| **NPS** | >50 | Surveys |

### Open Source Health Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Stars** | 2,000+ | Social proof, discoverability |
| **Forks** | 500+ | Community engagement |
| **Contributors** | 50+ | Sustainable development |
| **Issues Closed** | 80%+ | Responsive maintenance |
| **PR Merge Time** | <7 days | Contributor experience |

### Kill Criteria (90 Days Post-Launch)

If any of these are true, reconsider/pivot:

| Kill Signal | Threshold |
|-------------|-----------|
| GitHub stars | <500 (vs 1,000 target) |
| Self-hosted deployments | <500 (vs 2,000 target) |
| Cloud signups | <100 (vs 200 target) |
| Community sentiment | Majority negative feedback |
| No contributors | <5 external PRs |

---

## 10. Risks & Mitigations

### Strategic Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **No one self-hosts** | Medium | High | Make Docker deployment trivially easy |
| **Bloom copies features** | Medium | Medium | Community moat, different architecture |
| **Too technical for target users** | Medium | High | Invest in documentation, cloud option |
| **Community doesn't form** | Medium | High | Active maintainer engagement, quick PR reviews |

### Open Source Specific Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Forks compete** | Low | Medium | Stay ahead, community goodwill |
| **Support burden** | High | Medium | Great docs, community forums |
| **Contribution quality** | Medium | Low | Clear contribution guidelines |
| **Licensing issues** | Low | High | Proper license from day 1 |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Users prefer SaaS convenience** | Medium | High | Cloud option at competitive price |
| **Economic conditions worsen** | Medium | Medium | Free tier becomes more attractive |
| **Fiverr users choose established players** | Medium | Medium | Superior migration experience, FREE |

### Key Strategic Bets

| Bet | Assumption | Validation Criteria |
|-----|------------|---------------------|
| **Open Source Builds Trust** | Free creates goodwill and adoption | 2,000+ stars in 6 months |
| **Docker is Accessible** | Target users can deploy Docker | 50%+ successful self-deploy |
| **Bloom UX is Replicable** | Shadcn/Minimals can match quality | User feedback on design quality |
| **Cloud Converts** | 10%+ of free users upgrade | Conversion rate tracking |
| **Community Forms** | Developers contribute | 50+ contributors Year 1 |

---

## 11. Recommendation

### GO Decision

Based on comprehensive research and PM strategy feedback, **this product opportunity is validated with an open-source-first approach.**

### Rationale

| Factor | Assessment | Confidence |
|--------|------------|------------|
| **Market Gap** | No open-source Bloom alternative exists | High |
| **Target Audience** | Price-conscious users underserved | High |
| **Technical Feasibility** | Docker + Shadcn is proven stack | High |
| **Competitive Position** | Unique: beautiful + free + self-hosted | High |
| **Go-to-Market** | Open source reduces marketing spend | High |
| **Business Model** | Cloud converts fund development | Medium-High |

### Why Open Source First

| Benefit | Explanation |
|---------|-------------|
| **Zero Marketing Spend** | Let the product speak for itself |
| **Trust Building** | Give value before asking for payment |
| **Feedback Loop** | Community shapes product direction |
| **Competitive Moat** | Hard to compete with free + great UX |
| **Capital Efficient** | Reach PMF without heavy investment |

### Conditions for Success

1. **Docker deployment must be one command** - No complex setup
2. **UX must match Bloom quality** - Shadcn/Minimals implementation excellence
3. **Documentation must be exceptional** - Self-service first
4. **Community must feel heard** - Fast issue response, PR reviews
5. **Cloud option at launch or soon after** - Capture non-technical users

### Investment Required

| Phase | Focus | Timeline | Expected Outcome |
|-------|-------|----------|------------------|
| Year 1 | Community building | 12 months | 5,000+ users, 500 cloud |
| Year 2 | Ecosystem growth | 24 months | 20,000+ users, $400K ARR |
| Year 3 | Revenue scaling | 36 months | 50,000+ users, $1.2M ARR |

---

## 12. Next Steps

### Immediate Actions (Week 1)

1. **Finalize technology stack** - Confirm Shadcn UI / Minimals design system
2. **Set up GitHub repository** - Public repo, proper license, contributing guide
3. **Create Docker setup** - `docker-compose up` must work perfectly
4. **Begin core module development** - Quotes + Invoices first

### Pre-Launch Actions (Weeks 1-8)

1. **Development sprints** - MVP with quotes, invoices, payments, rate cards
2. **Documentation** - README, installation guide, user docs
3. **Docker optimization** - Multi-platform images, easy config
4. **Design system setup** - Shadcn components, Minimals theme
5. **Community prep** - Discord server, contributing guidelines

### Launch Actions (Weeks 8-12)

1. **Soft launch** - GitHub release, gather early feedback
2. **Hacker News post** - "Show HN: Open-source Bloom alternative"
3. **Reddit posts** - r/selfhosted, r/freelance, r/webdev
4. **Dev community outreach** - Dev.to article, Twitter threads
5. **Fiverr migration tools** - Import scripts, guides

### Post-Launch Actions (Weeks 12+)

1. **Community engagement** - Respond to issues, merge PRs
2. **Cloud launch** - Hosted option for non-technical users
3. **Iteration** - Features based on community feedback
4. **Contributor growth** - Hacktoberfest, good first issues

---

## Document References

| Phase | Document | Key Contents |
|-------|----------|--------------|
| 1 | MARKET_ANALYSIS.md | TAM/SAM/SOM, growth trends, timing |
| 2 | USER_PERSONAS.md | Bella, Patrick, Claire, anti-personas |
| 3 | COMPETITIVE_ANALYSIS.md | Bloom/Bonsai comparison, positioning |
| 4 | VALUE_PROPOSITION.md | Open-source value prop, messaging |
| 5 | PRODUCT_VISION.md | Vision, mission, principles, roadmap |
| 6 | BUSINESS_MODEL.md | Revenue model, pricing, projections |
| 7 | USER_JOURNEYS.md | User flows, stories, pain points |
| 8 | MVP_DEFINITION.md | Scope, modules, timeline, success criteria |

---

## Research Team

| Role | Responsibility | Phase |
|------|----------------|-------|
| Market Analyst | Market sizing, trends, timing | Phase 1 |
| Persona Researcher | User profiles, pain points, behaviors | Phase 2 |
| Competitive Analyst | Competitor features, pricing, positioning | Phase 3 |
| Value Strategist | Value proposition, messaging, differentiation | Phase 4 |
| Product Strategist | Vision, principles, roadmap | Phase 5 |
| Business Modeler | Revenue, pricing, projections | Phase 6 |
| Journey Mapper | User flows, stories, backlog | Phase 7 |
| MVP Definer | Scope, features, launch criteria | Phase 8 |
| Research Reporter | Summary, synthesis, recommendation | Phase 9 |

---

*Research completed January 2026*
*Strategy updated with PM feedback: Open Source First*
*Ready for development kickoff*

---

**RECOMMENDATION: GO**

**Strategy: Open Source First**

The Invoices & Quotes software product will launch as an open-source alternative to Bloom and Bonsai. The market gap is clear: price-conscious freelancers and small businesses want beautiful documents without expensive SaaS subscriptions.

**Key Strategic Decisions:**
- Open source core (FREE, self-hosted with Docker)
- Bloom-quality UX using Shadcn UI / Minimals design system
- Modular architecture (users choose features)
- Cloud-hosted option starting at $9/mo (undercutting Bloom's $18-20)
- Zero paid marketing initially - leverage developer communities

**Positioning:** "The open-source alternative to Bloom and Bonsai"

Proceed to development kickoff with the open-source-first strategy.

```bash
/project-kickoff --mvp-definition ./research/MVP_DEFINITION.md --strategy open-source-first
```
