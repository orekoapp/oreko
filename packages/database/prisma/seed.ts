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
    update: {},
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
    update: {},
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

  // Create sample quotes with different statuses
  const quoteStatuses = ['draft', 'sent', 'viewed', 'accepted', 'declined', 'converted'];

  for (let i = 0; i < quoteStatuses.length; i++) {
    const status = quoteStatuses[i]!;
    const client = createdClients[i % createdClients.length]!;

    const quote = await prisma.quote.upsert({
      where: {
        workspaceId_quoteNumber: {
          workspaceId: workspace.id,
          quoteNumber: `Q-${String(i + 1).padStart(4, '0')}`,
        },
      },
      update: { status },
      create: {
        workspaceId: workspace.id,
        clientId: client.id,
        quoteNumber: `Q-${String(i + 1).padStart(4, '0')}`,
        status,
        title: `Sample Quote - ${status}`,
        issueDate: new Date(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 1000,
        total: 1000,
        sentAt: status !== 'draft' ? new Date() : null,
        viewedAt: ['viewed', 'accepted', 'declined', 'converted'].includes(status) ? new Date() : null,
        acceptedAt: ['accepted', 'converted'].includes(status) ? new Date() : null,
        declinedAt: status === 'declined' ? new Date() : null,
      },
    });

    // Add line items
    await prisma.quoteLineItem.upsert({
      where: { id: `quote-item-${quote.id}` },
      update: {},
      create: {
        id: `quote-item-${quote.id}`,
        quoteId: quote.id,
        name: 'Development Services',
        quantity: 10,
        rate: 100,
        amount: 1000,
      },
    });

    console.log(`Created/Updated quote: ${quote.quoteNumber} (${status})`);

    // Create invoice for converted quote
    if (status === 'converted') {
      const invoice = await prisma.invoice.upsert({
        where: {
          workspaceId_invoiceNumber: {
            workspaceId: workspace.id,
            invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
          },
        },
        update: {},
        create: {
          workspaceId: workspace.id,
          clientId: client.id,
          quoteId: quote.id,
          invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
          status: 'sent',
          title: `Invoice from ${quote.title}`,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          subtotal: 1000,
          total: 1000,
          amountDue: 1000,
        },
      });

      await prisma.invoiceLineItem.upsert({
        where: { id: `invoice-item-${invoice.id}` },
        update: {},
        create: {
          id: `invoice-item-${invoice.id}`,
          invoiceId: invoice.id,
          name: 'Development Services',
          quantity: 10,
          rate: 100,
          amount: 1000,
        },
      });

      console.log(`Created/Updated invoice: ${invoice.invoiceNumber}`);
    }
  }

  // Create some additional invoices with different statuses
  const invoiceStatuses = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'voided'];

  for (let i = 0; i < invoiceStatuses.length; i++) {
    const status = invoiceStatuses[i]!;
    const client = createdClients[i % createdClients.length]!;
    const invoiceNumber = `INV-${String(100 + i).padStart(4, '0')}`;

    const invoice = await prisma.invoice.upsert({
      where: {
        workspaceId_invoiceNumber: {
          workspaceId: workspace.id,
          invoiceNumber,
        },
      },
      update: { status },
      create: {
        workspaceId: workspace.id,
        clientId: client.id,
        invoiceNumber,
        status,
        title: `Sample Invoice - ${status}`,
        issueDate: new Date(),
        dueDate: status === 'overdue'
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 500,
        total: 500,
        amountPaid: status === 'paid' ? 500 : 0,
        amountDue: status === 'paid' ? 0 : 500,
        sentAt: status !== 'draft' ? new Date() : null,
        viewedAt: ['viewed', 'paid', 'overdue'].includes(status) ? new Date() : null,
        paidAt: status === 'paid' ? new Date() : null,
        voidedAt: status === 'voided' ? new Date() : null,
      },
    });

    await prisma.invoiceLineItem.upsert({
      where: { id: `invoice-item-standalone-${invoice.id}` },
      update: {},
      create: {
        id: `invoice-item-standalone-${invoice.id}`,
        invoiceId: invoice.id,
        name: 'Consulting Services',
        quantity: 5,
        rate: 100,
        amount: 500,
      },
    });

    console.log(`Created/Updated invoice: ${invoice.invoiceNumber} (${status})`);
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
    update: {},
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
    update: {},
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
      update: {},
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

  for (const quoteData of demoQuotes) {
    await prisma.quote.upsert({
      where: {
        workspaceId_quoteNumber: {
          workspaceId: demoWorkspace.id,
          quoteNumber: quoteData.quoteNumber,
        },
      },
      update: { status: quoteData.status },
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

    // Add line items for each quote
    await prisma.quoteLineItem.upsert({
      where: { id: `${quoteData.id}-item-1` },
      update: {},
      create: {
        id: `${quoteData.id}-item-1`,
        quoteId: quoteData.id,
        name: 'Design Services',
        quantity: 1,
        rate: quoteData.subtotal,
        amount: quoteData.subtotal,
        sortOrder: 0,
      },
    });
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

  for (const invoiceData of demoInvoices) {
    await prisma.invoice.upsert({
      where: {
        workspaceId_invoiceNumber: {
          workspaceId: demoWorkspace.id,
          invoiceNumber: invoiceData.invoiceNumber,
        },
      },
      update: { status: invoiceData.status },
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

    // Add line items for each invoice
    await prisma.invoiceLineItem.upsert({
      where: { id: `${invoiceData.id}-item-1` },
      update: {},
      create: {
        id: `${invoiceData.id}-item-1`,
        invoiceId: invoiceData.id,
        name: 'Services',
        quantity: 1,
        rate: invoiceData.subtotal,
        amount: invoiceData.subtotal,
        sortOrder: 0,
      },
    });
  }
  console.log('Created/Updated demo invoices');

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
