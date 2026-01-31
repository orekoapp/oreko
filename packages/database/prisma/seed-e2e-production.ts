/**
 * Production E2E Test Data Seed Script
 *
 * Seeds test data for running E2E tests against production.
 * Uses an EXISTING user account (does not create users).
 *
 * Required Environment Variables:
 *   DATABASE_URL - Production database connection string
 *   E2E_USER_EMAIL - Email of the existing E2E test user on production
 *
 * Usage:
 *   DATABASE_URL="..." E2E_USER_EMAIL="your-e2e-user@example.com" pnpm db:seed:e2e
 *
 * Or:
 *   DATABASE_URL="..." E2E_USER_EMAIL="..." npx tsx prisma/seed-e2e-production.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get E2E user email from environment - REQUIRED
const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL;

if (!E2E_USER_EMAIL) {
  console.error('❌ E2E_USER_EMAIL environment variable is required');
  console.error('   Example: E2E_USER_EMAIL="test@yourcompany.com" pnpm db:seed:e2e');
  process.exit(1);
}

async function seedE2EProductionData() {
  console.log('🚀 Seeding E2E test data for production...');
  console.log(`📧 E2E User: ${E2E_USER_EMAIL}`);

  // Find the existing E2E user
  const e2eUser = await prisma.user.findUnique({
    where: { email: E2E_USER_EMAIL },
  });

  if (!e2eUser) {
    console.error(`❌ User not found: ${E2E_USER_EMAIL}`);
    console.error('   Please create this user first via the app registration.');
    process.exit(1);
  }
  console.log(`✓ Found E2E user: ${e2eUser.name || e2eUser.email}`);

  // Find user's workspace (they should have one from registration/onboarding)
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: e2eUser.id },
    include: { workspace: true },
  });

  if (!workspaceMember) {
    console.error(`❌ No workspace found for user: ${E2E_USER_EMAIL}`);
    console.error('   Please complete onboarding first.');
    process.exit(1);
  }

  const workspace = workspaceMember.workspace;
  console.log(`✓ Found workspace: ${workspace.name} (${workspace.slug})`);

  // Ensure number sequences exist
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
      currentValue: 100,
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
      currentValue: 100,
      padding: 4,
    },
  });
  console.log('✓ Number sequences ready');

  // Create E2E test clients
  const e2eClients = [
    { id: `e2e-client-1-${workspace.id}`, name: 'E2E Test Client Alpha', email: 'alpha@e2e-test.local', company: 'Alpha Corp', phone: '+1 (555) 100-0001' },
    { id: `e2e-client-2-${workspace.id}`, name: 'E2E Test Client Beta', email: 'beta@e2e-test.local', company: 'Beta Industries', phone: '+1 (555) 100-0002' },
    { id: `e2e-client-3-${workspace.id}`, name: 'E2E Test Client Gamma', email: 'gamma@e2e-test.local', company: 'Gamma LLC', phone: '+1 (555) 100-0003' },
  ];

  for (const clientData of e2eClients) {
    await prisma.client.upsert({
      where: { id: clientData.id },
      update: { name: clientData.name, email: clientData.email },
      create: {
        id: clientData.id,
        workspaceId: workspace.id,
        name: clientData.name,
        email: clientData.email,
        company: clientData.company,
        phone: clientData.phone,
      },
    });
  }
  console.log(`✓ Created/updated ${e2eClients.length} E2E test clients`);

  // Create E2E rate card category
  const e2eCategory = await prisma.rateCardCategory.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'E2E Test Services',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'E2E Test Services',
      color: '#EF4444',
    },
  });

  // Create E2E rate cards
  const e2eRateCards = [
    { id: `e2e-rate-1-${workspace.id}`, name: 'E2E Development', rate: 150, unit: 'hour' },
    { id: `e2e-rate-2-${workspace.id}`, name: 'E2E Design', rate: 125, unit: 'hour' },
    { id: `e2e-rate-3-${workspace.id}`, name: 'E2E Consulting', rate: 200, unit: 'hour' },
  ];

  for (const rateCardData of e2eRateCards) {
    await prisma.rateCard.upsert({
      where: { id: rateCardData.id },
      update: {},
      create: {
        id: rateCardData.id,
        workspaceId: workspace.id,
        categoryId: e2eCategory.id,
        name: rateCardData.name,
        rate: rateCardData.rate,
        unit: rateCardData.unit,
        pricingType: 'hourly',
        isActive: true,
      },
    });
  }
  console.log(`✓ Created/updated ${e2eRateCards.length} E2E rate cards`);

  // Create E2E quotes with all statuses for state matrix tests
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const e2eQuotes = [
    {
      id: `e2e-quote-draft-${workspace.id}`,
      quoteNumber: 'E2E-Q-0001',
      clientId: e2eClients[0]!.id,
      title: 'E2E Test Quote - Draft',
      status: 'draft',
      subtotal: 1500,
      total: 1500,
    },
    {
      id: `e2e-quote-sent-${workspace.id}`,
      quoteNumber: 'E2E-Q-0002',
      clientId: e2eClients[1]!.id,
      title: 'E2E Test Quote - Sent',
      status: 'sent',
      sentAt: sevenDaysAgo,
      subtotal: 2500,
      total: 2500,
    },
    {
      id: `e2e-quote-viewed-${workspace.id}`,
      quoteNumber: 'E2E-Q-0003',
      clientId: e2eClients[2]!.id,
      title: 'E2E Test Quote - Viewed',
      status: 'viewed',
      sentAt: sevenDaysAgo,
      viewedAt: new Date(sevenDaysAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
      subtotal: 3500,
      total: 3500,
    },
    {
      id: `e2e-quote-accepted-${workspace.id}`,
      quoteNumber: 'E2E-Q-0004',
      clientId: e2eClients[0]!.id,
      title: 'E2E Test Quote - Accepted',
      status: 'accepted',
      sentAt: fourteenDaysAgo,
      viewedAt: new Date(fourteenDaysAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
      acceptedAt: new Date(fourteenDaysAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
      subtotal: 5000,
      total: 5000,
    },
    {
      id: `e2e-quote-declined-${workspace.id}`,
      quoteNumber: 'E2E-Q-0005',
      clientId: e2eClients[1]!.id,
      title: 'E2E Test Quote - Declined',
      status: 'declined',
      sentAt: fourteenDaysAgo,
      viewedAt: new Date(fourteenDaysAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
      declinedAt: new Date(fourteenDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
      subtotal: 4000,
      total: 4000,
    },
    {
      id: `e2e-quote-converted-${workspace.id}`,
      quoteNumber: 'E2E-Q-0006',
      clientId: e2eClients[2]!.id,
      title: 'E2E Test Quote - Converted',
      status: 'converted',
      sentAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      acceptedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      subtotal: 6000,
      total: 6000,
    },
  ];

  for (const quoteData of e2eQuotes) {
    await prisma.quote.upsert({
      where: {
        workspaceId_quoteNumber: {
          workspaceId: workspace.id,
          quoteNumber: quoteData.quoteNumber,
        },
      },
      update: { status: quoteData.status },
      create: {
        id: quoteData.id,
        workspaceId: workspace.id,
        clientId: quoteData.clientId,
        quoteNumber: quoteData.quoteNumber,
        title: quoteData.title,
        status: quoteData.status,
        issueDate: now,
        expirationDate: thirtyDaysFromNow,
        sentAt: quoteData.sentAt,
        viewedAt: quoteData.viewedAt,
        acceptedAt: quoteData.acceptedAt,
        declinedAt: quoteData.declinedAt,
        subtotal: quoteData.subtotal,
        total: quoteData.total,
      },
    });

    // Add line item for each quote
    await prisma.quoteLineItem.upsert({
      where: { id: `${quoteData.id}-item` },
      update: {},
      create: {
        id: `${quoteData.id}-item`,
        quoteId: quoteData.id,
        name: 'E2E Test Service',
        description: 'Service for E2E testing',
        quantity: 10,
        rate: quoteData.subtotal / 10,
        amount: quoteData.subtotal,
        sortOrder: 0,
      },
    });
  }
  console.log(`✓ Created/updated ${e2eQuotes.length} E2E test quotes (all statuses)`);

  // Create E2E invoices with all statuses
  const e2eInvoices = [
    {
      id: `e2e-invoice-draft-${workspace.id}`,
      invoiceNumber: 'E2E-INV-0001',
      clientId: e2eClients[0]!.id,
      title: 'E2E Test Invoice - Draft',
      status: 'draft',
      dueDate: thirtyDaysFromNow,
      subtotal: 1000,
      total: 1000,
      amountPaid: 0,
      amountDue: 1000,
    },
    {
      id: `e2e-invoice-sent-${workspace.id}`,
      invoiceNumber: 'E2E-INV-0002',
      clientId: e2eClients[1]!.id,
      title: 'E2E Test Invoice - Sent',
      status: 'sent',
      sentAt: sevenDaysAgo,
      dueDate: thirtyDaysFromNow,
      subtotal: 2000,
      total: 2000,
      amountPaid: 0,
      amountDue: 2000,
    },
    {
      id: `e2e-invoice-viewed-${workspace.id}`,
      invoiceNumber: 'E2E-INV-0003',
      clientId: e2eClients[2]!.id,
      title: 'E2E Test Invoice - Viewed',
      status: 'viewed',
      sentAt: sevenDaysAgo,
      viewedAt: new Date(sevenDaysAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
      dueDate: thirtyDaysFromNow,
      subtotal: 3000,
      total: 3000,
      amountPaid: 0,
      amountDue: 3000,
    },
    {
      id: `e2e-invoice-partial-${workspace.id}`,
      invoiceNumber: 'E2E-INV-0004',
      clientId: e2eClients[0]!.id,
      title: 'E2E Test Invoice - Partial',
      status: 'partial',
      sentAt: fourteenDaysAgo,
      viewedAt: new Date(fourteenDaysAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
      dueDate: thirtyDaysFromNow,
      subtotal: 4000,
      total: 4000,
      amountPaid: 2000,
      amountDue: 2000,
    },
    {
      id: `e2e-invoice-paid-${workspace.id}`,
      invoiceNumber: 'E2E-INV-0005',
      clientId: e2eClients[1]!.id,
      title: 'E2E Test Invoice - Paid',
      status: 'paid',
      sentAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      paidAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      subtotal: 5000,
      total: 5000,
      amountPaid: 5000,
      amountDue: 0,
    },
    {
      id: `e2e-invoice-overdue-${workspace.id}`,
      invoiceNumber: 'E2E-INV-0006',
      clientId: e2eClients[2]!.id,
      title: 'E2E Test Invoice - Overdue',
      status: 'overdue',
      sentAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      subtotal: 6000,
      total: 6000,
      amountPaid: 0,
      amountDue: 6000,
    },
    {
      id: `e2e-invoice-voided-${workspace.id}`,
      invoiceNumber: 'E2E-INV-0007',
      clientId: e2eClients[0]!.id,
      title: 'E2E Test Invoice - Voided',
      status: 'voided',
      sentAt: fourteenDaysAgo,
      voidedAt: sevenDaysAgo,
      dueDate: thirtyDaysFromNow,
      subtotal: 1500,
      total: 1500,
      amountPaid: 0,
      amountDue: 0,
    },
  ];

  for (const invoiceData of e2eInvoices) {
    await prisma.invoice.upsert({
      where: {
        workspaceId_invoiceNumber: {
          workspaceId: workspace.id,
          invoiceNumber: invoiceData.invoiceNumber,
        },
      },
      update: { status: invoiceData.status },
      create: {
        id: invoiceData.id,
        workspaceId: workspace.id,
        clientId: invoiceData.clientId,
        invoiceNumber: invoiceData.invoiceNumber,
        title: invoiceData.title,
        status: invoiceData.status,
        issueDate: now,
        dueDate: invoiceData.dueDate,
        sentAt: invoiceData.sentAt,
        viewedAt: invoiceData.viewedAt,
        paidAt: invoiceData.paidAt,
        voidedAt: invoiceData.voidedAt,
        subtotal: invoiceData.subtotal,
        total: invoiceData.total,
        amountPaid: invoiceData.amountPaid,
        amountDue: invoiceData.amountDue,
      },
    });

    // Add line item
    await prisma.invoiceLineItem.upsert({
      where: { id: `${invoiceData.id}-item` },
      update: {},
      create: {
        id: `${invoiceData.id}-item`,
        invoiceId: invoiceData.id,
        name: 'E2E Test Service',
        description: 'Service for E2E testing',
        quantity: 10,
        rate: invoiceData.subtotal / 10,
        amount: invoiceData.subtotal,
        sortOrder: 0,
      },
    });
  }
  console.log(`✓ Created/updated ${e2eInvoices.length} E2E test invoices (all statuses)`);

  console.log('\n✅ E2E production test data seeding completed!');
  console.log('\n📋 Seeded Data Summary:');
  console.log(`   • Clients: ${e2eClients.length}`);
  console.log(`   • Rate Cards: ${e2eRateCards.length}`);
  console.log(`   • Quotes: ${e2eQuotes.length} (draft, sent, viewed, accepted, declined, converted)`);
  console.log(`   • Invoices: ${e2eInvoices.length} (draft, sent, viewed, partial, paid, overdue, voided)`);
  console.log('\n🔧 Run E2E tests with:');
  console.log(`   PLAYWRIGHT_TEST_BASE_URL="https://your-production-url.com" pnpm test:e2e`);
}

// Cleanup function to remove E2E test data
async function cleanupE2EProductionData() {
  console.log('🧹 Cleaning up E2E test data from production...');

  const e2eUser = await prisma.user.findUnique({
    where: { email: E2E_USER_EMAIL! },
  });

  if (!e2eUser) {
    console.log('User not found, nothing to clean up.');
    return;
  }

  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: e2eUser.id },
  });

  if (!workspaceMember) {
    console.log('Workspace not found, nothing to clean up.');
    return;
  }

  const workspaceId = workspaceMember.workspaceId;

  // Delete E2E quote line items and quotes
  await prisma.quoteLineItem.deleteMany({
    where: { quoteId: { startsWith: `e2e-quote-` } },
  });
  await prisma.quote.deleteMany({
    where: { quoteNumber: { startsWith: 'E2E-Q-' }, workspaceId },
  });
  console.log('✓ Removed E2E quotes');

  // Delete E2E invoice line items and invoices
  await prisma.invoiceLineItem.deleteMany({
    where: { invoiceId: { startsWith: `e2e-invoice-` } },
  });
  await prisma.invoice.deleteMany({
    where: { invoiceNumber: { startsWith: 'E2E-INV-' }, workspaceId },
  });
  console.log('✓ Removed E2E invoices');

  // Delete E2E clients
  await prisma.client.deleteMany({
    where: { id: { startsWith: `e2e-client-` } },
  });
  console.log('✓ Removed E2E clients');

  // Delete E2E rate cards
  await prisma.rateCard.deleteMany({
    where: { id: { startsWith: `e2e-rate-` } },
  });
  console.log('✓ Removed E2E rate cards');

  // Delete E2E category
  await prisma.rateCardCategory.deleteMany({
    where: { name: 'E2E Test Services', workspaceId },
  });
  console.log('✓ Removed E2E rate card category');

  console.log('\n✅ E2E test data cleanup completed!');
}

// Main execution
const isCleanup = process.argv.includes('--cleanup') || process.env.CLEANUP === 'true';

(isCleanup ? cleanupE2EProductionData() : seedE2EProductionData())
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
