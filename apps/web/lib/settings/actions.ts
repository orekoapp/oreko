'use server';

import { revalidatePath } from 'next/cache';
import { randomBytes, createHash } from 'crypto';
import { z } from 'zod';
import { prisma, Prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { logger } from '@/lib/logger';
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
  EmailSettingsData,
  UpdateEmailSettingsInput,
  Address,
  CustomFieldData,
  IntegrationData,
  WebhookData,
} from './types';
import { ROUTES } from '@/lib/routes';
import { toNumber, getBaseUrl } from '@/lib/utils';

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
  const { workspaceId, role } = await getCurrentUserWorkspace();

  // HIGH #10: Only owner/admin can rename workspace
  if (role === 'viewer' || role === 'editor') {
    throw new Error('Only admins can rename the workspace');
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name },
  });

  revalidatePath(ROUTES.settings);
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
    darkLogoUrl: profile.darkLogoUrl,
    socialLinks: profile.socialLinks as { platform: string; url: string }[] | null,
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
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer' || role === 'editor') {
    throw new Error('Only admins and owners can update business profile');
  }

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
        ...(input.socialLinks !== undefined && {
          socialLinks: input.socialLinks ? (input.socialLinks as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        }),
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
        socialLinks: input.socialLinks ? (input.socialLinks as unknown as Prisma.InputJsonValue) : undefined,
        taxId: input.taxId || null,
        currency: input.currency || 'USD',
        timezone: input.timezone || 'UTC',
      },
    });
  }

  revalidatePath(ROUTES.settings);
  revalidatePath(ROUTES.settingsBusiness);
}

// Update business logo
export async function updateBusinessLogo(logoUrl: string | null): Promise<void> {
  const { workspaceId, role } = await getCurrentUserWorkspace();
  if (role === 'viewer' || role === 'editor') {
    throw new Error('Only admins and owners can update business logo');
  }

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

  revalidatePath(ROUTES.settings);
  revalidatePath(ROUTES.settingsBusiness);
}

// ============================================
// EMAIL SETTINGS ACTIONS
// ============================================

// Get email settings
export async function getEmailSettings(): Promise<EmailSettingsData | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const profile = await prisma.businessProfile.findUnique({
    where: { workspaceId },
  });

  if (!profile) {
    return null;
  }

  return {
    emailSignature: profile.emailSignature,
    emailFooter: profile.emailFooter,
    clientEmail: profile.clientEmail,
  };
}

// Update email settings
export async function updateEmailSettings(
  input: UpdateEmailSettingsInput
): Promise<void> {
  const { workspaceId, role } = await getCurrentUserWorkspace();
  if (role === 'viewer' || role === 'editor') {
    throw new Error('Only admins and owners can update email settings');
  }

  const existing = await prisma.businessProfile.findUnique({
    where: { workspaceId },
  });

  if (existing) {
    await prisma.businessProfile.update({
      where: { workspaceId },
      data: {
        ...(input.emailSignature !== undefined && { emailSignature: input.emailSignature || null }),
        ...(input.emailFooter !== undefined && { emailFooter: input.emailFooter || null }),
        ...(input.clientEmail !== undefined && { clientEmail: input.clientEmail || null }),
      },
    });
  } else {
    await prisma.businessProfile.create({
      data: {
        workspaceId,
        businessName: 'My Business',
        emailSignature: input.emailSignature || null,
        emailFooter: input.emailFooter || null,
        clientEmail: input.clientEmail || null,
      },
    });
  }

  revalidatePath(ROUTES.settings);
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
    darkLogoUrl: branding.darkLogoUrl,
    faviconUrl: branding.faviconUrl,
    customCss: branding.customCss,
    fontFamily: branding.fontFamily,
  };
}

// Update branding settings
export async function updateBrandingSettings(
  input: UpdateBrandingSettingsInput
): Promise<void> {
  const { workspaceId, role } = await getCurrentUserWorkspace();
  if (role === 'viewer' || role === 'editor') {
    throw new Error('Only admins and owners can update branding settings');
  }

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
        ...(input.darkLogoUrl !== undefined && { darkLogoUrl: input.darkLogoUrl || null }),
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
        darkLogoUrl: input.darkLogoUrl || null,
        faviconUrl: input.faviconUrl || null,
        customCss: input.customCss || null,
        fontFamily: input.fontFamily || null,
      },
    });
  }

  revalidatePath(ROUTES.settings);
  revalidatePath(ROUTES.settingsBranding);
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

  revalidatePath(ROUTES.settings);
  revalidatePath(ROUTES.settingsPayments);
}

// ============================================
// TAX RATE ACTIONS
// ============================================

// Get all tax rates
export async function getTaxRates(): Promise<TaxRateData[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const taxRates = await prisma.taxRate.findMany({
    where: { workspaceId, deletedAt: null },
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
  const { workspaceId } = await getCurrentUserWorkspace();

  // MEDIUM #10: Validate rate bounds
  if (input.rate < 0 || input.rate > 100) {
    throw new Error('Tax rate must be between 0 and 100');
  }

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

  revalidatePath(ROUTES.settings);

  return { id: taxRate.id };
}

// Update tax rate
export async function updateTaxRate(input: UpdateTaxRateInput): Promise<void> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // MEDIUM #10: Validate rate bounds
  if (input.rate !== undefined && (input.rate < 0 || input.rate > 100)) {
    throw new Error('Tax rate must be between 0 and 100');
  }

  // Verify ownership
  const existing = await prisma.taxRate.findFirst({
    where: { id: input.id, workspaceId, deletedAt: null },
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

  revalidatePath(ROUTES.settings);
}

// Delete tax rate
export async function deleteTaxRate(id: string): Promise<void> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify ownership
  const existing = await prisma.taxRate.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Tax rate not found');
  }

  // Check if in use (only count active/non-deleted rate cards)
  const usageCount = await prisma.rateCard.count({
    where: { taxRateId: id, deletedAt: null },
  });

  if (usageCount > 0) {
    throw new Error(`Cannot delete tax rate. It is used by ${usageCount} rate card(s).`);
  }

  await prisma.taxRate.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath(ROUTES.settings);
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

// Zod schema for number sequence validation
const numberSequenceSchema = z.object({
  type: z.enum(['quote', 'invoice']),
  prefix: z.string().max(10, 'Prefix must be 10 characters or less').optional(),
  suffix: z.string().max(10, 'Suffix must be 10 characters or less').optional(),
  currentValue: z.number().int().min(0, 'Current value must be non-negative').optional(),
  padding: z.number().int().min(1).max(10, 'Padding must be between 1 and 10').optional(),
});

// Update number sequence
export async function updateNumberSequence(
  input: UpdateNumberSequenceInput
): Promise<void> {

  // Validate input with Zod
  const validated = numberSequenceSchema.parse(input);

  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.numberSequence.findFirst({
    where: { workspaceId, type: validated.type },
  });

  if (existing) {
    await prisma.numberSequence.update({
      where: { id: existing.id },
      data: {
        ...(validated.prefix !== undefined && { prefix: validated.prefix || null }),
        ...(validated.suffix !== undefined && { suffix: validated.suffix || null }),
        ...(validated.currentValue !== undefined && { currentValue: validated.currentValue }),
        ...(validated.padding !== undefined && { padding: validated.padding }),
      },
    });
  } else {
    await prisma.numberSequence.create({
      data: {
        workspaceId,
        type: validated.type,
        prefix: validated.prefix || (validated.type === 'quote' ? 'QT' : 'INV'),
        suffix: validated.suffix || null,
        currentValue: validated.currentValue ?? 0,
        padding: validated.padding ?? 4,
      },
    });
  }

  revalidatePath(ROUTES.settings);
  revalidatePath(ROUTES.settingsInvoice);
  revalidatePath(ROUTES.settingsQuotes);
}

// ============================================
// TEAM SETTINGS ACTIONS
// ============================================

export type WorkspaceMemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface WorkspaceMemberData {
  id: string;
  userId: string;
  role: WorkspaceMemberRole;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  joinedAt: Date;
}

// Get workspace members
export async function getWorkspaceMembers(): Promise<WorkspaceMemberData[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role as WorkspaceMemberRole,
    user: m.user,
    joinedAt: m.createdAt,
  }));
}

// Get current user's role
export async function getCurrentUserRole(): Promise<WorkspaceMemberRole> {
  const { workspaceId, userId } = await getCurrentUserWorkspace();

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  return (member?.role as WorkspaceMemberRole) || 'member';
}

// Update member role
export async function updateMemberRole(
  memberId: string,
  newRole: WorkspaceMemberRole
): Promise<{ success: boolean; error?: string }> {
  // Validate role at runtime (TypeScript types are erased, server actions accept any value)
  const validRoles = ['viewer', 'member', 'admin', 'owner'] as const;
  if (!validRoles.includes(newRole as typeof validRoles[number])) {
    return { success: false, error: 'Invalid role' };
  }

  const { workspaceId, userId } = await getCurrentUserWorkspace();

  // Get current user's role
  const currentUserMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!currentUserMember) {
    return { success: false, error: 'Not a member of this workspace' };
  }

  const currentRole = currentUserMember.role as WorkspaceMemberRole;

  // Only owners and admins can change roles
  if (currentRole !== 'owner' && currentRole !== 'admin') {
    return { success: false, error: 'Insufficient permissions' };
  }

  // Get target member
  const targetMember = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId },
  });

  if (!targetMember) {
    return { success: false, error: 'Member not found' };
  }

  // Admins cannot promote to owner
  if (currentRole === 'admin' && newRole === 'owner') {
    return { success: false, error: 'Only owners can promote to owner' };
  }

  // Cannot demote the only owner
  if (targetMember.role === 'owner') {
    const ownerCount = await prisma.workspaceMember.count({
      where: { workspaceId, role: 'owner' },
    });
    if (ownerCount === 1 && newRole !== 'owner') {
      return { success: false, error: 'Cannot demote the only owner' };
    }
  }

  // Only one owner allowed per workspace — transfer ownership
  if (newRole === 'owner') {
    // Demote current owner(s) to admin before promoting new owner
    await prisma.workspaceMember.updateMany({
      where: { workspaceId, role: 'owner' },
      data: { role: 'admin' },
    });
    // Update workspace.ownerId to the new owner
    const targetUser = await prisma.workspaceMember.findFirst({
      where: { id: memberId },
      select: { userId: true },
    });
    if (targetUser) {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: targetUser.userId },
      });
    }
  }

  const oldRole = targetMember.role;

  await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  // Bug #74: Audit log for role changes
  logger.info({ workspaceId, changedBy: userId, targetMemberId: memberId, targetUserId: targetMember.userId, oldRole, newRole }, '[AUDIT] Member role changed');

  revalidatePath(ROUTES.settingsTeam);

  return { success: true };
}

// Invite member
export async function inviteMember(
  email: string,
  role: WorkspaceMemberRole = 'member'
): Promise<{ success: boolean; error?: string }> {
  // Validate and normalize email upfront
  const emailResult = z.string().email().safeParse(email);
  if (!emailResult.success) {
    return { success: false, error: 'Invalid email address' };
  }
  const normalizedEmail = emailResult.data.toLowerCase().trim();

  // Validate role at runtime (TypeScript types are erased, server actions accept any value)
  const validRoles = ['viewer', 'member', 'admin', 'owner'] as const;
  if (!validRoles.includes(role as typeof validRoles[number])) {
    return { success: false, error: 'Invalid role' };
  }

  const { workspaceId, userId } = await getCurrentUserWorkspace();

  // Only owners and admins can invite members
  const currentRole = await getCurrentUserRole();
  if (currentRole !== 'owner' && currentRole !== 'admin') {
    return { success: false, error: 'Insufficient permissions to invite members' };
  }

  // Prevent privilege escalation: only owners can assign owner role
  if (role === 'owner' && currentRole !== 'owner') {
    return { success: false, error: 'Only workspace owners can assign the owner role' };
  }

  // Check if user exists (use normalized email)
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Check for existing pending invitation
    const existingInvitation = await prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email: normalizedEmail,
        acceptedAt: null,
        cancelledAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvitation) {
      return { success: false, error: 'An invitation has already been sent to this email' };
    }

    // Get workspace info for email
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    // Get current user name for email (reuse userId from above)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Create invitation (store hash, send raw token)
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email: normalizedEmail,
        role,
        token: tokenHash,
        invitedById: userId,
        expiresAt,
      },
    });

    // Send invitation email (don't fail if email fails)
    try {
      const { sendInvitationEmail } = await import('@/lib/services/email');
      const baseUrl = getBaseUrl();
      const inviteUrl = `${baseUrl}/invite/${rawToken}`;
      await sendInvitationEmail({
        to: normalizedEmail,
        workspaceName: workspace?.name || 'Workspace',
        inviterName: currentUser?.name || 'A team member',
        role,
        inviteUrl,
        rateLimitKey: workspaceId,
      });
    } catch (emailError) {
      logger.error({ err: emailError }, 'Failed to send invitation email');
    }

    revalidatePath(ROUTES.settingsTeam);
    return { success: true };
  }

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    return { success: false, error: 'User is already a member of this workspace' };
  }

  // Add member
  await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: user.id,
      role,
    },
  });

  revalidatePath(ROUTES.settingsTeam);

  return { success: true };
}

// Remove member
export async function removeMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId, userId } = await getCurrentUserWorkspace();

  // Get current user's role
  const currentRole = await getCurrentUserRole();

  // Only owners and admins can remove members
  if (currentRole !== 'owner' && currentRole !== 'admin') {
    return { success: false, error: 'Insufficient permissions' };
  }

  const targetMember = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId },
  });

  if (!targetMember) {
    return { success: false, error: 'Member not found' };
  }

  // Cannot remove the only owner
  if (targetMember.role === 'owner') {
    const ownerCount = await prisma.workspaceMember.count({
      where: { workspaceId, role: 'owner' },
    });
    if (ownerCount === 1) {
      return { success: false, error: 'Cannot remove the only owner' };
    }
  }

  // Cannot remove yourself
  if (targetMember.userId === userId) {
    return { success: false, error: 'Cannot remove yourself' };
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId },
  });

  revalidatePath(ROUTES.settingsTeam);

  return { success: true };
}

// ============================================
// INVITATION MANAGEMENT ACTIONS
// ============================================

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: { name: string | null };
}

export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const invitations = await prisma.workspaceInvitation.findMany({
    where: {
      workspaceId,
      acceptedAt: null,
      cancelledAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      invitedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return invitations.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
    invitedBy: { name: inv.invitedBy.name },
  }));
}

export async function cancelInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId } = await getCurrentUserWorkspace();
  const role = await getCurrentUserRole();
  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: 'Insufficient permissions' };
  }

  const invitation = await prisma.workspaceInvitation.findFirst({
    where: { id: invitationId, workspaceId, acceptedAt: null, cancelledAt: null },
  });

  if (!invitation) {
    return { success: false, error: 'Invitation not found' };
  }

  await prisma.workspaceInvitation.update({
    where: { id: invitationId },
    data: { cancelledAt: new Date() },
  });
  revalidatePath(ROUTES.settingsTeam);
  return { success: true };
}

export async function resendInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId, userId } = await getCurrentUserWorkspace();
  const role = await getCurrentUserRole();
  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: 'Insufficient permissions' };
  }

  // Rate limit to prevent email spam
  const { checkRateLimit } = await import('@/lib/rate-limit');
  const rateLimitResult = await checkRateLimit(`resend-invite:${userId}`, { limit: 5, windowMs: 300000 });
  if (rateLimitResult.limited) {
    return { success: false, error: 'Too many resend attempts. Please try again later.' };
  }

  const invitation = await prisma.workspaceInvitation.findFirst({
    where: { id: invitationId, workspaceId, acceptedAt: null, cancelledAt: null },
    include: { workspace: { select: { name: true } } },
  });

  if (!invitation) {
    return { success: false, error: 'Invitation not found' };
  }

  // Regenerate token and extend expiry (store hash, send raw)
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.workspaceInvitation.update({
    where: { id: invitationId },
    data: { token: tokenHash, expiresAt: newExpiresAt },
  });

  // Get current user name (reuse userId from above)
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  // Send email
  try {
    const { sendInvitationEmail } = await import('@/lib/services/email');
    const baseUrl = getBaseUrl();
    const inviteUrl = `${baseUrl}/invite/${rawToken}`;
    await sendInvitationEmail({
      to: invitation.email,
      workspaceName: invitation.workspace.name,
      inviterName: currentUser?.name || 'A team member',
      role: invitation.role,
      inviteUrl,
      rateLimitKey: workspaceId,
    });
  } catch (emailError) {
    logger.error({ err: emailError }, 'Failed to resend invitation email');
  }

  revalidatePath(ROUTES.settingsTeam);
  return { success: true };
}

// Accept an invitation by token (called from the invite page)
export async function acceptInvitation(
  token: string
): Promise<{ success: boolean; error?: string; workspaceId?: string }> {
  const { auth } = await import('@/lib/auth');
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return { success: false, error: 'You must be logged in to accept an invitation' };
  }

  // Rate limit by user ID to prevent brute-force token enumeration
  const { checkRateLimit } = await import('@/lib/rate-limit');
  const rateLimitResult = await checkRateLimit(`accept-invite:${session.user.id}`, { limit: 10, windowMs: 60000 });
  if (rateLimitResult.limited) {
    return { success: false, error: 'Too many attempts. Please try again later.' };
  }

  // Hash the incoming token to look up (tokens are stored as hashes)
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token: tokenHash },
    include: { workspace: { select: { name: true } } },
  });

  if (!invitation) {
    return { success: false, error: 'Invitation not found' };
  }

  if (invitation.cancelledAt) {
    return { success: false, error: 'This invitation has been cancelled' };
  }

  if (invitation.acceptedAt) {
    return { success: false, error: 'This invitation has already been accepted' };
  }

  if (new Date() > invitation.expiresAt) {
    return { success: false, error: 'This invitation has expired' };
  }

  if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return { success: false, error: 'This invitation was sent to a different email address' };
  }

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id,
      },
    },
  });

  if (existingMember) {
    // Mark invitation as accepted anyway
    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });
    return { success: true, workspaceId: invitation.workspaceId };
  }

  // Create membership and mark invitation accepted in a transaction
  await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id,
        role: (['member', 'admin', 'owner'] as const).includes(
          invitation.role as 'member' | 'admin' | 'owner'
        )
          ? (invitation.role as 'member' | 'admin' | 'owner')
          : 'member',
      },
    }),
    prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  revalidatePath(ROUTES.settingsTeam);
  return { success: true, workspaceId: invitation.workspaceId };
}

// ============================================
// BILLING SETTINGS ACTIONS
// ============================================

export interface BillingInfo {
  plan: 'free' | 'pro' | 'team';
  status: 'active' | 'canceled' | 'past_due';
  nextBillingDate: string | null;
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
}

// Get billing info
export async function getBillingInfo(): Promise<BillingInfo | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  });

  if (!workspace) {
    return null;
  }

  const settings = workspace.settings as Record<string, unknown> | null;

  // Return mock billing data for now
  return {
    plan: (settings?.plan as 'free' | 'pro' | 'team') || 'free',
    status: 'active',
    nextBillingDate: null,
    paymentMethod: null,
  };
}

// ============================================
// WORKSPACE SETTINGS ACTIONS
// ============================================

export interface WorkspaceSettings {
  id: string;
  name: string;
  slug: string;
}

// Get workspace settings
export async function getWorkspaceSettings(): Promise<WorkspaceSettings | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true, slug: true },
  });

  return workspace;
}

// Update workspace settings
export async function updateWorkspaceSettings(
  input: { name?: string; slug?: string }
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify current user is owner
  const role = await getCurrentUserRole();
  if (role !== 'owner') {
    return { success: false, error: 'Only owners can update workspace settings' };
  }

  // Bug #19: Validate slug against reserved system routes
  if (input.slug) {
    const reservedSlugs = [
      'api', 'admin', 'auth', 'login', 'register', 'settings', 'dashboard',
      'onboarding', 'quotes', 'invoices', 'clients', 'projects', 'analytics',
      'help', 'templates', 'contracts', 'rate-cards', 'q', 'i', 'p', 'c',
      'invite', 'verify-email', 'reset-password', 'forgot-password',
      'public', 'static', 'assets', '_next', 'favicon.ico',
    ];
    if (reservedSlugs.includes(input.slug.toLowerCase())) {
      return { success: false, error: 'This slug is reserved and cannot be used' };
    }

    // Check slug uniqueness if changing
    const existing = await prisma.workspace.findFirst({
      where: { slug: input.slug, id: { not: workspaceId } },
    });
    if (existing) {
      return { success: false, error: 'This slug is already taken' };
    }
  }

  // If slug is changing, record the old slug in history
  if (input.slug) {
    const currentWorkspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { slug: true },
    });

    if (currentWorkspace && currentWorkspace.slug !== input.slug) {
      await prisma.workspaceSlugHistory.create({
        data: {
          workspaceId,
          oldSlug: currentWorkspace.slug,
        },
      });

      // Bug #81: Clean up old slug history entries (keep last 90 days only)
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      await prisma.workspaceSlugHistory.deleteMany({
        where: { workspaceId, changedAt: { lt: cutoff } },
      }).catch(() => { /* non-critical cleanup */ });
    }
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.slug && { slug: input.slug }),
    },
  });

  revalidatePath(ROUTES.settingsWorkspace);

  return { success: true };
}

// Delete workspace
export async function deleteWorkspace(): Promise<{ success: boolean; error?: string }> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify current user is owner
  const role = await getCurrentUserRole();
  if (role !== 'owner') {
    return { success: false, error: 'Only owners can delete the workspace' };
  }

  // Bug #69: Notify all workspace members before deletion
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });

  // Bug #132: Check for pending/active payments before deletion
  const activePayments = await prisma.payment.count({
    where: {
      invoice: { workspaceId },
      status: 'pending',
    },
  });
  if (activePayments > 0) {
    return { success: false, error: 'Cannot delete workspace with pending payments. Please resolve all payments first.' };
  }

  // Bug #87: Cascade soft-delete to all workspace entities
  const deletedAt = new Date();
  await prisma.$transaction([
    prisma.quote.updateMany({
      where: { workspaceId, deletedAt: null },
      data: { deletedAt },
    }),
    prisma.invoice.updateMany({
      where: { workspaceId, deletedAt: null },
      data: { deletedAt },
    }),
    prisma.client.updateMany({
      where: { workspaceId, deletedAt: null },
      data: { deletedAt },
    }),
    prisma.project.updateMany({
      where: { workspaceId, deletedAt: null },
      data: { deletedAt },
    }),
    prisma.contract.updateMany({
      where: { workspaceId, deletedAt: null },
      data: { deletedAt },
    }),
    prisma.contractInstance.updateMany({
      where: { workspaceId, deletedAt: null },
      data: { deletedAt },
    }),
    prisma.rateCard.updateMany({
      where: { workspaceId, deletedAt: null },
      data: { deletedAt },
    }),
    prisma.workspace.update({
      where: { id: workspaceId },
      data: { deletedAt },
    }),
  ]);

  // Create notifications for all members
  try {
    const { createNotification } = await import('@/lib/notifications/internal');
    await Promise.allSettled(
      members.map((member) =>
        createNotification({
          userId: member.userId,
          workspaceId,
          type: 'workspace_deleted',
          title: `Workspace "${workspace?.name}" has been deleted`,
          message: 'The workspace owner has deleted this workspace.',
          entityType: 'workspace',
          entityId: workspaceId,
          link: '/dashboard',
        })
      )
    );
  } catch (error) {
    logger.error({ err: error }, 'Failed to send workspace deletion notifications');
  }

  revalidatePath('/');

  return { success: true };
}

// ============================================
// INVOICE DEFAULTS
// ============================================

export interface InvoiceDefaults {
  paymentTerms: string;
  defaultNotes: string;
  defaultTerms: string;
  lateFeeEnabled: boolean;
  lateFeeType: 'percentage' | 'fixed';
  lateFeeValue: number;
  reminderEnabled: boolean;
  reminderDays: number[];
}

const DEFAULT_INVOICE_DEFAULTS: InvoiceDefaults = {
  paymentTerms: 'net30',
  defaultNotes: '',
  defaultTerms: '',
  lateFeeEnabled: false,
  lateFeeType: 'percentage',
  lateFeeValue: 0,
  reminderEnabled: true,
  reminderDays: [7, 3, 1],
};

export async function getInvoiceDefaults(): Promise<InvoiceDefaults> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  });

  const settings = workspace?.settings as Record<string, unknown> | null;
  const invoiceDefaults = settings?.invoiceDefaults as Partial<InvoiceDefaults> | undefined;

  return { ...DEFAULT_INVOICE_DEFAULTS, ...invoiceDefaults };
}

export async function updateInvoiceDefaults(
  input: Partial<InvoiceDefaults>
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // Bug #89: Use transaction to prevent concurrent read-modify-write races
  await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.findUnique({
      where: { id: workspaceId },
      select: { settings: true, updatedAt: true },
    });

    const currentSettings = (workspace?.settings as Record<string, unknown>) || {};
    const currentDefaults = (currentSettings.invoiceDefaults as Partial<InvoiceDefaults>) || {};

    await tx.workspace.update({
      where: { id: workspaceId, updatedAt: workspace?.updatedAt },
      data: {
        settings: {
          ...currentSettings,
          invoiceDefaults: { ...currentDefaults, ...input },
        },
      },
    });
  });

  revalidatePath(ROUTES.settingsInvoice);

  return { success: true };
}

// ============================================
// WORKSPACE CURRENCY HELPER
// ============================================

/**
 * Get the workspace's default currency from the business profile.
 * Falls back to 'USD' if no business profile or currency is set.
 * This should be used as the default currency for new quotes/invoices.
 */
export async function getWorkspaceCurrency(): Promise<string> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const profile = await prisma.businessProfile.findUnique({
    where: { workspaceId },
    select: { currency: true },
  });

  return profile?.currency || 'USD';
}

// ============================================
// COMBINED SETTINGS
// ============================================

// ============================================
// CUSTOM FIELDS (STUB)
// ============================================

export async function getCustomFields(): Promise<CustomFieldData[]> {
  // TODO: Wire up to database when custom fields table is added
  return [];
}

export async function createCustomField(input: {
  name: string;
  fieldType: string;
  appliesTo: string[];
  isRequired?: boolean;
  options?: string[];
}): Promise<{ id: string }> {
  // TODO: Wire up to database

  revalidatePath('/settings/custom-fields');
  return { id: crypto.randomUUID() };
}

export async function updateCustomField(input: {
  id: string;
  name?: string;
  fieldType?: string;
  appliesTo?: string[];
  isRequired?: boolean;
  isActive?: boolean;
  options?: string[];
  sortOrder?: number;
}): Promise<void> {
  // TODO: Wire up to database

  revalidatePath('/settings/custom-fields');
}

export async function deleteCustomField(id: string): Promise<void> {
  // TODO: Wire up to database

  revalidatePath('/settings/custom-fields');
}

// ============================================
// INTEGRATIONS (STUB)
// ============================================

export async function getIntegrations(): Promise<IntegrationData[]> {
  return [
    {
      id: 'webhooks',
      name: 'Webhooks',
      provider: 'webhooks',
      description: 'Send real-time event notifications to any URL when actions occur in your workspace (e.g. quote accepted, invoice paid).',
      isConnected: false,
      isAvailable: true,
      connectedAt: null,
      config: {},
    },
    {
      id: 'zapier',
      name: 'Zapier',
      provider: 'zapier',
      description: 'Connect QuoteCraft to 5,000+ apps using Zapier. Set up a webhook in QuoteCraft and use it as a Zapier trigger.',
      isConnected: false,
      isAvailable: true,
      connectedAt: null,
      config: {},
    },
    {
      id: 'n8n',
      name: 'n8n',
      provider: 'n8n',
      description: 'Build powerful self-hosted automations with n8n. Use QuoteCraft webhooks as triggers in your n8n workflows.',
      isConnected: false,
      isAvailable: true,
      connectedAt: null,
      config: {},
    },
    {
      id: 'make',
      name: 'Make (Integromat)',
      provider: 'make',
      description: 'Create visual automation scenarios with Make. Connect QuoteCraft events to hundreds of services via webhooks.',
      isConnected: false,
      isAvailable: true,
      connectedAt: null,
      config: {},
    },
  ];
}

// ============================================
// WEBHOOKS
// ============================================

export async function getWebhooks(): Promise<WebhookData[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  return endpoints.map((ep) => ({
    id: ep.id,
    name: ep.name || ep.url,
    url: ep.url,
    secret: ep.secret,
    events: ep.events as WebhookData['events'],
    isActive: ep.isActive,
    createdAt: ep.createdAt,
    updatedAt: ep.updatedAt,
  }));
}

export async function createWebhook(input: {
  name: string;
  url: string;
  events: string[];
  secret?: string;
}): Promise<{ id: string }> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    throw new Error('Viewers cannot create webhooks');
  }

  // Generate a signing secret if none provided
  const secret = input.secret || `whsec_${randomBytes(24).toString('hex')}`;

  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      workspaceId,
      name: input.name.trim(),
      url: input.url.trim(),
      events: input.events,
      secret,
      isActive: true,
    },
  });

  revalidatePath('/settings/webhooks');
  return { id: endpoint.id };
}

export async function updateWebhook(input: {
  id: string;
  name?: string;
  url?: string;
  events?: string[];
  secret?: string;
  isActive?: boolean;
}): Promise<void> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    throw new Error('Viewers cannot update webhooks');
  }

  // Verify the webhook belongs to this workspace
  const existing = await prisma.webhookEndpoint.findFirst({
    where: { id: input.id, workspaceId },
  });

  if (!existing) {
    throw new Error('Webhook not found');
  }

  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.url !== undefined) data.url = input.url.trim();
  if (input.events !== undefined) data.events = input.events;
  if (input.secret !== undefined) data.secret = input.secret;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  await prisma.webhookEndpoint.update({
    where: { id: input.id },
    data,
  });

  revalidatePath('/settings/webhooks');
}

export async function deleteWebhook(id: string): Promise<void> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    throw new Error('Viewers cannot delete webhooks');
  }

  // Verify the webhook belongs to this workspace
  const existing = await prisma.webhookEndpoint.findFirst({
    where: { id, workspaceId },
  });

  if (!existing) {
    throw new Error('Webhook not found');
  }

  await prisma.webhookEndpoint.delete({
    where: { id },
  });

  revalidatePath('/settings/webhooks');
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
