/**
 * Production Seed Script
 *
 * Seeds ONLY the demo workspace for production.
 * Does NOT create test users or test data.
 *
 * Usage:
 *   DATABASE_URL="your-prod-connection-string" npx ts-node prisma/seed-production.ts
 *
 * Or via package.json script:
 *   DATABASE_URL="..." pnpm db:seed:prod
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Demo account configuration - should match apps/web/lib/demo/constants.ts
const DEMO_CONFIG = {
  email: process.env.DEMO_USER_EMAIL || 'demo@quotecraft.demo',
  password: process.env.DEMO_USER_PASSWORD || 'DemoPassword123!',
  displayName: 'Demo User',
  workspaceSlug: 'demo-workspace',
};

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function seedProductionDemo() {
  console.log('🚀 Seeding production demo data...');

  // Create demo user
  const demoPasswordHash = await hashPassword(DEMO_CONFIG.password);

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_CONFIG.email },
    update: {
      passwordHash: demoPasswordHash,
      name: DEMO_CONFIG.displayName,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: DEMO_CONFIG.email,
      passwordHash: demoPasswordHash,
      name: DEMO_CONFIG.displayName,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Demo user created/updated: ${DEMO_CONFIG.email}`);

  // Create demo workspace
  const demoWorkspace = await prisma.workspace.upsert({
    where: { slug: DEMO_CONFIG.workspaceSlug },
    update: {
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
  console.log(`✓ Demo workspace created/updated: ${demoWorkspace.name}`);

  // Add demo user as workspace owner
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
  console.log('✓ Business profile created/updated');

  // Create number sequences
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
  console.log('✓ Number sequences created/updated');

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
  console.log(`✓ Created/updated ${demoClients.length} demo clients`);

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
  console.log(`✓ Created/updated ${demoRateCards.length} demo rate cards`);

  // Create demo quotes
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
      subtotal: 17200,
      total: 17200,
    },
    {
      id: 'demo-quote-2',
      quoteNumber: 'Q-0002',
      clientId: 'demo-client-2',
      title: 'E-commerce Platform Design',
      status: 'sent',
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

    // Add line item
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
  console.log(`✓ Created/updated ${demoQuotes.length} demo quotes`);

  // Create demo invoices
  const demoInvoices = [
    {
      id: 'demo-invoice-1',
      invoiceNumber: 'INV-0001',
      clientId: 'demo-client-1',
      title: 'Previous Project - Final Payment',
      status: 'paid',
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
      sentAt: sevenDaysAgo,
      dueDate: thirtyDaysFromNow,
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
      sentAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
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
        issueDate: now,
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

    // Add line item
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
  console.log(`✓ Created/updated ${demoInvoices.length} demo invoices`);

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
  console.log(`✓ Created/updated ${demoProjects.length} demo projects`);

  // Link quotes to projects
  const quoteProjectLinks = [
    { quoteId: 'demo-quote-1', projectId: 'demo-project-1' },
    { quoteId: 'demo-quote-2', projectId: 'demo-project-2' },
    { quoteId: 'demo-quote-3', projectId: 'demo-project-3' },
    { quoteId: 'demo-quote-4', projectId: 'demo-project-4' },
    { quoteId: 'demo-quote-5', projectId: 'demo-project-5' },
  ];

  for (const link of quoteProjectLinks) {
    await prisma.quote.update({
      where: { id: link.quoteId },
      data: { projectId: link.projectId },
    });
  }
  console.log('✓ Linked quotes to projects');

  // Link invoices to projects
  const invoiceProjectLinks = [
    { invoiceId: 'demo-invoice-1', projectId: 'demo-project-1' },
    { invoiceId: 'demo-invoice-2', projectId: 'demo-project-3' },
    { invoiceId: 'demo-invoice-3', projectId: 'demo-project-2' },
    { invoiceId: 'demo-invoice-4', projectId: 'demo-project-4' },
  ];

  for (const link of invoiceProjectLinks) {
    await prisma.invoice.update({
      where: { id: link.invoiceId },
      data: { projectId: link.projectId },
    });
  }
  console.log('✓ Linked invoices to projects');

  console.log('\n✅ Production demo data seeding completed!');
  console.log(`\n📋 Demo account created. Credentials are set via DEMO_USER_EMAIL and DEMO_USER_PASSWORD env vars.`);
}

seedProductionDemo()
  .catch((e) => {
    console.error('❌ Error seeding production data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
