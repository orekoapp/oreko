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

// Run seeding by default, or cleanup if CLEANUP env var is set
const isCleanup = process.env.CLEANUP === 'true';

(isCleanup ? cleanupE2ETestData() : seedE2ETestData())
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
