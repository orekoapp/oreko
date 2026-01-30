import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
