/**
 * E2E Test Data Seeding Utility
 *
 * This script seeds the database with test data required for E2E tests.
 * It should be run before the E2E test suite.
 *
 * Usage: npx ts-node apps/web/e2e/utils/seed-e2e-data.ts
 * Or: pnpm e2e:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Must match global-setup.ts and auth.fixture.ts
const E2E_TEST_USER = {
  email: process.env.E2E_TEST_USER_EMAIL || 'e2e-test@quotecraft.dev',
  password: process.env.E2E_TEST_USER_PASSWORD || 'TestPassword123!',
  name: process.env.E2E_TEST_USER_NAME || 'E2E Test User',
};

// Must match role-permissions.spec.ts
const ROLE_TEST_USERS = [
  { email: 'owner@quotecraft.dev', password: 'OwnerPass123!', name: 'Owner User', role: 'owner' },
  { email: 'admin@quotecraft.dev', password: 'AdminPass123!', name: 'Admin User', role: 'admin' },
  { email: 'member@quotecraft.dev', password: 'MemberPass123!', name: 'Member User', role: 'member' },
  { email: 'viewer@quotecraft.dev', password: 'ViewerPass123!', name: 'Viewer User', role: 'viewer' },
];

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function seedE2ETestData() {
  console.log('Seeding E2E test data...');

  // Create E2E test user
  const passwordHash = await hashPassword(E2E_TEST_USER.password);
  const e2eUser = await prisma.user.upsert({
    where: { email: E2E_TEST_USER.email },
    update: { passwordHash, name: E2E_TEST_USER.name },
    create: {
      email: E2E_TEST_USER.email,
      passwordHash,
      name: E2E_TEST_USER.name,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`Created/Updated E2E test user: ${E2E_TEST_USER.email}`);

  // Create workspace for E2E test user
  const e2eWorkspace = await prisma.workspace.upsert({
    where: { slug: 'e2e-test-workspace' },
    update: {},
    create: {
      name: 'E2E Test Workspace',
      slug: 'e2e-test-workspace',
      ownerId: e2eUser.id,
      settings: {
        onboardingCompleted: true,
        currency: 'USD',
        timezone: 'America/New_York',
      },
    },
  });
  console.log(`Created/Updated E2E workspace: ${e2eWorkspace.name}`);

  // Add E2E user as workspace member
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: e2eWorkspace.id,
        userId: e2eUser.id,
      },
    },
    update: { role: 'owner' },
    create: {
      workspaceId: e2eWorkspace.id,
      userId: e2eUser.id,
      role: 'owner',
      acceptedAt: new Date(),
    },
  });

  // Create business profile
  await prisma.businessProfile.upsert({
    where: { workspaceId: e2eWorkspace.id },
    update: {},
    create: {
      workspaceId: e2eWorkspace.id,
      businessName: 'E2E Test Business',
      email: 'contact@e2e-test.dev',
      phone: '+1-555-E2E-TEST',
      currency: 'USD',
      timezone: 'America/New_York',
    },
  });
  console.log('Created/Updated business profile');

  // Create number sequences
  await prisma.numberSequence.upsert({
    where: {
      workspaceId_type: {
        workspaceId: e2eWorkspace.id,
        type: 'quote',
      },
    },
    update: {},
    create: {
      workspaceId: e2eWorkspace.id,
      type: 'quote',
      prefix: 'Q-',
      currentValue: 100,
      padding: 4,
    },
  });

  await prisma.numberSequence.upsert({
    where: {
      workspaceId_type: {
        workspaceId: e2eWorkspace.id,
        type: 'invoice',
      },
    },
    update: {},
    create: {
      workspaceId: e2eWorkspace.id,
      type: 'invoice',
      prefix: 'INV-',
      currentValue: 100,
      padding: 4,
    },
  });
  console.log('Created/Updated number sequences');

  // Create test clients
  const testClients = [
    { id: 'e2e-client-1', name: 'E2E Test Client', email: 'client@e2e-test.dev', company: 'E2E Corp' },
    { id: 'e2e-client-2', name: 'John Doe', email: 'john@e2e-test.dev', company: 'Doe Industries' },
    { id: 'e2e-client-3', name: 'Jane Smith', email: 'jane@e2e-test.dev', company: 'Smith LLC' },
  ];

  for (const clientData of testClients) {
    await prisma.client.upsert({
      where: { id: clientData.id },
      update: {},
      create: {
        id: clientData.id,
        workspaceId: e2eWorkspace.id,
        name: clientData.name,
        email: clientData.email,
        company: clientData.company,
      },
    });
  }
  console.log('Created/Updated test clients');

  // Create rate card category
  const category = await prisma.rateCardCategory.upsert({
    where: {
      workspaceId_name: {
        workspaceId: e2eWorkspace.id,
        name: 'E2E Services',
      },
    },
    update: {},
    create: {
      workspaceId: e2eWorkspace.id,
      name: 'E2E Services',
      color: '#3B82F6',
    },
  });

  // Create test rate cards
  const rateCards = [
    { id: 'e2e-rate-1', name: 'Development', rate: 150, unit: 'hour' },
    { id: 'e2e-rate-2', name: 'Design', rate: 125, unit: 'hour' },
    { id: 'e2e-rate-3', name: 'Consulting', rate: 175, unit: 'hour' },
  ];

  for (const rateCardData of rateCards) {
    await prisma.rateCard.upsert({
      where: { id: rateCardData.id },
      update: {},
      create: {
        id: rateCardData.id,
        workspaceId: e2eWorkspace.id,
        categoryId: category.id,
        name: rateCardData.name,
        rate: rateCardData.rate,
        unit: rateCardData.unit,
        pricingType: 'hourly',
      },
    });
  }
  console.log('Created/Updated test rate cards');

  // Create quotes with different statuses for state matrix tests
  const quoteStatuses = ['draft', 'sent', 'viewed', 'accepted', 'declined', 'converted'];
  const now = new Date();

  for (let i = 0; i < quoteStatuses.length; i++) {
    const status = quoteStatuses[i]!;
    const quoteNumber = `Q-${String(200 + i).padStart(4, '0')}`;

    const quote = await prisma.quote.upsert({
      where: {
        workspaceId_quoteNumber: {
          workspaceId: e2eWorkspace.id,
          quoteNumber,
        },
      },
      update: { status },
      create: {
        workspaceId: e2eWorkspace.id,
        clientId: testClients[i % testClients.length]!.id,
        quoteNumber,
        status,
        title: `E2E Test Quote - ${status}`,
        issueDate: now,
        expirationDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 1000,
        total: 1000,
        sentAt: status !== 'draft' ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) : null,
        viewedAt: ['viewed', 'accepted', 'declined', 'converted'].includes(status) ? new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) : null,
        acceptedAt: ['accepted', 'converted'].includes(status) ? new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) : null,
        declinedAt: status === 'declined' ? new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) : null,
      },
    });

    // Add line items
    await prisma.quoteLineItem.upsert({
      where: { id: `e2e-quote-item-${quote.id}` },
      update: {},
      create: {
        id: `e2e-quote-item-${quote.id}`,
        quoteId: quote.id,
        name: 'E2E Test Service',
        quantity: 10,
        rate: 100,
        amount: 1000,
      },
    });

    console.log(`Created/Updated quote: ${quoteNumber} (${status})`);
  }

  // Create invoices with different statuses
  const invoiceStatuses = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'voided'];

  for (let i = 0; i < invoiceStatuses.length; i++) {
    const status = invoiceStatuses[i]!;
    const invoiceNumber = `INV-${String(200 + i).padStart(4, '0')}`;

    const invoice = await prisma.invoice.upsert({
      where: {
        workspaceId_invoiceNumber: {
          workspaceId: e2eWorkspace.id,
          invoiceNumber,
        },
      },
      update: { status },
      create: {
        workspaceId: e2eWorkspace.id,
        clientId: testClients[i % testClients.length]!.id,
        invoiceNumber,
        status,
        title: `E2E Test Invoice - ${status}`,
        issueDate: now,
        dueDate: status === 'overdue'
          ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 500,
        total: 500,
        amountPaid: status === 'paid' ? 500 : status === 'partial' ? 250 : 0,
        amountDue: status === 'paid' ? 0 : status === 'partial' ? 250 : 500,
        sentAt: status !== 'draft' ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) : null,
        viewedAt: ['viewed', 'partial', 'paid', 'overdue'].includes(status) ? new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) : null,
        paidAt: status === 'paid' ? new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) : null,
        voidedAt: status === 'voided' ? new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) : null,
      },
    });

    // Add line items
    await prisma.invoiceLineItem.upsert({
      where: { id: `e2e-invoice-item-${invoice.id}` },
      update: {},
      create: {
        id: `e2e-invoice-item-${invoice.id}`,
        invoiceId: invoice.id,
        name: 'E2E Test Service',
        quantity: 5,
        rate: 100,
        amount: 500,
      },
    });

    console.log(`Created/Updated invoice: ${invoiceNumber} (${status})`);
  }

  // Create users for role-based permission tests
  console.log('\nCreating role test users...');

  for (const userData of ROLE_TEST_USERS) {
    const userPasswordHash = await hashPassword(userData.password);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { passwordHash: userPasswordHash, name: userData.name },
      create: {
        email: userData.email,
        passwordHash: userPasswordHash,
        name: userData.name,
        emailVerifiedAt: new Date(),
      },
    });

    // Add to workspace with role
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: e2eWorkspace.id,
          userId: user.id,
        },
      },
      update: { role: userData.role },
      create: {
        workspaceId: e2eWorkspace.id,
        userId: user.id,
        role: userData.role,
        acceptedAt: new Date(),
      },
    });

    console.log(`Created/Updated user ${userData.email} with role ${userData.role}`);
  }

  console.log('\nE2E test data seeding completed!');
}

async function cleanupE2ETestData() {
  console.log('Cleaning up E2E test data...');

  // Delete E2E-specific data
  // This is useful for cleaning up after tests if needed

  // Delete quotes with E2E prefix
  await prisma.quoteLineItem.deleteMany({
    where: { id: { startsWith: 'e2e-' } },
  });
  await prisma.quote.deleteMany({
    where: {
      OR: [
        { id: { startsWith: 'e2e-' } },
        { quoteNumber: { startsWith: 'Q-02' } },
      ],
    },
  });

  // Delete invoices with E2E prefix
  await prisma.invoiceLineItem.deleteMany({
    where: { id: { startsWith: 'e2e-' } },
  });
  await prisma.invoice.deleteMany({
    where: {
      OR: [
        { id: { startsWith: 'e2e-' } },
        { invoiceNumber: { startsWith: 'INV-02' } },
      ],
    },
  });

  // Delete E2E clients
  await prisma.client.deleteMany({
    where: { id: { startsWith: 'e2e-' } },
  });

  // Delete E2E rate cards
  await prisma.rateCard.deleteMany({
    where: { id: { startsWith: 'e2e-' } },
  });

  console.log('E2E test data cleanup completed!');
}

/**
 * Seeds edge case data for data integrity testing
 *
 * This creates records that test null/deleted client handling:
 * 1. Soft-deleted client with referencing quotes/invoices
 * 2. These records should display gracefully in the UI (not crash)
 */
async function seedEdgeCaseData() {
  console.log('\n=== Seeding Edge Case Data for Data Integrity Tests ===');

  // Get E2E workspace
  const workspace = await prisma.workspace.findFirst({
    where: { slug: 'e2e-test-workspace' },
  });

  if (!workspace) {
    console.warn('E2E workspace not found. Run normal seeding first.');
    return;
  }

  const now = new Date();

  // 1. Create a soft-deleted client (deleted but referenced by records)
  const deletedClient = await prisma.client.upsert({
    where: { id: 'e2e-deleted-client' },
    update: {
      deletedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Deleted 7 days ago
    },
    create: {
      id: 'e2e-deleted-client',
      workspaceId: workspace.id,
      name: 'Deleted Client Corp',
      email: 'deleted-client@e2e-test.dev',
      company: 'Deleted Corp LLC',
      deletedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Soft deleted
    },
  });
  console.log('Created soft-deleted client:', deletedClient.id);

  // 2. Create a client with no company field (null company)
  const clientNoCompany = await prisma.client.upsert({
    where: { id: 'e2e-client-no-company' },
    update: {},
    create: {
      id: 'e2e-client-no-company',
      workspaceId: workspace.id,
      name: 'Individual Freelancer',
      email: 'freelancer@e2e-test.dev',
      company: null, // No company - tests company fallback
    },
  });
  console.log('Created client with no company:', clientNoCompany.id);

  // 3. Create quote referencing deleted client
  const quoteDeletedClient = await prisma.quote.upsert({
    where: {
      workspaceId_quoteNumber: {
        workspaceId: workspace.id,
        quoteNumber: 'Q-EDGE-001',
      },
    },
    update: { clientId: deletedClient.id },
    create: {
      id: 'e2e-quote-deleted-client',
      workspaceId: workspace.id,
      clientId: deletedClient.id,
      quoteNumber: 'Q-EDGE-001',
      status: 'sent',
      title: 'Quote with Deleted Client',
      issueDate: now,
      expirationDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 2500,
      total: 2500,
      sentAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('Created quote with deleted client:', quoteDeletedClient.quoteNumber);

  // 4. Create quote with client that has no company
  const quoteNoCompanyClient = await prisma.quote.upsert({
    where: {
      workspaceId_quoteNumber: {
        workspaceId: workspace.id,
        quoteNumber: 'Q-EDGE-002',
      },
    },
    update: { clientId: clientNoCompany.id },
    create: {
      id: 'e2e-quote-no-company',
      workspaceId: workspace.id,
      clientId: clientNoCompany.id,
      quoteNumber: 'Q-EDGE-002',
      status: 'draft',
      title: 'Quote for Individual (No Company)',
      issueDate: now,
      expirationDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 1500,
      total: 1500,
    },
  });
  console.log('Created quote with no-company client:', quoteNoCompanyClient.quoteNumber);

  // 5. Create invoice referencing deleted client
  const invoiceDeletedClient = await prisma.invoice.upsert({
    where: {
      workspaceId_invoiceNumber: {
        workspaceId: workspace.id,
        invoiceNumber: 'INV-EDGE-001',
      },
    },
    update: { clientId: deletedClient.id },
    create: {
      id: 'e2e-invoice-deleted-client',
      workspaceId: workspace.id,
      clientId: deletedClient.id,
      invoiceNumber: 'INV-EDGE-001',
      status: 'overdue',
      title: 'Invoice with Deleted Client',
      issueDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      subtotal: 3000,
      total: 3000,
      amountPaid: 0,
      amountDue: 3000,
      sentAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('Created invoice with deleted client:', invoiceDeletedClient.invoiceNumber);

  // 6. Create invoice with client that has no company
  const invoiceNoCompanyClient = await prisma.invoice.upsert({
    where: {
      workspaceId_invoiceNumber: {
        workspaceId: workspace.id,
        invoiceNumber: 'INV-EDGE-002',
      },
    },
    update: { clientId: clientNoCompany.id },
    create: {
      id: 'e2e-invoice-no-company',
      workspaceId: workspace.id,
      clientId: clientNoCompany.id,
      invoiceNumber: 'INV-EDGE-002',
      status: 'sent',
      title: 'Invoice for Individual (No Company)',
      issueDate: now,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 800,
      total: 800,
      amountPaid: 0,
      amountDue: 800,
      sentAt: now,
    },
  });
  console.log('Created invoice with no-company client:', invoiceNoCompanyClient.invoiceNumber);

  // 7. Create line items for edge case records
  await prisma.quoteLineItem.upsert({
    where: { id: 'e2e-edge-quote-item-1' },
    update: {},
    create: {
      id: 'e2e-edge-quote-item-1',
      quoteId: quoteDeletedClient.id,
      name: 'Consulting Services',
      quantity: 25,
      rate: 100,
      amount: 2500,
    },
  });

  await prisma.quoteLineItem.upsert({
    where: { id: 'e2e-edge-quote-item-2' },
    update: {},
    create: {
      id: 'e2e-edge-quote-item-2',
      quoteId: quoteNoCompanyClient.id,
      name: 'Freelance Work',
      quantity: 15,
      rate: 100,
      amount: 1500,
    },
  });

  await prisma.invoiceLineItem.upsert({
    where: { id: 'e2e-edge-invoice-item-1' },
    update: {},
    create: {
      id: 'e2e-edge-invoice-item-1',
      invoiceId: invoiceDeletedClient.id,
      name: 'Project Completion',
      quantity: 30,
      rate: 100,
      amount: 3000,
    },
  });

  await prisma.invoiceLineItem.upsert({
    where: { id: 'e2e-edge-invoice-item-2' },
    update: {},
    create: {
      id: 'e2e-edge-invoice-item-2',
      invoiceId: invoiceNoCompanyClient.id,
      name: 'Design Services',
      quantity: 8,
      rate: 100,
      amount: 800,
    },
  });

  console.log('\nEdge case data seeding completed!');
  console.log('Created:');
  console.log('  - 1 soft-deleted client with referencing quote/invoice');
  console.log('  - 1 client with no company field');
  console.log('  - 2 quotes (one with deleted client, one with no-company client)');
  console.log('  - 2 invoices (one with deleted client, one with no-company client)');
}

// Run seeding by default, or cleanup if CLEANUP env var is set, or edge cases if EDGE_CASES is set
const isCleanup = process.env.CLEANUP === 'true';
const seedEdgeCases = process.env.SEED_EDGE_CASES === 'true';

async function main() {
  if (isCleanup) {
    await cleanupE2ETestData();
  } else {
    await seedE2ETestData();
    if (seedEdgeCases) {
      await seedEdgeCaseData();
    }
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
