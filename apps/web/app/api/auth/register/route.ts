import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@quotecraft/database';
import { hashPassword } from '@/lib/auth/credentials';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

// Generate a unique workspace slug from name
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const randomSuffix = crypto.randomUUID().substring(0, 8);
  return `${baseSlug}-${randomSuffix}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);
    const name = parsed.name;
    const email = parsed.email.toLowerCase();
    const password = parsed.password;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with workspace in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      // Create workspace for the user
      const workspaceName = `${name}'s Workspace`;
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: generateSlug(name),
          ownerId: user.id,
          settings: {
            onboardingCompleted: false,
          },
        },
      });

      // Add user as workspace member with owner role
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'owner',
          acceptedAt: new Date(),
        },
      });

      return user;
    });

    return NextResponse.json({ user: result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
