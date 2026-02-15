'use server';

import { prisma, Prisma } from '@quotecraft/database';
import { revalidatePath } from 'next/cache';
import { assertNotDemo } from '@/lib/demo/guard';
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
} from './types';

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
      orderBy: { [sortBy]: sortOrder },
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
      variables: (c.variables as unknown) as ContractVariable[],
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
    variables: (contract.variables as unknown) as ContractVariable[],
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
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

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
    variables: (contract.variables as unknown) as ContractVariable[],
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
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

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
      ...(input.name && { name: input.name }),
      ...(input.content && { content: input.content }),
      ...(input.isTemplate !== undefined && { isTemplate: input.isTemplate }),
      ...(input.variables && { variables: input.variables as unknown as Prisma.InputJsonValue }),
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
    variables: (contract.variables as unknown) as ContractVariable[],
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
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

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
        contract: { select: { name: true } },
        client: { select: { name: true, company: true } },
        quote: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contractInstance.count({ where }),
  ]);

  return {
    data: instances.map((i) => ({
      id: i.id,
      contractName: i.contract.name,
      clientName: i.client.company || i.client.name,
      quoteName: i.quote?.title || null,
      status: i.status,
      sentAt: i.sentAt,
      viewedAt: i.viewedAt,
      signedAt: i.signedAt,
      createdAt: i.createdAt,
    })),
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

  const instance = await prisma.contractInstance.findFirst({
    where: { id, workspaceId },
    include: {
      contract: { select: { name: true } },
      client: { select: { name: true, company: true } },
      quote: { select: { title: true } },
    },
  });

  if (!instance) {
    return null;
  }

  return {
    id: instance.id,
    contractId: instance.contractId,
    contractName: instance.contract.name,
    clientId: instance.clientId,
    clientName: instance.client.company || instance.client.name,
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
    pdfUrl: instance.pdfUrl,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  };
}

// Get contract instance by access token (for public client view)
export async function getContractInstanceByToken(token: string): Promise<ContractInstanceDetail | null> {
  const instance = await prisma.contractInstance.findUnique({
    where: { accessToken: token },
    include: {
      contract: { select: { name: true } },
      client: { select: { name: true, company: true } },
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

  // Mark as viewed if first time
  if (!instance.viewedAt) {
    await prisma.contractInstance.update({
      where: { id: instance.id },
      data: { viewedAt: new Date(), status: 'viewed' },
    });
  }

  return {
    id: instance.id,
    contractId: instance.contractId,
    contractName: instance.contract.name,
    clientId: instance.clientId,
    clientName: instance.client.company || instance.client.name,
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
    pdfUrl: instance.pdfUrl,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  };
}

// Create a contract instance from a template
export async function createContractInstance(
  input: CreateContractInstanceInput
): Promise<ContractInstanceDetail> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

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
    const variables = (template.variables as unknown) as ContractVariable[];
    for (const variable of variables) {
      const value = input.variableValues[variable.key] || variable.defaultValue || '';
      content = content.replace(new RegExp(`{{${variable.key}}}`, 'g'), value);
    }
  }

  // Replace common placeholders
  content = content
    .replace(/{{clientName}}/g, client.company || client.name)
    .replace(/{{clientEmail}}/g, client.email)
    .replace(/{{date}}/g, new Date().toLocaleDateString());

  const instance = await prisma.contractInstance.create({
    data: {
      contractId: input.contractId,
      clientId: input.clientId,
      quoteId: input.quoteId,
      workspaceId,
      content,
      status: 'draft',
    },
    include: {
      contract: { select: { name: true } },
      client: { select: { name: true, company: true } },
      quote: { select: { title: true } },
    },
  });

  revalidatePath('/contracts');

  return {
    id: instance.id,
    contractId: instance.contractId,
    contractName: instance.contract.name,
    clientId: instance.clientId,
    clientName: instance.client.company || instance.client.name,
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
    pdfUrl: instance.pdfUrl,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  };
}

// Send a contract instance to client
export async function sendContractInstance(id: string): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const instance = await prisma.contractInstance.findFirst({
    where: { id, workspaceId },
  });

  if (!instance) {
    throw new Error('Contract instance not found');
  }

  await prisma.contractInstance.update({
    where: { id },
    data: {
      status: 'sent',
      sentAt: new Date(),
    },
  });

  // TODO: Send email notification to client

  revalidatePath('/contracts');
  revalidatePath(`/contracts/${id}`);
}

// Sign a contract (called from public client view)
export async function signContract(input: SignContractInput, ipAddress?: string): Promise<void> {
  const instance = await prisma.contractInstance.findUnique({
    where: { accessToken: input.token },
  });

  if (!instance) {
    throw new Error('Contract not found');
  }

  if (instance.signedAt) {
    throw new Error('Contract already signed');
  }

  await prisma.contractInstance.update({
    where: { id: instance.id },
    data: {
      status: 'signed',
      signedAt: new Date(),
      signatureData: input.signatureData as unknown as Prisma.InputJsonValue,
      signerIpAddress: ipAddress || null,
    },
  });

  // TODO: Generate PDF and send confirmation email
}

// Delete a contract instance
export async function deleteContractInstance(id: string): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const instance = await prisma.contractInstance.findFirst({
    where: { id, workspaceId },
  });

  if (!instance) {
    throw new Error('Contract instance not found');
  }

  await prisma.contractInstance.delete({
    where: { id },
  });

  revalidatePath('/contracts');
}

// Duplicate a contract template
export async function duplicateContractTemplate(id: string): Promise<ContractTemplateDetail> {
  await assertNotDemo();
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
    variables: (contract.variables as unknown) as ContractVariable[],
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
    deletedAt: contract.deletedAt,
    _count: {
      instances: contract._count.instances,
    },
  };
}
