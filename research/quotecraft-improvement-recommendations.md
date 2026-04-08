# Oreko Improvement Recommendations

*Based on competitive analysis with Bloom - January 2026*

---

## Executive Summary

After thorough analysis of Bloom and Oreko, this document provides prioritized recommendations for improving Oreko to better compete in the quote/invoice software market while maintaining its core value propositions: simplicity, open-source, and cost-effectiveness.

---

## Priority 1: Critical Improvements (High Impact, Achievable)

### 1.1 Add More Payment Processors

**Current State:** Stripe only
**Recommendation:** Add Square and PayPal support

**Rationale:**
- Bloom supports Stripe, Square, PayPal, Venmo, CashApp, Zelle, and bank transfers
- Many freelancers already have PayPal or Square accounts
- International users may not have Stripe access
- This is often a deal-breaker for potential users

**Implementation:**
- Add Square integration for US/UK/Canada/Australia users
- Add PayPal Business integration
- Consider Wise/TransferWise for international users

**Estimated Effort:** Medium (2-3 weeks)

---

### 1.2 Expand Social Proof on Landing Page

**Current State:** "5,000+ freelancers" stat and 4 testimonials
**Recommendation:** Add more credibility signals

**Specific Changes:**
1. Add GitHub star count badge (updates dynamically)
2. Add "Downloads" or "Installs" counter
3. Collect and display more diverse testimonials (different industries)
4. Add case studies from real users
5. Consider industry logos if any notable companies use it

**Rationale:**
- Bloom's heavy social proof (15+ testimonials, influencer endorsements) is compelling
- Open-source projects can leverage community size as social proof
- Technical users trust GitHub metrics

**Estimated Effort:** Low (1 week)

---

### 1.3 Create a Mobile App (or PWA)

**Current State:** Responsive web only
**Recommendation:** Start with a Progressive Web App (PWA)

**Rationale:**
- Bloom has native iOS and Android apps
- Mobile invoicing is critical for on-the-go freelancers
- PWA is lower effort than native apps, works cross-platform

**Implementation Steps:**
1. Add PWA manifest and service worker
2. Enable offline viewing of quotes/invoices
3. Add push notifications for payments
4. Later: Consider React Native wrapper for app store presence

**Estimated Effort:** Medium (3-4 weeks for PWA)

---

### 1.4 Add Basic Scheduling/Calendar Integration

**Current State:** No scheduling features
**Recommendation:** Add simple calendar sync and appointment booking

**Rationale:**
- This is one of Bloom's most-used features
- Many freelancers need to schedule client calls before quoting
- Can integrate with existing Google Calendar APIs

**Scope (Keep Simple):**
- Sync quote deadlines/events to Google Calendar
- Simple availability picker for client meetings
- Don't try to build full scheduling system (that's scope creep)

**Estimated Effort:** Medium (2-3 weeks)

---

## Priority 2: Important Improvements (Medium Impact)

### 2.1 Improve Client Portal Features

**Current State:** Basic client portal
**Recommendation:** Add branded portal with more functionality

**Improvements:**
1. Custom subdomain support (client.yourcompany.com)
2. Client login to view all their quotes/invoices
3. Document sharing capability
4. Payment history view
5. Message/comment system on quotes

**Rationale:**
- Bloom's client portal is a major selling point
- Professional appearance matters for client trust
- Reduces email back-and-forth

**Estimated Effort:** Medium-High (4-5 weeks)

---

### 2.2 Add Contract/Agreement Templates

**Current State:** Listed as "Planned"
**Recommendation:** Prioritize basic contract functionality

**Features:**
1. Pre-built contract templates (NDA, service agreement, etc.)
2. Attach contracts to quotes
3. E-signature for contracts (can reuse existing signature system)
4. PDF generation for signed contracts

**Rationale:**
- Bloom has comprehensive contract signing
- Many freelancers need contracts before quotes
- Can be simpler than Bloom's implementation

**Estimated Effort:** Medium (3-4 weeks)

---

### 2.3 Add Email Template Customization

**Current State:** Basic email notifications
**Recommendation:** User-editable email templates

**Features:**
1. Customize quote sent, invoice sent, payment received emails
2. Add company branding to emails
3. Preview before sending
4. Basic variable substitution ({{client_name}}, {{amount}}, etc.)

**Rationale:**
- Professional email communication matters
- Bloom has full email automation
- Even basic customization is valuable

**Estimated Effort:** Low-Medium (2 weeks)

---

### 2.4 Add QuickBooks/Xero Integration

**Current State:** No accounting integrations
**Recommendation:** Add QuickBooks Online integration

**Rationale:**
- Bloom has QuickBooks integration
- Many freelancers use QBO for taxes
- Avoids double data entry for accounting

**Estimated Effort:** Medium (3 weeks)

---

## Priority 3: Nice-to-Have Improvements (Lower Priority)

### 3.1 Add Basic Workflow/Task Management

**Observation:** Bloom has comprehensive workflow management
**Recommendation:** Keep it simple - just add basic task checklists

**Implementation:**
- Add optional checklist to projects/quotes
- Pre-defined workflow templates
- Don't try to compete with full project management tools

**Rationale:**
- Full workflow management is scope creep
- Simple checklists provide 80% of the value
- Stay focused on core invoicing strength

---

### 3.2 Add More Reporting/Analytics

**Current State:** Basic dashboard metrics
**Recommendation:** Add more business insights

**Features:**
1. Revenue trends over time
2. Client profitability analysis
3. Quote conversion rate tracking
4. Payment timing analytics
5. Export to CSV/Excel

---

### 3.3 Consider Image/File Delivery Feature

**Observation:** Bloom's gallery feature is popular with photographers
**Recommendation:** Evaluate if this fits target market

**If implemented, keep simple:**
- File attachment to invoices
- Basic download tracking
- Don't build full gallery management

---

## UI/UX Specific Recommendations

### Landing Page Improvements

1. **Add a Video Demo**
   - Bloom doesn't have one, this could differentiate
   - Show the visual quote builder in action
   - Keep under 60 seconds

2. **Improve Feature Screenshots**
   - Screenshots now display correctly (aspect ratio fix applied)
   - Consider adding interactive hover states
   - Add captions explaining what users are seeing

3. **Add Comparison Table**
   - Bloom has "Bloom vs Others" comparison
   - Create "Oreko vs Bloom vs Bonsai" table
   - Highlight self-hosting and free tier advantages

4. **Strengthen the "Problem" Section**
   - Current "Sound Familiar?" section is good
   - Add more specific pain points
   - Include actual cost comparisons

5. **Add Trust Badges**
   - "MIT Licensed" badge
   - "GDPR Compliant" badge
   - GitHub stars counter
   - "Secure" indicators

### Dashboard/App Improvements

1. **Onboarding Flow**
   - Add guided setup wizard
   - Pre-populate with sample data
   - Quick tutorial for first quote

2. **Visual Quote Builder Polish**
   - This is the core differentiator - invest here
   - Add more block types
   - Improve drag-and-drop smoothness
   - Add template gallery

3. **Mobile Dashboard**
   - Optimize dashboard for tablet/mobile
   - Add quick actions (send invoice, check payment)
   - Push notification for payments

---

## What NOT to Do

### Avoid Feature Bloat
- Don't try to match every Bloom feature
- Stay focused on doing invoicing exceptionally well
- Complexity is the enemy of adoption

### Don't Abandon Open-Source Positioning
- This is the key differentiator
- Keep self-hosted version feature-complete
- Don't gate important features behind cloud-only

### Don't Compete on Influencer Marketing
- Bloom has established influencer relationships
- Focus on developer/technical community instead
- Leverage GitHub, Product Hunt, Hacker News

### Don't Under-Price Cloud Offering
- $9/mo starter is already aggressive
- Don't race to the bottom
- Compete on value and features, not just price

---

## Implementation Roadmap Suggestion

### Phase 1 (Next 4-6 weeks)
- [ ] Add PayPal payment integration
- [ ] Add PWA support
- [ ] Expand testimonials/social proof
- [ ] Add video demo to landing page

### Phase 2 (6-12 weeks)
- [ ] Add Square integration
- [ ] Implement basic contract templates
- [ ] Add email template customization
- [ ] Calendar sync (Google Calendar)

### Phase 3 (3-6 months)
- [ ] Enhanced client portal
- [ ] QuickBooks integration
- [ ] Basic workflow checklists
- [ ] Mobile app (React Native wrapper)

---

## Conclusion

Oreko has successfully positioned itself as a focused, cost-effective alternative to Bloom. The recommendations above aim to close feature gaps that matter most to users while avoiding the trap of becoming another bloated all-in-one platform.

**The key strategic insight:** Don't try to out-Bloom Bloom. Instead, be the best open-source invoicing tool that respects users' time, money, and data ownership.
