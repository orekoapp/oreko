import { NextResponse } from 'next/server';
import { prisma } from '@quotecraft/database';
import bcrypt from 'bcryptjs';
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

    // Delete invoice line items and invoices
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

  // Add demo user as workspace member
  await prisma.workspaceMember.create({
    data: {
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
      businessName: 'Acme Design Studio',
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
      { workspaceId: demoWorkspace.id, type: 'invoice', prefix: 'INV-', currentValue: 0, padding: 4 },
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
  ];

  await prisma.client.createMany({ data: clients });

  // Create rate card categories and items
  const category = await prisma.rateCardCategory.create({
    data: {
      workspaceId,
      name: 'Design Services',
      color: '#3B82F6',
    },
  });

  const rateCards = [
    { id: 'demo-rate-1', workspaceId, categoryId: category.id, name: 'UI/UX Design', rate: 150, unit: 'hour', pricingType: 'hourly' },
    { id: 'demo-rate-2', workspaceId, categoryId: category.id, name: 'Brand Identity', rate: 125, unit: 'hour', pricingType: 'hourly' },
    { id: 'demo-rate-3', workspaceId, categoryId: category.id, name: 'Web Development', rate: 175, unit: 'hour', pricingType: 'hourly' },
    { id: 'demo-rate-4', workspaceId, categoryId: category.id, name: 'Logo Design Package', rate: 2500, unit: 'project', pricingType: 'fixed' },
  ];

  await prisma.rateCard.createMany({ data: rateCards });

  // Create sample quotes with different statuses
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Quote 1: Draft
  await createQuoteWithLineItems(workspaceId, {
    quoteNumber: 'Q-0001',
    clientId: 'demo-client-1',
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

  // Invoice 3: Overdue
  await createInvoiceWithLineItems(workspaceId, {
    invoiceNumber: 'INV-0003',
    clientId: 'demo-client-2',
    title: 'Phase 1 Design Delivery',
    status: 'overdue',
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
    data: { currentValue: 4 },
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
      position: index,
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

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId,
      clientId: data.clientId,
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
      amountDue: subtotal - amountPaid,
    },
  });

  await prisma.invoiceLineItem.createMany({
    data: data.lineItems.map((item, index) => ({
      invoiceId: invoice.id,
      name: item.name,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate,
      position: index,
    })),
  });

  return invoice;
}
