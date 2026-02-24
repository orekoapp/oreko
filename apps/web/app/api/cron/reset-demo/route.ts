import { NextResponse } from 'next/server';
import { prisma } from '@quotecraft/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { DEMO_CONFIG } from '@/lib/demo/constants';

/**
 * Vercel Cron Job - Runs daily at midnight UTC
 * Resets the demo workspace data to a fresh state
 *
 * Schedule: 0 0 * * * (daily at midnight)
 * Configured in vercel.json
 */
export async function GET(request: Request) {
  // Verify the cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, require the cron secret
  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    console.log('[Demo Reset] Starting demo workspace reset...');

    // Fix duplicate demo users caused by trailing whitespace in env var.
    // The env var DEMO_USER_EMAIL may have had a trailing newline, creating
    // a second user. Merge them: keep the clean-email user, delete the dirty one.
    const cleanEmail = DEMO_CONFIG.email; // Already trimmed in constants.ts
    const dirtyUsers = await prisma.user.findMany({
      where: {
        email: { startsWith: cleanEmail },
        NOT: { email: cleanEmail },
      },
      select: { id: true, email: true },
    });
    if (dirtyUsers.length > 0) {
      console.log(`[Demo Reset] Found ${dirtyUsers.length} duplicate demo user(s) with dirty email, cleaning up...`);
      // Ensure the clean user exists first
      const cleanUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      for (const dirty of dirtyUsers) {
        // Transfer any workspace memberships from dirty user to clean user
        if (cleanUser) {
          await prisma.workspaceMember.updateMany({
            where: { userId: dirty.id },
            data: { userId: cleanUser.id },
          }).catch(() => {
            // Ignore unique constraint errors (clean user already has membership)
          });
        }
        // Delete dirty user's memberships and then the user
        await prisma.workspaceMember.deleteMany({ where: { userId: dirty.id } });
        // Update workspace ownership if needed
        await prisma.workspace.updateMany({
          where: { ownerId: dirty.id },
          data: { ownerId: cleanUser?.id || dirty.id },
        });
        await prisma.user.delete({ where: { id: dirty.id } }).catch(() => {
          // May fail if there are other FK references; update email instead
          prisma.user.update({
            where: { id: dirty.id },
            data: { email: `deleted-${dirty.id}@cleanup` },
          }).catch(() => {});
        });
      }
    }

    // Find demo workspace
    const demoWorkspace = await prisma.workspace.findUnique({
      where: { slug: DEMO_CONFIG.workspaceSlug },
    });

    if (!demoWorkspace) {
      // Create demo workspace if it doesn't exist
      console.log('[Demo Reset] Demo workspace not found, creating...');
      await createDemoWorkspaceAndData();
      return NextResponse.json({
        success: true,
        message: 'Demo workspace created',
        timestamp: new Date().toISOString(),
      });
    }

    // Delete all existing demo data (in correct order to respect foreign keys)
    console.log('[Demo Reset] Deleting existing demo data...');

    // Delete invoice events, line items, and invoices
    await prisma.invoiceEvent.deleteMany({
      where: { invoice: { workspaceId: demoWorkspace.id } },
    });
    await prisma.invoiceLineItem.deleteMany({
      where: { invoice: { workspaceId: demoWorkspace.id } },
    });
    await prisma.invoice.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });

    // Delete quote line items, events, and quotes
    await prisma.quoteLineItem.deleteMany({
      where: { quote: { workspaceId: demoWorkspace.id } },
    });
    await prisma.quoteEvent.deleteMany({
      where: { quote: { workspaceId: demoWorkspace.id } },
    });
    await prisma.quote.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });

    // Delete contracts and contract instances (before clients due to FK)
    await prisma.contractInstance.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });
    await prisma.contract.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });

    // Delete projects
    await prisma.project.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });

    // Delete clients
    await prisma.client.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });

    // Delete rate cards
    await prisma.rateCard.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });
    await prisma.rateCardCategory.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });

    // Clean up hardcoded-ID records that may exist in other workspaces (from initial seed)
    // These collide with seedDemoData() which reuses the same IDs
    const hardcodedIds = {
      contracts: ['demo-contract-1', 'demo-contract-2', 'demo-contract-3'],
      contractInstances: ['demo-contract-instance-1', 'demo-contract-instance-2', 'demo-contract-instance-3'],
      clients: ['demo-client-1', 'demo-client-2', 'demo-client-3', 'demo-client-4', 'demo-client-5', 'demo-client-6'],
      projects: ['demo-project-1', 'demo-project-2', 'demo-project-3', 'demo-project-4', 'demo-project-5'],
    };
    const hardcodedEmailIds = [
      'demo-email-template-1', 'demo-email-template-2', 'demo-email-template-3',
      'demo-email-template-4', 'demo-email-template-5', 'demo-email-template-6',
    ];
    await prisma.emailTemplate.deleteMany({ where: { id: { in: hardcodedEmailIds } } });
    await prisma.contractInstance.deleteMany({ where: { id: { in: hardcodedIds.contractInstances } } });
    await prisma.contract.deleteMany({ where: { id: { in: hardcodedIds.contracts } } });
    await prisma.project.deleteMany({ where: { id: { in: hardcodedIds.projects } } });
    await prisma.client.deleteMany({ where: { id: { in: hardcodedIds.clients } } });

    // Delete notifications (prevents stale/leaked notification data)
    await prisma.notification.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });

    // Delete email templates
    await prisma.emailTemplate.deleteMany({
      where: { workspaceId: demoWorkspace.id },
    });

    // Deduplicate workspace members: keep only the demo user as owner
    const demoUser = await prisma.user.findUnique({
      where: { email: DEMO_CONFIG.email },
      select: { id: true },
    });
    if (demoUser) {
      // Remove all members, then re-add demo user
      await prisma.workspaceMember.deleteMany({
        where: { workspaceId: demoWorkspace.id },
      });
      await prisma.workspaceMember.create({
        data: {
          workspaceId: demoWorkspace.id,
          userId: demoUser.id,
          role: 'owner',
          acceptedAt: new Date(),
        },
      });
    }

    // Reset number sequences
    await prisma.numberSequence.updateMany({
      where: { workspaceId: demoWorkspace.id },
      data: { currentValue: 0 },
    });

    // Re-seed demo data
    console.log('[Demo Reset] Re-seeding demo data...');
    await seedDemoData(demoWorkspace.id);

    console.log('[Demo Reset] Demo workspace reset complete');

    return NextResponse.json({
      success: true,
      message: 'Demo workspace reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Demo Reset] Error resetting demo workspace:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset demo workspace',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Create the demo workspace and initial data
 */
async function createDemoWorkspaceAndData() {
  // Create or update demo user
  const passwordHash = await bcrypt.hash(DEMO_CONFIG.password, 12);

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_CONFIG.email },
    update: { passwordHash, name: DEMO_CONFIG.displayName },
    create: {
      email: DEMO_CONFIG.email,
      passwordHash,
      name: DEMO_CONFIG.displayName,
      emailVerifiedAt: new Date(),
    },
  });

  // Create demo workspace
  const demoWorkspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: DEMO_CONFIG.workspaceSlug,
      ownerId: demoUser.id,
      settings: {
        isDemo: true,
        onboardingCompleted: true,
        currency: 'USD',
        timezone: 'America/New_York',
      },
    },
  });

  // Add demo user as workspace member (upsert to prevent duplicates on re-runs)
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: demoWorkspace.id,
        userId: demoUser.id,
      },
    },
    update: { role: 'owner' },
    create: {
      workspaceId: demoWorkspace.id,
      userId: demoUser.id,
      role: 'owner',
      acceptedAt: new Date(),
    },
  });

  // Create business profile
  await prisma.businessProfile.create({
    data: {
      workspaceId: demoWorkspace.id,
      businessName: 'Robert P. Loving',
      email: 'hello@acmedesign.demo',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Creative Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'United States',
      },
      website: 'https://acmedesign.demo',
      currency: 'USD',
      timezone: 'America/New_York',
    },
  });

  // Create number sequences
  await prisma.numberSequence.createMany({
    data: [
      { workspaceId: demoWorkspace.id, type: 'quote', prefix: 'Q-', currentValue: 0, padding: 4 },
      { workspaceId: demoWorkspace.id, type: 'invoice', prefix: '', currentValue: 0, padding: 4 },
    ],
  });

  // Seed the demo data
  await seedDemoData(demoWorkspace.id);
}

/**
 * Seed demo data into the workspace
 */
async function seedDemoData(workspaceId: string) {
  // Create demo clients
  const clients = [
    {
      id: `demo-client-1`,
      workspaceId,
      name: 'TechStart Inc.',
      email: 'projects@techstart.demo',
      company: 'TechStart Inc.',
      phone: '+1 (555) 234-5678',
      notes: 'Great startup client - always pays on time',
    },
    {
      id: `demo-client-2`,
      workspaceId,
      name: 'Global Retail Co.',
      email: 'procurement@globalretail.demo',
      company: 'Global Retail Co.',
      phone: '+1 (555) 345-6789',
      notes: 'Large enterprise client, requires detailed proposals',
    },
    {
      id: `demo-client-3`,
      workspaceId,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.demo',
      company: 'Johnson Consulting',
      phone: '+1 (555) 456-7890',
      notes: 'Freelance consultant, repeat customer',
    },
    {
      id: `demo-client-4`,
      workspaceId,
      name: 'Marcus Chen',
      email: 'marcus@chenventures.demo',
      company: 'Chen Ventures',
    },
    {
      id: `demo-client-5`,
      workspaceId,
      name: 'Creative Agency LLC',
      email: 'hello@creativeagency.demo',
      company: 'Creative Agency LLC',
      phone: '+1 (555) 567-8901',
    },
    {
      id: `demo-client-6`,
      workspaceId,
      name: 'Globex Corporation',
      email: 'info@globex.com',
      company: 'Globex Corporation',
      phone: '+1 (555) 678-9012',
    },
  ];

  await prisma.client.createMany({ data: clients });

  // Create demo projects
  const projects = [
    {
      id: 'demo-project-1',
      workspaceId,
      clientId: 'demo-client-1',
      name: 'Website Redesign 2024',
      description: 'Complete overhaul of the company website including new branding, UX improvements, and mobile responsiveness.',
      isActive: true,
    },
    {
      id: 'demo-project-2',
      workspaceId,
      clientId: 'demo-client-2',
      name: 'E-commerce Platform',
      description: 'Building a new e-commerce platform with inventory management, payment processing, and customer portal.',
      isActive: true,
    },
    {
      id: 'demo-project-3',
      workspaceId,
      clientId: 'demo-client-3',
      name: 'Brand Identity Package',
      description: 'Logo design, brand guidelines, and marketing collateral for Johnson Consulting.',
      isActive: true,
    },
    {
      id: 'demo-project-4',
      workspaceId,
      clientId: 'demo-client-4',
      name: 'Mobile App MVP',
      description: 'Design and development of a mobile app MVP for Chen Ventures startup.',
      isActive: true,
    },
    {
      id: 'demo-project-5',
      workspaceId,
      clientId: 'demo-client-5',
      name: 'Annual Retainer 2023',
      description: 'Ongoing design and development support for Creative Agency LLC.',
      isActive: false,
    },
  ];

  await prisma.project.createMany({ data: projects });

  // Create rate card categories and items
  const category = await prisma.rateCardCategory.create({
    data: {
      workspaceId,
      name: 'Design Services',
      color: '#3B82F6',
    },
  });

  const rateCards = [
    { workspaceId, categoryId: category.id, name: 'UI/UX Design', rate: 150, unit: 'hour', pricingType: 'hourly' },
    { workspaceId, categoryId: category.id, name: 'Brand Identity', rate: 125, unit: 'hour', pricingType: 'hourly' },
    { workspaceId, categoryId: category.id, name: 'Web Development', rate: 175, unit: 'hour', pricingType: 'hourly' },
    { workspaceId, categoryId: category.id, name: 'Logo Design Package', rate: 2500, unit: 'project', pricingType: 'fixed' },
  ];

  await prisma.rateCard.createMany({ data: rateCards });

  // Photography category + rate cards (matching reference screenshot)
  const photoCategory = await prisma.rateCardCategory.create({
    data: {
      workspaceId,
      name: 'Photography',
      color: '#F59E0B',
    },
  });

  await prisma.rateCard.createMany({
    data: [
      { workspaceId, categoryId: photoCategory.id, name: 'Photo Session', description: '2-hour on-location shoot', rate: 800, unit: 'session', pricingType: 'fixed' },
      { workspaceId, categoryId: photoCategory.id, name: 'Photo Editing', description: 'Color correction & retouching', rate: 25, unit: 'photo', pricingType: 'fixed' },
      { workspaceId, categoryId: photoCategory.id, name: 'Digital Delivery', description: 'High-res files via gallery', rate: 100, unit: 'delivery', pricingType: 'fixed' },
    ],
  });

  // Create sample quotes with different statuses
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Quote 1: Draft
  await createQuoteWithLineItems(workspaceId, {
    quoteNumber: 'Q-0001',
    clientId: 'demo-client-1',
    projectId: 'demo-project-1',
    title: 'Website Redesign Proposal',
    status: 'draft',
    issueDate: now,
    expirationDate: thirtyDaysFromNow,
    lineItems: [
      { name: 'Discovery & Research', quantity: 8, rate: 150 },
      { name: 'UI/UX Design', quantity: 40, rate: 150 },
      { name: 'Front-end Development', quantity: 60, rate: 175 },
    ],
  });

  // Quote 2: Sent
  await createQuoteWithLineItems(workspaceId, {
    quoteNumber: 'Q-0002',
    clientId: 'demo-client-2',
    projectId: 'demo-project-2',
    title: 'E-commerce Platform Design',
    status: 'sent',
    issueDate: sevenDaysAgo,
    expirationDate: thirtyDaysFromNow,
    sentAt: sevenDaysAgo,
    lineItems: [
      { name: 'E-commerce UX Audit', quantity: 16, rate: 150 },
      { name: 'Custom Theme Design', quantity: 80, rate: 150 },
      { name: 'Development & Integration', quantity: 120, rate: 175 },
    ],
  });

  // Quote 3: Viewed
  await createQuoteWithLineItems(workspaceId, {
    quoteNumber: 'Q-0003',
    clientId: 'demo-client-3',
    projectId: 'demo-project-3',
    title: 'Brand Identity Package',
    status: 'viewed',
    issueDate: sevenDaysAgo,
    expirationDate: thirtyDaysFromNow,
    sentAt: sevenDaysAgo,
    viewedAt: new Date(sevenDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
    lineItems: [
      { name: 'Logo Design Package', quantity: 1, rate: 2500 },
      { name: 'Brand Guidelines', quantity: 20, rate: 125 },
      { name: 'Collateral Design', quantity: 16, rate: 125 },
    ],
  });

  // Quote 4: Accepted
  await createQuoteWithLineItems(workspaceId, {
    quoteNumber: 'Q-0004',
    clientId: 'demo-client-4',
    projectId: 'demo-project-4',
    title: 'Mobile App UI Design',
    status: 'accepted',
    issueDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    expirationDate: thirtyDaysFromNow,
    sentAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    viewedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
    acceptedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    lineItems: [
      { name: 'App Wireframes', quantity: 24, rate: 150 },
      { name: 'High-fidelity Mockups', quantity: 40, rate: 150 },
      { name: 'Design System Documentation', quantity: 16, rate: 150 },
    ],
  });

  // Quote 5: Declined
  await createQuoteWithLineItems(workspaceId, {
    quoteNumber: 'Q-0005',
    clientId: 'demo-client-5',
    projectId: 'demo-project-5',
    title: 'Annual Retainer Package',
    status: 'declined',
    issueDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
    expirationDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    sentAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
    viewedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
    declinedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    lineItems: [
      { name: 'Monthly Design Retainer', quantity: 12, rate: 5000 },
    ],
  });

  // Create sample invoices
  // Invoice 1: Paid
  await createInvoiceWithLineItems(workspaceId, {
    invoiceNumber: 'INV-0001',
    clientId: 'demo-client-1',
    projectId: 'demo-project-1',
    title: 'Previous Project - Final Payment',
    status: 'paid',
    issueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    paidAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
    amountPaid: 4500,
    lineItems: [
      { name: 'Website Design - Final', quantity: 1, rate: 4500 },
    ],
  });

  // Invoice 2: Sent (awaiting payment)
  await createInvoiceWithLineItems(workspaceId, {
    invoiceNumber: 'INV-0002',
    clientId: 'demo-client-3',
    projectId: 'demo-project-3',
    title: 'Consulting Services - January',
    status: 'sent',
    issueDate: sevenDaysAgo,
    dueDate: thirtyDaysFromNow,
    sentAt: sevenDaysAgo,
    lineItems: [
      { name: 'Strategy Consulting', quantity: 8, rate: 150 },
      { name: 'Design Review Sessions', quantity: 4, rate: 150 },
    ],
  });

  // Invoice 3: Overdue (stored as 'sent' with past dueDate; overdue is computed at runtime)
  await createInvoiceWithLineItems(workspaceId, {
    invoiceNumber: 'INV-0003',
    clientId: 'demo-client-2',
    projectId: 'demo-project-2',
    title: 'Phase 1 Design Delivery',
    status: 'sent',
    issueDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    sentAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    viewedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
    lineItems: [
      { name: 'Design Phase 1', quantity: 1, rate: 8500 },
    ],
  });

  // Invoice 4: Draft
  await createInvoiceWithLineItems(workspaceId, {
    invoiceNumber: 'INV-0004',
    clientId: 'demo-client-4',
    projectId: 'demo-project-4',
    title: 'Mobile App Design - Milestone 1',
    status: 'draft',
    issueDate: now,
    dueDate: thirtyDaysFromNow,
    lineItems: [
      { name: 'Wireframes Completed', quantity: 1, rate: 3600 },
    ],
  });

  // Update number sequences
  await prisma.numberSequence.updateMany({
    where: { workspaceId, type: 'quote' },
    data: { currentValue: 5 },
  });

  await prisma.numberSequence.updateMany({
    where: { workspaceId, type: 'invoice' },
    data: { currentValue: 0 },
  });

  // Create contract templates
  const serviceAgreement = await prisma.contract.create({
    data: {
      workspaceId,
      name: 'Service Agreement',
      isTemplate: true,
      content: `<h1>Service Agreement</h1>
<p>This Service Agreement ("Agreement") is entered into as of <strong>{{date}}</strong> between:</p>

<h2>Parties</h2>
<p><strong>Service Provider:</strong> Acme Design Studio<br/>
Address: 123 Creative Street, San Francisco, CA 94102</p>

<p><strong>Client:</strong> {{client_name}}<br/>
Company: {{client_company}}<br/>
Email: {{client_email}}</p>

<h2>Scope of Services</h2>
<p>The Service Provider agrees to provide the following services:</p>
<ul>
<li>{{service_description}}</li>
</ul>

<h2>Payment Terms</h2>
<p>Total project value: <strong>{{project_value}}</strong></p>
<p>Payment schedule:</p>
<ul>
<li>50% upon signing this agreement</li>
<li>50% upon project completion</li>
</ul>

<h2>Project Timeline</h2>
<p>Estimated completion: {{timeline}}</p>

<h2>Terms & Conditions</h2>
<ol>
<li><strong>Revisions:</strong> This agreement includes up to 2 rounds of revisions.</li>
<li><strong>Intellectual Property:</strong> Upon full payment, all deliverables become the property of the Client.</li>
<li><strong>Confidentiality:</strong> Both parties agree to maintain confidentiality of proprietary information.</li>
<li><strong>Termination:</strong> Either party may terminate with 14 days written notice.</li>
</ol>

<h2>Signatures</h2>
<p>By signing below, both parties agree to the terms outlined in this Agreement.</p>`,
      variables: JSON.stringify([
        { key: 'date', label: 'Agreement Date', type: 'date' },
        { key: 'client_name', label: 'Client Name', type: 'text' },
        { key: 'client_company', label: 'Client Company', type: 'text' },
        { key: 'client_email', label: 'Client Email', type: 'text' },
        { key: 'service_description', label: 'Service Description', type: 'text' },
        { key: 'project_value', label: 'Project Value', type: 'text' },
        { key: 'timeline', label: 'Project Timeline', type: 'text' },
      ]),
    },
  });

  const ndaTemplate = await prisma.contract.create({
    data: {
      workspaceId,
      name: 'Non-Disclosure Agreement (NDA)',
      isTemplate: true,
      content: `<h1>Non-Disclosure Agreement</h1>
<p>This Non-Disclosure Agreement ("Agreement") is effective as of <strong>{{effective_date}}</strong>.</p>

<h2>Parties</h2>
<p><strong>Disclosing Party:</strong> {{disclosing_party}}</p>
<p><strong>Receiving Party:</strong> {{receiving_party}}</p>

<h2>Purpose</h2>
<p>The parties wish to explore a potential business relationship ("Purpose") during which Confidential Information may be disclosed.</p>

<h2>Definition of Confidential Information</h2>
<p>Confidential Information includes:</p>
<ul>
<li>Business plans, strategies, and financial information</li>
<li>Customer and client data</li>
<li>Technical data, trade secrets, and know-how</li>
<li>Software, designs, and prototypes</li>
<li>Any other proprietary information</li>
</ul>

<h2>Obligations</h2>
<p>The Receiving Party agrees to:</p>
<ol>
<li>Hold all Confidential Information in strict confidence</li>
<li>Not disclose Confidential Information to third parties without prior written consent</li>
<li>Use Confidential Information solely for the Purpose</li>
<li>Return or destroy all Confidential Information upon request</li>
</ol>

<h2>Term</h2>
<p>This Agreement shall remain in effect for <strong>{{term_years}}</strong> from the Effective Date.</p>

<h2>Signatures</h2>
<p>By signing below, both parties acknowledge and agree to the terms of this NDA.</p>`,
      variables: JSON.stringify([
        { key: 'effective_date', label: 'Effective Date', type: 'date' },
        { key: 'disclosing_party', label: 'Disclosing Party', type: 'text' },
        { key: 'receiving_party', label: 'Receiving Party', type: 'text' },
        { key: 'term_years', label: 'Term (e.g., "2 years")', type: 'text' },
      ]),
    },
  });

  const projectContract = await prisma.contract.create({
    data: {
      workspaceId,
      name: 'Project Contract',
      isTemplate: true,
      content: `<h1>Project Contract</h1>
<p>This Project Contract outlines the terms for <strong>{{project_name}}</strong>.</p>

<h2>Project Overview</h2>
<p><strong>Project Name:</strong> {{project_name}}</p>
<p><strong>Client:</strong> {{client_name}}</p>
<p><strong>Start Date:</strong> {{start_date}}</p>
<p><strong>Estimated End Date:</strong> {{end_date}}</p>

<h2>Deliverables</h2>
<p>{{deliverables}}</p>

<h2>Milestones & Payment Schedule</h2>
<table>
<tr><th>Milestone</th><th>Due Date</th><th>Amount</th></tr>
<tr><td>Project Kickoff</td><td>{{milestone_1_date}}</td><td>{{milestone_1_amount}}</td></tr>
<tr><td>Design Approval</td><td>{{milestone_2_date}}</td><td>{{milestone_2_amount}}</td></tr>
<tr><td>Final Delivery</td><td>{{milestone_3_date}}</td><td>{{milestone_3_amount}}</td></tr>
</table>

<h2>Communication</h2>
<p>Weekly status updates will be provided via email. The primary contact for this project is:</p>
<p><strong>Provider Contact:</strong> Acme Design Studio<br/>
<strong>Client Contact:</strong> {{client_contact}}</p>

<h2>Acceptance</h2>
<p>By signing below, both parties agree to proceed with the project under these terms.</p>`,
      variables: JSON.stringify([
        { key: 'project_name', label: 'Project Name', type: 'text' },
        { key: 'client_name', label: 'Client Name', type: 'text' },
        { key: 'client_contact', label: 'Client Contact', type: 'text' },
        { key: 'start_date', label: 'Start Date', type: 'date' },
        { key: 'end_date', label: 'End Date', type: 'date' },
        { key: 'deliverables', label: 'Deliverables', type: 'text' },
        { key: 'milestone_1_date', label: 'Milestone 1 Date', type: 'date' },
        { key: 'milestone_1_amount', label: 'Milestone 1 Amount', type: 'text' },
        { key: 'milestone_2_date', label: 'Milestone 2 Date', type: 'date' },
        { key: 'milestone_2_amount', label: 'Milestone 2 Amount', type: 'text' },
        { key: 'milestone_3_date', label: 'Milestone 3 Date', type: 'date' },
        { key: 'milestone_3_amount', label: 'Milestone 3 Amount', type: 'text' },
      ]),
    },
  });

  // Create sample contract instances (sent to clients)
  await prisma.contractInstance.create({
    data: {
      workspaceId,
      contractId: serviceAgreement.id,
      clientId: 'demo-client-1',
      status: 'signed',
      content: serviceAgreement.content
        .replace('{{date}}', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString())
        .replace('{{client_name}}', 'TechStart Inc.')
        .replace('{{client_company}}', 'TechStart Inc.')
        .replace('{{client_email}}', 'projects@techstart.demo')
        .replace('{{service_description}}', 'Website Redesign and Development')
        .replace('{{project_value}}', '$15,000')
        .replace('{{timeline}}', '6 weeks'),
      sentAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
      signedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      signatureData: {
        type: 'drawn',
        name: 'John Smith',
        date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      },
      signerIpAddress: '192.168.1.100',
    },
  });

  await prisma.contractInstance.create({
    data: {
      workspaceId,
      contractId: ndaTemplate.id,
      clientId: 'demo-client-2',
      status: 'sent',
      content: ndaTemplate.content
        .replace('{{effective_date}}', new Date().toLocaleDateString())
        .replace('{{disclosing_party}}', 'Global Retail Co.')
        .replace('{{receiving_party}}', 'Acme Design Studio')
        .replace('{{term_years}}', '3 years'),
      sentAt: sevenDaysAgo,
      viewedAt: new Date(sevenDaysAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.contractInstance.create({
    data: {
      workspaceId,
      contractId: projectContract.id,
      clientId: 'demo-client-4',
      status: 'draft',
      content: projectContract.content
        .replace('{{project_name}}', 'Mobile App UI Design')
        .replace('{{client_name}}', 'Marcus Chen')
        .replace('{{client_contact}}', 'Marcus Chen')
        .replace('{{start_date}}', now.toLocaleDateString())
        .replace('{{end_date}}', thirtyDaysFromNow.toLocaleDateString())
        .replace('{{deliverables}}', 'App wireframes, high-fidelity mockups, design system documentation')
        .replace('{{milestone_1_date}}', now.toLocaleDateString())
        .replace('{{milestone_1_amount}}', '$3,600')
        .replace('{{milestone_2_date}}', new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString())
        .replace('{{milestone_2_amount}}', '$6,000')
        .replace('{{milestone_3_date}}', thirtyDaysFromNow.toLocaleDateString())
        .replace('{{milestone_3_amount}}', '$2,400'),
    },
  });

  // Create email templates
  await prisma.emailTemplate.createMany({
    data: [
      {

        workspaceId,
        type: 'quote_sent',
        name: 'Quote Sent',
        subject: 'Your Quote from Acme Design Studio - {{quote_number}}',
        body: `<p>Hi {{client_name}},</p>

<p>Thank you for considering Acme Design Studio for your project!</p>

<p>We've prepared a detailed quote for <strong>{{quote_title}}</strong>. You can review the full proposal, including pricing and deliverables, using the link below:</p>

<p><a href="{{quote_link}}">View Your Quote</a></p>

<p>This quote is valid until {{expiration_date}}.</p>

<p>If you have any questions or would like to discuss the proposal, please don't hesitate to reach out.</p>

<p>Best regards,<br/>
Acme Design Studio</p>`,
        isActive: true,
        isDefault: true,
      },
      {

        workspaceId,
        type: 'quote_reminder',
        name: 'Quote Reminder',
        subject: 'Reminder: Your Quote Expires Soon - {{quote_number}}',
        body: `<p>Hi {{client_name}},</p>

<p>Just a friendly reminder that your quote for <strong>{{quote_title}}</strong> will expire on {{expiration_date}}.</p>

<p>If you're still interested, you can review and accept the proposal here:</p>

<p><a href="{{quote_link}}">View Your Quote</a></p>

<p>If you have any questions or need any adjustments to the proposal, please let us know!</p>

<p>Best regards,<br/>
Acme Design Studio</p>`,
        isActive: true,
        isDefault: true,
      },
      {

        workspaceId,
        type: 'invoice_sent',
        name: 'Invoice Sent',
        subject: 'Invoice {{invoice_number}} from Acme Design Studio',
        body: `<p>Hi {{client_name}},</p>

<p>Please find attached your invoice for <strong>{{invoice_title}}</strong>.</p>

<p><strong>Invoice Details:</strong></p>
<ul>
<li>Invoice Number: {{invoice_number}}</li>
<li>Amount Due: {{amount_due}}</li>
<li>Due Date: {{due_date}}</li>
</ul>

<p>You can view and pay your invoice online:</p>

<p><a href="{{invoice_link}}">View & Pay Invoice</a></p>

<p>Thank you for your business!</p>

<p>Best regards,<br/>
Acme Design Studio</p>`,
        isActive: true,
        isDefault: true,
      },
      {

        workspaceId,
        type: 'payment_reminder',
        name: 'Payment Reminder',
        subject: 'Payment Reminder: Invoice {{invoice_number}}',
        body: `<p>Hi {{client_name}},</p>

<p>This is a friendly reminder that invoice <strong>{{invoice_number}}</strong> for {{amount_due}} is due on {{due_date}}.</p>

<p>If you've already sent payment, please disregard this message.</p>

<p>You can view and pay your invoice here:</p>

<p><a href="{{invoice_link}}">View & Pay Invoice</a></p>

<p>If you have any questions about this invoice, please don't hesitate to contact us.</p>

<p>Best regards,<br/>
Acme Design Studio</p>`,
        isActive: true,
        isDefault: true,
      },
      {

        workspaceId,
        type: 'payment_received',
        name: 'Payment Confirmation',
        subject: 'Payment Received - Thank You!',
        body: `<p>Hi {{client_name}},</p>

<p>We've received your payment of <strong>{{payment_amount}}</strong> for invoice {{invoice_number}}.</p>

<p>Thank you for your prompt payment! We truly appreciate your business.</p>

<p>If you need a receipt or have any questions, please let us know.</p>

<p>Best regards,<br/>
Acme Design Studio</p>`,
        isActive: true,
        isDefault: true,
      },
      {

        workspaceId,
        type: 'contract_sent',
        name: 'Contract for Signature',
        subject: 'Contract Ready for Your Signature - {{contract_name}}',
        body: `<p>Hi {{client_name}},</p>

<p>Your contract for <strong>{{contract_name}}</strong> is ready for review and signature.</p>

<p>Please review the terms carefully and sign electronically using the secure link below:</p>

<p><a href="{{contract_link}}">Review & Sign Contract</a></p>

<p>If you have any questions about the contract terms, please don't hesitate to reach out.</p>

<p>Best regards,<br/>
Acme Design Studio</p>`,
        isActive: true,
        isDefault: true,
      },
    ],
  });
}

/**
 * Helper to create a quote with line items
 */
async function createQuoteWithLineItems(
  workspaceId: string,
  data: {
    quoteNumber: string;
    clientId: string;
    projectId?: string;
    title: string;
    status: string;
    issueDate: Date;
    expirationDate: Date;
    sentAt?: Date;
    viewedAt?: Date;
    acceptedAt?: Date;
    declinedAt?: Date;
    lineItems: { name: string; quantity: number; rate: number }[];
  }
) {
  const subtotal = data.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  const quote = await prisma.quote.create({
    data: {
      workspaceId,
      clientId: data.clientId,
      projectId: data.projectId,
      quoteNumber: data.quoteNumber,
      title: data.title,
      status: data.status,
      issueDate: data.issueDate,
      expirationDate: data.expirationDate,
      sentAt: data.sentAt,
      viewedAt: data.viewedAt,
      acceptedAt: data.acceptedAt,
      declinedAt: data.declinedAt,
      subtotal,
      total: subtotal,
    },
  });

  await prisma.quoteLineItem.createMany({
    data: data.lineItems.map((item, index) => ({
      quoteId: quote.id,
      name: item.name,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate,
      sortOrder: index,
    })),
  });

  return quote;
}

/**
 * Helper to create an invoice with line items
 */
async function createInvoiceWithLineItems(
  workspaceId: string,
  data: {
    invoiceNumber: string;
    clientId: string;
    projectId?: string;
    title: string;
    status: string;
    issueDate: Date;
    dueDate: Date;
    sentAt?: Date;
    viewedAt?: Date;
    paidAt?: Date;
    amountPaid?: number;
    lineItems: { name: string; quantity: number; rate: number }[];
  }
) {
  const subtotal = data.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const amountPaid = data.amountPaid || 0;

  const amountDue = (data.status === 'paid' || data.status === 'voided') ? 0 : subtotal - amountPaid;

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId,
      clientId: data.clientId,
      projectId: data.projectId,
      invoiceNumber: data.invoiceNumber,
      title: data.title,
      status: data.status,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      sentAt: data.sentAt,
      viewedAt: data.viewedAt,
      paidAt: data.paidAt,
      subtotal,
      total: subtotal,
      amountPaid,
      amountDue,
      accessToken: crypto.randomUUID(),
    },
  });

  await prisma.invoiceLineItem.createMany({
    data: data.lineItems.map((item, index) => ({
      invoiceId: invoice.id,
      name: item.name,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate,
      sortOrder: index,
    })),
  });

  // Create activity events with proper dates
  const events: { eventType: string; createdAt: Date }[] = [];
  events.push({ eventType: 'created', createdAt: data.issueDate });
  if (data.sentAt) events.push({ eventType: 'sent', createdAt: data.sentAt });
  if (data.viewedAt) events.push({ eventType: 'viewed', createdAt: data.viewedAt });
  if (data.paidAt) events.push({ eventType: 'paid', createdAt: data.paidAt });

  for (const evt of events) {
    await prisma.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        eventType: evt.eventType,
        actorType: evt.eventType === 'created' ? 'user' : 'system',
        metadata: {},
        createdAt: evt.createdAt,
      },
    });
  }

  return invoice;
}
