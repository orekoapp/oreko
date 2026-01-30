'use server';

import { prisma, Prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendEmail, sendQuoteSentEmail, sendInvoiceSentEmail } from '@/lib/services/email';
import { assertNotDemo } from '@/lib/demo/guard';
import type {
  EmailTemplateListItem,
  EmailTemplateDetail,
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput,
  EmailTemplateFilter,
  ScheduledEmailListItem,
  EmailVariables,
  EmailTemplateType,
  DEFAULT_TEMPLATES,
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

// Get all email templates
export async function getEmailTemplates(
  filter: EmailTemplateFilter = {}
): Promise<EmailTemplateListItem[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const { type, search, isActive } = filter;

  const where: Prisma.EmailTemplateWhereInput = {
    workspaceId,
    ...(type && { type }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const templates = await prisma.emailTemplate.findMany({
    where,
    orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
  });

  return templates.map((t) => ({
    id: t.id,
    type: t.type,
    name: t.name,
    subject: t.subject,
    isActive: t.isActive,
    isDefault: t.isDefault,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
}

// Get email template by ID
export async function getEmailTemplateById(id: string): Promise<EmailTemplateDetail | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const template = await prisma.emailTemplate.findFirst({
    where: { id, workspaceId },
  });

  if (!template) {
    return null;
  }

  return {
    id: template.id,
    workspaceId: template.workspaceId,
    type: template.type,
    name: template.name,
    subject: template.subject,
    body: template.body,
    isActive: template.isActive,
    isDefault: template.isDefault,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

// Get active template by type
export async function getActiveTemplateByType(type: EmailTemplateType): Promise<EmailTemplateDetail | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const template = await prisma.emailTemplate.findFirst({
    where: { workspaceId, type, isActive: true },
    orderBy: { isDefault: 'desc' },
  });

  if (!template) {
    return null;
  }

  return {
    id: template.id,
    workspaceId: template.workspaceId,
    type: template.type,
    name: template.name,
    subject: template.subject,
    body: template.body,
    isActive: template.isActive,
    isDefault: template.isDefault,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

// Create email template
export async function createEmailTemplate(
  input: CreateEmailTemplateInput
): Promise<EmailTemplateDetail> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // If setting as default, unset other defaults of same type
  if (input.isDefault) {
    await prisma.emailTemplate.updateMany({
      where: { workspaceId, type: input.type, isDefault: true },
      data: { isDefault: false },
    });
  }

  const template = await prisma.emailTemplate.create({
    data: {
      workspaceId,
      type: input.type,
      name: input.name,
      subject: input.subject,
      body: input.body,
      isActive: input.isActive ?? true,
      isDefault: input.isDefault ?? false,
    },
  });

  revalidatePath('/settings/emails');

  return {
    id: template.id,
    workspaceId: template.workspaceId,
    type: template.type,
    name: template.name,
    subject: template.subject,
    body: template.body,
    isActive: template.isActive,
    isDefault: template.isDefault,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

// Update email template
export async function updateEmailTemplate(
  input: UpdateEmailTemplateInput
): Promise<EmailTemplateDetail> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.emailTemplate.findFirst({
    where: { id: input.id, workspaceId },
  });

  if (!existing) {
    throw new Error('Email template not found');
  }

  // If setting as default, unset other defaults of same type
  if (input.isDefault) {
    await prisma.emailTemplate.updateMany({
      where: { workspaceId, type: existing.type, isDefault: true, id: { not: input.id } },
      data: { isDefault: false },
    });
  }

  const template = await prisma.emailTemplate.update({
    where: { id: input.id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.subject && { subject: input.subject }),
      ...(input.body && { body: input.body }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
    },
  });

  revalidatePath('/settings/emails');
  revalidatePath(`/settings/emails/${input.id}`);

  return {
    id: template.id,
    workspaceId: template.workspaceId,
    type: template.type,
    name: template.name,
    subject: template.subject,
    body: template.body,
    isActive: template.isActive,
    isDefault: template.isDefault,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

// Delete email template
export async function deleteEmailTemplate(id: string): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.emailTemplate.findFirst({
    where: { id, workspaceId },
  });

  if (!existing) {
    throw new Error('Email template not found');
  }

  await prisma.emailTemplate.delete({
    where: { id },
  });

  revalidatePath('/settings/emails');
}

// Process template with variables
function processTemplate(template: string, variables: EmailVariables): string {
  let result = template;

  // Replace simple variables
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  });

  // Handle simple conditionals {{#if variable}}...{{/if}}
  result = result.replace(
    /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g,
    (_, varName, content) => {
      const value = variables[varName as keyof EmailVariables];
      return value ? content : '';
    }
  );

  return result;
}

// Send email using template
export async function sendTemplatedEmail(params: {
  type: EmailTemplateType;
  to: string;
  variables: EmailVariables;
  customSubject?: string;
  customBody?: string;
}): Promise<{ success: boolean; error?: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();
  const { type, to, variables, customSubject, customBody } = params;

  // Get active template for this type
  const template = await prisma.emailTemplate.findFirst({
    where: { workspaceId, type, isActive: true },
    orderBy: { isDefault: 'desc' },
  });

  const subject = customSubject || (template ? template.subject : '');
  const body = customBody || (template ? template.body : '');

  if (!subject || !body) {
    return { success: false, error: 'No active template found for this email type' };
  }

  const processedSubject = processTemplate(subject, variables);
  const processedBody = processTemplate(body, variables);

  // Wrap body in email layout
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${processedBody}
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 14px;">
        Sent via QuoteCraft on behalf of ${variables.businessName}
      </p>
    </div>
  `;

  const result = await sendEmail({
    to,
    subject: processedSubject,
    html,
    tags: [{ name: 'type', value: type }],
  });

  return {
    success: result.success,
    error: result.error,
  };
}

// Get scheduled emails
export async function getScheduledEmails(filter?: {
  status?: string;
  limit?: number;
}): Promise<ScheduledEmailListItem[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const emails = await prisma.scheduledEmail.findMany({
    where: {
      workspaceId,
      ...(filter?.status && { status: filter.status }),
    },
    orderBy: { scheduledFor: 'asc' },
    take: filter?.limit || 50,
  });

  return emails.map((e) => ({
    id: e.id,
    type: e.type,
    entityType: e.entityType,
    entityId: e.entityId,
    recipientEmail: e.recipientEmail,
    recipientName: e.recipientName,
    subject: e.subject,
    scheduledFor: e.scheduledFor,
    status: e.status,
    sentAt: e.sentAt,
    createdAt: e.createdAt,
  }));
}

// Cancel scheduled email
export async function cancelScheduledEmail(id: string): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.scheduledEmail.findFirst({
    where: { id, workspaceId, status: 'pending' },
  });

  if (!existing) {
    throw new Error('Scheduled email not found or already processed');
  }

  await prisma.scheduledEmail.update({
    where: { id },
    data: { status: 'cancelled' },
  });

  revalidatePath('/settings/emails');
}

// Send contract email
export async function sendContractSentEmail(params: {
  contractInstanceId: string;
  message?: string;
}): Promise<{ success: boolean; error?: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const instance = await prisma.contractInstance.findFirst({
    where: { id: params.contractInstanceId, workspaceId },
    include: {
      contract: { select: { name: true } },
      client: { select: { name: true, email: true, company: true } },
      workspace: {
        select: {
          businessProfile: {
            select: { businessName: true, email: true },
          },
        },
      },
    },
  });

  if (!instance) {
    throw new Error('Contract instance not found');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const contractUrl = `${baseUrl}/c/${instance.accessToken}`;

  const variables: EmailVariables = {
    businessName: instance.workspace.businessProfile?.businessName || 'Your Business',
    businessEmail: instance.workspace.businessProfile?.email || undefined,
    clientName: instance.client.company || instance.client.name,
    clientEmail: instance.client.email,
    contractName: instance.contract.name,
    contractUrl,
    message: params.message,
  };

  return sendTemplatedEmail({
    type: 'contract_sent',
    to: instance.client.email,
    variables,
  });
}

// Send contract signed notification email
export async function sendContractSignedEmail(params: {
  contractInstanceId: string;
}): Promise<{ success: boolean; error?: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const instance = await prisma.contractInstance.findFirst({
    where: { id: params.contractInstanceId, workspaceId },
    include: {
      contract: { select: { name: true } },
      client: { select: { name: true, email: true, company: true } },
      workspace: {
        select: {
          businessProfile: {
            select: { businessName: true, email: true },
          },
        },
      },
    },
  });

  if (!instance) {
    throw new Error('Contract instance not found');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const contractUrl = `${baseUrl}/contracts/${instance.id}`;

  const variables: EmailVariables = {
    businessName: instance.workspace.businessProfile?.businessName || 'Your Business',
    businessEmail: instance.workspace.businessProfile?.email || undefined,
    clientName: instance.client.company || instance.client.name,
    clientEmail: instance.client.email,
    contractName: instance.contract.name,
    contractUrl,
  };

  // Send to the business owner
  const businessEmail = instance.workspace.businessProfile?.email;
  if (!businessEmail) {
    return { success: false, error: 'No business email configured' };
  }

  return sendTemplatedEmail({
    type: 'contract_signed',
    to: businessEmail,
    variables,
  });
}
