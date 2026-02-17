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

  const createdClients: { id: string }[] = [];
  for (const clientData of clients) {
    const client = await prisma.client.upsert({
      where: {
        id: `client-${clientData.email}`,
      },
      update: {},
      create: {
        id: `client-${clientData.email}`,
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

  const rateCards = [
    { name: 'Senior Developer', rate: 150, unit: 'hour' },
    { name: 'Junior Developer', rate: 75, unit: 'hour' },
    { name: 'Project Management', rate: 100, unit: 'hour' },
    { name: 'Design Services', rate: 125, unit: 'hour' },
  ];

  for (const rateCardData of rateCards) {
    await prisma.rateCard.upsert({
      where: {
        id: `ratecard-${rateCardData.name.toLowerCase().replace(/ /g, '-')}`,
      },
      update: {},
      create: {
        id: `ratecard-${rateCardData.name.toLowerCase().replace(/ /g, '-')}`,
        workspaceId: workspace.id,
        categoryId: rateCardCategory.id,
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

    // Add line items
    await prisma.quoteLineItem.upsert({
      where: { id: `quote-item-${quote.id}` },
      update: { name: q.itemName, quantity: q.qty, rate: q.rate, amount: q.subtotal },
      create: {
        id: `quote-item-${quote.id}`,
        quoteId: quote.id,
        name: q.itemName,
        quantity: q.qty,
        rate: q.rate,
        amount: q.subtotal,
      },
    });

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
  const testInvoices = [
    { status: 'draft', title: 'Server Setup & Config', subtotal: 1200, itemName: 'DevOps Services', qty: 8, rate: 150 },
    { status: 'sent', title: 'Q1 Consulting Retainer', subtotal: 3800, itemName: 'Consulting', qty: 38, rate: 100 },
    { status: 'viewed', title: 'Design System Delivery', subtotal: 6500, itemName: 'Design Services', qty: 52, rate: 125 },
    { status: 'paid', title: 'Landing Page Build', subtotal: 4200, itemName: 'Web Development', qty: 24, rate: 175 },
    { status: 'overdue', title: 'Database Optimization', subtotal: 2750, itemName: 'Performance Tuning', qty: 11, rate: 250 },
    { status: 'voided', title: 'Cancelled Project Deposit', subtotal: 950, itemName: 'Project Deposit', qty: 1, rate: 950 },
  ];

  for (let i = 0; i < testInvoices.length; i++) {
    const inv = testInvoices[i]!;
    const client = createdClients[i % createdClients.length]!;
    const invoiceNumber = `INV-${String(100 + i).padStart(4, '0')}`;

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
        subtotal: inv.subtotal,
        total: inv.subtotal,
        amountPaid: inv.status === 'paid' ? inv.subtotal : 0,
        amountDue: inv.status === 'paid' ? 0 : inv.subtotal,
        dueDate: inv.status === 'overdue'
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
        issueDate: new Date(),
        dueDate: inv.status === 'overdue'
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: inv.subtotal,
        total: inv.subtotal,
        amountPaid: inv.status === 'paid' ? inv.subtotal : 0,
        amountDue: inv.status === 'paid' ? 0 : inv.subtotal,
        sentAt: inv.status !== 'draft' ? new Date() : null,
        viewedAt: ['viewed', 'paid', 'overdue'].includes(inv.status) ? new Date() : null,
        paidAt: inv.status === 'paid' ? new Date() : null,
        voidedAt: inv.status === 'voided' ? new Date() : null,
      },
    });

    await prisma.invoiceLineItem.upsert({
      where: { id: `invoice-item-standalone-${invoice.id}` },
      update: { name: inv.itemName, quantity: inv.qty, rate: inv.rate, amount: inv.subtotal },
      create: {
        id: `invoice-item-standalone-${invoice.id}`,
        invoiceId: invoice.id,
        name: inv.itemName,
        quantity: inv.qty,
        rate: inv.rate,
        amount: inv.subtotal,
      },
    });

    console.log(`Created/Updated invoice: ${invoice.invoiceNumber} (${inv.status})`);
  }

  console.log('Database seeding completed!');

  // Seed demo workspace
  await seedDemoWorkspace();
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
    update: {},
    create: {
      workspaceId: demoWorkspace.id,
      type: 'invoice',
      prefix: 'INV-',
      currentValue: 4,
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

  // Create demo rate card category
  const demoCategory = await prisma.rateCardCategory.upsert({
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

  // Create demo rate cards
  const demoRateCards = [
    { id: 'demo-rate-1', name: 'UI/UX Design', rate: 150, unit: 'hour', pricingType: 'hourly' },
    { id: 'demo-rate-2', name: 'Brand Identity', rate: 125, unit: 'hour', pricingType: 'hourly' },
    { id: 'demo-rate-3', name: 'Web Development', rate: 175, unit: 'hour', pricingType: 'hourly' },
    { id: 'demo-rate-4', name: 'Logo Design Package', rate: 2500, unit: 'project', pricingType: 'fixed' },
  ];

  for (const rateCardData of demoRateCards) {
    await prisma.rateCard.upsert({
      where: { id: rateCardData.id },
      update: {},
      create: {
        id: rateCardData.id,
        workspaceId: demoWorkspace.id,
        categoryId: demoCategory.id,
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

    // Ensure at least one line item exists for this quote
    const existingItems = await prisma.quoteLineItem.findMany({ where: { quoteId: quote.id }, take: 1 });
    if (existingItems.length > 0) {
      await prisma.quoteLineItem.update({
        where: { id: existingItems[0]!.id },
        data: { name: 'Design Services', quantity: 1, rate: quoteData.subtotal, amount: quoteData.subtotal },
      });
    } else {
      await prisma.quoteLineItem.create({
        data: {
          quoteId: quote.id,
          name: 'Design Services',
          quantity: 1,
          rate: quoteData.subtotal,
          amount: quoteData.subtotal,
          sortOrder: 0,
        },
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

    // Ensure at least one line item exists for this invoice
    const existingItems = await prisma.invoiceLineItem.findMany({ where: { invoiceId: invoice.id }, take: 1 });
    if (existingItems.length > 0) {
      await prisma.invoiceLineItem.update({
        where: { id: existingItems[0]!.id },
        data: { name: 'Services', quantity: 1, rate: invoiceData.subtotal, amount: invoiceData.subtotal },
      });
    } else {
      await prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          name: 'Services',
          quantity: 1,
          rate: invoiceData.subtotal,
          amount: invoiceData.subtotal,
          sortOrder: 0,
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
