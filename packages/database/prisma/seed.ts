import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Demo account configuration (must match apps/web/lib/demo/constants.ts)
const DEMO_CONFIG = {
  email: process.env.DEMO_USER_EMAIL || 'demo@quotecraft.demo',
  password: 'DemoPassword123!',
  displayName: 'Demo User',
  workspaceSlug: 'demo-workspace',
};

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('Seeding database...');

  // Create test users with different roles
  const testUsers = [
    { email: 'test@quotecraft.dev', password: 'TestPassword123!', name: 'Test User' },
    { email: 'owner@quotecraft.dev', password: 'OwnerPass123!', name: 'Owner User' },
    { email: 'admin@quotecraft.dev', password: 'AdminPass123!', name: 'Admin User' },
    { email: 'member@quotecraft.dev', password: 'MemberPass123!', name: 'Member User' },
    { email: 'viewer@quotecraft.dev', password: 'ViewerPass123!', name: 'Viewer User' },
  ];

  const users: Record<string, { id: string }> = {};

  for (const userData of testUsers) {
    const passwordHash = await hashPassword(userData.password);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { passwordHash, name: userData.name },
      create: {
        email: userData.email,
        passwordHash,
        name: userData.name,
        emailVerifiedAt: new Date(),
      },
    });
    users[userData.email] = user;
    console.log(`Created/Updated user: ${userData.email}`);
  }

  // Create a test workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'test-workspace' },
    update: { name: 'Test Workspace' },
    create: {
      name: 'Test Workspace',
      slug: 'test-workspace',
      ownerId: users['owner@quotecraft.dev']!.id,
      settings: {},
    },
  });
  console.log(`Created/Updated workspace: ${workspace.name}`);

  // Add workspace members with different roles
  const memberRoles = [
    { email: 'owner@quotecraft.dev', role: 'owner' },
    { email: 'admin@quotecraft.dev', role: 'admin' },
    { email: 'member@quotecraft.dev', role: 'member' },
    { email: 'viewer@quotecraft.dev', role: 'viewer' },
    { email: 'test@quotecraft.dev', role: 'owner' },
  ];

  for (const member of memberRoles) {
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: users[member.email]!.id,
        },
      },
      update: { role: member.role },
      create: {
        workspaceId: workspace.id,
        userId: users[member.email]!.id,
        role: member.role,
        acceptedAt: new Date(),
      },
    });
    console.log(`Added ${member.email} as ${member.role} to workspace`);
  }

  // Create business profile
  await prisma.businessProfile.upsert({
    where: { workspaceId: workspace.id },
    update: {
      businessName: 'Test Business',
      email: 'contact@testbusiness.com',
      phone: '+1-555-123-4567',
      currency: 'USD',
      timezone: 'America/New_York',
    },
    create: {
      workspaceId: workspace.id,
      businessName: 'Test Business',
      email: 'contact@testbusiness.com',
      phone: '+1-555-123-4567',
      currency: 'USD',
      timezone: 'America/New_York',
    },
  });
  console.log('Created/Updated business profile');

  // Create test clients
  const clients = [
    { name: 'Acme Corporation', email: 'acme@example.com', company: 'Acme Corp' },
    { name: 'John Doe', email: 'john@example.com', company: 'Doe Industries' },
    { name: 'Jane Smith', email: 'jane@example.com', company: 'Smith LLC' },
  ];

  const clientIds = ['client-acme', 'client-john', 'client-jane'];
  const createdClients: { id: string }[] = [];
  for (let ci = 0; ci < clients.length; ci++) {
    const clientData = clients[ci]!;
    const clientId = clientIds[ci]!;

    // Clean up old pattern-based IDs (e.g. client-jane@example.com)
    const oldId = `client-${clientData.email}`;
    const oldClient = await prisma.client.findUnique({ where: { id: oldId } });
    if (oldClient) {
      // Delete old client's references first, then the client
      await prisma.quoteLineItem.deleteMany({ where: { quote: { clientId: oldId } } });
      await prisma.invoiceLineItem.deleteMany({ where: { invoice: { clientId: oldId } } });
      await prisma.quote.deleteMany({ where: { clientId: oldId } });
      await prisma.invoice.deleteMany({ where: { clientId: oldId } });
      await prisma.project.deleteMany({ where: { clientId: oldId } });
      await prisma.client.delete({ where: { id: oldId } });
      console.log(`Cleaned up old client ID: ${oldId}`);
    }

    const client = await prisma.client.upsert({
      where: { id: clientId },
      update: { name: clientData.name, email: clientData.email, company: clientData.company },
      create: {
        id: clientId,
        workspaceId: workspace.id,
        name: clientData.name,
        email: clientData.email,
        company: clientData.company,
      },
    });
    createdClients.push(client);
    console.log(`Created/Updated client: ${clientData.name}`);
  }

  // Create rate cards
  const rateCardCategory = await prisma.rateCardCategory.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Development Services',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Development Services',
      color: '#3B82F6',
    },
  });

  // Create second rate card category (M10 fix)
  const consultingCategory = await prisma.rateCardCategory.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Consulting Services',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Consulting Services',
      color: '#8B5CF6',
    },
  });

  const rateCards = [
    { name: 'Senior Developer', rate: 150, unit: 'hour', categoryId: rateCardCategory.id },
    { name: 'Junior Developer', rate: 75, unit: 'hour', categoryId: rateCardCategory.id },
    { name: 'Project Management', rate: 100, unit: 'hour', categoryId: consultingCategory.id },
    { name: 'Design Services', rate: 125, unit: 'hour', categoryId: consultingCategory.id },
  ];

  for (const rateCardData of rateCards) {
    const rcId = `ratecard-${rateCardData.name.toLowerCase().replace(/ /g, '-')}`;
    await prisma.rateCard.upsert({
      where: { id: rcId },
      update: { categoryId: rateCardData.categoryId },
      create: {
        id: rcId,
        workspaceId: workspace.id,
        categoryId: rateCardData.categoryId,
        name: rateCardData.name,
        rate: rateCardData.rate,
        unit: rateCardData.unit,
        pricingType: 'hourly',
      },
    });
    console.log(`Created/Updated rate card: ${rateCardData.name}`);
  }

  // Create number sequences
  await prisma.numberSequence.upsert({
    where: {
      workspaceId_type: {
        workspaceId: workspace.id,
        type: 'quote',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      type: 'quote',
      prefix: 'Q-',
      currentValue: 0,
      padding: 4,
    },
  });

  await prisma.numberSequence.upsert({
    where: {
      workspaceId_type: {
        workspaceId: workspace.id,
        type: 'invoice',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      type: 'invoice',
      prefix: 'INV-',
      currentValue: 0,
      padding: 4,
    },
  });
  console.log('Created/Updated number sequences');

  // Create sample quotes with different statuses and varied amounts
  const testQuotes = [
    { status: 'draft', title: 'Website Revamp', subtotal: 2500, itemName: 'Frontend Development', qty: 25, rate: 100 },
    { status: 'sent', title: 'API Integration Project', subtotal: 5750, itemName: 'Backend Development', qty: 23, rate: 250 },
    { status: 'viewed', title: 'Mobile App Design', subtotal: 8400, itemName: 'UI/UX Design', qty: 56, rate: 150 },
    { status: 'accepted', title: 'E-commerce Platform', subtotal: 15000, itemName: 'Full-Stack Development', qty: 100, rate: 150 },
    { status: 'declined', title: 'Data Migration Service', subtotal: 3200, itemName: 'Data Engineering', qty: 16, rate: 200 },
    { status: 'converted', title: 'SaaS Dashboard Build', subtotal: 12800, itemName: 'Product Development', qty: 64, rate: 200 },
  ];

  for (let i = 0; i < testQuotes.length; i++) {
    const q = testQuotes[i]!;
    const client = createdClients[i % createdClients.length]!;

    const quote = await prisma.quote.upsert({
      where: {
        workspaceId_quoteNumber: {
          workspaceId: workspace.id,
          quoteNumber: `Q-${String(i + 1).padStart(4, '0')}`,
        },
      },
      update: {
        status: q.status,
        title: q.title,
        subtotal: q.subtotal,
        total: q.subtotal,
        settings: {}, // C03 fix: clear stale blocks so fallback reconstructs from lineItems
        sentAt: q.status !== 'draft' ? new Date() : null,
        viewedAt: ['viewed', 'accepted', 'declined', 'converted'].includes(q.status) ? new Date() : null,
        acceptedAt: ['accepted', 'converted'].includes(q.status) ? new Date() : null,
        declinedAt: q.status === 'declined' ? new Date() : null,
      },
      create: {
        workspaceId: workspace.id,
        clientId: client.id,
        quoteNumber: `Q-${String(i + 1).padStart(4, '0')}`,
        status: q.status,
        title: q.title,
        issueDate: new Date(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: q.subtotal,
        total: q.subtotal,
        sentAt: q.status !== 'draft' ? new Date() : null,
        viewedAt: ['viewed', 'accepted', 'declined', 'converted'].includes(q.status) ? new Date() : null,
        acceptedAt: ['accepted', 'converted'].includes(q.status) ? new Date() : null,
        declinedAt: q.status === 'declined' ? new Date() : null,
      },
    });

    // Add line items (C03 fix: add multiple items per quote for realistic preview)
    // Split the total into primary (70%) and secondary (30%) line items
    const primaryAmount = Math.round(q.subtotal * 0.7);
    const secondaryAmount = q.subtotal - primaryAmount;
    const primaryQty = Math.max(1, Math.round(q.qty * 0.7));
    const secondaryQty = Math.max(1, q.qty - primaryQty);
    const primaryRate = Math.round(primaryAmount / primaryQty);
    const secondaryRate = Math.round(secondaryAmount / secondaryQty);

    await prisma.quoteLineItem.upsert({
      where: { id: `quote-item-${quote.id}` },
      update: { name: q.itemName, quantity: primaryQty, rate: primaryRate, amount: primaryQty * primaryRate, sortOrder: 0 },
      create: {
        id: `quote-item-${quote.id}`,
        quoteId: quote.id,
        name: q.itemName,
        quantity: primaryQty,
        rate: primaryRate,
        amount: primaryQty * primaryRate,
        sortOrder: 0,
      },
    });
    await prisma.quoteLineItem.upsert({
      where: { id: `quote-item-2-${quote.id}` },
      update: { name: 'Project Management', quantity: secondaryQty, rate: secondaryRate, amount: secondaryQty * secondaryRate, sortOrder: 1 },
      create: {
        id: `quote-item-2-${quote.id}`,
        quoteId: quote.id,
        name: 'Project Management',
        quantity: secondaryQty,
        rate: secondaryRate,
        amount: secondaryQty * secondaryRate,
        sortOrder: 1,
      },
    });

    // Update totals to match actual line item sums
    const actualTotal = (primaryQty * primaryRate) + (secondaryQty * secondaryRate);
    if (actualTotal !== q.subtotal) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { subtotal: actualTotal, total: actualTotal },
      });
    }

    console.log(`Created/Updated quote: ${quote.quoteNumber} (${q.status})`);

    // Create invoice for converted quote
    if (q.status === 'converted') {
      const invoice = await prisma.invoice.upsert({
        where: {
          workspaceId_invoiceNumber: {
            workspaceId: workspace.id,
            invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
          },
        },
        update: {
          status: 'sent',
          title: `Invoice from ${q.title}`,
          subtotal: q.subtotal,
          total: q.subtotal,
          amountDue: q.subtotal,
        },
        create: {
          workspaceId: workspace.id,
          clientId: client.id,
          quoteId: quote.id,
          invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
          status: 'sent',
          title: `Invoice from ${q.title}`,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          subtotal: q.subtotal,
          total: q.subtotal,
          amountDue: q.subtotal,
        },
      });

      await prisma.invoiceLineItem.upsert({
        where: { id: `invoice-item-${invoice.id}` },
        update: { name: q.itemName, quantity: q.qty, rate: q.rate, amount: q.subtotal },
        create: {
          id: `invoice-item-${invoice.id}`,
          invoiceId: invoice.id,
          name: q.itemName,
          quantity: q.qty,
          rate: q.rate,
          amount: q.subtotal,
        },
      });

      console.log(`Created/Updated invoice: ${invoice.invoiceNumber}`);
    }
  }

  // Create some additional invoices with different statuses and varied amounts
  // Note: amounts are derived from qty * rate to ensure math correctness (C01 fix)
  const testInvoices = [
    { status: 'draft', title: 'Server Setup & Config', itemName: 'DevOps Services', qty: 8, rate: 150 },
    { status: 'sent', title: 'Q1 Consulting Retainer', itemName: 'Consulting', qty: 38, rate: 100 },
    { status: 'viewed', title: 'Design System Delivery', itemName: 'Design Services', qty: 52, rate: 125 },
    { status: 'paid', title: 'Landing Page Build', itemName: 'Web Development', qty: 24, rate: 175 },
    { status: 'overdue', title: 'Database Optimization', itemName: 'Performance Tuning', qty: 11, rate: 250 },
    { status: 'voided', title: 'Cancelled Project Deposit', itemName: 'Project Deposit', qty: 1, rate: 950 },
    { status: 'paid', title: 'SEO Audit & Report', itemName: 'SEO Consulting', qty: 10, rate: 200 },
    { status: 'paid', title: 'Logo & Branding Package', itemName: 'Brand Design', qty: 1, rate: 3500 },
  ];

  // Clean up old INV-01xx invoices from previous seed format (M02 fix)
  for (let old = 100; old < 110; old++) {
    const oldNum = `INV-${String(old).padStart(4, '0')}`;
    const oldInv = await prisma.invoice.findUnique({
      where: { workspaceId_invoiceNumber: { workspaceId: workspace.id, invoiceNumber: oldNum } },
      select: { id: true },
    });
    if (oldInv) {
      await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: oldInv.id } });
      await prisma.invoiceEvent.deleteMany({ where: { invoiceId: oldInv.id } });
      await prisma.invoice.delete({ where: { id: oldInv.id } });
      console.log(`Cleaned up old invoice: ${oldNum}`);
    }
  }

  for (let i = 0; i < testInvoices.length; i++) {
    const inv = testInvoices[i]!;
    const client = createdClients[i % createdClients.length]!;
    const subtotal = inv.qty * inv.rate;
    const invoiceNumber = `INV-${String(7 + i).padStart(4, '0')}`;

    // C04 fix: For overdue invoices, issue date must be before due date
    const overdueIssueDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
    const overdueDueDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const invoice = await prisma.invoice.upsert({
      where: {
        workspaceId_invoiceNumber: {
          workspaceId: workspace.id,
          invoiceNumber,
        },
      },
      update: {
        status: inv.status,
        title: inv.title,
        subtotal,
        total: subtotal,
        amountPaid: inv.status === 'paid' ? subtotal : 0,
        amountDue: inv.status === 'paid' ? 0 : subtotal,
        issueDate: inv.status === 'overdue' ? overdueIssueDate : new Date(),
        dueDate: inv.status === 'overdue'
          ? overdueDueDate
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sentAt: inv.status !== 'draft' ? new Date() : null,
        viewedAt: ['viewed', 'paid', 'overdue'].includes(inv.status) ? new Date() : null,
        paidAt: inv.status === 'paid' ? new Date() : null,
        voidedAt: inv.status === 'voided' ? new Date() : null,
      },
      create: {
        workspaceId: workspace.id,
        clientId: client.id,
        invoiceNumber,
        status: inv.status,
        title: inv.title,
        issueDate: inv.status === 'overdue' ? overdueIssueDate : new Date(),
        dueDate: inv.status === 'overdue'
          ? overdueDueDate
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal,
        total: subtotal,
        amountPaid: inv.status === 'paid' ? subtotal : 0,
        amountDue: inv.status === 'paid' ? 0 : subtotal,
        sentAt: inv.status !== 'draft' ? new Date() : null,
        viewedAt: ['viewed', 'paid', 'overdue'].includes(inv.status) ? new Date() : null,
        paidAt: inv.status === 'paid' ? new Date() : null,
        voidedAt: inv.status === 'voided' ? new Date() : null,
      },
    });

    // C01 fix: amount is always qty * rate
    await prisma.invoiceLineItem.upsert({
      where: { id: `invoice-item-standalone-${invoice.id}` },
      update: { name: inv.itemName, quantity: inv.qty, rate: inv.rate, amount: subtotal },
      create: {
        id: `invoice-item-standalone-${invoice.id}`,
        invoiceId: invoice.id,
        name: inv.itemName,
        quantity: inv.qty,
        rate: inv.rate,
        amount: subtotal,
      },
    });

    // Seed activity events for this invoice (H01 fix)
    const invoiceEvents: { eventType: string; createdAt: Date }[] = [];
    invoiceEvents.push({ eventType: 'created', createdAt: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000) });
    if (inv.status !== 'draft') {
      invoiceEvents.push({ eventType: 'sent', createdAt: new Date(Date.now() - (28 - i) * 24 * 60 * 60 * 1000) });
    }
    if (['viewed', 'paid', 'overdue'].includes(inv.status)) {
      invoiceEvents.push({ eventType: 'viewed', createdAt: new Date(Date.now() - (25 - i) * 24 * 60 * 60 * 1000) });
    }
    if (inv.status === 'paid') {
      invoiceEvents.push({ eventType: 'paid', createdAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000) });
    }

    // Clear existing events and re-create
    await prisma.invoiceEvent.deleteMany({ where: { invoiceId: invoice.id } });
    for (const evt of invoiceEvents) {
      await prisma.invoiceEvent.create({
        data: {
          invoiceId: invoice.id,
          eventType: evt.eventType,
          actorId: users['test@quotecraft.dev']!.id,
          actorType: 'user',
          metadata: {},
          createdAt: evt.createdAt,
        },
      });
    }

    console.log(`Created/Updated invoice: ${invoice.invoiceNumber} (${inv.status})`);
  }

  // Seed activity events for quotes (H01 fix)
  const allQuotes = await prisma.quote.findMany({ where: { workspaceId: workspace.id } });
  for (const quote of allQuotes) {
    const existingEvents = await prisma.quoteEvent.count({ where: { quoteId: quote.id } });
    if (existingEvents > 0) continue; // Don't re-seed if events exist

    const quoteEvents: { eventType: string; createdAt: Date }[] = [];
    quoteEvents.push({ eventType: 'created', createdAt: quote.createdAt });
    if (quote.sentAt) quoteEvents.push({ eventType: 'sent', createdAt: quote.sentAt });
    if (quote.viewedAt) quoteEvents.push({ eventType: 'viewed', createdAt: quote.viewedAt });
    if (quote.acceptedAt) quoteEvents.push({ eventType: 'accepted', createdAt: quote.acceptedAt });
    if (quote.declinedAt) quoteEvents.push({ eventType: 'declined', createdAt: quote.declinedAt });

    for (const evt of quoteEvents) {
      await prisma.quoteEvent.create({
        data: {
          quoteId: quote.id,
          eventType: evt.eventType,
          actorId: users['test@quotecraft.dev']!.id,
          actorType: 'user',
          metadata: {},
          createdAt: evt.createdAt,
        },
      });
    }
  }
  console.log('Seeded activity events for quotes and invoices');

  // Update number sequences to match seeded data
  await prisma.numberSequence.update({
    where: { workspaceId_type: { workspaceId: workspace.id, type: 'quote' } },
    data: { currentValue: 6 },
  });
  await prisma.numberSequence.update({
    where: { workspaceId_type: { workspaceId: workspace.id, type: 'invoice' } },
    data: { currentValue: 14 },
  });

  console.log('Database seeding completed!');

  // Seed demo workspace
  await seedDemoWorkspace();
}

/** Helper: Generate realistic multi-item line items for demo quotes */
function getDemoQuoteLineItems(title: string, subtotal: number) {
  const itemSets: Record<string, { name: string; description: string; qty: number; rate: number }[]> = {
    'Website Redesign Proposal': [
      { name: 'UI/UX Design', description: 'Homepage and key page wireframes & visual design', qty: 40, rate: 150 },
      { name: 'Frontend Development', description: 'React/Next.js implementation with responsive layouts', qty: 60, rate: 175 },
      { name: 'Content Migration', description: 'Migrating existing content to new design', qty: 12, rate: 100 },
    ],
    'E-commerce Platform Design': [
      { name: 'Product Page Design', description: 'Full product listing and detail page design', qty: 48, rate: 150 },
      { name: 'Checkout Flow Design', description: 'Cart, checkout, and payment page UX', qty: 32, rate: 175 },
      { name: 'Admin Dashboard Design', description: 'Inventory and order management interface', qty: 56, rate: 150 },
    ],
    'Brand Identity Package': [
      { name: 'Logo Design', description: 'Primary logo with 3 concepts and revisions', qty: 1, rate: 3500 },
      { name: 'Brand Guidelines', description: 'Typography, color palette, usage rules document', qty: 1, rate: 2000 },
      { name: 'Collateral Design', description: 'Business card, letterhead, and email signature', qty: 1, rate: 1500 },
    ],
    'Mobile App UI Design': [
      { name: 'App UI Design', description: 'Screen designs for 20+ views', qty: 48, rate: 150 },
      { name: 'Prototype & Testing', description: 'Interactive prototype with usability testing', qty: 24, rate: 125 },
    ],
    'Annual Retainer Package': [
      { name: 'Monthly Design Support', description: '40 hours/month of on-demand design work', qty: 480, rate: 100 },
      { name: 'Dedicated Project Manager', description: 'Coordination and communication', qty: 120, rate: 50 },
    ],
  };

  const items = itemSets[title];
  if (items) return items;

  // Fallback: split into two items
  const primaryRate = 150;
  const primaryQty = Math.max(1, Math.round((subtotal * 0.7) / primaryRate));
  const secondaryRate = 100;
  const secondaryQty = Math.max(1, Math.round((subtotal * 0.3) / secondaryRate));
  return [
    { name: 'Design Services', description: 'Visual design and prototyping', qty: primaryQty, rate: primaryRate },
    { name: 'Project Management', description: 'Coordination and delivery', qty: secondaryQty, rate: secondaryRate },
  ];
}

/**
 * Seed the demo workspace with sample data for the public demo
 */
async function seedDemoWorkspace() {
  console.log('Seeding demo workspace...');

  // Create or update demo user
  const demoPasswordHash = await hashPassword(DEMO_CONFIG.password);

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_CONFIG.email },
    update: { passwordHash: demoPasswordHash, name: DEMO_CONFIG.displayName },
    create: {
      email: DEMO_CONFIG.email,
      passwordHash: demoPasswordHash,
      name: DEMO_CONFIG.displayName,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`Created/Updated demo user: ${DEMO_CONFIG.email}`);

  // Create demo workspace
  const demoWorkspace = await prisma.workspace.upsert({
    where: { slug: DEMO_CONFIG.workspaceSlug },
    update: {
      name: 'Demo Workspace',
      settings: {
        isDemo: true,
        onboardingCompleted: true,
        currency: 'USD',
        timezone: 'America/New_York',
      },
    },
    create: {
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
  console.log(`Created/Updated demo workspace: ${demoWorkspace.name}`);

  // Add demo user as workspace member
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

  // Create business profile for demo
  await prisma.businessProfile.upsert({
    where: { workspaceId: demoWorkspace.id },
    update: {
      businessName: 'Acme Design Studio',
      email: 'hello@acmedesign.demo',
      phone: '+1 (555) 123-4567',
      website: 'https://acmedesign.demo',
      currency: 'USD',
      timezone: 'America/New_York',
    },
    create: {
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
  console.log('Created/Updated demo business profile');

  // Create number sequences for demo
  await prisma.numberSequence.upsert({
    where: {
      workspaceId_type: {
        workspaceId: demoWorkspace.id,
        type: 'quote',
      },
    },
    update: {},
    create: {
      workspaceId: demoWorkspace.id,
      type: 'quote',
      prefix: 'Q-',
      currentValue: 5,
      padding: 4,
    },
  });

  await prisma.numberSequence.upsert({
    where: {
      workspaceId_type: {
        workspaceId: demoWorkspace.id,
        type: 'invoice',
      },
    },
    update: { currentValue: 7 },
    create: {
      workspaceId: demoWorkspace.id,
      type: 'invoice',
      prefix: 'INV-',
      currentValue: 7,
      padding: 4,
    },
  });

  // Create demo clients
  const demoClients = [
    { id: 'demo-client-1', name: 'TechStart Inc.', email: 'projects@techstart.demo', company: 'TechStart Inc.', phone: '+1 (555) 234-5678' },
    { id: 'demo-client-2', name: 'Global Retail Co.', email: 'procurement@globalretail.demo', company: 'Global Retail Co.', phone: '+1 (555) 345-6789' },
    { id: 'demo-client-3', name: 'Sarah Johnson', email: 'sarah.j@email.demo', company: 'Johnson Consulting', phone: '+1 (555) 456-7890' },
    { id: 'demo-client-4', name: 'Marcus Chen', email: 'marcus@chenventures.demo', company: 'Chen Ventures' },
    { id: 'demo-client-5', name: 'Creative Agency LLC', email: 'hello@creativeagency.demo', company: 'Creative Agency LLC', phone: '+1 (555) 567-8901' },
  ];

  for (const clientData of demoClients) {
    await prisma.client.upsert({
      where: { id: clientData.id },
      update: { name: clientData.name, email: clientData.email, company: clientData.company },
      create: {
        id: clientData.id,
        workspaceId: demoWorkspace.id,
        name: clientData.name,
        email: clientData.email,
        company: clientData.company,
        phone: clientData.phone,
      },
    });
  }
  console.log('Created/Updated demo clients');

  // Create demo rate card categories (M10 fix: multiple categories)
  const demoDesignCategory = await prisma.rateCardCategory.upsert({
    where: {
      workspaceId_name: {
        workspaceId: demoWorkspace.id,
        name: 'Design Services',
      },
    },
    update: {},
    create: {
      workspaceId: demoWorkspace.id,
      name: 'Design Services',
      color: '#3B82F6',
    },
  });

  const demoDevCategory = await prisma.rateCardCategory.upsert({
    where: {
      workspaceId_name: {
        workspaceId: demoWorkspace.id,
        name: 'Development Services',
      },
    },
    update: {},
    create: {
      workspaceId: demoWorkspace.id,
      name: 'Development Services',
      color: '#10B981',
    },
  });

  // Create demo rate cards
  const demoRateCards = [
    { id: 'demo-rate-1', name: 'UI/UX Design', rate: 150, unit: 'hour', pricingType: 'hourly', categoryId: demoDesignCategory.id },
    { id: 'demo-rate-2', name: 'Brand Identity', rate: 125, unit: 'hour', pricingType: 'hourly', categoryId: demoDesignCategory.id },
    { id: 'demo-rate-3', name: 'Web Development', rate: 175, unit: 'hour', pricingType: 'hourly', categoryId: demoDevCategory.id },
    { id: 'demo-rate-4', name: 'Logo Design Package', rate: 2500, unit: 'project', pricingType: 'fixed', categoryId: demoDesignCategory.id },
    { id: 'demo-rate-5', name: 'Backend API Development', rate: 200, unit: 'hour', pricingType: 'hourly', categoryId: demoDevCategory.id },
    { id: 'demo-rate-6', name: 'DevOps & Deployment', rate: 175, unit: 'hour', pricingType: 'hourly', categoryId: demoDevCategory.id },
  ];

  for (const rateCardData of demoRateCards) {
    await prisma.rateCard.upsert({
      where: { id: rateCardData.id },
      update: { categoryId: rateCardData.categoryId },
      create: {
        id: rateCardData.id,
        workspaceId: demoWorkspace.id,
        categoryId: rateCardData.categoryId,
        name: rateCardData.name,
        rate: rateCardData.rate,
        unit: rateCardData.unit,
        pricingType: rateCardData.pricingType,
      },
    });
  }
  console.log('Created/Updated demo rate cards');

  // Create demo quotes with various statuses
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const demoQuotes = [
    {
      id: 'demo-quote-1',
      quoteNumber: 'Q-0001',
      clientId: 'demo-client-1',
      title: 'Website Redesign Proposal',
      status: 'draft',
      issueDate: now,
      expirationDate: thirtyDaysFromNow,
      subtotal: 17200,
      total: 17200,
    },
    {
      id: 'demo-quote-2',
      quoteNumber: 'Q-0002',
      clientId: 'demo-client-2',
      title: 'E-commerce Platform Design',
      status: 'sent',
      issueDate: sevenDaysAgo,
      expirationDate: thirtyDaysFromNow,
      sentAt: sevenDaysAgo,
      subtotal: 35400,
      total: 35400,
    },
    {
      id: 'demo-quote-3',
      quoteNumber: 'Q-0003',
      clientId: 'demo-client-3',
      title: 'Brand Identity Package',
      status: 'viewed',
      issueDate: sevenDaysAgo,
      expirationDate: thirtyDaysFromNow,
      sentAt: sevenDaysAgo,
      viewedAt: new Date(sevenDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
      subtotal: 7000,
      total: 7000,
    },
    {
      id: 'demo-quote-4',
      quoteNumber: 'Q-0004',
      clientId: 'demo-client-4',
      title: 'Mobile App UI Design',
      status: 'accepted',
      issueDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      expirationDate: thirtyDaysFromNow,
      sentAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      acceptedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      subtotal: 12000,
      total: 12000,
    },
    {
      id: 'demo-quote-5',
      quoteNumber: 'Q-0005',
      clientId: 'demo-client-5',
      title: 'Annual Retainer Package',
      status: 'declined',
      issueDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      sentAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      declinedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      subtotal: 60000,
      total: 60000,
    },
  ];

  const demoQuoteIds: Record<string, string> = {};
  for (const quoteData of demoQuotes) {
    const quote = await prisma.quote.upsert({
      where: {
        workspaceId_quoteNumber: {
          workspaceId: demoWorkspace.id,
          quoteNumber: quoteData.quoteNumber,
        },
      },
      update: {
        status: quoteData.status,
        title: quoteData.title,
        subtotal: quoteData.subtotal,
        total: quoteData.total,
        settings: {}, // C03 fix: clear stale blocks
        sentAt: quoteData.sentAt ?? null,
        viewedAt: quoteData.viewedAt ?? null,
        acceptedAt: quoteData.acceptedAt ?? null,
        declinedAt: quoteData.declinedAt ?? null,
      },
      create: {
        id: quoteData.id,
        workspaceId: demoWorkspace.id,
        clientId: quoteData.clientId,
        quoteNumber: quoteData.quoteNumber,
        title: quoteData.title,
        status: quoteData.status,
        issueDate: quoteData.issueDate,
        expirationDate: quoteData.expirationDate,
        sentAt: quoteData.sentAt,
        viewedAt: quoteData.viewedAt,
        acceptedAt: quoteData.acceptedAt,
        declinedAt: quoteData.declinedAt,
        subtotal: quoteData.subtotal,
        total: quoteData.total,
      },
    });
    demoQuoteIds[quoteData.id] = quote.id;

    // C03 fix: Add multiple realistic line items per quote
    // Clear existing line items and recreate with proper math
    await prisma.quoteLineItem.deleteMany({ where: { quoteId: quote.id } });
    const demoLineItems = getDemoQuoteLineItems(quoteData.title, quoteData.subtotal);
    let lineItemTotal = 0;
    for (let li = 0; li < demoLineItems.length; li++) {
      const item = demoLineItems[li]!;
      const amount = item.qty * item.rate;
      lineItemTotal += amount;
      await prisma.quoteLineItem.create({
        data: {
          quoteId: quote.id,
          name: item.name,
          description: item.description,
          quantity: item.qty,
          rate: item.rate,
          amount,
          sortOrder: li,
        },
      });
    }
    // Update quote totals to match actual line items
    if (lineItemTotal !== quoteData.subtotal) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { subtotal: lineItemTotal, total: lineItemTotal },
      });
    }
  }
  console.log('Created/Updated demo quotes');

  // Create demo invoices
  const demoInvoices = [
    {
      id: 'demo-invoice-1',
      invoiceNumber: 'INV-0001',
      clientId: 'demo-client-1',
      title: 'Previous Project - Final Payment',
      status: 'paid',
      issueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      paidAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      subtotal: 4500,
      total: 4500,
      amountPaid: 4500,
      amountDue: 0,
    },
    {
      id: 'demo-invoice-2',
      invoiceNumber: 'INV-0002',
      clientId: 'demo-client-3',
      title: 'Consulting Services - January',
      status: 'sent',
      issueDate: sevenDaysAgo,
      dueDate: thirtyDaysFromNow,
      sentAt: sevenDaysAgo,
      subtotal: 1800,
      total: 1800,
      amountPaid: 0,
      amountDue: 1800,
    },
    {
      id: 'demo-invoice-3',
      invoiceNumber: 'INV-0003',
      clientId: 'demo-client-2',
      title: 'Phase 1 Design Delivery',
      status: 'overdue',
      issueDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      sentAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      subtotal: 8500,
      total: 8500,
      amountPaid: 0,
      amountDue: 8500,
    },
    {
      id: 'demo-invoice-4',
      invoiceNumber: 'INV-0004',
      clientId: 'demo-client-4',
      title: 'Mobile App Design - Milestone 1',
      status: 'draft',
      issueDate: now,
      dueDate: thirtyDaysFromNow,
      subtotal: 3600,
      total: 3600,
      amountPaid: 0,
      amountDue: 3600,
    },
    // H02 fix: Add more paid invoices for different clients to show revenue
    {
      id: 'demo-invoice-5',
      invoiceNumber: 'INV-0005',
      clientId: 'demo-client-2',
      title: 'E-commerce Design Phase 1',
      status: 'paid',
      issueDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      subtotal: 12500,
      total: 12500,
      amountPaid: 12500,
      amountDue: 0,
    },
    {
      id: 'demo-invoice-6',
      invoiceNumber: 'INV-0006',
      clientId: 'demo-client-3',
      title: 'Brand Guidelines Document',
      status: 'paid',
      issueDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      paidAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      subtotal: 3500,
      total: 3500,
      amountPaid: 3500,
      amountDue: 0,
    },
    {
      id: 'demo-invoice-7',
      invoiceNumber: 'INV-0007',
      clientId: 'demo-client-5',
      title: 'Monthly Design Retainer - Dec',
      status: 'paid',
      issueDate: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      paidAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
      subtotal: 5000,
      total: 5000,
      amountPaid: 5000,
      amountDue: 0,
    },
  ];

  const demoInvoiceIds: Record<string, string> = {};
  for (const invoiceData of demoInvoices) {
    const invoice = await prisma.invoice.upsert({
      where: {
        workspaceId_invoiceNumber: {
          workspaceId: demoWorkspace.id,
          invoiceNumber: invoiceData.invoiceNumber,
        },
      },
      update: {
        status: invoiceData.status,
        title: invoiceData.title,
        subtotal: invoiceData.subtotal,
        total: invoiceData.total,
        amountPaid: invoiceData.amountPaid,
        amountDue: invoiceData.amountDue,
        sentAt: invoiceData.sentAt ?? null,
        viewedAt: invoiceData.viewedAt ?? null,
        paidAt: invoiceData.paidAt ?? null,
      },
      create: {
        id: invoiceData.id,
        workspaceId: demoWorkspace.id,
        clientId: invoiceData.clientId,
        invoiceNumber: invoiceData.invoiceNumber,
        title: invoiceData.title,
        status: invoiceData.status,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        sentAt: invoiceData.sentAt,
        viewedAt: invoiceData.viewedAt,
        paidAt: invoiceData.paidAt,
        subtotal: invoiceData.subtotal,
        total: invoiceData.total,
        amountPaid: invoiceData.amountPaid,
        amountDue: invoiceData.amountDue,
      },
    });
    demoInvoiceIds[invoiceData.id] = invoice.id;

    // C01 fix: recreate line items with correct math
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: invoice.id } });
    // Split into 2 items for realism
    const invPrimaryRate = 150;
    const invPrimaryQty = Math.max(1, Math.round((invoiceData.subtotal * 0.65) / invPrimaryRate));
    const invPrimaryAmt = invPrimaryQty * invPrimaryRate;
    const invSecondaryAmt = invoiceData.subtotal - invPrimaryAmt;
    const invSecondaryRate = 100;
    const invSecondaryQty = Math.max(1, Math.round(invSecondaryAmt / invSecondaryRate));
    const invActualSecondaryAmt = invSecondaryQty * invSecondaryRate;

    await prisma.invoiceLineItem.create({
      data: {
        invoiceId: invoice.id,
        name: invoiceData.title.includes('Design') ? 'Design Services' : 'Professional Services',
        quantity: invPrimaryQty,
        rate: invPrimaryRate,
        amount: invPrimaryAmt,
        sortOrder: 0,
      },
    });
    if (invActualSecondaryAmt > 0) {
      await prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          name: 'Project Coordination',
          quantity: invSecondaryQty,
          rate: invSecondaryRate,
          amount: invActualSecondaryAmt,
          sortOrder: 1,
        },
      });
    }
    // Update totals to match actual line items
    const invActualTotal = invPrimaryAmt + invActualSecondaryAmt;
    if (invActualTotal !== invoiceData.subtotal) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          subtotal: invActualTotal,
          total: invActualTotal,
          amountPaid: invoiceData.status === 'paid' ? invActualTotal : invoiceData.amountPaid,
          amountDue: invoiceData.status === 'paid' ? 0 : invActualTotal,
        },
      });
    }
  }
  console.log('Created/Updated demo invoices');

  // Create demo projects
  const demoProjects = [
    {
      id: 'demo-project-1',
      clientId: 'demo-client-1',
      name: 'Website Redesign 2024',
      description: 'Complete overhaul of the company website including new branding, UX improvements, and mobile responsiveness.',
      isActive: true,
    },
    {
      id: 'demo-project-2',
      clientId: 'demo-client-2',
      name: 'E-commerce Platform',
      description: 'Building a new e-commerce platform with inventory management, payment processing, and customer portal.',
      isActive: true,
    },
    {
      id: 'demo-project-3',
      clientId: 'demo-client-3',
      name: 'Brand Identity Package',
      description: 'Logo design, brand guidelines, and marketing collateral for Johnson Consulting.',
      isActive: true,
    },
    {
      id: 'demo-project-4',
      clientId: 'demo-client-4',
      name: 'Mobile App MVP',
      description: 'Design and development of a mobile app MVP for Chen Ventures startup.',
      isActive: true,
    },
    {
      id: 'demo-project-5',
      clientId: 'demo-client-5',
      name: 'Annual Retainer 2023',
      description: 'Ongoing design and development support for Creative Agency LLC.',
      isActive: false,
    },
  ];

  for (const projectData of demoProjects) {
    await prisma.project.upsert({
      where: { id: projectData.id },
      update: {},
      create: {
        id: projectData.id,
        workspaceId: demoWorkspace.id,
        clientId: projectData.clientId,
        name: projectData.name,
        description: projectData.description,
        isActive: projectData.isActive,
      },
    });
  }
  console.log('Created/Updated demo projects');

  // Link existing quotes to projects (use actual IDs from upsert results)
  const quoteProjectLinks = [
    { quoteKey: 'demo-quote-1', projectId: 'demo-project-1' },
    { quoteKey: 'demo-quote-2', projectId: 'demo-project-2' },
    { quoteKey: 'demo-quote-3', projectId: 'demo-project-3' },
    { quoteKey: 'demo-quote-4', projectId: 'demo-project-4' },
    { quoteKey: 'demo-quote-5', projectId: 'demo-project-5' },
  ];
  for (const link of quoteProjectLinks) {
    const actualId = demoQuoteIds[link.quoteKey];
    if (actualId) {
      await prisma.quote.update({
        where: { id: actualId },
        data: { projectId: link.projectId },
      });
    }
  }
  console.log('Linked quotes to projects');

  // Link existing invoices to projects (use actual IDs from upsert results)
  const invoiceProjectLinks = [
    { invoiceKey: 'demo-invoice-1', projectId: 'demo-project-1' },
    { invoiceKey: 'demo-invoice-2', projectId: 'demo-project-3' },
    { invoiceKey: 'demo-invoice-3', projectId: 'demo-project-2' },
    { invoiceKey: 'demo-invoice-4', projectId: 'demo-project-4' },
  ];
  for (const link of invoiceProjectLinks) {
    const actualId = demoInvoiceIds[link.invoiceKey];
    if (actualId) {
      await prisma.invoice.update({
        where: { id: actualId },
        data: { projectId: link.projectId },
      });
    }
  }
  console.log('Linked invoices to projects');

  // Seed activity events for demo quotes (H01 fix)
  const allDemoQuotes = await prisma.quote.findMany({ where: { workspaceId: demoWorkspace.id } });
  for (const quote of allDemoQuotes) {
    const existingEvents = await prisma.quoteEvent.count({ where: { quoteId: quote.id } });
    if (existingEvents > 0) continue;

    const events: { eventType: string; createdAt: Date }[] = [];
    events.push({ eventType: 'created', createdAt: quote.createdAt });
    if (quote.sentAt) events.push({ eventType: 'sent', createdAt: quote.sentAt });
    if (quote.viewedAt) events.push({ eventType: 'viewed', createdAt: quote.viewedAt });
    if (quote.acceptedAt) events.push({ eventType: 'accepted', createdAt: quote.acceptedAt });
    if (quote.declinedAt) events.push({ eventType: 'declined', createdAt: quote.declinedAt });

    for (const evt of events) {
      await prisma.quoteEvent.create({
        data: {
          quoteId: quote.id,
          eventType: evt.eventType,
          actorId: demoUser.id,
          actorType: 'user',
          metadata: {},
          createdAt: evt.createdAt,
        },
      });
    }
  }

  // Seed activity events for demo invoices (H01 fix)
  const allDemoInvoices = await prisma.invoice.findMany({ where: { workspaceId: demoWorkspace.id } });
  for (const invoice of allDemoInvoices) {
    const existingEvents = await prisma.invoiceEvent.count({ where: { invoiceId: invoice.id } });
    if (existingEvents > 0) continue;

    const events: { eventType: string; createdAt: Date }[] = [];
    events.push({ eventType: 'created', createdAt: invoice.createdAt });
    if (invoice.sentAt) events.push({ eventType: 'sent', createdAt: invoice.sentAt });
    if (invoice.viewedAt) events.push({ eventType: 'viewed', createdAt: invoice.viewedAt });
    if (invoice.paidAt) events.push({ eventType: 'paid', createdAt: invoice.paidAt });

    for (const evt of events) {
      await prisma.invoiceEvent.create({
        data: {
          invoiceId: invoice.id,
          eventType: evt.eventType,
          actorId: demoUser.id,
          actorType: 'user',
          metadata: {},
          createdAt: evt.createdAt,
        },
      });
    }
  }
  console.log('Seeded demo activity events');

  // Clean up stale test data (manually created during testing)
  // Remove any quotes/invoices with "Untitled" titles or $0 amounts
  const staleQuotes = await prisma.quote.findMany({
    where: {
      workspaceId: demoWorkspace.id,
      OR: [
        { title: { contains: 'Untitled' } },
        { total: 0 },
      ],
      id: { notIn: Object.values(demoQuoteIds) },
    },
    select: { id: true, quoteNumber: true },
  });

  for (const sq of staleQuotes) {
    await prisma.quoteLineItem.deleteMany({ where: { quoteId: sq.id } });
    await prisma.quote.delete({ where: { id: sq.id } });
    console.log(`Cleaned up stale quote: ${sq.quoteNumber}`);
  }

  const staleInvoices = await prisma.invoice.findMany({
    where: {
      workspaceId: demoWorkspace.id,
      OR: [
        { title: { contains: 'Untitled' } },
        { total: 0 },
      ],
      id: { notIn: Object.values(demoInvoiceIds) },
    },
    select: { id: true, invoiceNumber: true },
  });

  for (const si of staleInvoices) {
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: si.id } });
    await prisma.invoice.delete({ where: { id: si.id } });
    console.log(`Cleaned up stale invoice: ${si.invoiceNumber}`);
  }

  console.log('Demo workspace seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
