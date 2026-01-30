'use server';

import { revalidatePath } from 'next/cache';
import { prisma, Prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { assertNotDemo } from '@/lib/demo/guard';
import type {
  BusinessProfileData,
  BrandingSettingsData,
  PaymentSettingsData,
  TaxRateData,
  NumberSequenceData,
  AllSettings,
  WorkspaceData,
  CreateTaxRateInput,
  UpdateTaxRateInput,
  UpdateBusinessProfileInput,
  UpdateBrandingSettingsInput,
  UpdatePaymentSettingsInput,
  UpdateNumberSequenceInput,
  Address,
} from './types';

// Helper to get current user's workspace
async function getCurrentUserWorkspace(): Promise<{ workspaceId: string; userId: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  if (!workspaceMember) {
    throw new Error('No workspace found');
  }

  return {
    workspaceId: workspaceMember.workspaceId,
    userId: session.user.id,
  };
}

// Helper to convert Prisma Decimal to number
function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return value.toNumber();
}

// ============================================
// WORKSPACE ACTIONS
// ============================================

// Get workspace data
export async function getWorkspace(): Promise<WorkspaceData> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    ownerId: workspace.ownerId,
    createdAt: workspace.createdAt,
  };
}

// Update workspace name
export async function updateWorkspaceName(name: string): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name },
  });

  revalidatePath('/settings');
}

// ============================================
// BUSINESS PROFILE ACTIONS
// ============================================

// Get business profile
export async function getBusinessProfile(): Promise<BusinessProfileData | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const profile = await prisma.businessProfile.findUnique({
    where: { workspaceId },
  });

  if (!profile) {
    return null;
  }

  return {
    businessName: profile.businessName,
    logoUrl: profile.logoUrl,
    email: profile.email,
    phone: profile.phone,
    website: profile.website,
    address: profile.address as Address | null,
    taxId: profile.taxId,
    currency: profile.currency,
    timezone: profile.timezone,
  };
}

// Update business profile
export async function updateBusinessProfile(
  input: UpdateBusinessProfileInput
): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.businessProfile.findUnique({
    where: { workspaceId },
  });

  if (existing) {
    await prisma.businessProfile.update({
      where: { workspaceId },
      data: {
        ...(input.businessName !== undefined && { businessName: input.businessName }),
        ...(input.email !== undefined && { email: input.email || null }),
        ...(input.phone !== undefined && { phone: input.phone || null }),
        ...(input.website !== undefined && { website: input.website || null }),
        ...(input.address !== undefined && {
          address: input.address ? (input.address as Prisma.InputJsonValue) : Prisma.JsonNull,
        }),
        ...(input.taxId !== undefined && { taxId: input.taxId || null }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.timezone !== undefined && { timezone: input.timezone }),
      },
    });
  } else {
    await prisma.businessProfile.create({
      data: {
        workspaceId,
        businessName: input.businessName || 'My Business',
        email: input.email || null,
        phone: input.phone || null,
        website: input.website || null,
        address: input.address ? (input.address as Prisma.InputJsonValue) : Prisma.JsonNull,
        taxId: input.taxId || null,
        currency: input.currency || 'USD',
        timezone: input.timezone || 'UTC',
      },
    });
  }

  revalidatePath('/settings');
  revalidatePath('/settings/business');
}

// Update business logo
export async function updateBusinessLogo(logoUrl: string | null): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.businessProfile.findUnique({
    where: { workspaceId },
  });

  if (existing) {
    await prisma.businessProfile.update({
      where: { workspaceId },
      data: { logoUrl },
    });
  } else {
    await prisma.businessProfile.create({
      data: {
        workspaceId,
        businessName: 'My Business',
        logoUrl,
      },
    });
  }

  revalidatePath('/settings');
  revalidatePath('/settings/business');
}

// ============================================
// BRANDING SETTINGS ACTIONS
// ============================================

// Get branding settings
export async function getBrandingSettings(): Promise<BrandingSettingsData | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const branding = await prisma.brandingSettings.findUnique({
    where: { workspaceId },
  });

  if (!branding) {
    return null;
  }

  return {
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    accentColor: branding.accentColor,
    logoUrl: branding.logoUrl,
    faviconUrl: branding.faviconUrl,
    customCss: branding.customCss,
    fontFamily: branding.fontFamily,
  };
}

// Update branding settings
export async function updateBrandingSettings(
  input: UpdateBrandingSettingsInput
): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.brandingSettings.findUnique({
    where: { workspaceId },
  });

  if (existing) {
    await prisma.brandingSettings.update({
      where: { workspaceId },
      data: {
        ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor || null }),
        ...(input.secondaryColor !== undefined && { secondaryColor: input.secondaryColor || null }),
        ...(input.accentColor !== undefined && { accentColor: input.accentColor || null }),
        ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl || null }),
        ...(input.faviconUrl !== undefined && { faviconUrl: input.faviconUrl || null }),
        ...(input.customCss !== undefined && { customCss: input.customCss || null }),
        ...(input.fontFamily !== undefined && { fontFamily: input.fontFamily || null }),
      },
    });
  } else {
    await prisma.brandingSettings.create({
      data: {
        workspaceId,
        primaryColor: input.primaryColor || '#3B82F6',
        secondaryColor: input.secondaryColor || '#8B5CF6',
        accentColor: input.accentColor || '#F59E0B',
        logoUrl: input.logoUrl || null,
        faviconUrl: input.faviconUrl || null,
        customCss: input.customCss || null,
        fontFamily: input.fontFamily || null,
      },
    });
  }

  revalidatePath('/settings');
  revalidatePath('/settings/branding');
}

// ============================================
// PAYMENT SETTINGS ACTIONS
// ============================================

// Get payment settings
export async function getPaymentSettings(): Promise<PaymentSettingsData | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const payment = await prisma.paymentSettings.findUnique({
    where: { workspaceId },
  });

  if (!payment) {
    return null;
  }

  return {
    stripeAccountId: payment.stripeAccountId,
    stripeAccountStatus: payment.stripeAccountStatus,
    stripeOnboardingComplete: payment.stripeOnboardingComplete,
    enabledPaymentMethods: payment.enabledPaymentMethods as string[],
    passProcessingFees: payment.passProcessingFees,
    defaultPaymentTerms: payment.defaultPaymentTerms,
  };
}

// Update payment settings
export async function updatePaymentSettings(
  input: UpdatePaymentSettingsInput
): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.paymentSettings.findUnique({
    where: { workspaceId },
  });

  if (existing) {
    await prisma.paymentSettings.update({
      where: { workspaceId },
      data: {
        ...(input.enabledPaymentMethods !== undefined && {
          enabledPaymentMethods: input.enabledPaymentMethods as Prisma.InputJsonValue,
        }),
        ...(input.passProcessingFees !== undefined && {
          passProcessingFees: input.passProcessingFees,
        }),
        ...(input.defaultPaymentTerms !== undefined && {
          defaultPaymentTerms: input.defaultPaymentTerms,
        }),
      },
    });
  } else {
    await prisma.paymentSettings.create({
      data: {
        workspaceId,
        enabledPaymentMethods: (input.enabledPaymentMethods || ['card']) as Prisma.InputJsonValue,
        passProcessingFees: input.passProcessingFees ?? false,
        defaultPaymentTerms: input.defaultPaymentTerms ?? 30,
      },
    });
  }

  revalidatePath('/settings');
  revalidatePath('/settings/payments');
}

// ============================================
// TAX RATE ACTIONS
// ============================================

// Get all tax rates
export async function getTaxRates(): Promise<TaxRateData[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const taxRates = await prisma.taxRate.findMany({
    where: { workspaceId },
    orderBy: { name: 'asc' },
  });

  return taxRates.map((tr) => ({
    id: tr.id,
    name: tr.name,
    rate: toNumber(tr.rate),
    description: tr.description,
    isInclusive: tr.isInclusive,
    isDefault: tr.isDefault,
    isActive: tr.isActive,
    createdAt: tr.createdAt,
    updatedAt: tr.updatedAt,
  }));
}

// Create tax rate
export async function createTaxRate(input: CreateTaxRateInput): Promise<{ id: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // If setting as default, unset other defaults
  if (input.isDefault) {
    await prisma.taxRate.updateMany({
      where: { workspaceId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const taxRate = await prisma.taxRate.create({
    data: {
      workspaceId,
      name: input.name,
      rate: input.rate,
      description: input.description || null,
      isInclusive: input.isInclusive ?? false,
      isDefault: input.isDefault ?? false,
      isActive: input.isActive ?? true,
    },
  });

  revalidatePath('/settings/tax-rates');

  return { id: taxRate.id };
}

// Update tax rate
export async function updateTaxRate(input: UpdateTaxRateInput): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify ownership
  const existing = await prisma.taxRate.findFirst({
    where: { id: input.id, workspaceId },
  });

  if (!existing) {
    throw new Error('Tax rate not found');
  }

  // If setting as default, unset other defaults
  if (input.isDefault) {
    await prisma.taxRate.updateMany({
      where: { workspaceId, isDefault: true, id: { not: input.id } },
      data: { isDefault: false },
    });
  }

  await prisma.taxRate.update({
    where: { id: input.id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.rate !== undefined && { rate: input.rate }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.isInclusive !== undefined && { isInclusive: input.isInclusive }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });

  revalidatePath('/settings/tax-rates');
}

// Delete tax rate
export async function deleteTaxRate(id: string): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify ownership
  const existing = await prisma.taxRate.findFirst({
    where: { id, workspaceId },
  });

  if (!existing) {
    throw new Error('Tax rate not found');
  }

  // Check if in use
  const usageCount = await prisma.rateCard.count({
    where: { taxRateId: id },
  });

  if (usageCount > 0) {
    throw new Error(`Cannot delete tax rate. It is used by ${usageCount} rate card(s).`);
  }

  await prisma.taxRate.delete({
    where: { id },
  });

  revalidatePath('/settings/tax-rates');
}

// ============================================
// NUMBER SEQUENCE ACTIONS
// ============================================

// Get number sequences
export async function getNumberSequences(): Promise<NumberSequenceData[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const sequences = await prisma.numberSequence.findMany({
    where: { workspaceId },
    orderBy: { type: 'asc' },
  });

  // Ensure we have both quote and invoice sequences
  const types = ['quote', 'invoice'];
  const existingTypes = new Set(sequences.map((s) => s.type));

  const missingSequences = types.filter((t) => !existingTypes.has(t));
  if (missingSequences.length > 0) {
    await Promise.all(
      missingSequences.map((type) =>
        prisma.numberSequence.create({
          data: {
            workspaceId,
            type,
            prefix: type === 'quote' ? 'QT' : 'INV',
            currentValue: 0,
            padding: 4,
          },
        })
      )
    );

    // Refetch
    const updated = await prisma.numberSequence.findMany({
      where: { workspaceId },
      orderBy: { type: 'asc' },
    });

    return updated.map((s) => ({
      id: s.id,
      type: s.type,
      prefix: s.prefix,
      suffix: s.suffix,
      currentValue: s.currentValue,
      padding: s.padding,
    }));
  }

  return sequences.map((s) => ({
    id: s.id,
    type: s.type,
    prefix: s.prefix,
    suffix: s.suffix,
    currentValue: s.currentValue,
    padding: s.padding,
  }));
}

// Update number sequence
export async function updateNumberSequence(
  input: UpdateNumberSequenceInput
): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.numberSequence.findFirst({
    where: { workspaceId, type: input.type },
  });

  if (existing) {
    await prisma.numberSequence.update({
      where: { id: existing.id },
      data: {
        ...(input.prefix !== undefined && { prefix: input.prefix || null }),
        ...(input.suffix !== undefined && { suffix: input.suffix || null }),
        ...(input.currentValue !== undefined && { currentValue: input.currentValue }),
        ...(input.padding !== undefined && { padding: input.padding }),
      },
    });
  } else {
    await prisma.numberSequence.create({
      data: {
        workspaceId,
        type: input.type,
        prefix: input.prefix || (input.type === 'quote' ? 'QT' : 'INV'),
        suffix: input.suffix || null,
        currentValue: input.currentValue ?? 0,
        padding: input.padding ?? 4,
      },
    });
  }

  revalidatePath('/settings');
  revalidatePath('/settings/invoices');
  revalidatePath('/settings/quotes');
}

// ============================================
// COMBINED SETTINGS
// ============================================

// Get all settings
export async function getAllSettings(): Promise<AllSettings> {
  const [businessProfile, branding, payment, taxRates, numberSequences] =
    await Promise.all([
      getBusinessProfile(),
      getBrandingSettings(),
      getPaymentSettings(),
      getTaxRates(),
      getNumberSequences(),
    ]);

  return {
    businessProfile,
    branding,
    payment,
    taxRates,
    numberSequences,
  };
}
