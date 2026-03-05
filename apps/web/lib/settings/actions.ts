'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma, Prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
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
  const { workspaceId } = await getCurrentUserWorkspace();

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

  revalidatePath('/settings/tax-rates');
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

  revalidatePath('/settings');
  revalidatePath('/settings/invoices');
  revalidatePath('/settings/quotes');
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

  await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  revalidatePath('/settings/team');

  return { success: true };
}

// Invite member
export async function inviteMember(
  email: string,
  role: WorkspaceMemberRole = 'member'
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // Only owners and admins can invite members
  const currentRole = await getCurrentUserRole();
  if (currentRole !== 'owner' && currentRole !== 'admin') {
    return { success: false, error: 'Insufficient permissions to invite members' };
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing pending invitation
    const existingInvitation = await prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email: normalizedEmail,
        acceptedAt: null,
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

    // Get current user name for email
    const { userId } = await getCurrentUserWorkspace();
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Create invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email: normalizedEmail,
        role,
        token,
        invitedById: userId,
        expiresAt,
      },
    });

    // Send invitation email (don't fail if email fails)
    try {
      const { sendInvitationEmail } = await import('@/lib/services/email');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const inviteUrl = `${baseUrl}/invite/${token}`;
      await sendInvitationEmail({
        to: normalizedEmail,
        workspaceName: workspace?.name || 'Workspace',
        inviterName: currentUser?.name || 'A team member',
        role,
        inviteUrl,
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    revalidatePath('/settings/team');
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

  revalidatePath('/settings/team');

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

  revalidatePath('/settings/team');

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
    where: { id: invitationId, workspaceId, acceptedAt: null },
  });

  if (!invitation) {
    return { success: false, error: 'Invitation not found' };
  }

  await prisma.workspaceInvitation.delete({ where: { id: invitationId } });
  revalidatePath('/settings/team');
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

  const invitation = await prisma.workspaceInvitation.findFirst({
    where: { id: invitationId, workspaceId, acceptedAt: null },
    include: { workspace: { select: { name: true } } },
  });

  if (!invitation) {
    return { success: false, error: 'Invitation not found' };
  }

  // Regenerate token and extend expiry
  const newToken = crypto.randomUUID();
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.workspaceInvitation.update({
    where: { id: invitationId },
    data: { token: newToken, expiresAt: newExpiresAt },
  });

  // Get current user name (reuse userId from above)
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  // Send email
  try {
    const { sendInvitationEmail } = await import('@/lib/services/email');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${newToken}`;
    await sendInvitationEmail({
      to: invitation.email,
      workspaceName: invitation.workspace.name,
      inviterName: currentUser?.name || 'A team member',
      role: invitation.role,
      inviteUrl,
    });
  } catch (emailError) {
    console.error('Failed to resend invitation email:', emailError);
  }

  revalidatePath('/settings/team');
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

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: { workspace: { select: { name: true } } },
  });

  if (!invitation) {
    return { success: false, error: 'Invitation not found' };
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

  revalidatePath('/settings/team');
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

  // Check slug uniqueness if changing
  if (input.slug) {
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
    }
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.slug && { slug: input.slug }),
    },
  });

  revalidatePath('/settings/workspace');

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

  // Soft delete workspace (or implement hard delete with cascading)
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { deletedAt: new Date() },
  });

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

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  });

  const currentSettings = (workspace?.settings as Record<string, unknown>) || {};
  const currentDefaults = (currentSettings.invoiceDefaults as Partial<InvoiceDefaults>) || {};

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...currentSettings,
        invoiceDefaults: { ...currentDefaults, ...input },
      },
    },
  });

  revalidatePath('/settings/invoices');

  return { success: true };
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
