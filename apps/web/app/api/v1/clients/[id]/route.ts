import { NextRequest } from 'next/server';
import { prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/clients/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;
  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });

  if (!client) return apiError('Client not found', 404);

  return apiSuccess({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    address: client.address,
    billingAddress: client.billingAddress,
    metadata: client.metadata,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  });
}

// PATCH /api/v1/clients/:id
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;
  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });
  if (!client) return apiError('Client not found', 404);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  // Strip potentially dangerous fields that should never be user-controlled
  delete body.id;
  delete body.workspaceId;
  delete body.deletedAt;
  delete body.createdAt;
  delete body.updatedAt;

  const { name, email, phone, company, address, billingAddress, metadata } = body as {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: Record<string, string>;
    billingAddress?: Record<string, string>;
    metadata?: Record<string, unknown>;
  };

  // Check email uniqueness if changing email
  if (email && email !== client.email) {
    const existing = await prisma.client.findFirst({
      where: { workspaceId, email, deletedAt: null, id: { not: id } },
    });
    if (existing) return apiError('A client with this email already exists', 409);
  }

  // Validate name is non-empty if provided
  if (name !== undefined && !name.trim()) {
    return apiError('Client name cannot be empty', 400);
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (company !== undefined) updateData.company = company;
  if (address !== undefined) updateData.address = address;
  if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
  if (metadata !== undefined) updateData.metadata = metadata;

  const updated = await prisma.client.update({
    where: { id },
    data: updateData,
  });

  return apiSuccess({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    company: updated.company,
    address: updated.address,
    billingAddress: updated.billingAddress,
    metadata: updated.metadata,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });
}

// DELETE /api/v1/clients/:id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;
  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });
  if (!client) return apiError('Client not found', 404);

  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return apiSuccess({ message: 'Client deleted' });
}
