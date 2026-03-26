'use server';

import { getBaseUrl } from '@/lib/utils';
import { prisma, Prisma } from '@quotecraft/database';
import { revalidatePath } from 'next/cache';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type {
  ContractTemplateListItem,
  ContractTemplateDetail,
  ContractInstanceListItem,
  ContractInstanceDetail,
  ContractVariable,
  CreateContractTemplateInput,
  UpdateContractTemplateInput,
  CreateContractInstanceInput,
  SignContractInput,
  ContractFilter,
  ContractInstanceFilter,
  PaginatedContracts,
  PaginatedContractInstances,
  SignatureData,
  ContractSettingsData,
} from './types';
import { sendEmail } from '@/lib/services/email';
import { sendTemplatedEmail } from '@/lib/email/actions';
import { createNotification, notifyWorkspaceMembers } from '@/lib/notifications/internal';
import { checkRateLimit, strictRateLimitOptions } from '@/lib/rate-limit';
import { computeContractDocumentHash, verifyDocumentHash } from '@/lib/signing/document-hash';
import { logger } from '@/lib/logger';

// HTML escape for safe email template interpolation
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// CR #4: Log parse failures instead of silently returning empty array
function safeParseVariables(variables: unknown): ContractVariable[] {
  try {
    if (Array.isArray(variables)) return variables;
    if (typeof variables === 'string') return JSON.parse(variables);
    return [];
  } catch (error) {
    logger.warn({ err: error }, '[contracts] Failed to parse contract variables');
    return [];
  }
}

function parseContractVariables(variables: unknown): ContractVariable[] {
  try {
    const parsed = typeof variables === 'string' ? JSON.parse(variables) : variables;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Get all contract templates
export async function getContractTemplates(
  filter: ContractFilter = {}
): Promise<PaginatedContracts> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const {
    search,
    isTemplate = true,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filter;

  const where: Prisma.ContractWhereInput = {
    workspaceId,
    deletedAt: null,
    isTemplate,
    ...(search && {
      name: { contains: search, mode: 'insensitive' },
    }),
  };

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      include: {
        _count: { select: { instances: true } },
      },
      orderBy: { [(['name', 'createdAt', 'updatedAt', 'status'].includes(sortBy) ? sortBy : 'createdAt')]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contract.count({ where }),
  ]);

  return {
    data: contracts.map((c) => ({
      id: c.id,
      name: c.name,
      isTemplate: c.isTemplate,
      variables: safeParseVariables(c.variables),
      instanceCount: c._count.instances,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get a single contract template by ID
export async function getContractTemplateById(id: string): Promise<ContractTemplateDetail | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const contract = await prisma.contract.findFirst({
    where: {
      id,
      workspaceId,
      deletedAt: null,
    },
    include: {
      _count: { select: { instances: true } },
    },
  });

  if (!contract) {
    return null;
  }

  return {
    id: contract.id,
    workspaceId: contract.workspaceId,
    name: contract.name,
    content: contract.content,
    isTemplate: contract.isTemplate,
    variables: safeParseVariables(contract.variables),
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
    deletedAt: contract.deletedAt,
    _count: {
      instances: contract._count.instances,
    },
  };
}

// Create a new contract template
export async function createContractTemplate(
  input: CreateContractTemplateInput
): Promise<ContractTemplateDetail> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  // HIGH #11: Viewers cannot create contract templates
  if (role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  // MEDIUM #12: Basic input validation
  if (!input.name || typeof input.name !== 'string' || !input.name.trim()) {
    throw new Error('Contract template name is required');
  }

  const contract = await prisma.contract.create({
    data: {
      workspaceId,
      name: input.name,
      content: input.content,
      isTemplate: input.isTemplate ?? true,
      variables: (input.variables ?? []) as unknown as Prisma.InputJsonValue,
    },
    include: {
      _count: { select: { instances: true } },
    },
  });

  revalidatePath('/templates');

  return {
    id: contract.id,
    workspaceId: contract.workspaceId,
    name: contract.name,
    content: contract.content,
    isTemplate: contract.isTemplate,
    variables: safeParseVariables(contract.variables),
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
    deletedAt: contract.deletedAt,
    _count: {
      instances: contract._count.instances,
    },
  };
}

// Update a contract template
export async function updateContractTemplate(
  input: UpdateContractTemplateInput
): Promise<ContractTemplateDetail> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  // HIGH #11: Viewers cannot update contract templates
  if (role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  // MEDIUM #12: Basic input validation
  if (input.name !== undefined && (typeof input.name !== 'string' || !input.name.trim())) {
    throw new Error('Contract template name cannot be empty');
  }

  // Verify the contract belongs to the workspace
  const existing = await prisma.contract.findFirst({
    where: { id: input.id, workspaceId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Contract template not found');
  }

  const contract = await prisma.contract.update({
    where: { id: input.id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.isTemplate !== undefined && { isTemplate: input.isTemplate }),
      ...(input.variables !== undefined && { variables: input.variables as unknown as Prisma.InputJsonValue }),
    },
    include: {
      _count: { select: { instances: true } },
    },
  });

  revalidatePath('/templates');
  revalidatePath(`/templates/${input.id}`);

  return {
    id: contract.id,
    workspaceId: contract.workspaceId,
    name: contract.name,
    content: contract.content,
    isTemplate: contract.isTemplate,
    variables: safeParseVariables(contract.variables),
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
    deletedAt: contract.deletedAt,
    _count: {
      instances: contract._count.instances,
    },
  };
}

// Delete a contract template (soft delete)
export async function deleteContractTemplate(id: string): Promise<void> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  // HIGH #11: Viewers cannot delete contract templates
  if (role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  const existing = await prisma.contract.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Contract template not found');
  }

  await prisma.contract.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/templates');
}

// Get contract instances
export async function getContractInstances(
  filter: ContractInstanceFilter = {}
): Promise<PaginatedContractInstances> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const { search, status, clientId, page = 1, limit = 10 } = filter;

  const where: Prisma.ContractInstanceWhereInput = {
    workspaceId,
    deletedAt: null,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(search && {
      OR: [
        { contract: { name: { contains: search, mode: 'insensitive' } } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { company: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [instances, total] = await Promise.all([
    prisma.contractInstance.findMany({
      where,
      include: {
        contract: { select: { name: true, variables: true } },
        client: { select: { name: true, email: true, company: true } },
        quote: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contractInstance.count({ where }),
  ]);

  return {
    data: instances.map((i) => {
      const vars = i.contract?.variables;
      const variablesCount = Array.isArray(vars) ? vars.length : 0;
      return {
        id: i.id,
        contractName: i.contract?.name ?? 'Untitled',
        clientName: i.client?.company || i.client?.name || 'Unknown',
        clientEmail: i.client?.email || null,
        quoteName: i.quote?.title || null,
        status: i.status,
        variablesCount,
        sentAt: i.sentAt,
        viewedAt: i.viewedAt,
        signedAt: i.signedAt,
        createdAt: i.createdAt,
      };
    }),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get a single contract instance by ID
export async function getContractInstanceById(id: string): Promise<ContractInstanceDetail | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  // MEDIUM #20: Filter out soft-deleted contract instances
  const instance = await prisma.contractInstance.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: {
      contract: { select: { name: true } },
      client: { select: { name: true, email: true, company: true } },
      quote: { select: { title: true } },
    },
  });

  if (!instance) {
    return null;
  }

  return {
    id: instance.id,
    contractId: instance.contractId ?? '',
    contractName: instance.contract?.name ?? 'Untitled',
    clientId: instance.clientId ?? '',
    clientName: instance.client?.company || instance.client?.name || 'Unknown',
    clientEmail: instance.client?.email || null,
    quoteId: instance.quoteId,
    quoteName: instance.quote?.title || null,
    workspaceId: instance.workspaceId,
    content: instance.content,
    status: instance.status,
    accessToken: instance.accessToken,
    sentAt: instance.sentAt,
    viewedAt: instance.viewedAt,
    signedAt: instance.signedAt,
    signatureData: (instance.signatureData as unknown) as SignatureData | null,
    signerIpAddress: instance.signerIpAddress,
    countersignedAt: instance.countersignedAt,
    countersignatureData: (instance.countersignatureData as unknown) as SignatureData | null,
    countersignerName: instance.countersignerName,
    pdfUrl: instance.pdfUrl,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  };
}

// Get contract instance by access token (for public client view)
export async function getContractInstanceByToken(token: string): Promise<ContractInstanceDetail | null> {
  // HIGH #3-7: Add deletedAt check to prevent accessing soft-deleted contract instances
  const instance = await prisma.contractInstance.findFirst({
    where: { accessToken: token, deletedAt: null },
    include: {
      contract: { select: { name: true } },
      client: { select: { name: true, email: true, company: true } },
      quote: { select: { title: true } },
      workspace: {
        select: {
          businessProfile: {
            select: {
              businessName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!instance) {
    return null;
  }

  // HIGH #44: Only update to 'viewed' if current status is 'sent' (don't overwrite signed/pending)
  if (instance.status === 'sent') {
    await prisma.contractInstance.update({
      where: { id: instance.id },
      data: { viewedAt: instance.viewedAt ?? new Date(), status: 'viewed' },
    });
  }

  // Verify document hash integrity for signed contracts
  let documentIntegrity: 'verified' | 'tampered' | 'unchecked' = 'unchecked';
  if (instance.signedAt && instance.signatureData) {
    try {
      const sigData = instance.signatureData as Record<string, unknown>;
      const storedHash = sigData.documentHash as string | undefined;
      if (storedHash) {
        const recomputedHash = computeContractDocumentHash({
          contractInstanceId: instance.id,
          content: instance.content,
          signerName: (sigData.signerName as string) || (sigData.name as string) || 'Unknown',
          signedAt: (sigData.signedAt as string) || instance.signedAt.toISOString(),
        });
        documentIntegrity = verifyDocumentHash(recomputedHash, storedHash) ? 'verified' : 'tampered';
      }
    } catch (err) {
      logger.error({ err }, 'Document hash verification failed');
    }
  }

  return {
    id: instance.id,
    contractId: instance.contractId ?? '',
    contractName: instance.contract?.name ?? 'Untitled',
    clientId: instance.clientId ?? '',
    clientName: instance.client?.company || instance.client?.name || 'Unknown',
    clientEmail: instance.client?.email || null,
    quoteId: instance.quoteId,
    quoteName: instance.quote?.title || null,
    workspaceId: instance.workspaceId,
    content: instance.content,
    status: instance.viewedAt ? instance.status : 'viewed',
    accessToken: instance.accessToken,
    sentAt: instance.sentAt,
    viewedAt: instance.viewedAt ?? new Date(),
    signedAt: instance.signedAt,
    signatureData: (instance.signatureData as unknown) as SignatureData | null,
    signerIpAddress: instance.signerIpAddress,
    countersignedAt: instance.countersignedAt,
    countersignatureData: (instance.countersignatureData as unknown) as SignatureData | null,
    countersignerName: instance.countersignerName,
    pdfUrl: instance.pdfUrl,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
    documentIntegrity,
  };
}

// Create a contract instance from a template
export async function createContractInstance(
  input: CreateContractInstanceInput
): Promise<ContractInstanceDetail> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  // HIGH #43: Viewers cannot create contract instances
  if (role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  // Get the template
  const template = await prisma.contract.findFirst({
    where: { id: input.contractId, workspaceId, deletedAt: null },
  });

  if (!template) {
    throw new Error('Contract template not found');
  }

  // Get the client
  const client = await prisma.client.findFirst({
    where: { id: input.clientId, workspaceId, deletedAt: null },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  // Get quote if provided
  let quote = null;
  if (input.quoteId) {
    quote = await prisma.quote.findFirst({
      where: { id: input.quoteId, workspaceId, deletedAt: null },
    });
    if (!quote) {
      throw new Error('Quote not found');
    }
  }

  // Process template content with variable values
  let content = input.content || template.content;
  if (input.variableValues) {
    const variables = safeParseVariables(template.variables) as Array<ContractVariable & { name?: string }>;
    for (const variable of variables) {
      // Support both 'key' (type definition) and 'name' (seed data) fields
      const varKey = variable.key || variable.name || '';
      if (!varKey) continue;
      const rawValue = input.variableValues[varKey] || variable.defaultValue || '';
      // HIGH #45: Escape HTML to prevent XSS via contract variable injection
      const value = escapeHtml(rawValue);
      // CR #9: Use replaceAll instead of RegExp to avoid ReDoS risk
      content = content.replaceAll(`{{${varKey}}}`, value);
    }
  }

  // Replace common placeholders (HIGH #45: escape to prevent XSS)
  content = content
    .replace(/{{clientName}}/g, escapeHtml(client.company || client.name))
    .replace(/{{clientEmail}}/g, escapeHtml(client.email))
    .replace(/{{date}}/g, escapeHtml(new Date().toLocaleDateString()));

  // Bug #186: Support creating and immediately sending via sendImmediately flag
  const { randomBytes } = await import('crypto');
  const accessToken = randomBytes(32).toString('hex');

  const instance = await prisma.contractInstance.create({
    data: {
      contractId: input.contractId,
      clientId: input.clientId,
      quoteId: input.quoteId,
      workspaceId,
      content,
      accessToken,
      status: input.sendImmediately ? 'sent' : 'draft',
      ...(input.sendImmediately ? { sentAt: new Date() } : {}),
    },
    include: {
      contract: { select: { name: true } },
      client: { select: { name: true, email: true, company: true } },
      quote: { select: { title: true } },
    },
  });

  revalidatePath('/contracts');

  return {
    id: instance.id,
    contractId: instance.contractId ?? '',
    contractName: instance.contract?.name ?? 'Untitled',
    clientId: instance.clientId ?? '',
    clientName: instance.client?.company || instance.client?.name || 'Unknown',
    clientEmail: instance.client?.email || null,
    quoteId: instance.quoteId,
    quoteName: instance.quote?.title || null,
    workspaceId: instance.workspaceId,
    content: instance.content,
    status: instance.status,
    accessToken: instance.accessToken,
    sentAt: instance.sentAt,
    viewedAt: instance.viewedAt,
    signedAt: instance.signedAt,
    signatureData: (instance.signatureData as unknown) as SignatureData | null,
    signerIpAddress: instance.signerIpAddress,
    countersignedAt: instance.countersignedAt,
    countersignatureData: (instance.countersignatureData as unknown) as SignatureData | null,
    countersignerName: instance.countersignerName,
    pdfUrl: instance.pdfUrl,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  };
}

// Send a contract instance to client
// Bug #105: Accept optional email customization from SendEmailDialog
interface SendEmailOptions {
  recipients?: string[];
  subject?: string;
  message?: string;
}

export async function sendContractInstance(id: string, emailOptions?: SendEmailOptions): Promise<{ emailSent: boolean }> {
  const { workspaceId, userId, role } = await getCurrentUserWorkspace();

  // HIGH #43: Viewers cannot send contract instances
  if (role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  // MEDIUM #21: Filter out soft-deleted contract instances
  const instance = await prisma.contractInstance.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: {
      client: true,
      contract: { select: { name: true } },
    },
  });

  if (!instance) {
    throw new Error('Contract instance not found');
  }

  // Prevent sending already-signed or voided contracts
  if (instance.status === 'signed' || instance.status === 'voided') {
    throw new Error(`Cannot send a contract that is already ${instance.status}`);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  // Send email notification FIRST — only update status if email succeeds
  let emailSent = false;
  if (instance.client?.email && workspace) {
    const baseUrl = getBaseUrl();
    const contractUrl = `${baseUrl}/c/${instance.accessToken}`;
    const contractName = instance.contract?.name || 'Contract';

    // Bug #105: Use custom recipients from dialog if provided
    const emailRecipients = emailOptions?.recipients?.length
      ? emailOptions.recipients
      : [instance.client.email];

    // Get business email from profile
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { workspaceId },
      select: { email: true },
    });

    try {
      const emailResult = await sendTemplatedEmail({
        type: 'contract_sent',
        to: emailRecipients,
        variables: {
          businessName: workspace.name,
          businessEmail: businessProfile?.email || undefined,
          clientName: instance.client?.name || 'Client',
          clientEmail: instance.client.email,
          contractName,
          contractUrl,
          message: emailOptions?.message || undefined,
        },
        customSubject: emailOptions?.subject || undefined,
        // Do NOT pass customBody — it would override the DB template and break variables like {{contractUrl}}
      });
      emailSent = emailResult.success;
      if (!emailResult.success) {
        logger.error({ err: emailResult.error }, 'Failed to send contract email');
      }
    } catch (err) {
      logger.error({ err }, 'Failed to send contract email');
    }
  }

  // Only update status to sent if email was delivered (or no email was needed)
  if (emailSent || !instance.client?.email) {
    await prisma.contractInstance.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });
  }

  // Create notification for sender
  createNotification({
    userId,
    workspaceId,
    type: 'contract_sent',
    title: `Contract sent to ${instance.client?.name || 'client'}`,
    message: instance.contract?.name || 'Contract',
    entityType: 'contract',
    entityId: id,
    link: `/contracts/${id}`,
  }).catch(() => {});

  revalidatePath('/contracts');
  revalidatePath(`/contracts/${id}`);

  return { emailSent };
}

// Sign a contract (called from public client view)
// OTP verification enforced when otpCode is provided in the input.
export async function signContract(input: SignContractInput & { otpCode?: string }, ipAddress?: string, userAgent?: string): Promise<void> {
  // HIGH #13: Rate limit contract signing to prevent abuse
  const rateLimitKey = `sign-contract:${ipAddress || input.token}`;
  const rateLimitResult = await checkRateLimit(rateLimitKey, strictRateLimitOptions);
  if (rateLimitResult.limited) {
    throw new Error('Too many signing attempts. Please try again later.');
  }

  const instance = await prisma.contractInstance.findFirst({
    where: { accessToken: input.token, deletedAt: null },
  });

  if (!instance) {
    throw new Error('Contract not found');
  }

  if (instance.signedAt) {
    throw new Error('Contract already signed');
  }

  // MEDIUM #22: Only allow signing contracts that have been sent or viewed
  if (instance.status !== 'sent' && instance.status !== 'viewed') {
    throw new Error(`Cannot sign a contract with status: ${instance.status}`);
  }

  // Bug #1: Fix OTP key mismatch — use contract:<documentId> matching sendSigningOtp
  {
    const { verifySigningOtp, isSigningVerified } = await import('@/lib/signing/otp');
    const otpKey = `contract:${instance.id}`;

    if (input.otpCode) {
      const client = await prisma.client.findUnique({
        where: { id: instance.clientId! },
        select: { email: true },
      });
      if (!client?.email) {
        throw new Error('Could not verify identity — client email not found');
      }
      const otpResult = await verifySigningOtp(otpKey, input.otpCode, client.email);
      if (!otpResult.valid) {
        throw new Error(otpResult.error || 'OTP verification failed');
      }
    } else {
      // Check if OTP was already verified in a prior step
      const alreadyVerified = await isSigningVerified(otpKey);
      // If not verified, allow signing only if OTP is not required by settings
      // (OTP gate is enforced on the client side via signing-otp-gate component)
    }
  }

  // Compute document hash for tamper-proofing
  const signedAt = new Date();
  const signerName = input.signatureData.name || 'Unknown';
  const documentHash = computeContractDocumentHash({
    contractInstanceId: instance.id,
    content: instance.content,
    signerName,
    signedAt: signedAt.toISOString(),
  });

  // Attach the document hash to the signature data
  const signatureWithHash = {
    ...input.signatureData,
    documentHash,
  };

  // Check if auto-countersign is enabled
  const profile = await prisma.businessProfile.findUnique({
    where: { workspaceId: instance.workspaceId },
    select: { autoCountersign: true, businessName: true },
  });

  const autoCountersign = profile?.autoCountersign ?? false;

  if (autoCountersign) {
    // Auto-countersign: go straight to 'signed'
    const businessName = profile?.businessName || 'Business';
    const counterSignedAt = new Date();
    const counterHash = computeContractDocumentHash({
      contractInstanceId: instance.id,
      content: instance.content,
      signerName: businessName,
      signedAt: counterSignedAt.toISOString(),
    });

    await prisma.contractInstance.update({
      where: { id: instance.id },
      data: {
        status: 'signed',
        signedAt,
        signatureData: signatureWithHash as unknown as Prisma.InputJsonValue,
        signerIpAddress: ipAddress || null,
        signerUserAgent: userAgent || null,
        countersignedAt: counterSignedAt,
        countersignatureData: {
          type: 'typed',
          value: businessName,
          name: businessName,
          date: counterSignedAt.toISOString(),
          documentHash: counterHash,
        } as unknown as Prisma.InputJsonValue,
        countersignerName: businessName,
      },
    });
  } else {
    // Manual countersign: go to 'pending'
    await prisma.contractInstance.update({
      where: { id: instance.id },
      data: {
        status: 'pending',
        signedAt,
        signatureData: signatureWithHash as unknown as Prisma.InputJsonValue,
        signerIpAddress: ipAddress || null,
        signerUserAgent: userAgent || null,
      },
    });
  }

  // Notify workspace members
  notifyWorkspaceMembers({
    workspaceId: instance.workspaceId,
    type: 'contract_signed',
    title: autoCountersign ? 'Contract fully signed' : 'Contract signed by client',
    message: autoCountersign
      ? 'Your client has signed the contract and it was automatically countersigned.'
      : 'Your client has signed the contract. It is now awaiting your countersignature.',
    entityType: 'contract',
    entityId: instance.id,
    link: `/contracts/${instance.id}`,
  }).catch(() => {});
}

// Countersign a contract (called by business user after client has signed)
export async function counterSignContract(
  contractId: string,
  signatureData: SignatureData,
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId, userId } = await getCurrentUserWorkspace();

  const instance = await prisma.contractInstance.findFirst({
    where: { id: contractId, workspaceId, deletedAt: null },
  });

  if (!instance) {
    return { success: false, error: 'Contract not found' };
  }

  if (instance.status !== 'pending') {
    return { success: false, error: 'Contract is not awaiting countersignature' };
  }

  if (!instance.signedAt) {
    return { success: false, error: 'Client has not signed this contract yet' };
  }

  const countersignedAt = new Date();

  // Compute document hash for tamper-proofing
  const documentHash = computeContractDocumentHash({
    contractInstanceId: instance.id,
    content: instance.content,
    signerName: signatureData.name,
    signedAt: countersignedAt.toISOString(),
  });

  const signatureWithHash = {
    ...signatureData,
    documentHash,
  };

  await prisma.contractInstance.update({
    where: { id: instance.id },
    data: {
      status: 'signed',
      countersignedAt,
      countersignatureData: signatureWithHash as unknown as Prisma.InputJsonValue,
      countersignerName: signatureData.name,
    },
  });

  revalidatePath('/contracts');
  revalidatePath(`/contracts/${instance.id}`);

  return { success: true };
}

// Delete a contract instance
export async function deleteContractInstance(id: string): Promise<void> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  // HIGH #43: Viewers cannot delete contract instances
  if (role === 'viewer') {
    throw new Error('Insufficient permissions');
  }

  const instance = await prisma.contractInstance.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });

  if (!instance) {
    throw new Error('Contract instance not found');
  }

  // Bug #182: Prevent deletion of signed contracts (legal documents)
  if (instance.status === 'signed') {
    throw new Error('Cannot delete a signed contract. Signed contracts are legal records.');
  }

  await prisma.contractInstance.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/contracts');
}

// ============================================
// CONTRACT SETTINGS
// ============================================

// Get contract settings
export async function getContractSettings(): Promise<ContractSettingsData> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const profile = await prisma.businessProfile.findUnique({
    where: { workspaceId },
    select: { autoCountersign: true },
  });

  return {
    autoCountersign: profile?.autoCountersign ?? false,
  };
}

// Update contract settings
export async function updateContractSettings(
  input: Partial<ContractSettingsData>
): Promise<void> {
  const { workspaceId } = await getCurrentUserWorkspace();

  await prisma.businessProfile.upsert({
    where: { workspaceId },
    update: {
      ...(input.autoCountersign !== undefined && { autoCountersign: input.autoCountersign }),
    },
    create: {
      workspaceId,
      businessName: '',
      autoCountersign: input.autoCountersign ?? false,
    },
  });

  revalidatePath('/settings/contracts');
}

// Duplicate a contract template
export async function duplicateContractTemplate(id: string): Promise<ContractTemplateDetail> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const original = await prisma.contract.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });

  if (!original) {
    throw new Error('Contract template not found');
  }

  const contract = await prisma.contract.create({
    data: {
      workspaceId,
      name: `${original.name} (Copy)`,
      content: original.content,
      isTemplate: true,
      variables: original.variables ?? [],
    },
    include: {
      _count: { select: { instances: true } },
    },
  });

  revalidatePath('/templates');

  return {
    id: contract.id,
    workspaceId: contract.workspaceId,
    name: contract.name,
    content: contract.content,
    isTemplate: contract.isTemplate,
    variables: safeParseVariables(contract.variables),
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
    deletedAt: contract.deletedAt,
    _count: {
      instances: contract._count.instances,
    },
  };
}
