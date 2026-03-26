import { NextRequest } from 'next/server';
import { prisma, Prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';

// GET /api/v1/clients — List clients
export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
  const search = searchParams.get('search') || undefined;

  const where: Record<string, unknown> = { workspaceId, deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  const data = clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: c.company,
    address: c.address,
    billingAddress: c.billingAddress,
    metadata: c.metadata,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return apiSuccess({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/v1/clients — Create a client
export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;

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

  if (!name) return apiError('name is required', 400);
  if (!email) return apiError('email is required', 400);

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return apiError('Invalid email format', 400);

  // Validate metadata size
  if (metadata && JSON.stringify(metadata).length > 10000) {
    return apiError('Metadata too large (max 10KB)', 400);
  }

  // Check for duplicate email in workspace
  const existing = await prisma.client.findFirst({
    where: { workspaceId, email, deletedAt: null },
  });
  if (existing) return apiError('A client with this email already exists', 409);

  const client = await prisma.client.create({
    data: {
      workspaceId,
      name,
      email,
      phone: phone || null,
      company: company || null,
      address: (address || undefined) as Prisma.InputJsonValue,
      billingAddress: (billingAddress || undefined) as Prisma.InputJsonValue,
      metadata: (metadata || {}) as Prisma.InputJsonValue,
    },
  });

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
  }, 201);
}
